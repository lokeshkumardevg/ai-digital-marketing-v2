import React from 'react';
import {
  X,
  CirclePlus,
  Info,
  ChevronDown,
  CloudUpload,
  CheckCircle2,
  
} from 'lucide-react';
import { motion } from 'framer-motion';

interface UploadedGroupItem {
  file: File;
  preview: string;
  uploadedUrl?: string;
}

interface UploadByGroupModalProps {
  open: boolean;
  groupCreativeType: string;
  groupFiles: File[];
  groupUploading: boolean;
  groupSaving: boolean;
  groupUploaded: boolean;
  groupLifetimeStart: string;
  groupLifetimeEnd: string;
  uploadedGroupItems: UploadedGroupItem[];
  onClose: () => void;
  onCreativeTypeChange: (value: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onUpload: () => void;
  onRemoveFile: (index: number) => void;
  onLifetimeStartChange: (value: string) => void;
  onLifetimeEndChange: (value: string) => void;
  onConfirm: () => void;
}

const UploadByGroupModal: React.FC<UploadByGroupModalProps> = ({
  open,
  groupCreativeType,
  groupFiles,
  groupUploading,
  groupSaving: _groupSaving,
  groupUploaded: _groupUploaded,
  groupLifetimeStart: _groupLifetimeStart,
  groupLifetimeEnd: _groupLifetimeEnd,
  uploadedGroupItems,
  onClose,
  onCreativeTypeChange,
  onFileChange,
  onDrop,
  onDragOver,
  onUpload,
  onRemoveFile,
  onLifetimeStartChange: _onLifetimeStartChange,
  onLifetimeEndChange: _onLifetimeEndChange,
  onConfirm: _onConfirm,
}) => {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(3px)',
        zIndex: 1200,
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
          background: 'var(--bg-secondary)',
          borderRadius: '24px',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6)',
          padding: '28px 30px',
          overflow: 'auto',
          border: '1px solid var(--glass-border)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Upload by Group
          </h2>

          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: 'var(--glass-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
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
            borderBottom: '1px solid var(--glass-border)',
            marginBottom: '28px',
          }}
        >
          <button
            style={{
              padding: '14px 22px',
              border: '1px solid var(--glass-border)',
              borderBottom: 'none',
              background: 'var(--bg-secondary)',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              color: 'var(--accent-primary)',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            Group 01
          </button>

          <button
            style={{
              marginLeft: '8px',
              width: '44px',
              height: '44px',
              border: '1px solid var(--glass-border)',
              borderBottom: 'none',
              background: 'var(--bg-secondary)',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            <CirclePlus size={18} />
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '18px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1.5px solid var(--accent-primary)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
            }}
          >
            <CheckCircle2 size={18} />
          </div>

          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Start by selecting a creative type.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            gap: '20px',
            flexWrap: 'wrap',
            marginBottom: '24px',
          }}
        >
          <div style={{ minWidth: '260px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                fontWeight: 500,
              }}
            >
              <span>Creatives type</span>
              <Info size={16} color="var(--text-dim)" />
            </div>

            <div style={{ position: 'relative', width: '260px', maxWidth: '100%' }}>
              <select
                value={groupCreativeType}
                onChange={(e) => onCreativeTypeChange(e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '999px',
                  border: '1px solid var(--accent-primary)',
                  padding: '0 42px 0 16px',
                  outline: 'none',
                  background: 'var(--bg-elevated)',
                  color: groupCreativeType ? 'var(--text-primary)' : 'var(--text-dim)',
                  fontSize: '0.92rem',
                  appearance: 'none',
                  colorScheme: 'dark',
                }}
              >
                <option value="">Please select</option>
                <option value="image">Generic Creatives</option>
                <option value="video">Category Creatives</option>
                <option value="text">Item Creatives</option>
              </select>

              <ChevronDown
                size={18}
                color="var(--text-dim)"
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

          <button
            disabled
            style={{
              height: '44px',
              padding: '0 24px',
              borderRadius: '999px',
              border: '1px solid var(--glass-border)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-dim)',
              fontSize: '0.95rem',
              fontWeight: 500,
              cursor: 'not-allowed',
            }}
          >
            Move creatives
          </button>
        </div>

        {groupCreativeType === 'image' ? (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--accent-primary)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                }}
              >
                1
              </div>

              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Upload creatives for targeted use.
              </div>
            </div>

            <label htmlFor="group-generic-upload" style={{ display: 'block', cursor: 'pointer' }}>
              <input
                id="group-generic-upload"
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={onFileChange}
              />

              <div
  onDrop={onDrop}
  onDragOver={onDragOver}
  style={{
    minHeight: '250px',
    border: '1.5px dashed var(--glass-border)',
    borderRadius: '28px',
    background: 'var(--bg-elevated)',
    padding: '18px',
    marginBottom: '20px',
  }}
>
  {uploadedGroupItems.length === 0 ? (
    // EMPTY STATE (same as your current UI)
    <div
      style={{
        minHeight: '210px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px',
      }}
    >
      <div>
        <CloudUpload size={44} color="var(--glass-border)" style={{ margin: '0 auto 14px' }} />
        <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
          Click or drag file to this area to upload
        </div>
        <div style={{ fontSize: '0.95rem', color: 'var(--text-dim)' }}>
          Drag & drop or select multiple tagged creatives for bulk upload
        </div>
      </div>
    </div>
  ) : (
    // 🔥 NEW UI (LIKE SECOND IMAGE)
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      
      {/* Upload box LEFT */}
      <div
        style={{
          width: '160px',
          minHeight: '190px',
          border: '1.5px dashed var(--glass-border)',
          borderRadius: '22px',
          background: 'var(--bg-elevated)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '16px',
        }}
      >
        <CloudUpload size={30} color="var(--text-dim)" />
      </div>

      {/* IMAGE PREVIEW */}
      {uploadedGroupItems.map((item, index) => (
        <div
          key={index}
          style={{
            width: '160px',
            border: '1px solid var(--glass-border)',
            borderRadius: '18px',
            overflow: 'hidden',
            background: 'var(--bg-elevated)',
          }}
        >
          <img
            src={item.preview}
            style={{ width: '100%', height: '140px', objectFit: 'cover' }}
          />

          <div style={{ padding: '10px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.file.name}</div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemoveFile(index);
              }}
              style={{ color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
            </label>

           

            {/* {groupUploaded && (
              <div
                style={{
                  border: '1px solid var(--glass-border)',
                  borderRadius: '20px',
                  padding: '20px',
                  background: 'var(--bg-elevated)',
                  marginBottom: '24px',
                }}
              >
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '16px',
                  }}
                >
                  Add limited lifetime
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '16px',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-dim)',
                        marginBottom: '8px',
                        fontWeight: 500,
                      }}
                    >
                      Lifetime Start
                    </div>
                    <input
                      type="date"
                      value={groupLifetimeStart}
                      onChange={(e) => onLifetimeStartChange(e.target.value)}
                      style={{
                        width: '100%',
                        height: '46px',
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border)',
                        padding: '0 14px',
                        outline: 'none',
                        fontSize: '0.92rem',
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        colorScheme: 'dark',
                      }}
                    />
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-dim)',
                        marginBottom: '8px',
                        fontWeight: 500,
                      }}
                    >
                      Lifetime End
                    </div>
                    <input
                      type="date"
                      value={groupLifetimeEnd}
                      onChange={(e) => onLifetimeEndChange(e.target.value)}
                      style={{
                        width: '100%',
                        height: '46px',
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border)',
                        padding: '0 14px',
                        outline: 'none',
                        fontSize: '0.92rem',
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        colorScheme: 'dark',
                      }}
                    />
                  </div>
                </div>
              </div>
            )} */}
          </>
        ) : (
          <div
            style={{
              minHeight: '320px',
              border: '1px dashed var(--glass-border)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-dim)',
              fontSize: '0.98rem',
              background: 'var(--bg-elevated)',
            }}
          >
            Select <span style={{ color: 'var(--accent-primary)', margin: '0 6px' }}>Any </span> to
            start upload flow.
          </div>
        )}

        <div
          style={{
            position: 'sticky',
            bottom: 0,
            background: 'var(--bg-secondary)',
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
              border: '1px solid var(--glass-border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontWeight: 500,
              fontSize: '0.98rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

         <button
  onClick={onUpload}
  disabled={groupCreativeType !== 'image' || groupFiles.length === 0 || groupUploading}
  style={{
    minWidth: '168px',
    height: '48px',
    borderRadius: '999px',
    border: 'none',
    background:
      groupCreativeType === 'image' && groupFiles.length > 0 && !groupUploading
        ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-primary))'
        : 'var(--glass-bg)',
    color:
      groupCreativeType === 'image' && groupFiles.length > 0 && !groupUploading
        ? '#fff'
        : 'var(--text-dim)',
    fontWeight: 600,
    fontSize: '0.98rem',
    cursor:
      groupCreativeType === 'image' && groupFiles.length > 0 && !groupUploading
        ? 'pointer'
        : 'not-allowed',
    opacity: groupUploading ? 0.8 : 1,
  }}
>
  {groupUploading ? 'Uploading...' : 'Upload'}
</button>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadByGroupModal;