import { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  Mic,
  MessageSquare,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  PenTool,
  RotateCcw,
  Lightbulb,
} from 'lucide-react';
import { IELTS_SPEAKING_PROMPTS } from '../../data/ieltsDataset';
import { SpeakingSession, SpeakingFeedback, SpeakingPrompt } from '../../lib/types';
import { evaluateSpeakingTranscript } from '../../lib/aiService';
import { saveSpeakingSession } from '../../lib/storage';
import { logStudyEvent } from '../../lib/studyTracker';
import { AudioRecorder } from '../../components/AudioRecorder';

export const SpeakingCoachView = () => {
  const [activePart, setActivePart] = useState<1 | 2 | 3>(1);
  const partPrompts = IELTS_SPEAKING_PROMPTS.filter(p => p.part === activePart);

  const [selectedPrompt, setSelectedPrompt] = useState<SpeakingPrompt>(partPrompts[0] || IELTS_SPEAKING_PROMPTS[0]);
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(selectedPrompt.prepSeconds);
  const [isPrepping, setIsPrepping] = useState(false);
  const [prepNotes, setPrepNotes] = useState('');
  const [transcriptText, setTranscriptText] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [showPhrases, setShowPhrases] = useState(true);

  // Switch active part and update prompt
  const handlePartSelect = (part: 1 | 2 | 3) => {
    setActivePart(part);
    const promptsForPart = IELTS_SPEAKING_PROMPTS.filter(p => p.part === part);
    const firstPrompt = promptsForPart[0] || IELTS_SPEAKING_PROMPTS[0];
    setSelectedPrompt(firstPrompt);
    setFeedback(null);
    setTranscriptText('');
    setPrepNotes('');
    setIsPrepping(false);
    setPrepSecondsLeft(firstPrompt.prepSeconds);
  };

  const handlePromptSelect = (prompt: SpeakingPrompt) => {
    setSelectedPrompt(prompt);
    setFeedback(null);
    setTranscriptText('');
    setPrepNotes('');
    setIsPrepping(false);
    setPrepSecondsLeft(prompt.prepSeconds);
  };

  // 1-minute prep timer for Part 2
  useEffect(() => {
    let interval: any = null;
    if (isPrepping && prepSecondsLeft > 0) {
      interval = setInterval(() => {
        setPrepSecondsLeft(p => {
          if (p <= 1) {
            clearInterval(interval);
            setIsPrepping(false);
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPrepping, prepSecondsLeft]);

  const handleStartPrep = () => {
    setPrepSecondsLeft(selectedPrompt.prepSeconds || 60);
    setIsPrepping(true);
  };

  const handleResetPrep = () => {
    setIsPrepping(false);
    setPrepSecondsLeft(selectedPrompt.prepSeconds || 60);
  };

  const handleRecordingDone = (_blob: Blob, transcript: string, duration: number) => {
    setTranscriptText(transcript);
    setRecordingDuration(duration);
  };

  const handleEvaluate = async () => {
    if (!transcriptText.trim()) return;
    setIsEvaluating(true);

    try {
      const result = await evaluateSpeakingTranscript(
        selectedPrompt.topic,
        selectedPrompt.prompt,
        transcriptText,
        recordingDuration || (selectedPrompt.part === 1 ? 45 : 90),
        selectedPrompt.part
      );
      setFeedback(result);

      const session: SpeakingSession = {
        id: `spk-${Date.now()}`,
        part: selectedPrompt.part,
        topic: selectedPrompt.topic,
        prompt: selectedPrompt.prompt,
        bulletPoints: selectedPrompt.bulletPoints,
        transcript: transcriptText,
        durationSeconds: recordingDuration,
        timestamp: new Date().toISOString(),
        feedback: result,
      };

      saveSpeakingSession(session);
      logStudyEvent(
        'speaking',
        `Speaking Drill Part ${selectedPrompt.part}: ${selectedPrompt.topic}`,
        Math.round(recordingDuration / 60) || (selectedPrompt.part === 1 ? 2 : 4),
        result ? `Band ${result.estimated_band.toFixed(1)}` : 'Recorded'
      );
    } catch (e) {
      console.error('Speaking evaluation failed', e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const partDetails = {
    1: {
      title: 'Part 1: Introduction & Interview',
      duration: '4 – 5 minutes',
      speakingLimit: 60,
      description: 'Examiner asks general questions about your life, hobbies, hometown, studies, or daily routine.',
      strategy: 'Answer in 2–3 complete, natural sentences. State your answer clearly, add a reason or brief example, and avoid mechanical memorized speeches.',
      badgeColor: 'var(--brand-primary)',
    },
    2: {
      title: 'Part 2: Individual Long Turn (Cue Card)',
      duration: '3 – 4 minutes',
      speakingLimit: 120,
      description: 'Examiner hands you a cue card prompt. You have 1 minute to plan notes and 1 to 2 minutes of uninterrupted speaking.',
      strategy: 'Use the 1-minute prep timer to jot down 3–4 bullet keywords. Structure your delivery with a clear Past-Present-Future temporal flow.',
      badgeColor: '#8b5cf6',
    },
    3: {
      title: 'Part 3: Two-Way Analytical Discussion',
      duration: '4 – 5 minutes',
      speakingLimit: 120,
      description: 'Examiner explores deeper, abstract, and societal issues connected to the Part 2 topic.',
      strategy: 'Structure responses with: Direct Assertion ➔ In-depth Explanation ➔ Concrete Real-World Example ➔ Balanced Counter-Perspective.',
      badgeColor: '#f59e0b',
    },
  };

  const activeMeta = partDetails[activePart];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '960px', margin: '0 auto', paddingBottom: '5rem' }}>
      
      {/* Header & Part Switcher */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '1.25rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Official IELTS Interview Simulator
            </div>
            <h1 style={{ marginTop: '0.2rem', fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Speaking Examiner Practice
            </h1>
            <p style={{ marginTop: '0.25rem', fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: 1.55 }}>
              Practice authentic face-to-face interviews across Part 1 (Introduction), Part 2 (Cue Card), and Part 3 (In-Depth Discussion) with live speech recording & examiner evaluation.
            </p>
          </div>

          {/* Authentic 3-Part Master Segmented Switcher */}
          <div style={{
            display: 'inline-flex',
            backgroundColor: 'var(--bg-subtle)',
            padding: '4px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-sm)',
            gap: '4px',
          }}>
            {([1, 2, 3] as const).map(p => {
              const isActive = activePart === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePartSelect(p)}
                  style={{
                    padding: '0.5rem 1.15rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isActive ? 'var(--brand-primary)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 550,
                    fontSize: '0.84rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 180ms cubic-bezier(0.23, 1, 0.32, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {p === 1 && <MessageSquare size={14} />}
                  {p === 2 && <Mic size={14} />}
                  {p === 3 && <BookOpen size={14} />}
                  <span>Part {p}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Part Subtitle & Format Guide Banner */}
        <div style={{
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.15rem',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 750,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: activeMeta.badgeColor,
              backgroundColor: 'var(--bg-surface)',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
            }}>
              {activeMeta.title}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={13} color="var(--brand-primary)" />
              <span>Standard exam format: <strong>{activeMeta.duration}</strong></span>
            </span>
          </div>

          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Max speech limit: <strong>{activeMeta.speakingLimit}s</strong>
          </span>
        </div>

        {/* Topic Selector Chips for Current Part */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            Select Part {activePart} Practice Topic:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {partPrompts.map(p => {
              const isSelected = selectedPrompt.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePromptSelect(p)}
                  style={{
                    padding: '0.45rem 0.95rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isSelected ? 'var(--brand-surface)' : 'var(--bg-surface)',
                    color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.82rem',
                    border: isSelected ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease-out',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <span>{p.topic}</span>
                  {isSelected && <CheckCircle2 size={13} color="var(--brand-primary)" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Prompt & Examiner Card */}
      <div className="double-bezel">
        <div className="double-bezel-inner" style={{
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-brand" style={{ fontSize: '0.75rem' }}>
                Topic: {selectedPrompt.topic}
              </span>
              <span className="badge badge-zinc" style={{ fontSize: '0.72rem' }}>
                IELTS Part {selectedPrompt.part}
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {activePart === 1 ? 'Conversational Questions' : activePart === 2 ? '1-Min Prep + 2-Min Speech' : 'Abstract Discussion'}
            </span>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
              {activePart === 1 ? 'Examiner Prompt:' : activePart === 2 ? 'Candidate Task Card:' : 'Discussion Theme:'}
            </div>
            <h2 style={{ fontSize: '1.3rem', lineHeight: 1.45, fontWeight: 750, color: 'var(--text-primary)', margin: 0 }}>
              {selectedPrompt.prompt}
            </h2>
          </div>

          {/* Questions / Bullet Points */}
          {selectedPrompt.bulletPoints && selectedPrompt.bulletPoints.length > 0 && (
            <div style={{
              padding: '1.15rem 1.35rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <HelpCircle size={14} color="var(--brand-primary)" />
                <span>
                  {activePart === 1 ? 'Examiner Questions to Answer:' : activePart === 2 ? 'You should say:' : 'Analytical Inquiries to Address:'}
                </span>
              </div>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', margin: 0 }}>
                {selectedPrompt.bulletPoints.map((b, idx) => (
                  <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    <strong>{idx + 1}.</strong> {b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Band 8+ Vocabulary & Discourse Markers Accordion */}
          {selectedPrompt.suggestedPhrases && selectedPrompt.suggestedPhrases.length > 0 && (
            <div style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}>
              <button
                type="button"
                onClick={() => setShowPhrases(!showPhrases)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  backgroundColor: 'var(--brand-surface)',
                  border: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 650,
                  color: 'var(--brand-primary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Lightbulb size={14} />
                  <span>Band 8.0+ Model Discourse Markers & Phrasing</span>
                </div>
                <span style={{ fontSize: '0.74rem' }}>{showPhrases ? 'Hide' : 'Show Useful Phrases'}</span>
              </button>

              {showPhrases && (
                <div style={{ padding: '0.85rem 1rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', backgroundColor: 'var(--bg-surface)' }}>
                  {selectedPrompt.suggestedPhrases.map((phrase, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-primary)',
                        backgroundColor: 'var(--bg-subtle)',
                        padding: '0.3rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      "{phrase}"
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Part 2 Specific: 1-Minute Prep Countdown Timer & Scratchpad */}
          {selectedPrompt.part === 2 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Clock size={18} color="var(--brand-primary)" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 650, color: 'var(--text-primary)' }}>
                    1-Minute Candidate Preparation Time:
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: prepSecondsLeft <= 10 ? 'var(--error)' : 'var(--brand-primary)',
                      backgroundColor: prepSecondsLeft <= 10 ? 'rgba(239, 68, 68, 0.1)' : 'var(--brand-surface)',
                      padding: '0.15rem 0.55rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {prepSecondsLeft}s
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {!isPrepping && prepSecondsLeft > 0 && (
                    <button type="button" onClick={handleStartPrep} className="btn btn-primary btn-sm" style={{ gap: '0.35rem' }}>
                      <Clock size={13} />
                      <span>Start 1-Min Prep</span>
                    </button>
                  )}
                  {isPrepping && (
                    <button type="button" onClick={() => setIsPrepping(false)} className="btn btn-secondary btn-sm">
                      Pause Timer
                    </button>
                  )}
                  {prepSecondsLeft < (selectedPrompt.prepSeconds || 60) && (
                    <button type="button" onClick={handleResetPrep} className="btn btn-subtle btn-sm" style={{ gap: '0.3rem' }}>
                      <RotateCcw size={13} />
                      <span>Reset Timer</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Candidate Prep Scratchpad */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  <PenTool size={12} />
                  <span>Candidate Scratchpad (Jot down your 3–4 bullet points during the 1-minute prep):</span>
                </div>
                <input
                  type="text"
                  value={prepNotes}
                  onChange={e => setPrepNotes(e.target.value)}
                  placeholder="e.g. 1. Riverside botanic park  2. Cycling trails & quiet flora  3. Weekly visits on weekends  4. Essential mental escape from noise"
                  className="input"
                  style={{ fontSize: '0.84rem', padding: '0.55rem 0.85rem', backgroundColor: '#ffffff' }}
                />
              </div>
            </div>
          )}

          {/* Examiner Strategy Tip */}
          <div style={{
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-subtle)',
            padding: '0.65rem 0.95rem',
            borderRadius: 'var(--radius-sm)',
            borderLeft: `3px solid ${activeMeta.badgeColor}`,
          }}>
            <strong>Examiner Strategy:</strong> {activeMeta.strategy}
          </div>
        </div>
      </div>

      {/* Recording & Speech Capture Component */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.4rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Mic size={17} color="var(--brand-primary)" />
            <span>Record Your Part {activePart} Response (Up to {selectedPrompt.talkSeconds} seconds)</span>
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Speak clearly into microphone. Live transcription runs automatically.
          </span>
        </div>

        <AudioRecorder
          maxDurationSeconds={selectedPrompt.talkSeconds}
          onRecordingComplete={handleRecordingDone}
        />
      </div>

      {/* Transcript Review & Edit (Double Bezel) */}
      <div className="double-bezel">
        <div className="double-bezel-inner" style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 650, color: 'var(--text-primary)' }}>
              Spoken Transcript (Live Speech-to-Text):
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              You may edit or refine words before requesting examiner evaluation
            </span>
          </div>

          <textarea
            value={transcriptText}
            onChange={(e) => setTranscriptText(e.target.value)}
            placeholder="Speak into the microphone above to auto-transcribe your speech, or paste speech notes here..."
            className="textarea"
            style={{
              minHeight: '120px',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: '#ffffff',
              fontSize: '0.9rem',
              lineHeight: 1.6,
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.25rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Duration: <strong>{recordingDuration}s</strong> · Word Count: <strong>{transcriptText.trim() ? transcriptText.trim().split(/\s+/).length : 0} words</strong>
            </span>

            <button
              type="button"
              onClick={handleEvaluate}
              disabled={isEvaluating || !transcriptText.trim()}
              className="btn btn-primary btn-lg"
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '0.75rem 1.65rem',
                fontSize: '0.92rem',
                fontWeight: 700,
                transition: 'transform 120ms ease-out',
              }}
            >
              <Sparkles size={16} />
              <span>{isEvaluating ? 'Examiner Evaluating Speech...' : `Evaluate Part ${activePart} Response`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Panel */}
      {feedback && (
        <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', padding: '1.75rem' }}>
          {/* Estimated Band */}
          <div style={{
            padding: 'var(--space-5)',
            backgroundColor: 'var(--brand-primary-subtle)',
            border: '1px solid var(--brand-primary-border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--brand-primary)', letterSpacing: '0.04em' }}>
                IELTS Speaking Part {selectedPrompt.part} Performance Assessment
              </span>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                Overall Band {feedback.estimated_band.toFixed(1)}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Evaluated against official IELTS public band descriptors (Fluency, Lexical Resource, Grammar, Pronunciation).
              </div>
            </div>
            <span className="badge badge-brand" style={{ fontSize: '0.74rem' }}>
              Synced to Cloud Profile
            </span>
          </div>

          {/* Criteria Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <div style={{ padding: '0.9rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fluency & Coherence</div>
              <div className="font-mono" style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--brand-primary)', marginTop: '0.2rem' }}>
                Band {feedback.criteria.fluency_coherence.toFixed(1)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.45 }}>
                {feedback.observations.fluency}
              </div>
            </div>

            <div style={{ padding: '0.9rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Lexical Resource</div>
              <div className="font-mono" style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--brand-primary)', marginTop: '0.2rem' }}>
                Band {feedback.criteria.lexical_resource.toFixed(1)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.45 }}>
                {feedback.observations.vocabulary}
              </div>
            </div>

            <div style={{ padding: '0.9rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Grammatical Range & Accuracy</div>
              <div className="font-mono" style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--brand-primary)', marginTop: '0.2rem' }}>
                Band {feedback.criteria.grammatical_range.toFixed(1)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.45 }}>
                {feedback.observations.grammar}
              </div>
            </div>

            <div style={{ padding: '0.9rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pronunciation & Rhythm</div>
              <div className="font-mono" style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--brand-primary)', marginTop: '0.2rem' }}>
                Band {feedback.criteria.pronunciation.toFixed(1)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.45 }}>
                {feedback.observations.pronunciation}
              </div>
            </div>
          </div>

          {/* Targeted Drills */}
          {feedback.targeted_drills.length > 0 && (
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.92rem', color: 'var(--brand-primary)', marginBottom: '0.4rem', fontWeight: 700 }}>
                High-Yield Examiner Drills:
              </h4>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: 0 }}>
                {feedback.targeted_drills.map((drill, idx) => (
                  <li key={idx} style={{ fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {drill}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
