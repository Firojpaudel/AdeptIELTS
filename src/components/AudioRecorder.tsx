import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Volume2, AlertCircle, Loader2 } from 'lucide-react';
import { transcribeAudioWithWhisper } from '../lib/aiService';

interface AudioRecorderProps {
  maxDurationSeconds?: number;
  onRecordingComplete: (audioBlob: Blob, transcript: string, durationSeconds: number) => void;
  onLiveTranscript?: (liveText: string) => void;
  onRecordingStatusChange?: (recording: boolean) => void;
  /** Groq API key for Whisper STT fallback on mobile browsers */
  apiKey?: string;
}

export const AudioRecorder = ({
  maxDurationSeconds = 120,
  onRecordingComplete,
  onLiveTranscript,
  onRecordingStatusChange,
  apiKey,
}: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const liveTranscriptRef = useRef('');
  const durationRef = useRef(0);
  const isRecordingRef = useRef(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const mimeTypeRef = useRef('');

  // Detect supported audio MIME type across iOS Safari and Android Chrome
  const getSupportedMimeType = (): string => {
    if (typeof MediaRecorder === 'undefined') return '';
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg;codecs=opus',
    ];
    for (const mime of candidates) {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(mime)) {
        return mime;
      }
    }
    return '';
  };

  // Initialize Speech Recognition if supported across browsers (Chrome, Edge, Safari 14.5+)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentText = '';
          for (let i = 0; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript + ' ';
          }
          const trimmed = currentText.trim();
          setLiveTranscript(trimmed);
          liveTranscriptRef.current = trimmed;
          if (onLiveTranscript) {
            onLiveTranscript(trimmed);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition status/warning:', e?.error);
        };

        recognition.onend = () => {
          // Restart recognition if still actively recording (e.g. mobile Safari silence timeout)
          if (isRecordingRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (_) {}
          }
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('SpeechRecognition initialization error:', e);
      }
    }
  }, []);

  const startRecording = async () => {
    setErrorMsg(null);
    audioChunksRef.current = [];
    setLiveTranscript('');
    liveTranscriptRef.current = '';
    setAudioUrl(null);
    setDuration(0);
    durationRef.current = 0;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const mime = getSupportedMimeType();
      mimeTypeRef.current = mime;
      const options = mime ? { mimeType: mime } : undefined;

      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        // Fallback without mimeType option if browser rejects format
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blobType = mimeTypeRef.current || (audioChunksRef.current[0]?.type) || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Clean up microphone stream tracks
        stream.getTracks().forEach(track => track.stop());

        // Whisper STT Fallback: if Web Speech API produced no transcript (common on mobile),
        // send the recorded audio to Groq Whisper for server-side transcription.
        let finalTranscript = liveTranscriptRef.current;
        if ((!finalTranscript || finalTranscript.length < 3) && apiKey && audioBlob.size > 1000) {
          setIsTranscribing(true);
          try {
            const whisperResult = await transcribeAudioWithWhisper(audioBlob, apiKey);
            if (whisperResult.text && whisperResult.text.length > 0) {
              finalTranscript = whisperResult.text;
              setLiveTranscript(finalTranscript);
              liveTranscriptRef.current = finalTranscript;
              if (onLiveTranscript) onLiveTranscript(finalTranscript);
            }
          } catch (err) {
            console.warn('Whisper fallback failed:', err);
          } finally {
            setIsTranscribing(false);
          }
        }

        onRecordingComplete(audioBlob, finalTranscript, durationRef.current);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      isRecordingRef.current = true;
      if (onRecordingStatusChange) onRecordingStatusChange(true);

      // Start duration counter
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const next = prev + 1;
          durationRef.current = next;
          if (next >= maxDurationSeconds) {
            stopRecording();
            return maxDurationSeconds;
          }
          return next;
        });
      }, 1000);

      // Start live transcription if available
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Already started or unsupported on this device
        }
      }
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setErrorMsg(
        err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
          ? 'Microphone permission was denied. Please allow microphone access in your browser settings to practice Speaking.'
          : 'Could not access microphone. Please check your device audio settings.'
      );
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsRecording(false);
    if (onRecordingStatusChange) onRecordingStatusChange(false);
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioUrl) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setLiveTranscript('');
    liveTranscriptRef.current = '';
    setDuration(0);
    durationRef.current = 0;
    setIsPlaying(false);
    if (onLiveTranscript) {
      onLiveTranscript('');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="double-bezel">
      <div className="double-bezel-inner" style={{
        padding: 'clamp(1rem, 4vw, 1.5rem)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}>
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 0.8rem',
            backgroundColor: 'var(--error-subtle)',
            color: 'var(--error)',
            fontSize: '0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--error-border)',
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {!isRecording && !audioUrl && (
              <button
                onClick={startRecording}
                className="btn btn-primary"
                style={{ padding: '0.55rem 1.15rem' }}
              >
                <Mic size={16} />
                <span>Start Recording</span>
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="btn btn-danger"
                style={{ padding: '0.55rem 1.15rem' }}
              >
                <Square size={16} />
                <span>Stop Recording</span>
              </button>
            )}

            {audioUrl && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={togglePlayback}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  <span>{isPlaying ? 'Pause' : 'Listen'}</span>
                </button>
                <button
                  onClick={resetRecording}
                  className="btn btn-subtle"
                  style={{ padding: '0.5rem 0.75rem' }}
                  title="Discard and Retake"
                >
                  <RotateCcw size={15} />
                  <span>Retake</span>
                </button>
              </div>
            )}

            <div className="font-mono" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: isRecording ? 'var(--error)' : 'var(--text-secondary)',
            }}>
              {isRecording && (
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--error)',
                  display: 'inline-block',
                  animation: 'pulse 1.2s infinite',
                }} />
              )}
              <span>{formatTime(duration)} / {formatTime(maxDurationSeconds)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {isTranscribing ? 'Transcribing with AI...' : isRecording ? 'Speaking in progress...' : audioUrl ? 'Response captured' : 'Microphone standby'}
            </span>
            {isTranscribing ? (
              <span className="badge badge-brand" style={{ fontSize: '0.68rem', padding: '2px 6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Loader2 size={10} className="spin" />
                Whisper STT
              </span>
            ) : speechSupported ? (
              <span className="badge badge-brand" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                STT Live
              </span>
            ) : apiKey ? (
              <span className="badge badge-brand" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                Whisper Fallback
              </span>
            ) : (
              <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                Audio Only
              </span>
            )}
          </div>
        </div>

        {/* Audio player element (hidden native controller) */}
        {audioUrl && (
          <audio
            ref={audioPlayerRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            style={{ display: 'none' }}
          />
        )}

        {/* Real-time transcript status & transfer indicator */}
        <div style={{
          backgroundColor: isRecording ? 'var(--brand-primary-subtle)' : 'var(--bg-subtle)',
          border: `1px solid ${isRecording ? 'var(--brand-primary-border)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem 1rem',
          minHeight: '60px',
          transition: 'all 160ms ease-out',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              <Volume2 size={13} color="var(--brand-primary)" />
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Live Speech Stream
              </span>
              {isRecording && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '0.72rem',
                  fontWeight: 650,
                  color: 'var(--brand-primary)',
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)', animation: 'pulseDot 1.4s infinite' }} />
                  Streaming live into editor below ↓
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {speechSupported ? 'Real-Time Web Speech' : 'Microphone Ready'}
            </span>
          </div>
          <p style={{
            fontSize: '0.88rem',
            lineHeight: 1.5,
            color: liveTranscript ? 'var(--text-primary)' : 'var(--text-muted)',
            fontStyle: liveTranscript ? 'normal' : 'italic',
            wordBreak: 'break-word',
          }}>
            {liveTranscript
              ? `"${liveTranscript}"`
              : (isRecording
                  ? 'Listening to microphone... spoken words are streaming directly into your response workspace below.'
                  : 'Spoken words stream directly into your response workspace below as you talk.')}
          </p>
        </div>
      </div>
    </div>
  );
};
