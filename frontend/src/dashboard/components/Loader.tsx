import React, { memo } from 'react';

/* ─────────────────────────────────────────────────────────────
   UNIQUE LIGHTWEIGHT AI LOADER
   Theme: Dark Blue + Black
   Fast • GPU Optimized • Minimal DOM • Premium Look
───────────────────────────────────────────────────────────── */

type LoaderVariant = 'page' | 'section' | 'inline' | 'button';
type LoaderSize = 'sm' | 'md' | 'lg';

interface LoaderProps {
  variant?: LoaderVariant;
  size?: LoaderSize;
  message?: string;
}

const SIZE = {
  sm: 42,
  md: 58,
  lg: 76,
};

const STYLE_ID = 'wheedle-ai-loader-styles';

const styles = `
/* ──────────────────────────────────────────
   ROOT
────────────────────────────────────────── */
.wai-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-family: Inter, sans-serif;
}
 
/* ──────────────────────────────────────────
   CORE
────────────────────────────────────────── */
.wai-core {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Outer rotating ring */
.wai-ring {
  position: absolute;
  inset: 0;

  border-radius: 999px;

  border: 2px solid rgba(59,130,246,0.08);
  border-top-color: #3b82f6;
  border-right-color: rgba(96,165,250,0.7);

  animation: wai-spin 1s linear infinite;

  will-change: transform;
}

/* Middle pulse ring */
.wai-ring-2 {
  position: absolute;
  inset: 8px;

  border-radius: 999px;
  border: 1px solid rgba(96,165,250,0.18);

  animation: wai-pulse 2s ease-in-out infinite;
}

/* Core orb */
.wai-core-dot {
  width: 28%;
  height: 28%;

  border-radius: 999px;

  background:
    radial-gradient(circle at 30% 30%, #93c5fd 0%, #2563eb 55%, #1e3a8a 100%);

  box-shadow:
    0 0 12px rgba(37,99,235,0.45),
    0 0 30px rgba(37,99,235,0.15);

  animation: wai-breathe 1.8s ease-in-out infinite;
}

/* Floating particles */
.wai-particle {
  position: absolute;

  width: 6px;
  height: 6px;

  border-radius: 999px;

  background: #60a5fa;

  opacity: 0.7;

  animation: wai-orbit linear infinite;
}

/* ──────────────────────────────────────────
   TEXT
────────────────────────────────────────── */
.wai-message {
  color: #dbeafe;

  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.4px;

  opacity: 0.95;

  animation: wai-text 2s ease-in-out infinite;
}

.wai-sub {
  color: #64748b;
  font-size: 12px;
}

/* ──────────────────────────────────────────
   INLINE
────────────────────────────────────────── */
.wai-inline {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

/* ──────────────────────────────────────────
   BUTTON
────────────────────────────────────────── */
.wai-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

/* ──────────────────────────────────────────
   ANIMATIONS
────────────────────────────────────────── */
@keyframes wai-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes wai-pulse {
  0%,100% {
    transform: scale(1);
    opacity: 0.35;
  }
  50% {
    transform: scale(1.12);
    opacity: 0.7;
  }
}

@keyframes wai-breathe {
  0%,100% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.82);
  }
}

@keyframes wai-orbit {
  from {
    transform: rotate(0deg) translateX(var(--orbit)) rotate(0deg);
  }
  to {
    transform: rotate(360deg) translateX(var(--orbit)) rotate(-360deg);
  }
}

@keyframes wai-text {
  0%,100% {
    opacity: 0.75;
  }
  50% {
    opacity: 1;
  }
}
`;

function injectStyles() {
  if (typeof document === 'undefined') return;

  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.innerHTML = styles;

  document.head.appendChild(style);
}

/* ───────────────────────────────────────────── */

const CoreLoader = ({ size }: { size: number }) => {
  const particleSize = size * 0.08;

  return (
    <div
      className="wai-core"
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Rings */}
      <div className="wai-ring" />
      <div className="wai-ring-2" />

      {/* Core */}
      <div className="wai-core-dot" />

      {/* Floating particles */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="wai-particle"
          style={{
            width: particleSize,
            height: particleSize,

            ['--orbit' as any]: `${size * 0.42}px`,

            animationDuration: `${2.6 + i * 0.4}s`,
            animationDelay: `${i * 0.25}s`,
          }}
        />
      ))}
    </div>
  );
};

/* ───────────────────────────────────────────── */

const LoaderComponent: React.FC<LoaderProps> = ({
  variant = 'section',
  size = 'md',
  message = 'Initializing AI...',
}) => {
  injectStyles();

  const loaderSize = SIZE[size];

  /* INLINE */
  if (variant === 'inline') {
    return (
      <span className="wai-inline">
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            border: '2px solid rgba(59,130,246,0.18)',
            borderTopColor: '#3b82f6',
            animation: 'wai-spin .7s linear infinite',
          }}
        />

        <span
          style={{
            color: '#cbd5e1',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {message}
        </span>
      </span>
    );
  }

  /* BUTTON */
  if (variant === 'button') {
    return (
      <span className="wai-button">
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 999,
            border: '2px solid rgba(255,255,255,0.15)',
            borderTopColor: '#60a5fa',
            animation: 'wai-spin .7s linear infinite',
          }}
        />

        <span>{message}</span>
      </span>
    );
  }

  return (
    <div
      className={`wai-loader ${
        variant === 'page' ? 'wai-loader-page' : ''
      }`}
      style={{
        padding: variant === 'section' ? '42px 24px' : undefined,
      }}
    >
       

      {/* Loader */}
      <CoreLoader size={loaderSize} />

      {/* Message */}
      <div className="wai-message">{message}</div>

      {/* Tiny ambient glow */}
      <div
        style={{
          position: 'absolute',

          width: loaderSize * 3,
          height: loaderSize * 3,

          borderRadius: '50%',

          background:
            'radial-gradient(circle, rgba(37,99,235,0.10), transparent 70%)',

          filter: 'blur(40px)',

          zIndex: -1,

          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────
   EXPORTS
───────────────────────────────────────────── */

export const Loader = memo(LoaderComponent);

export const PageLoader = ({
  message,
}: {
  message?: string;
}) => (
  <Loader
    variant="page"
    size="lg"
    message={message}
  />
);

export const SectionLoader = ({
  message,
}: {
  message?: string;
}) => (
  <Loader
    variant="section"
    size="md"
    message={message}
  />
);

export const InlineLoader = ({
  message,
}: {
  message?: string;
}) => (
  <Loader
    variant="inline"
    size="sm"
    message={message}
  />
);

export const ButtonLoader = ({
  message,
}: {
  message?: string;
}) => (
  <Loader
    variant="button"
    size="sm"
    message={message}
  />
);

export default Loader;