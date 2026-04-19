import React from 'react';
import { X, ChevronDown, Info, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../GlassCard';

interface AiCreativeModalProps {
  open: boolean;
  genTopic: string;
  genType: string;
  genTone: string;
  generating: boolean;
  setGenTopic: (value: string) => void;
  setGenType: (value: string) => void;
  setGenTone: (value: string) => void;
  onClose: () => void;
  onGenerate: () => void;
}

const previewImages = [
  'https://via.placeholder.com/220x150?text=Preview+1',
  'https://via.placeholder.com/220x150?text=Preview+2',
  'https://via.placeholder.com/220x150?text=Preview+3',
  'https://via.placeholder.com/220x150?text=Preview+4',
];

const AiCreativeModal: React.FC<AiCreativeModalProps> = ({
  open,
  genTopic,
  genType,
  generating,
  setGenTopic,
  setGenType,
  onClose,
  onGenerate,
}) => {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: '1180px',
        }}
      >
        <GlassCard
          style={{
            padding: '28px',
            position: 'relative',
            borderRadius: '28px',
            background: '#ffffff',
            boxShadow: '0 30px 80px rgba(15, 23, 42, 0.18)',
          }}
        >
          <button
            onClick={onClose}
            type="button"
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              width: '40px',
              height: '40px',
              borderRadius: '999px',
              border: 'none',
              background: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <X size={24} />
          </button>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '420px 1fr',
              gap: '28px',
              alignItems: 'stretch',
              minHeight: '620px',
            }}
          >
            {/* Left side form */}
            <div
              style={{
                border: '1px solid #f1f5f9',
                borderRadius: '24px',
                padding: '28px 24px',
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="input-group">
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '10px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#18181b',
                    }}
                  >
                    Select Type
                  </label>

                  <div style={{ position: 'relative', width: '100%' }}>
                    <select
                      value={genType}
                      onChange={(e) => setGenType(e.target.value)}
                      style={{
                        width: '100%',
                        height: '54px',
                        borderRadius: '999px',
                        border: '1.5px solid #d4d4d8',
                        padding: '0 48px 0 18px',
                        fontSize: '0.98rem',
                        color: '#18181b',
                        background: '#fff',
                        outline: 'none',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                      }}
                    >
                      <option value="user_upload">User upload</option>
                      <option value="url_scrape">URL scrape</option>
                      <option value="ai_generate">AI generate</option>
                    </select>

                    <ChevronDown
                      size={18}
                      style={{
                        position: 'absolute',
                        right: '18px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#b3b3b3',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '10px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#18181b',
                    }}
                  >
                    <span style={{ color: '#e11d48' }}>*</span>
                    Product URL
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '999px',
                        background: '#e5e7eb',
                        color: '#6b7280',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Info size={12} />
                    </span>
                  </label>

                  <input
                    type="text"
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    placeholder="Please enter product URL"
                    style={{
                      width: '100%',
                      height: '54px',
                      borderRadius: '999px',
                      border: '1.5px solid #d4d4d8',
                      padding: '0 18px',
                      fontSize: '0.98rem',
                      color: '#18181b',
                      outline: 'none',
                      background: '#fff',
                    }}
                  />
                </div>

                <button
                  type="button"
                  style={{
                    width: '100%',
                    height: '58px',
                    borderRadius: '999px',
                    border: '1.5px solid #d8b4fe',
                    background: '#fff',
                    color: '#c084fc',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: 'pointer',
                  }}
                >
                  Fetch Images
                </button>
              </div>

              <button
                onClick={onGenerate}
                disabled={generating}
                type="button"
                style={{
                  width: '100%',
                  height: '64px',
                  borderRadius: '999px',
                  border: 'none',
                  background: 'linear-gradient(90deg, #b794f6 0%, #1e035e 100%)',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: generating ? 'not-allowed' : 'pointer',
                  opacity: generating ? 0.7 : 1,
                  boxShadow: '0 16px 35px rgba(76, 29, 149, 0.22)',
                  marginTop: '28px',
                }}
              >
                {generating ? 'Submitting...' : 'Submit Now'}
              </button>
            </div>

            {/* Right side preview */}
            <div
              style={{
                border: '1px solid #f1f5f9',
                borderRadius: '24px',
                background: '#fafafa',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7c3aed',
                  }}
                >
                  <ImageIcon size={18} />
                </div>

                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.05rem',
                      fontWeight: 700,
                      color: '#111827',
                    }}
                  >
                    Scraped Images Preview
                  </h3>
                  <p
                    style={{
                      margin: '4px 0 0',
                      fontSize: '0.9rem',
                      color: '#6b7280',
                    }}
                  >
                    Fetch ke baad website images yahin show hongi
                  </p>
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  borderRadius: '20px',
                  border: '1px dashed #d8b4fe',
                  background: '#ffffff',
                  padding: '18px',
                  overflowY: 'auto',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {previewImages.map((img, index) => (
                    <div
                      key={index}
                      style={{
                        borderRadius: '18px',
                        overflow: 'hidden',
                        background: '#f8fafc',
                        border: '1px solid #ede9fe',
                        minHeight: '160px',
                      }}
                    >
                      <img
                        src={img}
                        alt={`preview-${index}`}
                        style={{
                          width: '100%',
                          height: '160px',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default AiCreativeModal;