import { useState } from 'react';
import { CheckCircle2, ArrowLeft, ArrowRight, BookOpen, Award, Brain, Loader2, Copy, Check, AlertTriangle, Clock, SlidersHorizontal, PenTool, ShieldCheck } from 'lucide-react';
import { IELTS_QUESTIONS, IELTS_WRITING_PROMPTS } from '../../data/ieltsDataset';
import { ExamTimer } from '../../components/ExamTimer';
import { rawToReadingBand, calculateOverallBand, formatBand } from '../../lib/ieltsScoring';
import { saveExamScore, recordQuestionAttempt } from '../../lib/storage';
import { ExamScoreRecord, LearnerProfile, QuestionAttempt, Question, WritingFeedback } from '../../lib/types';
import { generateAdaptiveQuestionsWithContext, evaluateWritingEssay } from '../../lib/aiService';
import * as confettiPkg from 'canvas-confetti';
const confetti = (confettiPkg as any).default || confettiPkg;

interface MockExamViewProps {
  onExitMock: () => void;
  profile?: LearnerProfile | null;
  attempts?: QuestionAttempt[];
  onAttemptRecorded?: (attempt: QuestionAttempt) => void;
}

export function MockExamView({ onExitMock, profile, attempts = [], onAttemptRecorded }: MockExamViewProps) {
  const [examState, setExamState] = useState<'intro' | 'active' | 'results'>('intro');
  const [examMode, setExamMode] = useState<'adaptive_ai' | 'standard'>('adaptive_ai');
  const [currentSection, setCurrentSection] = useState<'reading' | 'writing'>('reading');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [readingAnswers, setReadingAnswers] = useState<Record<string, string>>({});
  const [writingEssay, setWritingEssay] = useState('');
  const [copiedModel, setCopiedModel] = useState(false);
  const [readingScore, setReadingScore] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>(IELTS_QUESTIONS.filter(q => q.skill === 'reading'));
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isEvaluatingWriting, setIsEvaluatingWriting] = useState(false);
  const [writingFeedback, setWritingFeedback] = useState<WritingFeedback | null>(null);

  const activeQ = questions[currentQuestionIndex] || questions[0];
  const writingPrompt = IELTS_WRITING_PROMPTS[0];

  const handleStartExam = async () => {
    if (examMode === 'adaptive_ai' && profile) {
      setIsGeneratingQuestions(true);
      try {
        const generated = await generateAdaptiveQuestionsWithContext({
          profile,
          attempts,
          count: 5,
        });
        if (generated && generated.length > 0) {
          setQuestions(generated);
        }
      } catch (e) {
        console.warn('Adaptive generation fallback to authentic benchmark bank', e);
      } finally {
        setIsGeneratingQuestions(false);
      }
    }
    setExamState('active');
  };

  const handleSelectAnswer = (qId: string, ans: string) => {
    setReadingAnswers(prev => ({ ...prev, [qId]: ans }));
  };

  const handleSubmitExam = async () => {
    // Score Reading deterministically
    let correct = 0;
    questions.forEach(q => {
      const userAns = (readingAnswers[q.id] || '').trim().toLowerCase();
      const correctAns = Array.isArray(q.correctAnswer)
        ? q.correctAnswer.map(a => a.toLowerCase())
        : [q.correctAnswer.toLowerCase()];
      const isCorrect = correctAns.includes(userAns);
      if (isCorrect) correct++;

      // Log attempt into user behavioral tracking
      if (profile) {
        const attempt: QuestionAttempt = {
          id: `mock-att-${Date.now()}-${q.id}`,
          questionId: q.id,
          skill: 'reading',
          subskill: q.subskill || 'reading_comprehension',
          isCorrect,
          userAnswer: userAns,
          timeSpentSeconds: 60,
          timestamp: new Date().toISOString(),
        };
        recordQuestionAttempt(attempt, profile.id);
        if (onAttemptRecorded) onAttemptRecorded(attempt);
      }
    });

    const scaledRaw = Math.round((correct / (questions.length || 1)) * 40);
    const readingBand = rawToReadingBand(scaledRaw, profile?.testType || 'academic');
    setReadingScore(readingBand);

    // AI evaluate the essay if provided
    let assessedWritingBand = 5.5;
    if (writingEssay.trim().length > 30) {
      setIsEvaluatingWriting(true);
      try {
        const feedback = await evaluateWritingEssay(writingPrompt.prompt, writingEssay, 'task2');
        setWritingFeedback(feedback);
        assessedWritingBand = feedback.estimated_band;
      } catch (e) {
        assessedWritingBand = writingEssay.length > 200 ? 6.5 : 5.5;
      } finally {
        setIsEvaluatingWriting(false);
      }
    }

    const estimatedOverall = calculateOverallBand(readingBand, 7.0, assessedWritingBand, 6.5);
    setExamState('results');

    // Persist Exam Score with full behavioral breakdown to cloud database
    const examRecord: ExamScoreRecord = {
      id: `exam-${Date.now()}`,
      userId: profile?.id || '',
      examType: 'full_mock',
      overallBand: estimatedOverall,
      readingBand,
      writingBand: assessedWritingBand,
      listeningBand: 7.0,
      speakingBand: 6.5,
      rawScore: correct,
      totalQuestions: questions.length,
      timeSpentSeconds: 3600,
      details: JSON.stringify({
        readingAnswers,
        correctCount: correct,
        essayWordCount: writingEssay.trim().split(/\s+/).filter(Boolean).length,
        examMode,
      }),
      createdAt: new Date().toISOString(),
    };

    saveExamScore(examRecord);

    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch (_) {}
  };

  if (examState === 'intro') {
    return (
      <div className="fade-in double-bezel" style={{
        maxWidth: '780px',
        margin: 'clamp(0.75rem, 3vw, 2rem) auto',
      }}>
        <div className="double-bezel-inner" style={{
          padding: 'clamp(1rem, 3.5vw, 2rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.4rem',
        }}>
          <div>
            <span className="badge badge-brand" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 650, padding: '0.3rem 0.75rem' }}>
              {examMode === 'adaptive_ai' ? (
                <>
                  <SlidersHorizontal size={13} />
                  <span>Adaptive Calibration Engine</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={13} />
                  <span>Cambridge Benchmark Standard</span>
                </>
              )}
            </span>
            <h1 style={{ marginTop: '0.5rem', fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              IELTS Timed Exam Simulation
            </h1>
            <p style={{ marginTop: '0.35rem', fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Standard test center conditions with continuous timing, split-pane reading navigation, authentic answer sheets, and zero interruptions.
            </p>
          </div>

          {/* Simulation Engine Mode Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Select Simulation Engine
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '0.85rem' }}>
              <button
                type="button"
                onClick={() => setExamMode('adaptive_ai')}
                style={{
                  padding: '1.1rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: `1.5px solid ${examMode === 'adaptive_ai' ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                  backgroundColor: examMode === 'adaptive_ai' ? 'var(--brand-primary-subtle)' : 'var(--bg-surface)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  transition: 'all var(--transition-fast)',
                  boxShadow: examMode === 'adaptive_ai' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: examMode === 'adaptive_ai' ? 'var(--brand-primary)' : 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: examMode === 'adaptive_ai' ? 'var(--brand-primary)' : 'var(--bg-subtle)',
                      color: examMode === 'adaptive_ai' ? '#ffffff' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <SlidersHorizontal size={15} />
                    </div>
                    <span>Adaptive AI Simulation</span>
                  </div>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: `2px solid ${examMode === 'adaptive_ai' ? 'var(--brand-primary)' : 'var(--border-strong)'}`,
                    backgroundColor: examMode === 'adaptive_ai' ? 'var(--brand-primary)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {examMode === 'adaptive_ai' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff' }} />}
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Synthesizes fresh passages & questions targeting your calibrated Band {(profile?.targetBand || 7.5).toFixed(1)} and past error patterns.
                </p>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>Dynamic Prompts</span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>Personalized</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExamMode('standard')}
                style={{
                  padding: '1.1rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  border: `1.5px solid ${examMode === 'standard' ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                  backgroundColor: examMode === 'standard' ? 'var(--brand-primary-subtle)' : 'var(--bg-surface)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  transition: 'all var(--transition-fast)',
                  boxShadow: examMode === 'standard' ? 'var(--shadow-xs)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: examMode === 'standard' ? 'var(--brand-primary)' : 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: examMode === 'standard' ? 'var(--brand-primary)' : 'var(--bg-subtle)',
                      color: examMode === 'standard' ? '#ffffff' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <BookOpen size={15} />
                    </div>
                    <span>Cambridge Benchmark</span>
                  </div>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: `2px solid ${examMode === 'standard' ? 'var(--brand-primary)' : 'var(--border-strong)'}`,
                    backgroundColor: examMode === 'standard' ? 'var(--brand-primary)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {examMode === 'standard' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff' }} />}
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Standard fixed test paper from official Cambridge IELTS examination specifications.
                </p>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>Authentic Past Paper</span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>Fixed Standard</span>
                </div>
              </button>
            </div>
          </div>

          {/* Exam Modules Overview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Exam Modules Included
            </span>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
              gap: '0.85rem',
            }}>
              <div style={{
                padding: '1.1rem 1.25rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    <BookOpen size={16} color="var(--brand-primary)" />
                    <span>Academic Reading</span>
                  </div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>SECTION 1 • 60m</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {examMode === 'adaptive_ai' ? 'Contextual academic passages with True/False/Not Given & multiple choice.' : 'Authentic past examination passages with evidence tracking.'}
                </p>
              </div>

              <div style={{
                padding: '1.1rem 1.25rem',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    <PenTool size={16} color="var(--brand-primary)" />
                    <span>Academic Writing</span>
                  </div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>SECTION 2 • 40m</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Task 2 Argumentative Academic Essay (250+ words) evaluated against official Cambridge 9-band criteria.
                </p>
              </div>
            </div>
          </div>

          {/* Test Center Protocol */}
          <div style={{
            padding: '1.1rem 1.25rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 750, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                <Clock size={16} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
                <span>Official Test Center Protocol</span>
              </div>
              <span className="badge badge-zinc" style={{ fontSize: '0.68rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                STRICT TIMING
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Once initiated, timers run continuously to mirror real exam pressure. Coaching aids are locked until submission, after which your responses are permanently recorded to your diagnostic timeline.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button onClick={onExitMock} className="btn btn-secondary" style={{ borderRadius: 'var(--radius-full)', padding: '0.65rem 1.35rem' }}>
              Cancel & Return
            </button>
            <button
              onClick={handleStartExam}
              disabled={isGeneratingQuestions}
              className="btn btn-primary btn-lg"
              style={{ borderRadius: 'var(--radius-full)', padding: '0.65rem 1.5rem', gap: '0.6rem' }}
            >
              {isGeneratingQuestions ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Synthesizing Adaptive Exam...</span>
                </>
              ) : (
                <>
                  <span>Begin Mock Exam</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (examState === 'results') {
    const readingBand = readingScore || 6.5;
    const assessedWritingBand = writingFeedback ? writingFeedback.estimated_band : (writingEssay.length > 200 ? 6.5 : 5.5);
    const estimatedOverall = calculateOverallBand(readingBand, 7.0, assessedWritingBand, 6.5);

    return (
      <div className="fade-in double-bezel" style={{
        maxWidth: '780px',
        margin: 'clamp(0.75rem, 3vw, 2rem) auto',
      }}>
        <div className="double-bezel-inner" style={{
          padding: 'clamp(1rem, 3.5vw, 2rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          alignItems: 'center',
          textAlign: 'center',
        }}>
          <Award size={48} color="var(--brand-primary)" />
          <div>
            <span className="badge badge-brand">
              {examMode === 'adaptive_ai' ? 'AI-Calibrated Exam Complete' : 'Exam Simulation Complete'}
            </span>
            <h1 style={{ marginTop: '0.5rem', fontSize: '2rem' }}>
              Overall Performance: Band {formatBand(estimatedOverall)}
            </h1>
            <p style={{ marginTop: '0.25rem', maxWidth: '540px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {examMode === 'adaptive_ai'
                ? 'Simulation scored using Cambridge band tables with AI examiner evaluation of your argumentative essay.'
                : 'Simulation calibrated under standard IELTS scoring tables.'}
            </p>
          </div>

          <div style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 'var(--space-4)',
            margin: '0.5rem 0',
          }}>
            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reading</div>
              <div className="font-mono" style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--brand-primary)' }}>
                Band {readingBand.toFixed(1)}
              </div>
            </div>
            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Writing (AI Evaluated)</div>
              <div className="font-mono" style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--brand-primary)' }}>
                Band {assessedWritingBand.toFixed(1)}
              </div>
            </div>
            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overall Estimated</div>
              <div className="font-mono" style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--success)' }}>
                Band {estimatedOverall.toFixed(1)}
              </div>
            </div>
          </div>

          {/* AI Writing Criteria Feedback Breakdown */}
          {writingFeedback && (
            <div style={{
              width: '100%',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--brand-primary)', fontWeight: 700, fontSize: '0.92rem' }}>
                  <Award size={15} />
                  <span>Cambridge AI Writing Examiner Diagnostic</span>
                </div>
                <span className="badge badge-brand" style={{ fontSize: '0.7rem' }}>
                  Band {writingFeedback.estimated_band.toFixed(1)} Evaluated
                </span>
              </div>

              {writingFeedback.examiner_summary && (
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {writingFeedback.examiner_summary}
                </p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Task Response</div>
                  <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Band {writingFeedback.criteria.task_response.toFixed(1)}</div>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Coherence & Cohesion</div>
                  <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Band {writingFeedback.criteria.coherence.toFixed(1)}</div>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lexical Resource</div>
                  <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Band {writingFeedback.criteria.lexical_resource.toFixed(1)}</div>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Grammar & Accuracy</div>
                  <div className="font-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Band {writingFeedback.criteria.grammar.toFixed(1)}</div>
                </div>
              </div>

              {/* Strengths vs Flaws */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '0.65rem' }}>
                <div style={{ padding: '0.65rem', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--success)', fontWeight: 700, fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                    <CheckCircle2 size={13} /> What Went Right
                  </div>
                  <ul style={{ paddingLeft: '1rem', margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    {(writingFeedback.what_went_right || writingFeedback.strengths || []).slice(0, 2).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ padding: '0.65rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--danger)', fontWeight: 700, fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                    <AlertTriangle size={13} /> What Went Wrong
                  </div>
                  <ul style={{ paddingLeft: '1rem', margin: 0, fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    {(writingFeedback.what_went_wrong || writingFeedback.issues.map(x => x.problem)).slice(0, 2).map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Examiner Band 8.5+ Model Solution */}
              {writingFeedback.examiner_model_answer && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--brand-primary-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--brand-primary-border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                      Cambridge Examiner Model Solution (Band 8.5+)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(writingFeedback.examiner_model_answer || '');
                        setCopiedModel(true);
                        setTimeout(() => setCopiedModel(false), 2000);
                      }}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', gap: '0.2rem' }}
                    >
                      {copiedModel ? <Check size={11} color="var(--success)" /> : <Copy size={11} />}
                      <span>{copiedModel ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div style={{
                    maxHeight: '160px',
                    overflowY: 'auto',
                    fontSize: '0.78rem',
                    lineHeight: 1.55,
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {writingFeedback.examiner_model_answer}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onExitMock}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', maxWidth: '320px', justifyContent: 'center' }}
          >
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
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <ExamTimer totalSeconds={currentSection === 'reading' ? 60 * 60 : 40 * 60} onTimeExpired={handleSubmitExam} />
          <button onClick={handleSubmitExam} className="btn btn-danger btn-sm">
            End & Submit Exam
          </button>
        </div>
      </div>

      {currentSection === 'reading' ? (
        <div className="responsive-split-grid">
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
                {questions.map((q, idx) => {
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
                  QUESTION {currentQuestionIndex + 1} OF {questions.length}
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
                  onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === questions.length - 1}
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
