import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type LoaderVariant = 'page' | 'section' | 'inline' | 'button' | 'overlay';
type LoaderSize    = 'sm' | 'md' | 'lg' | 'xl';

interface LoaderProps {
  variant?:  LoaderVariant;  // page=full screen, section=card-level, inline=inside text, button=inside button, overlay=on top of content
  size?:     LoaderSize;
  message?:  string;         // optional loading message
  submessage?: string;       // optional smaller subtitle
  transparent?: boolean;     // skip background (for overlay)
}

// ─── Size map ─────────────────────────────────────────────────────────────────
const SIZE: Record<LoaderSize, { ring: number; dot: number; gap: number; font: string; subFont: string }> = {
  sm:  { ring: 28,  dot: 4,  gap: 10, font: '0.78rem', subFont: '0.68rem' },
  md:  { ring: 44,  dot: 5,  gap: 14, font: '0.88rem', subFont: '0.75rem' },
  lg:  { ring: 64,  dot: 7,  gap: 18, font: '1rem',    subFont: '0.82rem' },
  xl:  { ring: 88,  dot: 9,  gap: 24, font: '1.15rem', subFont: '0.88rem' },
};

// ─── Keyframes (injected once) ────────────────────────────────────────────────
const STYLES = `
  @keyframes wai-spin {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes wai-pulse {
    0%, 100% { opacity: 1;   transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.75); }
  }
  @keyframes wai-orbit {
    0%   { transform: rotate(0deg)   translateX(var(--orbit-r)) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg); }
  }
  @keyframes wai-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes wai-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes wai-bar {
    0%   { transform: scaleY(0.3); }
    50%  { transform: scaleY(1.0); }
    100% { transform: scaleY(0.3); }
  }
  @keyframes wai-glow-ring {
    0%, 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0); }
    50%       { box-shadow: 0 0 24px 4px rgba(124,58,237,0.35); }
  }
`;

// ─── Inject styles once ────────────────────────────────────────────────────────
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.textContent = STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Classic spinning arc ring */
const RingSpinner: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
    {/* Track */}
    <div style={{
      position: 'absolute', inset: 0, borderRadius: '50%',
      border: `${Math.max(2, size * 0.07)}px solid rgba(124,58,237,0.15)`,
    }} />
    {/* Spinning arc */}
    <div style={{
      position: 'absolute', inset: 0, borderRadius: '50%',
      border: `${Math.max(2, size * 0.07)}px solid transparent`,
      borderTopColor: '#7c3aed',
      borderRightColor: 'rgba(124,58,237,0.4)',
      animation: 'wai-spin 0.9s cubic-bezier(0.4,0,0.2,1) infinite',
    }} />
    {/* Inner glow dot */}
    <div style={{
      position: 'absolute',
      top: '50%', left: '50%',
      width: size * 0.2, height: size * 0.2,
      borderRadius: '50%',
      background: 'radial-gradient(circle, #a78bfa, #7c3aed)',
      transform: 'translate(-50%, -50%)',
      boxShadow: '0 0 10px rgba(124,58,237,0.8)',
    }} />
  </div>
);

/** Three orbiting dots */
const OrbitDots: React.FC<{ size: number }> = ({ size }) => {
  const r     = size * 0.35;
  const dSize = Math.max(4, size * 0.13);
  const dots  = [
    { color: '#7c3aed', delay: '0s',     opacity: 1 },
    { color: '#a78bfa', delay: '-0.3s',  opacity: 0.75 },
    { color: '#6366f1', delay: '-0.6s',  opacity: 0.5 },
  ];
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Faint center */}
      <div style={{ position: 'absolute', inset: size * 0.3 }} />
      {dots.map((d, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: dSize, height: dSize,
          marginTop: -dSize / 2, marginLeft: -dSize / 2,
          borderRadius: '50%',
          background: d.color,
          boxShadow: `0 0 8px ${d.color}`,
          opacity: d.opacity,
          ['--orbit-r' as any]: `${r}px`,
          animation: `wai-orbit ${0.9 + i * 0.15}s linear ${d.delay} infinite`,
        }} />
      ))}
    </div>
  );
};

/** Pulsing bar equalizer */
const BarLoader: React.FC<{ size: number }> = ({ size }) => {
  const bars  = 5;
  const bw    = Math.max(3, size * 0.1);
  const bh    = size * 0.65;
  const gap   = bw * 0.7;
  const colors = ['#6366f1', '#7c3aed', '#8b5cf6', '#a78bfa', '#7c3aed'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap, height: size, flexShrink: 0 }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{
          width: bw, height: bh,
          borderRadius: bw,
          background: colors[i],
          boxShadow: `0 0 8px ${colors[i]}80`,
          transformOrigin: 'center bottom',
          animation: `wai-bar 1s ease-in-out ${i * 0.12}s infinite`,
        }} />
      ))}
    </div>
  );
};

/** Inline spinner (just the small ring, no wrapper) */
const InlineSpinner: React.FC<{ size: number }> = ({ size }) => (
  <div style={{
    display: 'inline-block',
    width: size, height: size,
    borderRadius: '50%',
    border: `${Math.max(2, size * 0.12)}px solid rgba(124,58,237,0.2)`,
    borderTopColor: '#7c3aed',
    animation: 'wai-spin 0.8s linear infinite',
    flexShrink: 0,
  }} />
);

/** Shimmer text label */
const ShimmerText: React.FC<{ text: string; fontSize: string }> = ({ text, fontSize }) => (
  <div style={{
    fontSize,
    fontWeight: 600,
    fontFamily: 'Outfit, sans-serif',
    background: 'linear-gradient(90deg, #a78bfa 0%, #f1f5f9 40%, #a78bfa 60%, #6366f1 100%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'wai-shimmer 2s linear infinite',
    whiteSpace: 'nowrap',
  }}>
    {text}
  </div>
);

// ─── Main Loader ──────────────────────────────────────────────────────────────
export const Loader: React.FC<LoaderProps> = ({
  variant    = 'section',
  size       = 'md',
  message,
  submessage,
  transparent = false,
}) => {
  injectStyles();
  const s = SIZE[size];

  // ── INLINE ──────────────────────────────────────────────────────────────────
  if (variant === 'inline') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, verticalAlign: 'middle' }}>
        <InlineSpinner size={s.ring * 0.55} />
        {message && (
          <span style={{ fontSize: s.font, color: '#94a3b8', fontWeight: 500 }}>{message}</span>
        )}
      </span>
    );
  }

  // ── BUTTON ──────────────────────────────────────────────────────────────────
  if (variant === 'button') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
        <InlineSpinner size={14} />
        <span style={{ fontSize: s.font, fontWeight: 600 }}>{message || 'Loading...'}</span>
      </span>
    );
  }

  // ── PAGE (full-screen) ───────────────────────────────────────────────────────
  if (variant === 'page') {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: s.gap,
        animation: 'wai-fade-in 0.3s ease-out',
      }}>
        {/* Background glow blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: '20%', right: '30%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', filter: 'blur(30px)' }} />
        </div>

        {/* Logo wordmark */}
        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em', marginBottom: 4 }}>
          Wheedle<span style={{ background: 'linear-gradient(135deg,#a78bfa,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>.ai</span>
        </div>

        {/* Main spinner group */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <OrbitDots size={s.ring * 1.5} />
        </div>

        {/* Animated glow ring behind */}
        <div style={{
          position: 'absolute',
          width: s.ring * 2.2, height: s.ring * 2.2,
          borderRadius: '50%',
          border: '1px solid rgba(124,58,237,0.2)',
          animation: 'wai-glow-ring 2s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {message && <ShimmerText text={message} fontSize={s.font} />}
        {submessage && (
          <div style={{ fontSize: s.subFont, color: '#475569', fontWeight: 500, marginTop: -8 }}>{submessage}</div>
        )}
      </div>
    );
  }

  // ── OVERLAY (on top of content without unmounting it) ─────────────────────
  if (variant === 'overlay') {
    return (
      <div style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: transparent ? 'transparent' : 'rgba(8,13,26,0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: s.gap,
        borderRadius: 'inherit',
        animation: 'wai-fade-in 0.2s ease-out',
      }}>
        <RingSpinner size={s.ring} />
        {message && <ShimmerText text={message} fontSize={s.font} />}
        {submessage && (
          <div style={{ fontSize: s.subFont, color: '#94a3b8', fontWeight: 500 }}>{submessage}</div>
        )}
      </div>
    );
  }

  // ── SECTION (default — card / panel level) ────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: s.gap,
      padding: '48px 24px',
      animation: 'wai-fade-in 0.25s ease-out',
      width: '100%',
    }}>
      <BarLoader size={s.ring} />
      {message && <ShimmerText text={message} fontSize={s.font} />}
      {submessage && (
        <div style={{ fontSize: s.subFont, color: '#475569', fontWeight: 500, textAlign: 'center' }}>
          {submessage}
        </div>
      )}
    </div>
  );
};

// ─── Named preset exports (convenience) ──────────────────────────────────────

/** Full-screen page loader */
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <Loader variant="page" size="xl" message={message} />
);

/** Card / panel level loader */
export const SectionLoader: React.FC<{ message?: string; size?: LoaderSize }> = ({ message, size = 'md' }) => (
  <Loader variant="section" size={size} message={message} />
);

/** Inline loader — sits inside a sentence or next to text */
export const InlineLoader: React.FC<{ message?: string }> = ({ message }) => (
  <Loader variant="inline" size="sm" message={message} />
);

/** Overlay on top of a positioned container */
export const OverlayLoader: React.FC<{ message?: string; size?: LoaderSize }> = ({ message, size = 'md' }) => (
  <Loader variant="overlay" size={size} message={message} />
);

/** Replaces the text/icon inside a button */
export const ButtonLoader: React.FC<{ message?: string }> = ({ message }) => (
  <Loader variant="button" size="sm" message={message} />
);

export default Loader;