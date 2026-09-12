import { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  ArrowRight,
  Columns,
  Layers,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
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
  const [feedbackTab, setFeedbackTab] = useState<'rubric' | 'comparison' | 'vocabulary'>('rubric');
  const [copiedModel, setCopiedModel] = useState(false);
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
                    backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.82rem',
                    boxShadow: isActive ? 'var(--shadow-xs)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 140ms var(--ease-out), color 140ms var(--ease-out), box-shadow 140ms var(--ease-out)',
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
              backgroundColor: 'var(--bg-surface)',
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

      {/* Editor & Diagnostic Results Split Grid (Stacks on screens <= 900px) */}
      <div
        className={feedback ? 'responsive-split-grid' : ''}
        style={{
          display: 'grid',
          gridTemplateColumns: feedback ? undefined : '1fr',
          gap: 'var(--space-6)',
          alignItems: 'start',
        }}
      >
        {/* Editor Area (Double Bezel) */}
        <div className="double-bezel" style={{ width: '100%' }}>
          <div className="double-bezel-inner" style={{
            padding: 'clamp(1rem, 4vw, 1.5rem)',
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
                backgroundColor: 'var(--bg-surface)',
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
          <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxHeight: '720px', overflowY: 'auto' }}>
            {/* Band Score & Examiner Summary Header */}
            <div style={{
              padding: '1.25rem',
              backgroundColor: 'var(--brand-primary-subtle)',
              border: '1px solid var(--brand-primary-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 750, textTransform: 'uppercase', color: 'var(--brand-primary)', letterSpacing: '0.05em' }}>
                    Cambridge Certified IELTS Assessment
                  </span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                    Overall Band {feedback.estimated_band.toFixed(1)}
                  </div>
                </div>
                <span className="badge badge-brand" style={{ fontSize: '0.75rem' }}>
                  Official Public Rubrics
                </span>
              </div>
              {feedback.examiner_summary && (
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  {feedback.examiner_summary}
                </p>
              )}
            </div>

            {/* Segmented Feedback Mode Switcher */}
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--bg-subtle)',
              padding: '4px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              gap: '4px',
            }}>
              <button
                type="button"
                onClick={() => setFeedbackTab('rubric')}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: feedbackTab === 'rubric' ? 'var(--bg-surface)' : 'transparent',
                  color: feedbackTab === 'rubric' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  fontWeight: feedbackTab === 'rubric' ? 700 : 550,
                  fontSize: '0.8rem',
                  border: feedbackTab === 'rubric' ? '1px solid var(--border-subtle)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  boxShadow: feedbackTab === 'rubric' ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 150ms ease',
                }}
              >
                <Layers size={13} />
                <span>Diagnostic Rubric</span>
              </button>

              <button
                type="button"
                onClick={() => setFeedbackTab('comparison')}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: feedbackTab === 'comparison' ? 'var(--bg-surface)' : 'transparent',
                  color: feedbackTab === 'comparison' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  fontWeight: feedbackTab === 'comparison' ? 700 : 550,
                  fontSize: '0.8rem',
                  border: feedbackTab === 'comparison' ? '1px solid var(--border-subtle)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  boxShadow: feedbackTab === 'comparison' ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 150ms ease',
                }}
              >
                <Columns size={13} />
                <span>Side-by-Side Model</span>
              </button>

              <button
                type="button"
                onClick={() => setFeedbackTab('vocabulary')}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: feedbackTab === 'vocabulary' ? 'var(--bg-surface)' : 'transparent',
                  color: feedbackTab === 'vocabulary' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  fontWeight: feedbackTab === 'vocabulary' ? 700 : 550,
                  fontSize: '0.8rem',
                  border: feedbackTab === 'vocabulary' ? '1px solid var(--border-subtle)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  boxShadow: feedbackTab === 'vocabulary' ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 150ms ease',
                }}
              >
                <Zap size={13} />
                <span>Lexical Upgrades ({feedback.lexical_upgrades?.length || 0})</span>
              </button>
            </div>

            {/* TAB 1: DIAGNOSTIC RUBRIC */}
            {feedbackTab === 'rubric' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* 4 Official Criteria Scores */}
                <div>
                  <h4 style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.45rem', letterSpacing: '0.04em' }}>
                    IELTS 4 Assessment Criteria
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div style={{ padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Task Response</div>
                      <div className="font-mono" style={{ fontWeight: 750, fontSize: '1.15rem', color: 'var(--brand-primary)' }}>
                        Band {feedback.criteria.task_response.toFixed(1)}
                      </div>
                    </div>

                    <div style={{ padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Coherence & Cohesion</div>
                      <div className="font-mono" style={{ fontWeight: 750, fontSize: '1.15rem', color: 'var(--brand-primary)' }}>
                        Band {feedback.criteria.coherence.toFixed(1)}
                      </div>
                    </div>

                    <div style={{ padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Lexical Resource</div>
                      <div className="font-mono" style={{ fontWeight: 750, fontSize: '1.15rem', color: 'var(--brand-primary)' }}>
                        Band {feedback.criteria.lexical_resource.toFixed(1)}
                      </div>
                    </div>

                    <div style={{ padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Grammatical Accuracy</div>
                      <div className="font-mono" style={{ fontWeight: 750, fontSize: '1.15rem', color: 'var(--brand-primary)' }}>
                        Band {feedback.criteria.grammar.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* What Went Right vs What Went Wrong */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                  {/* What Went Right */}
                  <div style={{
                    padding: '0.85rem',
                    backgroundColor: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: 'var(--radius-md)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--success)', fontWeight: 700, fontSize: '0.86rem', marginBottom: '0.4rem' }}>
                      <CheckCircle2 size={15} />
                      <span>What Went Right (Demonstrated Strengths)</span>
                    </div>
                    <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: 0 }}>
                      {(feedback.what_went_right && feedback.what_went_right.length > 0 ? feedback.what_went_right : feedback.strengths).map((str, idx) => (
                        <li key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  {/* What Went Wrong */}
                  <div style={{
                    padding: '0.85rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 'var(--radius-md)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--danger)', fontWeight: 700, fontSize: '0.86rem', marginBottom: '0.4rem' }}>
                      <AlertTriangle size={15} />
                      <span>What Went Wrong (Crucial Areas Holding You Back)</span>
                    </div>
                    <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: 0 }}>
                      {(feedback.what_went_wrong && feedback.what_went_wrong.length > 0 ? feedback.what_went_wrong : feedback.issues.map(i => i.problem)).map((iss, idx) => (
                        <li key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{iss}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Priority Actions */}
                {feedback.priority_actions && feedback.priority_actions.length > 0 && (
                  <div style={{ padding: '0.8rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                    <h4 style={{ fontSize: '0.82rem', color: 'var(--brand-primary)', marginBottom: '0.35rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      High-Yield Priority Actions for Next Band:
                    </h4>
                    <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', margin: 0 }}>
                      {feedback.priority_actions.map((act, idx) => (
                        <li key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>{act}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SIDE-BY-SIDE MODEL REWRITE & COMPARISON */}
            {feedbackTab === 'comparison' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '1rem',
                  alignItems: 'start',
                }}>
                  {/* Column 1: Candidate Original */}
                  <div style={{
                    padding: '1rem',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Your Submitted Draft
                      </span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                        {wordCount} words
                      </span>
                    </div>
                    <div style={{
                      maxHeight: '300px',
                      overflowY: 'auto',
                      fontSize: '0.85rem',
                      lineHeight: 1.6,
                      color: 'var(--text-secondary)',
                      whiteSpace: 'pre-wrap',
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      {essayText}
                    </div>

                    {feedback.sentence_corrections && feedback.sentence_corrections.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                          Identified Flaws in Draft:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                          {feedback.sentence_corrections.map((sc, idx) => (
                            <div key={idx} style={{
                              padding: '0.5rem 0.65rem',
                              backgroundColor: 'rgba(239, 68, 68, 0.05)',
                              borderLeft: '2px solid var(--danger)',
                              borderRadius: 'var(--radius-xs)',
                              fontSize: '0.78rem',
                            }}>
                              <div style={{ fontStyle: 'italic', color: 'var(--text-primary)' }}>"{sc.original}"</div>
                              <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem', fontSize: '0.72rem' }}>{sc.explanation}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Examiner Model Solution */}
                  <div style={{
                    padding: '1rem',
                    backgroundColor: 'var(--brand-primary-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--brand-primary-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 750, color: 'var(--brand-primary)' }}>
                        Cambridge Examiner Model (Band 8.5+)
                      </span>
                      {feedback.examiner_model_answer && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(feedback.examiner_model_answer || '');
                            setCopiedModel(true);
                            setTimeout(() => setCopiedModel(false), 2000);
                          }}
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', gap: '0.25rem' }}
                        >
                          {copiedModel ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                          <span>{copiedModel ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                    <div style={{
                      maxHeight: '300px',
                      overflowY: 'auto',
                      fontSize: '0.85rem',
                      lineHeight: 1.65,
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-wrap',
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--brand-primary-border)',
                    }}>
                      {feedback.examiner_model_answer || (
                        feedback.rewrite_exercises?.[0]?.model_revision || 'Model answer generated upon submission.'
                      )}
                    </div>

                    {feedback.sentence_corrections && feedback.sentence_corrections.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                          Examiner Model Rewrites:
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                          {feedback.sentence_corrections.map((sc, idx) => (
                            <div key={idx} style={{
                              padding: '0.5rem 0.65rem',
                              backgroundColor: 'rgba(16, 185, 129, 0.08)',
                              borderLeft: '2px solid var(--success)',
                              borderRadius: 'var(--radius-xs)',
                              fontSize: '0.78rem',
                            }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>"{sc.corrected}"</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LEXICAL RESOURCE UPGRADES */}
            {feedbackTab === 'vocabulary' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Examiner recommendations replacing candidate draft phrases with Band 8+ academic collocations:
                </div>
                {(feedback.lexical_upgrades && feedback.lexical_upgrades.length > 0) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {feedback.lexical_upgrades.map((lex, idx) => (
                      <div key={idx} style={{
                        padding: '0.75rem',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Draft: <strong style={{ color: 'var(--danger)', textDecoration: 'line-through' }}>{lex.original}</strong>
                          </span>
                          <span className="badge badge-brand" style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>
                            {lex.category?.replace(/_/g, ' ') || 'Collocation'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontWeight: 700, fontSize: '0.88rem' }}>
                          <ArrowRight size={14} />
                          <span>{lex.upgrade}</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                          {lex.context}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No specific lexical upgrades identified for this submission.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
