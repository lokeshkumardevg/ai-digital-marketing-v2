import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, style }) => {
  return (
    <div 
      className={`glass-panel ${className}`} 
      onClick={onClick}
      style={{
        padding: '24px',
        transition: 'all var(--transition-medium)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        background: '#ffffff',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--glass-shadow)',
        ...style
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(112, 51, 245, 0.12)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
        }
      }}
    >
      {children}
    </div>
  );
};

