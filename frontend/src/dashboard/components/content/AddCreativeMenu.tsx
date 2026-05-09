import React from 'react';
import { LayoutGrid, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

interface AddCreativeMenuProps {
  menuRef: React.RefObject<HTMLDivElement | null>;
  onUploadByGroup: () => void;
  onBulkUploadByFilename: () => void;
}

const AddCreativeMenu: React.FC<AddCreativeMenuProps> = ({
  menuRef,
  onUploadByGroup,
  onBulkUploadByFilename,
}) => {
  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.18 }}
      style={{
        position: 'absolute',
        top: '56px',
        left: '0',
        width: '420px',
        maxWidth: 'calc(100vw - 64px)',
        background: 'rgba(10, 15, 30, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.4)',
        padding: '14px',
        zIndex: 100,
      }}
    >
      <button
        onClick={onUploadByGroup}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          padding: '18px',
          borderRadius: '18px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            minWidth: '42px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
          }}
        >
          <LayoutGrid size={20} />
        </div>

        <div>
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '6px',
            }}
          >
            Upload by Group
          </div>
          <div
            style={{
              fontSize: '0.92rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
            }}
          >
            Assign category/item and upload for targeted use.
          </div>
        </div>
      </button>

      <button
        onClick={onBulkUploadByFilename}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          padding: '18px',
          borderRadius: '18px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            minWidth: '42px',
            borderRadius: '12px',
            background: '#f5f3ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2631d6',
          }}
        >
          <Upload size={20} />
        </div>

        <div>
          <div
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '6px',
            }}
          >
            Bulk Upload by Filename
          </div>
          <div
            style={{
              fontSize: '0.92rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
            }}
          >
            Make sure your file names match the required format.
          </div>
        </div>
      </button>
    </motion.div>
  );
};

export default AddCreativeMenu;