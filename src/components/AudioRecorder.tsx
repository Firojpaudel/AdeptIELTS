import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Volume2, AlertCircle } from 'lucide-react';

interface AudioRecorderProps {
  maxDurationSeconds?: number;
  onRecordingComplete: (audioBlob: Blob, transcript: string, durationSeconds: number) => void;
}

export const AudioRecorder = ({
  maxDurationSeconds = 120,
  onRecordingComplete,
}: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + ' ';
        }
        setLiveTranscript(currentText.trim());
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition warning:', e.error);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startRecording = async () => {
    setErrorMsg(null);
    audioChunksRef.current = [];
    setLiveTranscript('');
    setAudioUrl(null);
    setDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Discard active mic stream tracks for security/privacy
        stream.getTracks().forEach(track => track.stop());

        onRecordingComplete(audioBlob, liveTranscript, duration);
      };

      mediaRecorder.start(250);
      setIsRecording(true);

      // Start duration counter
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= maxDurationSeconds) {
            stopRecording();
            return maxDurationSeconds;
          }
          return prev + 1;
        });
      }, 1000);

      // Start live transcription
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Already started or unsupported
        }
      }
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setErrorMsg('Microphone access is required for IELTS Speaking practice. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioUrl) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setLiveTranscript('');
    setDuration(0);
    setIsPlaying(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="double-bezel">
      <div className="double-bezel-inner" style={{
        padding: '1.5rem',
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

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {isRecording ? 'Speaking in progress...' : audioUrl ? 'Response captured' : 'Microphone standby'}
          </span>
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

        {/* Real-time transcript box */}
        <div style={{
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem 1rem',
          minHeight: '60px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <Volume2 size={13} color="var(--text-muted)" />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Live Speech Transcript:
            </span>
          </div>
          <p style={{
            fontSize: '0.88rem',
            lineHeight: 1.5,
            color: liveTranscript ? 'var(--text-primary)' : 'var(--text-muted)',
            fontStyle: liveTranscript ? 'normal' : 'italic',
          }}>
            {liveTranscript || (isRecording ? 'Start speaking clearly into your microphone...' : 'Recorded spoken words will be transcribed here automatically.')}
          </p>
        </div>
      </div>
    </div>
  );
};
