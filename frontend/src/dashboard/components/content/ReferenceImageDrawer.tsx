import React from 'react';
import { X, Check, Plus, Loader2 } from 'lucide-react';

interface ReferenceImageDrawerProps {
  open: boolean;
  loading: boolean;
  images: string[];
  selectedImages: string[];
  onClose: () => void;
  onToggle: (url: string) => void;
  onSave: () => void;
}

const MAX_SELECTION = 5;

const ReferenceImageDrawer: React.FC<ReferenceImageDrawerProps> = ({
  open,
  loading,
  images,
  selectedImages,
  onClose,
  onToggle,
  onSave,
}) => {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed right-0 top-0 z-50 h-screen w-full max-w-[980px] shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: '#18181f' }}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-5"
            style={{ borderBottom: '1px solid #2a2a38' }}
          >
            <h2 className="text-[22px] font-semibold" style={{ color: '#f4f4f6' }}>
              Select Reference Image
            </h2>

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: '#1e1e27', color: '#8b8b9e' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto px-6 py-4">
            <div className="mb-5 text-[17px] font-semibold" style={{ color: '#8b8b9e' }}>
              Selected{' '}
              <span style={{ color: '#a78bfa' }}>
                ({selectedImages.length}/{MAX_SELECTION})
              </span>
            </div>

            {loading ? (
              <div className="flex min-h-[430px] items-center justify-center">
                <div className="flex flex-col items-center gap-4" style={{ color: '#a78bfa' }}>
                  <Loader2 className="animate-spin" size={34} />
                  <p className="text-[18px] font-medium">
                    Collecting target URL images, please wait ..
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-[150px_repeat(auto-fill,minmax(150px,1fr))] gap-4">
                <div
                  className="flex h-[150px] items-center justify-center rounded-[20px]"
                  style={{
                    border: '1px solid #2a2a38',
                    background: '#14141c',
                    color: '#5a5a72',
                  }}
                >
                  <Plus size={42} />
                </div>

                {images.map((image) => {
                  const active = selectedImages.includes(image);

                  return (
                    <button
                      key={image}
                      type="button"
                      onClick={() => onToggle(image)}
                      className="relative h-[150px] overflow-hidden rounded-[20px]"
                      style={{
                        border: active ? '2px solid #7c3aed' : '1px solid #2a2a38',
                        boxShadow: active ? '0 0 0 3px rgba(124,58,237,0.2)' : 'none',
                      }}
                    >
                      <img
                        src={image}
                        alt="reference"
                        className="h-full w-full object-cover"
                      />

                      <div
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md"
                        style={{
                          background: active ? '#7c3aed' : 'rgba(20,20,28,0.85)',
                          color: active ? '#ffffff' : '#8b8b9e',
                        }}
                      >
                        <Check size={16} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="px-6 py-5"
            style={{ borderTop: '1px solid #2a2a38' }}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="rounded-full px-10 py-3 text-[18px] font-medium"
                style={{
                  border: '1px solid #3a3a50',
                  color: '#f4f4f6',
                  background: 'transparent',
                }}
              >
                Cancel
              </button>

              <button
                onClick={onSave}
                disabled={selectedImages.length === 0}
                className="rounded-full px-12 py-3 text-[18px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: 'linear-gradient(to right, #6d28d9, #4c1d95)',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReferenceImageDrawer;