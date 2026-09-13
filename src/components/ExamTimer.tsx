import { useState, useEffect } from 'react';
import { Timer, Pause, Play, RotateCcw } from 'lucide-react';

export interface ExamTimerProps {
  totalSeconds: number;
  onTimeExpired?: () => void;
  autoStart?: boolean;
  warnUnderMinutes?: number;
  label?: string;
  isActiveExternal?: boolean;
  onActiveChange?: (active: boolean) => void;
}

export const ExamTimer = ({
  totalSeconds,
  onTimeExpired,
  autoStart = false,
  warnUnderMinutes = 5,
  isActiveExternal,
  onActiveChange,
}: ExamTimerProps) => {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isActive, setIsActive] = useState(autoStart);
  const [hasStarted, setHasStarted] = useState(autoStart);

  // Sync external active state if provided
  useEffect(() => {
    if (isActiveExternal !== undefined && isActiveExternal !== isActive) {
      setIsActive(isActiveExternal);
      if (isActiveExternal) setHasStarted(true);
    }
  }, [isActiveExternal]);

  useEffect(() => {
    setSecondsLeft(totalSeconds);
    if (!autoStart && isActiveExternal === undefined) {
      setIsActive(false);
      setHasStarted(false);
    }
  }, [totalSeconds, autoStart]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsActive(false);
            if (onActiveChange) onActiveChange(false);
            if (onTimeExpired) onTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, onTimeExpired, onActiveChange]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const isWarning = secondsLeft <= warnUnderMinutes * 60 && secondsLeft > 0;
  const isDanger = secondsLeft <= 60 && secondsLeft > 0;

  const formatUnit = (n: number) => n.toString().padStart(2, '0');
  const formattedTime = `${hours > 0 ? `${formatUnit(hours)}:` : ''}${formatUnit(minutes)}:${formatUnit(seconds)}`;

  const totalMin = Math.round(totalSeconds / 60);

  const handleStart = () => {
    setIsActive(true);
    setHasStarted(true);
    if (onActiveChange) onActiveChange(true);
  };

  const handleTogglePause = () => {
    const next = !isActive;
    setIsActive(next);
    if (onActiveChange) onActiveChange(next);
  };

  const handleReset = () => {
    setIsActive(false);
    setHasStarted(false);
    setSecondsLeft(totalSeconds);
    if (onActiveChange) onActiveChange(false);
  };

  // State 1: Idle / Readiness Mode (Never auto-tick before user is ready)
  if (!hasStarted) {
    return (
      <button
        type="button"
        onClick={handleStart}
        className="btn"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 0.95rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-sm)',
          fontSize: '0.84rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          cursor: 'pointer',
          transition: 'all 200ms cubic-bezier(0.23, 1, 0.32, 1)',
        }}
        title="Click when you are ready to begin the timed exam"
      >
        <Play size={13} style={{ fill: 'currentColor', color: 'var(--brand-primary)', flexShrink: 0 }} />
        <span className="feedback-tab-full">Start Timed Session ({totalMin}m)</span>
        <span className="feedback-tab-short">Timed ({totalMin}m)</span>
      </button>
    );
  }

  // State 2: Active / Paused Morphed Timer Pill
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.65rem',
        padding: '0.36rem 0.85rem',
        backgroundColor: isDanger
          ? 'var(--error-subtle)'
          : isWarning
          ? 'var(--warning-subtle)'
          : !isActive
          ? '#fffbeb'
          : 'var(--bg-surface)',
        border: `1px solid ${
          isDanger
            ? 'var(--error-border)'
            : isWarning
            ? 'var(--warning-border)'
            : !isActive
            ? '#fde68a'
            : 'var(--brand-primary-border)'
        }`,
        borderRadius: 'var(--radius-full)',
        boxShadow: isDanger ? '0 0 0 2px var(--error-border)' : 'var(--shadow-sm)',
        transition: 'all 240ms cubic-bezier(0.23, 1, 0.32, 1)',
        animation: 'timerMorph 220ms cubic-bezier(0.23, 1, 0.32, 1)',
      }}
    >
      {/* Live / Paused Status Indicator with Pulsing Emerald Dot */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: !isActive ? '#b45309' : isDanger ? 'var(--error)' : 'var(--brand-primary)',
        }}
      >
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: !isActive ? '#f59e0b' : isDanger ? 'var(--error)' : 'var(--brand-primary)',
            display: 'inline-block',
            animation: !isActive ? 'none' : 'pulseDot 1.6s ease-in-out infinite',
          }}
        />
        {!isActive ? 'PAUSED' : 'LIVE'}
      </span>

      <span style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-default)' }} />

      {/* Digits with Tabular Numeral Alignment */}
      <span
        className="font-mono"
        style={{
          fontSize: '0.96rem',
          fontWeight: 700,
          color: isDanger
            ? 'var(--error)'
            : isWarning
            ? 'var(--warning)'
            : !isActive
            ? '#92400e'
            : 'var(--text-primary)',
          letterSpacing: '0.04em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {formattedTime}
      </span>

      {/* Control Buttons with Tactile Press Feedback */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', marginLeft: '0.1rem' }}>
        <button
          type="button"
          onClick={handleTogglePause}
          style={{
            padding: '4px',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-xs)',
            transition: 'all var(--transition-fast)',
            cursor: 'pointer',
          }}
          title={isActive ? 'Pause Timer' : 'Resume Timer'}
          aria-label={isActive ? 'Pause Timer' : 'Resume Timer'}
        >
          {isActive ? <Pause size={13} /> : <Play size={13} style={{ fill: 'currentColor' }} />}
        </button>

        <button
          type="button"
          onClick={handleReset}
          style={{
            padding: '4px',
            color: 'var(--text-secondary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-xs)',
            transition: 'all var(--transition-fast)',
            cursor: 'pointer',
          }}
          title="Reset to Preparation Mode"
          aria-label="Reset to Preparation Mode"
        >
          <RotateCcw size={13} />
        </button>
      </div>
    </div>
  );
};
