import React from 'react';

interface ContentTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ContentTabs: React.FC<ContentTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div
      style={{
        background: 'transparent',
        borderBottom: '1px solid var(--glass-border)',
        padding: '0 32px',
      }}
    >
      <div style={{ display: 'flex', gap: '0', padding: '0' }}>
        {['All Creatives'].map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              padding: '14px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.88rem',
              fontWeight: 600,
              color: activeTab === tab ? '#2631d6' : 'var(--text-secondary)',
              borderBottom:
                activeTab === tab ? '2px solid #2631d6' : '2px solid transparent',
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ContentTabs;