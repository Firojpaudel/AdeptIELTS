import React from 'react';

interface AdeptLogoProps {
  variant?: 'full' | 'icon';
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const AdeptLogo: React.FC<AdeptLogoProps> = ({
  variant = 'full',
  height = 36,
  className = '',
  style = {},
}) => {
  if (variant === 'icon') {
    return (
      <div
        className={`adept-icon-container ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height,
          width: height,
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          flexShrink: 0,
          ...style,
        }}
      >
        <img
          src="/brand/app-icon.png"
          alt="AdeptIELTS Icon"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div
      className={`adept-logo-lockup ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height,
        flexShrink: 0,
        userSelect: 'none',
        ...style,
      }}
    >
      <img
        src="/brand/logo-light.png"
        alt="AdeptIELTS — Adaptive Preparation"
        className="adept-logo-light"
        style={{
          height,
          width: 'auto',
          objectFit: 'contain',
        }}
        loading="eager"
      />
      <img
        src="/brand/logo-dark.png"
        alt="AdeptIELTS — Adaptive Preparation"
        className="adept-logo-dark"
        style={{
          height,
          width: 'auto',
          objectFit: 'contain',
        }}
        loading="eager"
      />
    </div>
  );
};

export default AdeptLogo;
