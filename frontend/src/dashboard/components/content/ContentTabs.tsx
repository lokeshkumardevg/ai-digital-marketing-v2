import React from 'react';
import { Layers, Image as ImageIcon, Video, Sparkles } from 'lucide-react';

interface ContentTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts?: {
    all: number;
    images: number;
    videos: number;
    ai: number;
  };
}

const TABS = [
  { id: 'All Creatives', label: 'All Creatives', icon: Layers, key: 'all' as const },
  { id: 'Images', label: 'Images & Banners', icon: ImageIcon, key: 'images' as const },
  { id: 'Videos', label: 'Video Ads', icon: Video, key: 'videos' as const },
  { id: 'AI Generated', label: 'AI Generated', icon: Sparkles, key: 'ai' as const, badge: 'AI' },
];

const ContentTabs: React.FC<ContentTabsProps> = ({ activeTab, onTabChange, counts }) => {
  return (
    <div
      style={{
        background: 'var(--bg-secondary, #0a0f1e)',
        borderBottom: '1px solid var(--glass-border, rgba(99, 102, 241, 0.18))',
        padding: '0 32px',
        overflowX: 'auto',
      }}
    >
      <div style={{ display: 'flex', gap: '8px', padding: '0' }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = counts ? counts[tab.key] : undefined;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                padding: '14px 18px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '0.88rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#38bdf8' : 'var(--text-secondary, #94a3b8)',
                borderBottom: isActive ? '2px solid #0665ff' : '2px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.18s ease',
              }}
            >
              <Icon size={15} style={{ opacity: isActive ? 1 : 0.7 }} />
              <span>{tab.label}</span>
              {typeof count === 'number' && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '1px 7px',
                    borderRadius: '999px',
                    background: isActive ? 'rgba(6, 101, 255, 0.2)' : 'var(--bg-elevated, #0f172a)',
                    color: isActive ? '#38bdf8' : 'var(--text-dim, #64748b)',
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              )}
              {tab.badge && !count && (
                <span
                  style={{
                    fontSize: '0.62rem',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    fontWeight: 800,
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ContentTabs;