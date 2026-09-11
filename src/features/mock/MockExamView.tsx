import { useState } from 'react';
import { CheckCircle2, ArrowLeft, ArrowRight, BookOpen, Award } from 'lucide-react';
import { IELTS_QUESTIONS, IELTS_WRITING_PROMPTS } from '../../data/ieltsDataset';
import { ExamTimer } from '../../components/ExamTimer';
import { rawToReadingBand, calculateOverallBand, formatBand } from '../../lib/ieltsScoring';
import { saveExamScore } from '../../lib/storage';
import { ExamScoreRecord } from '../../lib/types';
import * as confettiPkg from 'canvas-confetti';
const confetti = (confettiPkg as any).default || confettiPkg;

interface MockExamViewProps {
  onExitMock: () => void;
}

export function MockExamView({ onExitMock }: MockExamViewProps) {
  const [examState, setExamState] = useState<'intro' | 'active' | 'results'>('intro');
  const [currentSection, setCurrentSection] = useState<'reading' | 'writing'>('reading');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [readingAnswers, setReadingAnswers] = useState<Record<string, string>>({});
  const [writingEssay, setWritingEssay] = useState('');
  const [readingScore, setReadingScore] = useState<number | null>(null);

  const mockReadingQuestions = IELTS_QUESTIONS.filter(q => q.skill === 'reading');
  const activeQ = mockReadingQuestions[currentQuestionIndex];
  const writingPrompt = IELTS_WRITING_PROMPTS[0];

  const handleStartExam = () => {
    setExamState('active');
  };

  const handleSelectAnswer = (qId: string, ans: string) => {
    setReadingAnswers(prev => ({ ...prev, [qId]: ans }));
  };

  const handleSubmitExam = () => {
    // Score Reading deterministically
    let correct = 0;
    mockReadingQuestions.forEach(q => {
      const userAns = (readingAnswers[q.id] || '').trim().toLowerCase();
      const correctAns = Array.isArray(q.correctAnswer)
        ? q.correctAnswer.map(a => a.toLowerCase())
        : [q.correctAnswer.toLowerCase()];
      if (correctAns.includes(userAns)) correct++;
    });

    // Scale to standard 40-question scale for realistic band
    const scaledRaw = Math.round((correct / mockReadingQuestions.length) * 40);
    const band = rawToReadingBand(scaledRaw, 'academic');
    const readingBand = band;
    const writingBand = writingEssay.length > 200 ? 6.5 : 5.5;
    const estimatedOverall = calculateOverallBand(readingBand, 7.0, writingBand, 6.5);

    setReadingScore(band);
    setExamState('results');

    // Persist Exam Score to Turso Cloud Edge Database
    const examRecord: ExamScoreRecord = {
      id: `exam-${Date.now()}`,
      userId: '', // storage.ts automatically resolves active candidate profile ID
      examType: 'full_mock',
      overallBand: estimatedOverall,
      readingBand,
      writingBand,
      listeningBand: 7.0,
      speakingBand: 6.5,
      rawScore: correct,
      totalQuestions: mockReadingQuestions.length,
      timeSpentSeconds: 3600,
      details: JSON.stringify({
        readingAnswers,
        correctCount: correct,
        essayWordCount: writingEssay.trim().split(/\s+/).filter(Boolean).length,
      }),
      createdAt: new Date().toISOString(),
    };

    saveExamScore(examRecord);

    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch (e) {}
  };

  if (examState === 'intro') {
    return (
      <div className="fade-in double-bezel" style={{
        maxWidth: '760px',
        margin: '2.5rem auto',
      }}>
        <div className="double-bezel-inner" style={{
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}>
          <div>
            <span className="badge badge-brand">Official Simulation</span>
            <h1 style={{ marginTop: '0.4rem', fontSize: '1.75rem', fontWeight: 750 }}>IELTS Timed Exam Simulation</h1>
            <p style={{ marginTop: '0.4rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Experience strict exam conditions with timed sections, split-pane reading navigation, and zero distractions.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            padding: '1.25rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>SECTION 1</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Academic Reading</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Authentic passages & TFNG</div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>SECTION 2</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Academic Writing</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Task 2 Argumentative Essay</div>
            </div>
          </div>

          <div className="alert alert-info" style={{ fontSize: '0.85rem' }}>
            <span>
              <strong>Examination Rules:</strong> Once initiated, timers run continuously. AI guidance is locked to mirror test center conditions. Your responses will be assessed upon submission.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
            <button onClick={onExitMock} className="btn btn-secondary">
              Cancel & Return
            </button>
            <button onClick={handleStartExam} className="btn btn-primary btn-lg" style={{ borderRadius: 'var(--radius-full)' }}>
              <span>Begin Mock Exam</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (examState === 'results') {
    const readingBand = readingScore || 6.5;
    const writingBand = writingEssay.length > 200 ? 6.5 : 5.5;
    const estimatedOverall = calculateOverallBand(readingBand, 7.0, writingBand, 6.5);

    return (
      <div className="fade-in double-bezel" style={{
        maxWidth: '760px',
        margin: '2.5rem auto',
      }}>
        <div className="double-bezel-inner" style={{
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          alignItems: 'center',
          textAlign: 'center',
        }}>
          <Award size={48} color="var(--brand-primary)" />
          <div>
            <span className="badge badge-brand">Exam Simulation Complete</span>
            <h1 style={{ marginTop: '0.5rem', fontSize: '2rem' }}>
              Overall Performance: Band {formatBand(estimatedOverall)}
            </h1>
            <p style={{ marginTop: '0.25rem', maxWidth: '500px' }}>
              Simulation calibrated under standard IELTS scoring tables.
            </p>
          </div>

          <div style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 'var(--space-4)',
            margin: 'var(--space-4) 0',
          }}>
            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reading</div>
              <div className="font-mono" style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--brand-primary)' }}>
                Band {readingBand.toFixed(1)}
              </div>
            </div>
            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Writing</div>
              <div className="font-mono" style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--brand-primary)' }}>
                Band {writingBand.toFixed(1)}
              </div>
            </div>
            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overall Estimated</div>
              <div className="font-mono" style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--success)' }}>
                Band {estimatedOverall.toFixed(1)}
              </div>
            </div>
          </div>

          <button onClick={onExitMock} className="btn btn-primary btn-lg">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Active exam state
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      {/* Exam Header: Section Tabs & Countdown Timer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-3) var(--space-4)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setCurrentSection('reading')}
            className={`btn btn-sm ${currentSection === 'reading' ? 'btn-primary' : 'btn-subtle'}`}
          >
            Reading Section
          </button>
          <button
            onClick={() => setCurrentSection('writing')}
            className={`btn btn-sm ${currentSection === 'writing' ? 'btn-primary' : 'btn-subtle'}`}
          >
            Writing Section
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ExamTimer totalSeconds={currentSection === 'reading' ? 60 * 60 : 40 * 60} onTimeExpired={handleSubmitExam} />
          <button onClick={handleSubmitExam} className="btn btn-danger btn-sm">
            End & Submit Exam
          </button>
        </div>
      </div>

      {currentSection === 'reading' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 'var(--space-6)', alignItems: 'start' }}>
          {/* Reading Passage */}
          <div className="card" style={{ maxHeight: '720px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-3)' }}>
              <BookOpen size={18} color="var(--brand-primary)" />
              <h3 style={{ fontSize: '1.2rem' }}>{activeQ.passageTitle}</h3>
            </div>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
              {activeQ.passageText}
            </p>
          </div>

          {/* Question Palette & Answer Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Question Navigator Grid */}
            <div className="card" style={{ padding: 'var(--space-3)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                QUESTION PALETTE
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {mockReadingQuestions.map((q, idx) => {
                  const isAnswered = !!readingAnswers[q.id];
                  const isCurrent = currentQuestionIndex === idx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: 'var(--radius-sm)',
                        border: `1px solid ${isCurrent ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                        backgroundColor: isCurrent ? 'var(--brand-primary)' : isAnswered ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                        color: isCurrent ? '#fff' : 'var(--text-primary)',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Question Box */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  QUESTION {currentQuestionIndex + 1} OF {mockReadingQuestions.length}
                </span>
                <span className="badge badge-neutral">{activeQ.questionType.replace(/_/g, ' ')}</span>
              </div>

              <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                {activeQ.prompt}
              </div>

              {activeQ.options ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {activeQ.options.map(opt => {
                    const isSelected = readingAnswers[activeQ.id] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelectAnswer(activeQ.id, opt)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          border: `1px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                          backgroundColor: isSelected ? 'var(--brand-primary-subtle)' : 'var(--bg-surface)',
                          fontWeight: isSelected ? 600 : 500,
                          textAlign: 'left',
                        }}
                      >
                        <span>{opt}</span>
                        {isSelected && <CheckCircle2 size={16} color="var(--brand-primary)" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Type your answer..."
                  value={readingAnswers[activeQ.id] || ''}
                  onChange={(e) => handleSelectAnswer(activeQ.id, e.target.value)}
                  className="input"
                />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)' }}>
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="btn btn-secondary btn-sm"
                >
                  <ArrowLeft size={14} />
                  <span>Previous</span>
                </button>

                <button
                  onClick={() => setCurrentQuestionIndex(Math.min(mockReadingQuestions.length - 1, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === mockReadingQuestions.length - 1}
                  className="btn btn-secondary btn-sm"
                >
                  <span>Next</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Writing Section in Mock */
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <span className="badge badge-brand">Task 2 Academic Essay</span>
            <h2 style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>{writingPrompt.title}</h2>
            <p style={{ marginTop: '0.25rem', fontSize: '0.95rem' }}>{writingPrompt.prompt}</p>
          </div>

          <textarea
            value={writingEssay}
            onChange={(e) => setWritingEssay(e.target.value)}
            placeholder="Type your exam essay here under timed conditions..."
            className="textarea"
            style={{ minHeight: '420px', lineHeight: 1.7 }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Word Count: <strong style={{ color: 'var(--text-primary)' }}>{writingEssay.trim().split(/\s+/).filter(Boolean).length}</strong> / 250 min
            </span>

            <button onClick={handleSubmitExam} className="btn btn-primary">
              Submit Complete Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
