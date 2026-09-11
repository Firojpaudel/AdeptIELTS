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
        <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Target IELTS Band:
            </label>
            <select
              value={targetBandInput}
              onChange={(e) => setTargetBandInput(Number(e.target.value))}
              className="select"
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
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Examination Module:
            </label>
            <select
              value={testTypeInput}
              onChange={(e) => setTestTypeInput(e.target.value as any)}
              className="select"
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
              gap: 'var(--space-4)',
              border: submitted ? (isCorrect ? '1px solid var(--success-border)' : '1px solid var(--error-border)') : '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  QUESTION {idx + 1} OF {diagnosticQuestions.length} • {q.subskill.toUpperCase()}
                </span>
                <span className="badge badge-neutral">{q.difficulty}</span>
              </div>

              {q.passageText && (
                <div style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  borderLeft: '3px solid var(--brand-primary)',
                }}>
                  <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                    Excerpt: {q.passageTitle}
                  </strong>
                  {q.passageText.slice(0, 320)}...
                </div>
              )}

              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {q.prompt}
              </div>

              {/* Options */}
              {q.options ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {q.options.map((opt) => {
                    const selected = userAnswer === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelect(q.id, opt)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          border: `1px solid ${selected ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                          backgroundColor: selected ? 'var(--brand-primary-subtle)' : 'var(--bg-surface)',
                          color: selected ? 'var(--brand-primary)' : 'var(--text-primary)',
                          fontWeight: selected ? 600 : 500,
                          textAlign: 'left',
                          cursor: submitted ? 'default' : 'pointer',
                        }}
                      >
                        <span>{opt}</span>
                        {selected && <CheckCircle2 size={16} color="var(--brand-primary)" />}
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
          padding: 'var(--space-8)',
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

          <div style={{ display: 'flex', gap: '1rem', marginTop: 'var(--space-2)' }}>
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
