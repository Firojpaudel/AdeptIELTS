import { useState, useEffect } from 'react';
import { Sparkles, Clock } from 'lucide-react';
import { IELTS_SPEAKING_PROMPTS } from '../../data/ieltsDataset';
import { SpeakingSession, SpeakingFeedback } from '../../lib/types';
import { evaluateSpeakingTranscript } from '../../lib/aiService';
import { saveSpeakingSession } from '../../lib/storage';
import { logStudyEvent } from '../../lib/studyTracker';
import { AudioRecorder } from '../../components/AudioRecorder';

export const SpeakingCoachView = () => {
  const [selectedPrompt, setSelectedPrompt] = useState(IELTS_SPEAKING_PROMPTS[0]);
  const [prepSecondsLeft, setPrepSecondsLeft] = useState(selectedPrompt.prepSeconds);
  const [isPrepping, setIsPrepping] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);

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
    setPrepSecondsLeft(selectedPrompt.prepSeconds);
    setIsPrepping(true);
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
        recordingDuration || 60
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
        Math.round(recordingDuration / 60) || 3,
        result ? `Band ${result.estimated_band.toFixed(1)}` : 'Recorded'
      );
    } catch (e) {
      console.error('Speaking evaluation failed', e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header & Part Switcher */}
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
            IELTS Speaking Interview Simulator
          </div>
          <h1 style={{ marginTop: '0.2rem', fontSize: '1.75rem' }}>Speaking Examiner Practice</h1>
          <p style={{ marginTop: '0.2rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Simulate authentic Part 1, Part 2 (Cue Card), and Part 3 face-to-face interviews with live speech recording.
          </p>
        </div>

        <div style={{
          display: 'inline-flex',
          gap: '2px',
          backgroundColor: 'var(--bg-subtle)',
          padding: '3px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-default)',
        }}>
          {IELTS_SPEAKING_PROMPTS.map((p) => {
            const isActive = selectedPrompt.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPrompt(p);
                  setFeedback(null);
                  setTranscriptText('');
                  setIsPrepping(false);
                  setPrepSecondsLeft(p.prepSeconds);
                }}
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
                Part {p.part}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cue Card Prompt Area (Double Bezel) */}
      <div className="double-bezel">
        <div className="double-bezel-inner" style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-brand" style={{ fontSize: '0.74rem' }}>
              Topic: {selectedPrompt.topic}
            </span>
            <span className="badge badge-zinc">Part {selectedPrompt.part} Task</span>
          </div>

          <h2 style={{ fontSize: '1.25rem', lineHeight: 1.45, fontWeight: 700 }}>
            {selectedPrompt.prompt}
          </h2>

          {selectedPrompt.bulletPoints && (
            <div style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                You should say:
              </div>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {selectedPrompt.bulletPoints.map((b, idx) => (
                  <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 1-Minute Prep Control for Part 2 */}
          {selectedPrompt.part === 2 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} color="var(--brand-primary)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  1-Minute Preparation Time:
                </span>
                <span className="font-mono" style={{ fontWeight: 700, color: prepSecondsLeft <= 10 ? 'var(--error)' : 'var(--brand-primary)' }}>
                  {prepSecondsLeft}s
                </span>
              </div>

              {!isPrepping && prepSecondsLeft > 0 && (
                <button onClick={handleStartPrep} className="btn btn-secondary btn-sm">
                  Start Prep Countdown
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recording & Speech Capture Component */}
      <div>
        <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-3)', fontWeight: 600 }}>
          Record Spoken Response (Up to {selectedPrompt.talkSeconds} seconds)
        </h3>
        <AudioRecorder
          maxDurationSeconds={selectedPrompt.talkSeconds}
          onRecordingComplete={handleRecordingDone}
        />
      </div>

      {/* Transcript review & edit (Double Bezel) */}
      <div className="double-bezel">
        <div className="double-bezel-inner" style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Spoken Transcript (Auto-Transcribed from Speech):
            </label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              You may edit or refine transcript before submitting for evaluation
            </span>
          </div>

          <textarea
            value={transcriptText}
            onChange={(e) => setTranscriptText(e.target.value)}
            placeholder="Speak into the microphone above to auto-transcribe your speech, or type notes here..."
            className="textarea"
            style={{
              minHeight: '120px',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: '#ffffff',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating || !transcriptText.trim()}
              className="btn btn-primary btn-lg"
              style={{ borderRadius: 'var(--radius-full)', padding: '0.65rem 1.4rem' }}
            >
              <Sparkles size={16} />
              <span>{isEvaluating ? 'Examiner Evaluating Speech...' : 'Evaluate Spoken Performance'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Panel */}
      {feedback && (
        <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Estimated Band */}
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
                Speaking Performance Estimate
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                Overall Band {feedback.estimated_band.toFixed(1)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Based on speech flow, vocabulary breadth, and grammatical accuracy.
              </div>
            </div>
          </div>

          {/* Criteria Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fluency & Coherence</div>
              <div className="font-mono" style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--brand-primary)' }}>
                Band {feedback.criteria.fluency_coherence.toFixed(1)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {feedback.observations.fluency}
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lexical Resource</div>
              <div className="font-mono" style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--brand-primary)' }}>
                Band {feedback.criteria.lexical_resource.toFixed(1)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {feedback.observations.vocabulary}
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Grammatical Range</div>
              <div className="font-mono" style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--brand-primary)' }}>
                Band {feedback.criteria.grammatical_range.toFixed(1)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {feedback.observations.grammar}
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pronunciation & Rhythm</div>
              <div className="font-mono" style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--brand-primary)' }}>
                Band {feedback.criteria.pronunciation.toFixed(1)}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {feedback.observations.pronunciation}
              </div>
            </div>
          </div>

          {/* Targeted Drills */}
          {feedback.targeted_drills.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--brand-primary)', marginBottom: '0.4rem' }}>
                Targeted Speaking Drills
              </h4>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {feedback.targeted_drills.map((drill, idx) => (
                  <li key={idx} style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{drill}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
