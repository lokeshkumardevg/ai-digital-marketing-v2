import React from 'react';
import { Plus, Sparkles } from 'lucide-react';
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
}

const ContentActions: React.FC<ContentActionsProps> = ({
  addCreativeButtonRef,
  addCreativeMenuRef,
  showAddCreativeMenu,
  onAddCreativeClick,
  onShowAiCreativePanel,
  onUploadByGroup,
  onBulkUploadByFilename,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
        position: 'relative',
        flexWrap: 'wrap',
      }}
    >
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
          background: 'linear-gradient(135deg, #2631d6, #1e27a8)',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.85rem',
          boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
        }}
      >
        <Plus size={14} /> Add Creative
      </button>

      <button
        onClick={onShowAiCreativePanel}
        type="button"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '9px 18px',
          borderRadius: '999px',
          border: '1.5px solid #c4b5fd',
          background: 'transparent',
          color: '#2631d6',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.85rem',
        }}
      >
        <Sparkles size={14} /> AI Creative Generation
      </button>

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