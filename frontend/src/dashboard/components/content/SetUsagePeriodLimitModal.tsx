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
        background: 'rgba(15, 23, 42, 0.16)',
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
          background: '#fff',
          borderRadius: '24px',
          boxShadow: '0 30px 80px rgba(15, 23, 42, 0.18)',
          padding: '28px 30px',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
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
            <h2 style={{ margin: 0, fontSize: '1.7rem', fontWeight: 700, color: '#111827' }}>
              Set usage period limit
            </h2>
            <p style={{ margin: '10px 0 0', color: '#6b7280', fontSize: '1rem' }}>
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
              background: '#f3f4f6',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#111827',
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
            borderBottom: '1px solid #ececec',
            marginBottom: '28px',
          }}
        >
          <button
            style={{
              padding: '14px 22px',
              border: '1px solid #ececec',
              borderBottom: 'none',
              background: '#fff',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              color: '#2631d6',
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
            background: '#f3e8ff',
            color: '#2631d6',
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#111827', fontWeight: 600 }}>
            <Clock3 size={18} color="#2631d6" />
            <span>Set limited lifetime</span>
          </div>

          <button
            type="button"
            style={{
              height: '44px',
              padding: '0 18px',
              borderRadius: '999px',
              border: '1px solid #8b5cf6',
              background: '#fff',
              color: '#2631d6',
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
                border: '1px solid #e5e7eb',
                borderRadius: '22px',
                padding: '18px',
                display: 'flex',
                gap: '18px',
                alignItems: 'center',
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
                    color: '#111827',
                    marginBottom: '14px',
                    wordBreak: 'break-word',
                  }}
                >
                  {item.file.name}
                </div>

                <div style={{ fontSize: '1.05rem', color: '#6b7280', marginBottom: '8px' }}>
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
                        border: '1px solid #d1d5db',
                        padding: '0 42px 0 14px',
                        outline: 'none',
                        fontSize: '0.95rem',
                      }}
                    />
                    <CalendarDays
                      size={16}
                      color="#9ca3af"
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>

                  <span style={{ color: '#111827', fontWeight: 600 }}>~</span>

                  <div style={{ position: 'relative' }}>
                    <input
                      type="date"
                      value={lifetimeEnd}
                      onChange={(e) => onLifetimeEndChange(e.target.value)}
                      style={{
                        width: '180px',
                        height: '42px',
                        borderRadius: '999px',
                        border: '1px solid #d1d5db',
                        padding: '0 42px 0 14px',
                        outline: 'none',
                        fontSize: '0.95rem',
                      }}
                    />
                    <CalendarDays
                      size={16}
                      color="#9ca3af"
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
            background: '#fff',
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
              border: '1px solid #d6d6d6',
              background: '#fff',
              color: '#111827',
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
              background: 'linear-gradient(135deg, #2631d6, #1e27a8)',
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