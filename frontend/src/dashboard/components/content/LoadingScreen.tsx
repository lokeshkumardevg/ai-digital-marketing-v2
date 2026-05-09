import React from 'react';

interface LoadingScreenProps {
  text?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  text = 'Loading Creative Hub...',
}) => {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}
    >
      <div
        className="animate-fade-in"
        style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600 }}
      >
        {text}
      </div>
    </div>
  );
};

export default LoadingScreen;