import { useState } from 'react';
import { RotateCcw, Sparkles, Clock, Play } from 'lucide-react';
import { IELTS_WRITING_PROMPTS } from '../../data/ieltsDataset';
import { WritingSubmission, WritingFeedback } from '../../lib/types';
import { evaluateWritingEssay } from '../../lib/aiService';
import { saveWritingSubmission } from '../../lib/storage';
import { logStudyEvent } from '../../lib/studyTracker';
import { ExamTimer } from '../../components/ExamTimer';

export const WritingCoachView = () => {
  const [selectedPrompt, setSelectedPrompt] = useState(IELTS_WRITING_PROMPTS[0]);
  const [essayText, setEssayText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const showTimer = true;

  const wordCount = essayText.trim().split(/\s+/).filter(Boolean).length;
  const minRequired = selectedPrompt.minWords;
  const isWordCountSufficient = wordCount >= minRequired;

  const handleEvaluate = async () => {
    if (wordCount < 40) return;
    setIsEvaluating(true);

    try {
      const result = await evaluateWritingEssay(selectedPrompt.promptText, essayText, selectedPrompt.taskType);
      setFeedback(result);

      const submission: WritingSubmission = {
        id: `sub-${Date.now()}`,
        taskType: selectedPrompt.taskType,
        promptTitle: selectedPrompt.title,
        promptText: selectedPrompt.promptText,
        essayText,
        wordCount,
        timeSpentSeconds: selectedPrompt.timeMinutes * 60,
        timestamp: new Date().toISOString(),
        feedback: result,
      };

      saveWritingSubmission(submission);
      logStudyEvent(
        'writing',
        `Writing Essay: ${selectedPrompt.title} (${wordCount} words)`,
        selectedPrompt.timeMinutes || 20,
        result ? `Band ${result.estimated_band.toFixed(1)}` : 'Submitted'
      );
    } catch (e) {
      console.error('Writing evaluation error:', e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setEssayText('');
    setFeedback(null);
    setIsTimerActive(false);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header & Mode Switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: 'var(--space-4)',
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 650, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            IELTS Academic & General Writing
          </div>
          <h1 style={{ marginTop: '0.2rem', fontSize: '1.75rem' }}>Writing Evaluator</h1>
          <p style={{ marginTop: '0.2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Instant criterion-by-criterion diagnostics under authentic IELTS rubrics (Task Response, Coherence, Lexical Resource, Grammar).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {showTimer && (
            <ExamTimer
              totalSeconds={selectedPrompt.timeMinutes * 60}
              warnUnderMinutes={5}
              autoStart={false}
              isActiveExternal={isTimerActive}
              onActiveChange={setIsTimerActive}
            />
          )}

          <div style={{
            display: 'inline-flex',
            gap: '2px',
            backgroundColor: 'var(--bg-subtle)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
          }}>
            {IELTS_WRITING_PROMPTS.map(p => {
              const isActive = selectedPrompt.id === p.id;
              const label = p.id.includes('automation')
                ? 'Task 2 Essay'
                : p.id.includes('renewable')
                ? 'Task 1 Graph'
                : 'Task 1 Letter';

              return (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPrompt(p); setFeedback(null); setIsTimerActive(false); }}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'calc(var(--radius-md) - 2px)',
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.82rem',
                    boxShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.06)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Prompt Card (Double Bezel) */}
      <div className="double-bezel">
        <div className="double-bezel-inner" style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-brand" style={{ fontSize: '0.74rem' }}>
              {selectedPrompt.title}
            </span>
            <span className="badge badge-zinc">Minimum {selectedPrompt.minWords} words</span>
          </div>

          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.55 }}>
            {selectedPrompt.promptText}
          </div>
        </div>
      </div>

      {/* Exam Readiness & Strategy Card */}
      {!isTimerActive ? (
        <div className="card fade-in" style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--brand-primary-subtle)',
          border: '1px solid var(--brand-primary-border)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#ffffff',
              border: '1px solid var(--brand-primary-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-primary)',
              boxShadow: 'var(--shadow-xs)',
            }}>
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 650, color: 'var(--text-primary)' }}>
                Exam Simulation: {selectedPrompt.timeMinutes} Minutes Allocated
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Spend 5m planning & outlining, {selectedPrompt.timeMinutes - 10}m composing, and 5m proofreading. When you are ready, start the timer.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsTimerActive(true)}
            className="btn btn-primary"
            style={{
              gap: '0.45rem',
              borderRadius: 'var(--radius-full)',
              padding: '0.45rem 1.15rem',
              fontSize: '0.85rem',
              fontWeight: 650,
            }}
          >
            <Play size={13} style={{ fill: 'currentColor' }} />
            <span>I'm Ready — Start Timer</span>
          </button>
        </div>
      ) : (
        <div className="fade-in" style={{
          padding: '0.65rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: 'var(--brand-primary)',
              animation: 'pulseDot 1.6s ease-in-out infinite',
            }} />
            <strong>Timed Session In Progress:</strong> Aim for minimum {selectedPrompt.minWords} words before time expires.
          </span>

          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Authentic IELTS Rubrics Enabled
          </span>
        </div>
      )}

      {/* Editor & Diagnostic Results Split Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: feedback ? 'minmax(0, 1fr) minmax(0, 1fr)' : '1fr',
        gap: 'var(--space-6)',
        alignItems: 'start',
      }}>
        {/* Editor Area (Double Bezel) */}
        <div className="double-bezel" style={{ width: '100%' }}>
          <div className="double-bezel-inner" style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Essay Response Workspace
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Auto-formatted with word limits and band requirement feedback
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isWordCountSufficient ? 'var(--success-subtle)' : 'var(--warning-subtle)',
                border: `1px solid ${isWordCountSufficient ? 'var(--success-border)' : 'var(--warning-border)'}`,
                color: isWordCountSufficient ? 'var(--success)' : 'var(--warning)',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}>
                <span className="font-mono">{wordCount}</span> / {minRequired} words
              </div>
            </div>

            <textarea
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder={`Draft your complete IELTS ${selectedPrompt.taskType.toUpperCase()} essay here...\n\nExample paragraph structure:\n1. Introduction & Thesis\n2. First Main Argument with Supporting Example\n3. Counter-Perspective or Second Dimension\n4. Conclusion & Summary`}
              className="textarea"
              style={{
                minHeight: '420px',
                fontSize: '0.96rem',
                lineHeight: 1.7,
                padding: '1.2rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-default)',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
              <button
                onClick={handleReset}
                className="btn btn-secondary btn-sm"
                disabled={!essayText && !feedback}
              >
                <RotateCcw size={14} />
                <span>Clear Editor</span>
              </button>

              <button
                onClick={handleEvaluate}
                disabled={isEvaluating || wordCount < 30}
                className="btn btn-primary btn-lg"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.65rem 1.4rem' }}
              >
                <Sparkles size={16} />
                <span>{isEvaluating ? 'Evaluating Rubric...' : 'Evaluate Band & Feedback'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Feedback Panel */}
        {feedback && (
          <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxHeight: '680px', overflowY: 'auto' }}>
            {/* Band Score Snapshot */}
            <div style={{
              padding: 'var(--space-5)',
              backgroundColor: 'var(--brand-primary-subtle)',
              border: '1px solid var(--brand-primary-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-primary)', letterSpacing: '0.04em' }}>
                  AI-Estimated Performance
                </span>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                  Overall Band {feedback.estimated_band.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Indicative diagnostic estimation • Not official IELTS certificate
                </div>
              </div>
            </div>

            {/* 4 Official Criteria Scores */}
            <div>
              <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                IELTS Assessment Criteria
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div style={{ padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Task Response</div>
                  <div className="font-mono" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--brand-primary)' }}>
                    Band {feedback.criteria.task_response.toFixed(1)}
                  </div>
                </div>

                <div style={{ padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Coherence & Cohesion</div>
                  <div className="font-mono" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--brand-primary)' }}>
                    Band {feedback.criteria.coherence.toFixed(1)}
                  </div>
                </div>

                <div style={{ padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lexical Resource</div>
                  <div className="font-mono" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--brand-primary)' }}>
                    Band {feedback.criteria.lexical_resource.toFixed(1)}
                  </div>
                </div>

                <div style={{ padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Grammatical Accuracy</div>
                  <div className="font-mono" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--brand-primary)' }}>
                    Band {feedback.criteria.grammar.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths */}
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--success)' }}>
                Demonstrated Strengths
              </h4>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {feedback.strengths.map((str, idx) => (
                  <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{str}</li>
                ))}
              </ul>
            </div>

            {/* Key Issues & Recommendations */}
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--warning)' }}>
                Areas for Score Acceleration
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {feedback.issues.map((iss, idx) => (
                  <div key={idx} style={{
                    padding: '0.65rem 0.85rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                  }}>
                    <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {iss.problem}
                    </strong>
                    <div style={{ color: 'var(--text-secondary)' }}>{iss.suggestion}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Rewrite Drills */}
            {feedback.rewrite_exercises.length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.4rem', color: 'var(--brand-primary)' }}>
                  Targeted Sentence Elevation Drill
                </h4>
                {feedback.rewrite_exercises.map((rw, idx) => (
                  <div key={idx} style={{
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    fontSize: '0.85rem',
                  }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                      ORIGINAL PHRASE:
                    </div>
                    <div style={{ fontStyle: 'italic', color: 'var(--text-primary)' }}>
                      "{rw.original}"
                    </div>
                    <div style={{ color: 'var(--brand-primary)', fontWeight: 600, marginTop: '0.2rem' }}>
                      Goal: {rw.instruction}
                    </div>
                    <div style={{
                      padding: '0.4rem 0.6rem',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--success)',
                      fontWeight: 500,
                    }}>
                      Model Upgrade: {rw.model_revision}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
