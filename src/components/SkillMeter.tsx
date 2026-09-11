interface SkillMeterProps {
  label: string;
  currentBand: number;
  targetBand: number;
  masteryPercentage?: number;
  size?: 'sm' | 'md' | 'lg';
  onAction?: () => void;
}

export const SkillMeter = ({
  label,
  currentBand,
  targetBand,
  masteryPercentage,
  size = 'md',
  onAction,
}: SkillMeterProps) => {
  const percentage = Math.min(100, Math.max(0, (currentBand / 9.0) * 100));
  const targetPercentage = Math.min(100, Math.max(0, (targetBand / 9.0) * 100));
  const isTargetAchieved = currentBand >= targetBand;
  const gap = Number((targetBand - currentBand).toFixed(1));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.45rem',
      width: '100%',
      padding: '0.75rem 0.95rem',
      backgroundColor: 'var(--bg-canvas)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      transition: 'border-color var(--transition-fast)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: size === 'sm' ? '0.82rem' : '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {label}
          </span>
          {isTargetAchieved ? (
            <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>On Target</span>
          ) : (
            <span className="badge badge-zinc" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
              -{gap} band gap
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="font-mono" style={{
            fontSize: '0.92rem',
            fontWeight: 700,
            color: isTargetAchieved ? 'var(--success)' : 'var(--text-primary)',
          }}>
            {currentBand.toFixed(1)}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            / {targetBand.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Modern Progress Bar */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: size === 'sm' ? '5px' : '6px',
        backgroundColor: 'rgba(228, 228, 231, 0.7)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
      }}>
        {/* Fill bar */}
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: isTargetAchieved
            ? 'linear-gradient(90deg, #10b981, #059669)'
            : 'linear-gradient(90deg, #0d9488, #0f766e)',
          borderRadius: 'var(--radius-full)',
          transition: 'width 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
        }} />

        {/* Target tick marker */}
        <div style={{
          position: 'absolute',
          left: `${targetPercentage}%`,
          top: 0,
          bottom: 0,
          width: '2px',
          backgroundColor: '#09090b',
          zIndex: 2,
          opacity: 0.7,
        }} />
      </div>

      {masteryPercentage !== undefined && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.1rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Adaptive mastery: <strong style={{ color: 'var(--text-secondary)' }}>{masteryPercentage}%</strong>
          </span>
          {onAction && (
            <button
              onClick={onAction}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.72rem',
                color: 'var(--brand-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Practice skill →
            </button>
          )}
        </div>
      )}
    </div>
  );
};
