import React from 'react';

interface ContentTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ContentTabs: React.FC<ContentTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div
      style={{
        background: '#18181f',
        borderBottom: '1px solid #2a2a38',
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
              color: activeTab === tab ? '#a78bfa' : '#8b8b9e',
              borderBottom:
                activeTab === tab ? '2px solid #a78bfa' : '2px solid transparent',
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