import React from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  text?: string;
  subtext?: string;
  inline?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  text = 'Loading Creative Hub...',
  subtext = 'Syncing AI media assets & visual templates',
  inline = false,
}) => {
  return (
    <div
      style={{
        height: inline ? '320px' : 'calc(100vh - 120px)',
        minHeight: '260px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: inline ? 'transparent' : 'var(--bg-primary, #050a18)',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {/* Background radial glow */}
      <div
        style={{
          position: 'absolute',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 101, 255, 0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Futuristic Spinner Ring */}
      <div
        style={{
          position: 'relative',
          width: '74px',
          height: '74px',
          marginBottom: '20px',
        }}
      >
        {/* Outer glowing rotating ring */}
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

        {/* Counter-rotating inner ring */}
        <div
          style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '50%',
            border: '2px solid rgba(34, 211, 238, 0.15)',
            borderBottomColor: '#22d3ee',
            borderLeftColor: '#0665ff',
            animation: 'spin 1.8s linear infinite reverse',
          }}
        />

        {/* Center glowing orb with icon */}
        <div
          style={{
            position: 'absolute',
            inset: '18px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0665ff 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 14px rgba(6, 101, 255, 0.6)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          <Sparkles size={16} />
        </div>
      </div>

      {/* Loading Text */}
      <div
        style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--text-primary, #f8fafc)',
          fontFamily: 'Outfit, sans-serif',
          letterSpacing: '-0.2px',
          textAlign: 'center',
        }}
      >
        {text}
      </div>

      {subtext && (
        <div
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary, #94a3b8)',
            marginTop: '6px',
            textAlign: 'center',
            maxWidth: '360px',
          }}
        >
          {subtext}
        </div>
      )}
    </div>
  );
};

export default LoadingScreen;