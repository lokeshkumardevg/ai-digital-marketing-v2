import React from 'react';
import { Plus, Sparkles, Share2, RefreshCw } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import AddCreativeMenu from './AddCreativeMenu';

interface ContentActionsProps {
  addCreativeButtonRef: React.RefObject<HTMLButtonElement | null>;
  addCreativeMenuRef: React.RefObject<HTMLDivElement | null>;
  showAddCreativeMenu: boolean;
  onAddCreativeClick: () => void;
  onShowAiCreativePanel: () => void;
  onUploadByGroup: () => void;
  onBulkUploadByFilename: () => void;
  onNavigateToPublisher?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const ContentActions: React.FC<ContentActionsProps> = ({
  addCreativeButtonRef,
  addCreativeMenuRef,
  showAddCreativeMenu,
  onAddCreativeClick,
  onShowAiCreativePanel,
  onUploadByGroup,
  onBulkUploadByFilename,
  onNavigateToPublisher,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '20px',
        position: 'relative',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Add Creative Dropdown Trigger */}
        <button
          ref={addCreativeButtonRef}
          onClick={onAddCreativeClick}
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '9px 18px',
            borderRadius: '999px',
            background: 'var(--bg-elevated, #0f172a)',
            border: '1px solid var(--glass-border, rgba(99, 102, 241, 0.25))',
            color: 'var(--text-primary, #fff)',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(6, 101, 255, 0.6)';
            e.currentTarget.style.background = 'rgba(6, 101, 255, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--glass-border, rgba(99, 102, 241, 0.25))';
            e.currentTarget.style.background = 'var(--bg-elevated, #0f172a)';
          }}
        >
          <Plus size={15} color="#38bdf8" /> Add Assets
        </button>

        {/* AI Creative Generation Button */}
        <button
          onClick={onShowAiCreativePanel}
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 20px',
            borderRadius: '999px',
            border: 'none',
            background: 'var(--accent-gradient, linear-gradient(135deg, #0665ff 0%, #22d3ee 100%))',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.85rem',
            boxShadow: '0 4px 18px rgba(6, 101, 255, 0.35)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 22px rgba(6, 101, 255, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 18px rgba(6, 101, 255, 0.35)';
          }}
        >
          <Sparkles size={15} /> AI Studio Generator
        </button>

        {/* Post Publisher Link */}
        {onNavigateToPublisher && (
          <button
            onClick={onNavigateToPublisher}
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '9px 18px',
              borderRadius: '999px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#34d399',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.22)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.12)';
            }}
          >
            <Share2 size={14} /> Post to Social Channels
          </button>
        )}
      </div>

      {/* Right Tools (Refresh) */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid var(--glass-border, rgba(99, 102, 241, 0.2))',
            background: 'var(--bg-elevated, #0f172a)',
            color: 'var(--text-secondary, #94a3b8)',
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
            fontSize: '0.82rem',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
        </button>
      )}

      <AnimatePresence>
        {showAddCreativeMenu && (
          <AddCreativeMenu
            menuRef={addCreativeMenuRef}
            onUploadByGroup={onUploadByGroup}
            onBulkUploadByFilename={onBulkUploadByFilename}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContentActions;