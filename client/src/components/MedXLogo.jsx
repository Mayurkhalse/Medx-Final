import React from 'react';

/**
 * Authoritative Med-X Brand Logo Component
 * Grounded in the official reference:
 * [Purple ECG Pulse Waveform Icon] MedX (bold purple wordmark)
 */
export function MedXLogo({
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  showText = true,
  className = '',
  style = {}
}) {
  const sizeMap = {
    sm: { icon: 20, fontSize: '1.1rem', gap: '0.4rem', stroke: 2.4 },
    md: { icon: 26, fontSize: '1.35rem', gap: '0.5rem', stroke: 2.6 },
    lg: { icon: 34, fontSize: '1.75rem', gap: '0.65rem', stroke: 2.8 },
    xl: { icon: 44, fontSize: '2.25rem', gap: '0.8rem', stroke: 3.2 }
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`medx-brand-lockup ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: current.gap,
        userSelect: 'none',
        ...style
      }}
    >
      {/* Authoritative Purple ECG Pulse Icon */}
      <svg
        width={current.icon}
        height={current.icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, display: 'block' }}
        aria-hidden="true"
      >
        <path
          d="M3 16h6l3.5-9.5L18.5 25.5 23 16h6"
          stroke="#7C3AED"
          strokeWidth={current.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Authoritative MedX Wordmark */}
      {showText && (
        <span
          style={{
            fontSize: current.fontSize,
            fontWeight: 800,
            letterSpacing: '-0.035em',
            color: '#7C3AED',
            fontFamily: 'var(--medx-font-display, "Plus Jakarta Sans", sans-serif)',
            lineHeight: 1,
            whiteSpace: 'nowrap'
          }}
        >
          MedX
        </span>
      )}
    </div>
  );
}

export default MedXLogo;
