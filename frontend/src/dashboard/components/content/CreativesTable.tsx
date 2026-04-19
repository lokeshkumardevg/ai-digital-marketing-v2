import React, { useMemo, useState } from 'react';
import { Image as ImageIcon, Trash2, Eye, Pencil } from 'lucide-react';

interface CreativeItem {
  _id?: string;
  id?: string;
  title: string;
  contentType: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  createdAt?: string;
  lifetimeStart?: string;
  lifetimeEnd?: string;
  status?: string;
}

interface CreativesTableProps {
  creatives: CreativeItem[];
  onDelete: (id: string) => void;
  deletingId?: string;
}

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
};

const CreativesTable: React.FC<CreativesTableProps> = ({
  creatives,
  onDelete,
  deletingId,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const normalizedCreatives = useMemo(() => {
    return creatives.filter((item) => item.contentType === 'image');
  }, [creatives]);

  if (!normalizedCreatives.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <ImageIcon className="h-7 w-7 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-700">No creatives found</h3>
        <p className="mt-1 text-sm text-slate-400">Upload your first creative to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {normalizedCreatives.map((creative) => {
        const id = creative._id || creative.id || '';

        return (
          <div
            key={id}
            className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            onMouseEnter={() => setHoveredId(id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="relative h-56 w-full overflow-hidden bg-slate-100">
              {creative.imageUrl ? (
                <img
                  src={creative.imageUrl}
                  alt={creative.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-slate-300" />
                </div>
              )}

              <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />

              <div
                className={`absolute bottom-3 left-3 right-3 flex items-center justify-between transition ${
                  hoveredId === id ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-2'
                }`}
              >
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow"
                >
                  <Eye className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(id)}
                    disabled={deletingId === id}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-red-500 shadow disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 p-4">
              <h3 className="truncate text-lg font-semibold text-slate-900">
                {creative.title}
              </h3>

              <div className="mt-4 grid grid-cols-4 gap-3 text-center">
                <div>
                  <p className="text-xs text-slate-400">Upload</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {formatDate(creative.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Start</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {formatDate(creative.lifetimeStart)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">End</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {formatDate(creative.lifetimeEnd)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <p className="text-sm font-semibold text-slate-800 capitalize">
                    {creative.status || 'draft'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CreativesTable;