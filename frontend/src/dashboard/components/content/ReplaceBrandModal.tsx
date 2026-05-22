// components/ReplaceBrandModal.tsx

import React from 'react';
import { AlertTriangle, RefreshCcw, X } from 'lucide-react';

interface Props {
  open: boolean;
  existingBrand: string;
  newBrand: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ReplaceBrandModal: React.FC<Props> = ({
  open,
  existingBrand,
  newBrand,
  loading,
  onCancel,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl border border-yellow-500/20 bg-[#07111F] shadow-2xl overflow-hidden">

        {/* Content */}
        <div className="p-8">

          {/* Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-yellow-500/20 bg-yellow-500/10">
            <AlertTriangle className="h-10 w-10 text-yellow-400" />
          </div>

          {/* Heading */}
          <h2 className="text-center text-3xl font-bold text-white">
            Replace Existing Brand?
          </h2>

          {/* Description */}
          <p className="mt-5 text-center text-lg leading-8 text-slate-300">
            You already have{' '}
            <span className="font-bold text-white">
              "{existingBrand}"
            </span>{' '}
            saved.
            <br />
            Do you want to replace it with{' '}
            <span className="font-bold text-white">
              "{newBrand}"
            </span>
            ?
          </p>

          {/* Warning */}
          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4">
            <p className="text-center text-sm font-medium text-red-300">
              Your previous brand data will be overwritten.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-4">

            {/* Cancel */}
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-[#0B1627] text-lg font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
              Keep "{existingBrand}"
            </button>

            {/* Confirm */}
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-red-600 text-lg font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              {loading
                ? 'Replacing...'
                : `Replace with "${newBrand}"`}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplaceBrandModal;