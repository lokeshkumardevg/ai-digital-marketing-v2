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
        background: '#0f0f12',
      }}
    >
      <div
        className="animate-fade-in"
        style={{ fontSize: '1rem', color: '#8b8b9e', fontWeight: 600 }}
      >
        {text}
      </div>
    </div>
  );
};

export default LoadingScreen;