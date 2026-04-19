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
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed right-0 top-0 z-50 h-screen w-full max-w-[980px] bg-white shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <h2 className="text-[22px] font-semibold text-slate-900">
              Select Reference Image
            </h2>

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-auto px-6 py-4">
            <div className="mb-5 text-[17px] font-semibold text-slate-500">
              Selected{' '}
              <span className="text-violet-600">
                ({selectedImages.length}/{MAX_SELECTION})
              </span>
            </div>

            {loading ? (
              <div className="flex min-h-[430px] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-violet-600">
                  <Loader2 className="animate-spin" size={34} />
                  <p className="text-[18px] font-medium">
                    Collecting target URL images, please wait ..
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-[150px_repeat(auto-fill,minmax(150px,1fr))] gap-4">
                <div className="flex h-[150px] items-center justify-center rounded-[20px] border border-slate-200 bg-white text-slate-400">
                  <Plus size={42} />
                </div>

                {images.map((image) => {
                  const active = selectedImages.includes(image);

                  return (
                    <button
                      key={image}
                      type="button"
                      onClick={() => onToggle(image)}
                      className={`relative h-[150px] overflow-hidden rounded-[20px] border ${
                        active
                          ? 'border-violet-500 ring-2 ring-violet-500/20'
                          : 'border-slate-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt="reference"
                        className="h-full w-full object-cover"
                      />

                      <div
                        className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md ${
                          active ? 'bg-violet-600 text-white' : 'bg-white/80 text-slate-500'
                        }`}
                      >
                        <Check size={16} />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 px-6 py-5">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="rounded-full border border-slate-300 px-10 py-3 text-[18px] font-medium text-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={onSave}
                disabled={selectedImages.length === 0}
                className="rounded-full bg-gradient-to-r from-violet-500 to-violet-700 px-12 py-3 text-[18px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
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