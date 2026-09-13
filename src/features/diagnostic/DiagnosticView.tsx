import { useState } from 'react';
import { CheckCircle2, ArrowRight, RotateCcw, Award } from 'lucide-react';
import { IELTS_QUESTIONS } from '../../data/ieltsDataset';
import { LearnerProfile } from '../../lib/types';
import { formatBand } from '../../lib/ieltsScoring';
import { saveLearnerProfile } from '../../lib/storage';

interface DiagnosticViewProps {
  profile: LearnerProfile;
  onProfileUpdated: (profile: LearnerProfile) => void;
  onFinish: () => void;
}

export const DiagnosticView = ({
  profile,
  onProfileUpdated,
  onFinish,
}: DiagnosticViewProps) => {
  const diagnosticQuestions = IELTS_QUESTIONS.slice(0, 4);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [targetBandInput, setTargetBandInput] = useState(profile.targetBand);
  const [testTypeInput, setTestTypeInput] = useState(profile.testType);

  const handleSelect = (questionId: string, answer: string) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    diagnosticQuestions.forEach(q => {
      const userAns = (selectedAnswers[q.id] || '').trim().toLowerCase();
      const correctAns = Array.isArray(q.correctAnswer)
        ? q.correctAnswer.map(a => a.toLowerCase())
        : [q.correctAnswer.toLowerCase()];
      if (correctAns.includes(userAns)) {
        correctCount++;
      }
    });

    // Baseline calculation based on diagnostic accuracy
    const accuracy = correctCount / diagnosticQuestions.length;
    let estimatedBand = 5.5;
    if (accuracy >= 0.85) estimatedBand = 7.5;
    else if (accuracy >= 0.65) estimatedBand = 6.5;
    else if (accuracy >= 0.45) estimatedBand = 6.0;

    const updatedProfile: LearnerProfile = {
      ...profile,
      targetBand: targetBandInput,
      testType: testTypeInput,
      currentEstimatedBand: estimatedBand,
      skillBands: {
        reading: estimatedBand,
        listening: Math.min(9.0, estimatedBand + 0.5),
        writing: Math.max(5.0, estimatedBand - 0.5),
        speaking: estimatedBand,
      },
      onboardingCompleted: true,
    };

    saveLearnerProfile(updatedProfile);
    onProfileUpdated(updatedProfile);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="fade-in" style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <span className="badge badge-brand" style={{ marginBottom: '0.5rem' }}>Initial Assessment</span>
        <h1>IELTS Diagnostic Evaluation</h1>
        <p style={{ marginTop: '0.25rem' }}>
          Calibrate your starting baseline. This 4-item diagnostic tests textual inference, detail scanning, and academic deduction under authentic IELTS criteria.
        </p>
      </div>

      {/* Target band and module selection */}
      {!submitted && (
        <div className="card" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '1.25rem',
          padding: 'clamp(1rem, 3.5vw, 1.5rem)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.45rem', letterSpacing: '0.01em' }}>
              Target IELTS Band
            </label>
            <select
              value={targetBandInput}
              onChange={(e) => setTargetBandInput(Number(e.target.value))}
              className="select"
              style={{ fontWeight: 600, padding: '0.65rem 0.85rem' }}
            >
              <option value={6.0}>Band 6.0 (Competent)</option>
              <option value={6.5}>Band 6.5 (Standard Academic Entry)</option>
              <option value={7.0}>Band 7.0 (Good User)</option>
              <option value={7.5}>Band 7.5 (Competitive University Entry)</option>
              <option value={8.0}>Band 8.0 (Very Good User)</option>
              <option value={8.5}>Band 8.5 (Expert)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: '0.45rem', letterSpacing: '0.01em' }}>
              Examination Module
            </label>
            <select
              value={testTypeInput}
              onChange={(e) => setTestTypeInput(e.target.value as any)}
              className="select"
              style={{ fontWeight: 600, padding: '0.65rem 0.85rem' }}
            >
              <option value="academic">IELTS Academic (Higher Education)</option>
              <option value="general">IELTS General Training (Migration / Work)</option>
            </select>
          </div>
        </div>
      )}

      {/* Diagnostic Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {diagnosticQuestions.map((q, idx) => {
          const userAnswer = selectedAnswers[q.id];
          const isCorrect = Array.isArray(q.correctAnswer)
            ? q.correctAnswer.map(a => a.toLowerCase()).includes((userAnswer || '').trim().toLowerCase())
            : q.correctAnswer.toLowerCase() === (userAnswer || '').trim().toLowerCase();

          return (
            <div key={q.id} className="card" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              padding: 'clamp(1rem, 3.5vw, 1.5rem)',
              borderRadius: 'var(--radius-lg)',
              border: submitted ? (isCorrect ? '1.5px solid var(--success-border)' : '1.5px solid var(--error-border)') : '1px solid var(--border-default)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  QUESTION {idx + 1} OF {diagnosticQuestions.length} • {q.subskill.toUpperCase()}
                </span>
                <span className="badge badge-neutral">{q.difficulty}</span>
              </div>

              {q.passageText && (
                <div style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.92rem',
                  lineHeight: 1.7,
                  color: 'var(--text-secondary)',
                  borderLeft: '3px solid var(--brand-primary)',
                  whiteSpace: 'pre-line',
                }}>
                  <strong style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    Excerpt: {q.passageTitle}
                  </strong>
                  {(() => {
                    const paragraphs = q.passageText.split('\n\n');
                    return paragraphs[0] || q.passageText;
                  })()}
                </div>
              )}

              <div style={{ fontSize: '1.05rem', fontWeight: 650, color: 'var(--text-primary)', lineHeight: 1.55 }}>
                {q.prompt}
              </div>

              {/* Options */}
              {q.options ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {q.options.map((opt, optIdx) => {
                    const selected = userAnswer === opt;
                    const letter = String.fromCharCode(65 + optIdx);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelect(q.id, opt)}
                        className="card-hover"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.85rem',
                          padding: '0.85rem 1.15rem',
                          borderRadius: 'var(--radius-md)',
                          border: `1.5px solid ${selected ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                          backgroundColor: selected ? 'var(--brand-primary-subtle)' : 'var(--bg-surface)',
                          color: selected ? 'var(--brand-primary)' : 'var(--text-primary)',
                          fontWeight: selected ? 650 : 500,
                          textAlign: 'left',
                          cursor: submitted ? 'default' : 'pointer',
                          transition: 'all var(--transition-fast)',
                          boxShadow: selected ? 'var(--shadow-xs)' : 'none',
                        }}
                      >
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: `1.5px solid ${selected ? 'var(--brand-primary)' : 'var(--border-strong)'}`,
                          backgroundColor: selected ? 'var(--brand-primary)' : 'transparent',
                          color: selected ? '#ffffff' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          transition: 'all var(--transition-fast)',
                        }}>
                          {selected ? '✓' : letter}
                        </span>
                        <span style={{ flex: 1, fontSize: '0.92rem' }}>{opt}</span>
                        {selected && <CheckCircle2 size={16} color="var(--brand-primary)" style={{ flexShrink: 0 }} />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    placeholder="Type your answer (exact words from text)..."
                    value={userAnswer || ''}
                    disabled={submitted}
                    onChange={(e) => handleSelect(q.id, e.target.value)}
                    className="input"
                  />
                </div>
              )}

              {/* Rationale if submitted */}
              {submitted && (
                <div style={{
                  padding: 'var(--space-4)',
                  backgroundColor: isCorrect ? 'var(--success-subtle)' : 'var(--error-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                }}>
                  <div style={{ fontWeight: 600, color: isCorrect ? 'var(--success)' : 'var(--error)', marginBottom: '0.2rem' }}>
                    {isCorrect ? 'Correct' : `Incorrect — Official Answer: ${Array.isArray(q.correctAnswer) ? q.correctAnswer.join('/') : q.correctAnswer}`}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      {!submitted ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
          <button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length < diagnosticQuestions.length}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', maxWidth: '340px', justifyContent: 'center' }}
          >
            <span>Complete Diagnostic Evaluation</span>
            <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <div className="card" style={{
          backgroundColor: 'var(--brand-primary-subtle)',
          border: '1px solid var(--brand-primary-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          alignItems: 'center',
          textAlign: 'center',
          padding: 'clamp(1.25rem, 4vw, 2rem)',
        }}>
          <Award size={36} color="var(--brand-primary)" />
          <div>
            <h2 style={{ fontSize: '1.6rem', color: 'var(--brand-primary)' }}>
              Diagnostic Baseline Established: Band {formatBand(profile.currentEstimatedBand)}
            </h2>
            <p style={{ maxWidth: '560px', marginTop: '0.5rem' }}>
              Your personalized adaptive curriculum has been calibrated for <strong>Band {profile.targetBand.toFixed(1)}</strong>. Weakness remediation paths for True/False/Not Given and paragraph scanning have been prioritized.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: 'var(--space-2)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={onFinish} className="btn btn-primary btn-lg">
              <span>Go to Personalized Dashboard</span>
              <ArrowRight size={18} />
            </button>
            <button onClick={handleReset} className="btn btn-secondary btn-lg">
              <RotateCcw size={16} />
              <span>Retake</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
