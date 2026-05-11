import React from 'react';
import { X, Clock3, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

interface UploadedGroupItem {
  file: File;
  preview: string;
  uploadedUrl?: string;
}

interface SetUsagePeriodLimitModalProps {
  open: boolean;
  items: UploadedGroupItem[];
  lifetimeStart: string;
  lifetimeEnd: string;
  saving: boolean;
  onClose: () => void;
  onLifetimeStartChange: (value: string) => void;
  onLifetimeEndChange: (value: string) => void;
  onConfirm: () => void;
}

const SetUsagePeriodLimitModal: React.FC<SetUsagePeriodLimitModalProps> = ({
  open,
  items,
  lifetimeStart,
  lifetimeEnd,
  saving,
  onClose,
  onLifetimeStartChange,
  onLifetimeEndChange,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: 1300,
        padding: '20px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0 }}
        style={{
          width: '100%',
          height: 'calc(100vh - 40px)',
          background: '#0f1117',
          borderRadius: '24px',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6)',
          padding: '28px 30px',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #1e2130',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '28px',
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 700, color: '#f1f5f9' }}>
              Set usage period limit
            </h2>
            <p style={{ margin: '10px 0 0', color: '#64748b', fontSize: '1rem' }}>
              Usage Limit Cycle enables system monitoring of creative validity, automatically pausing
              expired creatives to prevent poor ad performance.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: 'none',
              background: '#1e2130',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'end',
            gap: '0',
            borderBottom: '1px solid #1e2130',
            marginBottom: '28px',
          }}
        >
          <button
            style={{
              padding: '14px 22px',
              border: '1px solid #1e2130',
              borderBottom: 'none',
              background: '#0f1117',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              color: '#a78bfa',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            Group 01
          </button>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 14px',
            borderRadius: '999px',
            background: '#1e1433',
            color: '#a78bfa',
            fontWeight: 600,
            width: 'fit-content',
            marginBottom: '24px',
          }}
        >
          Generic Creatives
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#f1f5f9', fontWeight: 600 }}>
            <Clock3 size={18} color="#a78bfa" />
            <span>Set limited lifetime</span>
          </div>

          <button
            type="button"
            style={{
              height: '44px',
              padding: '0 18px',
              borderRadius: '999px',
              border: '1px solid #6d28d9',
              background: 'transparent',
              color: '#a78bfa',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Batch mark usage period limit
          </button>
        </div>

        <div style={{ display: 'grid', gap: '18px', flex: 1 }}>
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                maxWidth: '620px',
                border: '1px solid #1e2130',
                borderRadius: '22px',
                padding: '18px',
                display: 'flex',
                gap: '18px',
                alignItems: 'center',
                background: '#131720',
              }}
            >
              <img
                src={item.preview}
                alt={item.file.name}
                style={{
                  width: '112px',
                  height: '112px',
                  objectFit: 'cover',
                  borderRadius: '18px',
                  flexShrink: 0,
                }}
              />

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#f1f5f9',
                    marginBottom: '14px',
                    wordBreak: 'break-word',
                  }}
                >
                  {item.file.name}
                </div>

                <div style={{ fontSize: '1.05rem', color: '#64748b', marginBottom: '8px' }}>
                  Limited Lifetime
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="date"
                      value={lifetimeStart}
                      onChange={(e) => onLifetimeStartChange(e.target.value)}
                      style={{
                        width: '180px',
                        height: '42px',
                        borderRadius: '999px',
                        border: '1px solid #2d3348',
                        padding: '0 42px 0 14px',
                        outline: 'none',
                        fontSize: '0.95rem',
                        background: '#1a1f2e',
                        color: '#f1f5f9',
                        colorScheme: 'dark',
                      }}
                    />
                    <CalendarDays
                      size={16}
                      color="#475569"
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>

                  <span style={{ color: '#f1f5f9', fontWeight: 600 }}>~</span>

                  <div style={{ position: 'relative' }}>
                    <input
                      type="date"
                      value={lifetimeEnd}
                      onChange={(e) => onLifetimeEndChange(e.target.value)}
                      style={{
                        width: '180px',
                        height: '42px',
                        borderRadius: '999px',
                        border: '1px solid #2d3348',
                        padding: '0 42px 0 14px',
                        outline: 'none',
                        fontSize: '0.95rem',
                        background: '#1a1f2e',
                        color: '#f1f5f9',
                        colorScheme: 'dark',
                      }}
                    />
                    <CalendarDays
                      size={16}
                      color="#475569"
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'sticky',
            bottom: 0,
            background: '#0f1117',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '20px',
            marginTop: '24px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              minWidth: '168px',
              height: '48px',
              borderRadius: '999px',
              border: '1px solid #2d3348',
              background: 'transparent',
              color: '#94a3b8',
              fontWeight: 500,
              fontSize: '0.98rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={saving}
            style={{
              minWidth: '168px',
              height: '48px',
              borderRadius: '999px',
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.98rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.8 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SetUsagePeriodLimitModal;