import React from 'react';
import { Calendar, Search, X, RotateCcw } from 'lucide-react';

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
  const hasActiveFilters = Boolean(
    uploadDateStart || uploadDateEnd || lifetimeStart || lifetimeEnd || search
  );

  const handleClearFilters = () => {
    setUploadDateStart('');
    setUploadDateEnd('');
    setLifetimeStart('');
    setLifetimeEnd('');
    setSearch('');
  };

  return (
    <div
      style={{
        background: 'var(--bg-secondary, #0a0f1e)',
        border: '1px solid var(--glass-border, rgba(99, 102, 241, 0.18))',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Upload Date Range */}
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-secondary, #94a3b8)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Created Date
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                border: '1px solid var(--glass-border, rgba(99, 102, 241, 0.2))',
                borderRadius: '8px',
                background: 'var(--bg-elevated, #0f172a)',
                fontSize: '0.82rem',
                color: 'var(--text-secondary, #94a3b8)',
              }}
            >
              <Calendar size={13} color="#38bdf8" />
              <input
                type="date"
                value={uploadDateStart}
                onChange={(e) => setUploadDateStart(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary, #fff)',
                  fontSize: '0.82rem',
                  colorScheme: 'dark',
                }}
              />
              <span style={{ color: 'var(--text-dim, #64748b)' }}>→</span>
              <input
                type="date"
                value={uploadDateEnd}
                onChange={(e) => setUploadDateEnd(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary, #fff)',
                  fontSize: '0.82rem',
                  colorScheme: 'dark',
                }}
              />
            </div>
          </div>

          {/* Active Schedule Lifetime */}
          <div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-secondary, #94a3b8)',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Schedule Window
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                border: '1px solid var(--glass-border, rgba(99, 102, 241, 0.2))',
                borderRadius: '8px',
                background: 'var(--bg-elevated, #0f172a)',
                fontSize: '0.82rem',
                color: 'var(--text-secondary, #94a3b8)',
              }}
            >
              <Calendar size={13} color="#a78bfa" />
              <input
                type="date"
                value={lifetimeStart}
                onChange={(e) => setLifetimeStart(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary, #fff)',
                  fontSize: '0.82rem',
                  colorScheme: 'dark',
                }}
              />
              <span style={{ color: 'var(--text-dim, #64748b)' }}>→</span>
              <input
                type="date"
                value={lifetimeEnd}
                onChange={(e) => setLifetimeEnd(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary, #fff)',
                  fontSize: '0.82rem',
                  colorScheme: 'dark',
                }}
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '18px',
              }}
            >
              <RotateCcw size={12} /> Reset Filters
            </button>
          )}
        </div>

        {/* Search Input */}
        <div>
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--text-secondary, #94a3b8)',
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Search Creatives
          </div>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: '11px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-dim, #64748b)',
                pointerEvents: 'none',
              }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title..."
              style={{
                width: '100%',
                padding: '7px 32px 7px 32px',
                borderRadius: '8px',
                border: '1px solid var(--glass-border, rgba(99, 102, 241, 0.2))',
                fontSize: '0.84rem',
                color: 'var(--text-primary, #fff)',
                outline: 'none',
                background: 'var(--bg-elevated, #0f172a)',
                boxSizing: 'border-box',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim, #64748b)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentFilters;