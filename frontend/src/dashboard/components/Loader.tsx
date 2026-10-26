import React, { memo } from 'react';
import { Sparkles } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   WHEEDLE AI FUTURISTIC LOADER SYSTEM
   Theme: Wheedle Dark (#050a18) + Electric Blue (#0665ff) + Cyan (#22d3ee)
   GPU Accelerated • Dual Rotating Glowing Rings • Central Pulse
───────────────────────────────────────────────────────────── */

export type LoaderVariant = 'page' | 'section' | 'inline' | 'button';
export type LoaderSize = 'sm' | 'md' | 'lg';

export interface LoaderProps {
  variant?: LoaderVariant;
  size?: LoaderSize;
  message?: string;
  submessage?: string;
}

const SIZE_CONFIG = {
  sm: { outer: 38, inner: 26, orb: 14, icon: 10, font: 12 },
  md: { outer: 60, inner: 44, orb: 22, icon: 13, font: 14 },
  lg: { outer: 80, inner: 60, orb: 30, icon: 16, font: 16 },
};

const LoaderComponent: React.FC<LoaderProps> = ({
  variant = 'section',
  size = 'md',
  message = 'Processing AI Matrix...',
  submessage,
}) => {
  const cfg = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  /* INLINE (e.g. inside small cards or badges) */
  if (variant === 'inline') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: '2px solid rgba(6, 101, 255, 0.2)',
            borderTopColor: '#0665ff',
            borderRightColor: '#22d3ee',
            display: 'inline-block',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        {message && (
          <span style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '13px', fontWeight: 500 }}>
            {message}
          </span>
        )}
      </span>
    );
  }

  /* BUTTON (inside primary action buttons) */
  if (variant === 'button') {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            width: 15,
            height: 15,
            borderRadius: '50%',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            borderTopColor: '#ffffff',
            display: 'inline-block',
            animation: 'spin 0.7s linear infinite',
          }}
        />
        {message && <span>{message}</span>}
      </span>
    );
  }

  const isPage = variant === 'page';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isPage ? '0' : '48px 24px',
        minHeight: isPage ? 'calc(100vh - 80px)' : '240px',
        width: '100%',
        position: 'relative',
        background: isPage ? 'var(--bg-primary, #050a18)' : 'transparent',
        boxSizing: 'border-box',
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: 'absolute',
          width: cfg.outer * 3.5,
          height: cfg.outer * 3.5,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 101, 255, 0.16) 0%, transparent 70%)',
          filter: 'blur(36px)',
          pointerEvents: 'none',
        }}
      />

      {/* Dual Rotating Rings Core */}
      <div
        style={{
          position: 'relative',
          width: cfg.outer,
          height: cfg.outer,
          marginBottom: '16px',
        }}
      >
        {/* Outer Ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid rgba(6, 101, 255, 0.15)',
            borderTopColor: '#0665ff',
            borderRightColor: '#22d3ee',
            animation: 'spin 1.1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite',
            boxShadow: '0 0 16px rgba(6, 101, 255, 0.35)',
          }}
        />

        {/* Inner Ring (Counter-rotating) */}
        <div
          style={{
            position: 'absolute',
            inset: `${(cfg.outer - cfg.inner) / 2}px`,
            borderRadius: '50%',
            border: '2px solid rgba(34, 211, 238, 0.15)',
            borderBottomColor: '#22d3ee',
            borderLeftColor: '#0665ff',
            animation: 'spin 1.8s linear infinite reverse',
          }}
        />

        {/* Center Orb */}
        <div
          style={{
            position: 'absolute',
            inset: `${(cfg.outer - cfg.orb) / 2}px`,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0665ff 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 12px rgba(6, 101, 255, 0.65)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          <Sparkles size={cfg.icon} />
        </div>
      </div>

      {/* Primary Message */}
      {message && (
        <div
          style={{
            fontSize: `${cfg.font}px`,
            fontWeight: 700,
            color: 'var(--text-primary, #f8fafc)',
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '-0.2px',
            textAlign: 'center',
          }}
        >
          {message}
        </div>
      )}

      {/* Submessage */}
      {submessage && (
        <div
          style={{
            fontSize: '12.5px',
            color: 'var(--text-secondary, #94a3b8)',
            marginTop: '6px',
            textAlign: 'center',
            maxWidth: '380px',
            lineHeight: 1.45,
          }}
        >
          {submessage}
        </div>
      )}
    </div>
  );
};

export const Loader = memo(LoaderComponent);

export const PageLoader = ({
  message = 'Loading Intelligence Matrix...',
  submessage = 'Syncing real-time workspace nodes & analytics data',
}: {
  message?: string;
  submessage?: string;
}) => (
  <Loader variant="page" size="lg" message={message} submessage={submessage} />
);

export const SectionLoader = ({
  message = 'Fetching Data...',
  submessage,
}: {
  message?: string;
  submessage?: string;
}) => (
  <Loader variant="section" size="md" message={message} submessage={submessage} />
);

export const InlineLoader = ({
  message,
}: {
  message?: string;
}) => (
  <Loader variant="inline" size="sm" message={message} />
);

export const ButtonLoader = ({
  message,
}: {
  message?: string;
}) => (
  <Loader variant="button" size="sm" message={message} />
);

export default Loader;