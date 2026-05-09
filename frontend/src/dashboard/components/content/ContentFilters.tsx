import React from 'react';
import { Calendar, Package, Search } from 'lucide-react';

interface ContentFiltersProps {
  uploadDateStart: string;
  uploadDateEnd: string;
  lifetimeStart: string;
  lifetimeEnd: string;
  search: string;
  setUploadDateStart: (value: string) => void;
  setUploadDateEnd: (value: string) => void;
  setLifetimeStart: (value: string) => void;
  setLifetimeEnd: (value: string) => void;
  setSearch: (value: string) => void;
}

const ContentFilters: React.FC<ContentFiltersProps> = ({
  uploadDateStart,
  uploadDateEnd,
  lifetimeStart,
  lifetimeEnd,
  search,
  setUploadDateStart,
  setUploadDateEnd,
  setLifetimeStart,
  setLifetimeEnd,
  setSearch,
}) => {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '5px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Upload Date
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
            }}
          >
            <Calendar size={13} />
            <input
              type="date"
              value={uploadDateStart}
              onChange={(e) => setUploadDateStart(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '0.82rem',
              }}
            />
            <span>→</span>
            <input
              type="date"
              value={uploadDateEnd}
              onChange={(e) => setUploadDateEnd(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '0.82rem',
              }}
            />
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '5px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Limited Lifetime
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: '#fafafa',
              fontSize: '0.82rem',
              color: '#64748b',
            }}
          >
            <Calendar size={13} />
            <input
              type="date"
              value={lifetimeStart}
              onChange={(e) => setLifetimeStart(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '0.82rem',
              }}
            />
            <span>→</span>
            <input
              type="date"
              value={lifetimeEnd}
              onChange={(e) => setLifetimeEnd(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '0.82rem',
              }}
            />
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '5px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Item
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              background: '#fafafa',
              cursor: 'pointer',
              fontSize: '0.82rem',
              color: '#64748b',
              minWidth: '140px',
            }}
          >
            <Package size={13} /> Please select
          </div>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              marginBottom: '5px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Search
          </div>
          <div style={{ position: 'relative' }}>
            <Search
              size={13}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search creatives..."
              style={{
                padding: '8px 12px 8px 30px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border)',
                fontSize: '0.82rem',
                color: 'var(--text-primary)',
                outline: 'none',
                background: 'rgba(255, 255, 255, 0.05)',
                width: '200px',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentFilters;