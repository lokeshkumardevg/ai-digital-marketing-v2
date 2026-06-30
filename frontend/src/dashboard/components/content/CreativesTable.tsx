import React, { useEffect, useMemo, useState } from 'react';
import { Image as ImageIcon, Trash2, Eye, Pencil, Clock3, ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react';

export interface CreativeItem {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  contentType?: string;
  type?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  createdAt?: string;
  createdAtRaw?: string;
  lifetimeStart?: string;
  lifetimeEnd?: string;
  lifetimeStartRaw?: string;
  lifetimeEndRaw?: string;
  uploadDate?: string;
  status?: string;
  platform?: string;
  lifetime?: string;
  scheduledForRaw?: string;
  isManualCreative?: boolean;
}

interface CreativesTableProps {
  creatives: CreativeItem[];
  onPreviewCreative: (creative: CreativeItem) => void;
  onWatchCreative: (creative: CreativeItem) => void;
  onEditCreative: (creative: CreativeItem) => void;
  onDeleteCreative: (creative: CreativeItem) => void;
  onRepromptCreative: (creative: CreativeItem) => void;
  deletingCreativeId?: string | null;
  loading?: boolean;
}

const ITEMS_PER_PAGE = 8;

const CreativesTable: React.FC<CreativesTableProps> = ({
  creatives,
  onPreviewCreative,
  onWatchCreative,
  onEditCreative,
  onDeleteCreative,
  onRepromptCreative,
  deletingCreativeId,
  loading = false,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedCreatives = useMemo(() => {
    return creatives.map((item) => ({
      ...item,
      type:
        item.contentType === 'blog'
          ? 'text'
          : item.contentType === 'video'
          ? 'video'
          : item.type || item.contentType || 'image',
    }));
  }, [creatives]);

  const totalPages = Math.max(
    1,
    Math.ceil(normalizedCreatives.length / ITEMS_PER_PAGE)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedCreatives = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return normalizedCreatives.slice(startIndex, endIndex);
  }, [normalizedCreatives, currentPage]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i += 1) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage, '...', totalPages);
    }

    return pages;
  };

  if (!normalizedCreatives.length && !loading) {
    return (
      <div
        style={{
          borderRadius: '24px',
          border: '1px solid var(--glass-border)',
          background: 'var(--bg-secondary)',
          padding: '64px 24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '999px',
            background: 'var(--bg-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <ImageIcon size={28} color="var(--text-dim)" />
        </div>

        <h3
          style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          No content found
        </h3>

        <p
          style={{
            margin: '6px 0 0',
            fontSize: '0.92rem',
            color: 'var(--text-secondary)',
          }}
        >
          AI generated content will appear here after you add it to Content Hub.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="creatives-table-grid">
        {paginatedCreatives.map((creative) => {
          const id = creative._id || creative.id || '';
          const title = creative.title || creative.name || 'Untitled Creative';
          const imageSrc = creative.thumbnailUrl || creative.imageUrl || '';
          const isHovered = hoveredId === id;
          const isDeleting = deletingCreativeId === id;

          return (
            <div
              key={id}
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                overflow: 'hidden',
                borderRadius: '24px',
                border: '1px solid var(--glass-border)',
                background: 'var(--bg-card)',
                boxShadow: isHovered
                  ? '0 18px 40px rgba(0, 0, 0, 0.45)'
                  : '0 4px 12px rgba(0, 0, 0, 0.25)',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'all 0.22s ease',
                width: '100%',
                maxWidth: '280px',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  height: '190px',
                  width: '100%',
                  overflow: 'hidden',
                  background: 'var(--bg-elevated)',
                }}
              >
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      background: 'var(--bg-elevated)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--bg-elevated)',
                    }}
                  >
                    {creative.type === 'video' ? (
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5v14l11-7z" fill="var(--glass-border)"/>
                      </svg>
                    ) : creative.type === 'text' || creative.contentType === 'blog' ? (
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="var(--glass-border)"/>
                        <polyline points="14,2 14,8 20,8" fill="var(--glass-border)"/>
                        <line x1="16" y1="13" x2="8" y2="13" stroke="var(--glass-border)" strokeWidth="1"/>
                        <line x1="16" y1="17" x2="8" y2="17" stroke="var(--glass-border)" strokeWidth="1"/>
                        <polyline points="10,9 9,9 8,9" stroke="var(--glass-border)" strokeWidth="1"/>
                      </svg>
                    ) : (
                      <ImageIcon size={40} color="var(--glass-border)" />
                    )}
                  </div>
                )}

                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: isHovered ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0)',
                    transition: 'all 0.22s ease',
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    right: '12px',
                    bottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: isHovered ? 1 : 0,
                    transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
                    pointerEvents: isHovered ? 'auto' : 'none',
                    transition: 'all 0.22s ease',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onDeleteCreative(creative)}
                    disabled={isDeleting}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '999px',
                      border: 'none',
                      background: 'var(--glass-bg)',
                      color: 'var(--error)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                      opacity: isDeleting ? 0.65 : 1,
                    }}
                  >
                    <Trash2 size={16} />
                  </button>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onWatchCreative(creative)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '999px',
                        border: 'none',
                        background: 'var(--glass-bg)',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                      }}
                    >
                      <Clock3 size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditCreative(creative)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '999px',
                        border: 'none',
                        background: 'rgba(30, 30, 39, 0.96)',
                        color: '#f4f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                      }}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onRepromptCreative(creative)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '999px',
                        border: 'none',
                        background: 'var(--glass-bg)',
                        color: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                      }}
                    >
                      <RefreshCcw size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onPreviewCreative(creative)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '999px',
                        border: 'none',
                        background: 'rgba(30, 30, 39, 0.96)',
                        color: '#f4f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)',
                      }}
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--glass-border)',
                  padding: '12px 14px 14px',
                }}
              >
                <h3
                  title={title}
                  style={{
                    margin: 0,
                    fontSize: '0.98rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {title}
                </h3>

                <div
                  style={{
                    marginTop: '14px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                    gap: '8px',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.72rem',
                        fontWeight: 400,
                        color: 'var(--text-dim)',
                        lineHeight: 1.2,
                      }}
                    >
                      Spend
                    </p>
                    <p
                      style={{
                        margin: '8px 0 0',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        lineHeight: 1.2,
                      }}
                    >
                      0
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.72rem',
                        fontWeight: 400,
                        color: 'var(--text-dim)',
                        lineHeight: 1.2,
                      }}
                    >
                      CTR
                    </p>
                    <p
                      style={{
                        margin: '8px 0 0',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        lineHeight: 1.2,
                      }}
                    >
                      0
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.72rem',
                        fontWeight: 400,
                        color: 'var(--text-dim)',
                        lineHeight: 1.2,
                      }}
                    >
                      CVR
                    </p>
                    <p
                      style={{
                        margin: '8px 0 0',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        lineHeight: 1.2,
                      }}
                    >
                      0
                    </p>
                  </div>

                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.72rem',
                        fontWeight: 400,
                        color: 'var(--text-dim)',
                        lineHeight: 1.2,
                      }}
                    >
                      Use
                    </p>
                    <p
                      style={{
                        margin: '8px 0 0',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        lineHeight: 1.2,
                      }}
                    >
                      0
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {normalizedCreatives.length > ITEMS_PER_PAGE && (
        <div className="creatives-pagination">
          <button
            type="button"
            className="creatives-pagination-arrow"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>

          <div className="creatives-pagination-pages">
            {getPageNumbers().map((page, index) =>
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="creatives-pagination-ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(Number(page))}
                  className={`creatives-pagination-page ${
                    currentPage === page ? 'active' : ''
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            className="creatives-pagination-arrow"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <style>
        {`
          .creatives-table-grid {
            display: grid;
            grid-template-columns: repeat(1, minmax(260px, 280px));
            gap: 24px;
          }

          @media (min-width: 900px) {
            .creatives-table-grid {
              grid-template-columns: repeat(2, minmax(260px, 280px));
            }
          }

          @media (min-width: 1400px) {
            .creatives-table-grid {
              grid-template-columns: repeat(4, minmax(260px, 280px));
            }
          }

          .creatives-pagination {
            margin-top: 28px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 10px;
            flex-wrap: wrap;
          }

          .creatives-pagination-pages {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .creatives-pagination-arrow,
          .creatives-pagination-page {
            min-width: 38px;
            height: 38px;
            border-radius: 12px;
            border: 1px solid var(--glass-border);
            background: var(--bg-card);
            color: var(--text-primary);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.92rem;
            font-weight: 600;
          }

          .creatives-pagination-arrow:hover:not(:disabled),
          .creatives-pagination-page:hover:not(.active) {
            border-color: var(--text-dim);
            background: var(--bg-elevated);
          }

          .creatives-pagination-page.active {
            background: var(--accent-primary);
            border-color: var(--accent-primary);
            color: var(--text-primary);
            box-shadow: var(--accent-glow);
          }

          .creatives-pagination-arrow:disabled {
            opacity: 0.35;
            cursor: not-allowed;
          }

          .creatives-pagination-ellipsis {
            min-width: 24px;
            text-align: center;
            color: var(--text-dim);
            font-weight: 700;
          }
        `}
      </style>
    </>
  );
};

export default CreativesTable;