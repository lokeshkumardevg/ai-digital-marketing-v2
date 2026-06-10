// ─── InboxPage.tsx ───────────────────────────────────────────
// Route: /reviews/inbox
//
// Full-page staggered grid of review cards with working filters.
// Clicking a card opens a side panel with detail + AI reply.
//
// ✅ FIXED: Field mapping aligned with actual backend response:
//   - comment   → used directly (was: content)
//   - date       → used directly (was: reviewDate)
//   - isReplied  → from API or derived from status === 'replied'
//   - isResolved → from API (direct)
//   - sentiment  → optional (not in API, gracefully absent)
//   - topics     → optional (not in API, gracefully absent)

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, RefreshCw, MessageSquare, CheckCircle, Clock,
  AlertCircle, Inbox, Bot, Sparkles, Send, Shield,
  X, Grid, List, Filter as FilterIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { GlassCard } from '../components/GlassCard';
import type { AppDispatch, RootState } from '../../store';
import {
  fetchReviews,
  generateAiReply,
  publishReply,
  resolveReview,
  setActiveReview,
  setFilter,
  setReviewsPage,
  type Review,
} from '../../store/slices/Reputationslice';
import { StarRating, PlatformBadge, SentimentBadge } from '../components/Reviewhelpers';

// ─── Local Filter Types ──────────────────────────────────────
interface LocalFilters {
  search: string;
  platform: string;
  sentiment: string;
  status: string;
  rating: string;
}

// ─── Helper: derive display fields from raw API response ─────
// Backend returns: comment, date, isReplied, isResolved
// Frontend expects: comment (text), date, isReplied, isResolved
// sentiment and topics are optional — not returned by current API
function normalizeReview(r: any): Review {
  return {
    ...r,
    // Map "comment" to "content" so existing UI references work
    content:    r.comment    ?? r.content    ?? '',
    // Map "date" to "reviewDate" so timeSince() works
    reviewDate: r.date       ?? r.reviewDate ?? r.createdAt ?? '',
    // Derive isReplied from status if not explicitly set
    isReplied:  r.isReplied  ?? (r.status === 'replied'),
    // Default isResolved to false if absent
    isResolved: r.isResolved ?? false,
    // sentiment / topics not in current API — default gracefully
    sentiment:  r.sentiment  ?? '',
    topics:     Array.isArray(r.topics) ? r.topics : [],
  };
}

// ─── Animated Review Card (Grid Item) ────────────────────────
const ReviewCard: React.FC<{
  review: Review;
  index: number;
  onClick: () => void;
  viewMode: 'grid' | 'list';
}> = ({ review, index, onClick, viewMode }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 80);
    return () => clearTimeout(timer);
  }, [index]);

  const timeSince = (dateStr: string) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return 'Just now';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', glow: 'rgba(16,185,129,0.2)' };
      case 'negative': return { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',  glow: 'rgba(239,68,68,0.2)' };
      case 'neutral':  return { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', glow: 'rgba(59,130,246,0.2)' };
      case 'mixed':    return { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', glow: 'rgba(245,158,11,0.2)' };
      default:         return { bg: 'rgba(107,114,128,0.15)',border: 'rgba(107,114,128,0.4)',glow: 'rgba(107,114,128,0.2)' };
    }
  };

  const colors = getSentimentColor(review.sentiment ?? '');
  const isListView = viewMode === 'list';

  // ── Resolve the comment text from either field ──
  const commentText: string = (review as any).content || (review as any).comment || '';
  // ── Resolve the display date ──
  const displayDate: string = (review as any).reviewDate || (review as any).date || (review as any).createdAt || '';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered ? colors.bg : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isHovered ? colors.border : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '16px',
        padding: 'clamp(16px, 2vw, 24px)',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isVisible
          ? `translateY(0) scale(${isHovered ? 1.02 : 1})`
          : 'translateY(30px) scale(0.95)',
        opacity: isVisible ? 1 : 0,
        boxShadow: isHovered
          ? `0 8px 32px ${colors.glow}, 0 2px 8px rgba(0,0,0,0.3)`
          : '0 2px 8px rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden',
        ...(isListView && { display: 'flex', alignItems: 'center', gap: '16px' }),
      }}
    >
      {/* Gradient accent bar */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${colors.border}, transparent)`,
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }} />

      <div style={{
        display: 'flex',
        flexDirection: isListView ? 'row' : 'column',
        gap: '12px',
        flex: 1,
        ...(isListView && { alignItems: 'center' }),
      }}>
        {/* Avatar + Name + Time */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          ...(isListView && { flex: '0 0 200px' }),
        }}>
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '12px',
            background: 'var(--accent-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
            transition: 'transform 0.3s ease, border-radius 0.3s ease',
            transform: isHovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1) rotate(0deg)',
          }}>
            {review.reviewerName?.charAt(0) ?? '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>
              {review.reviewerName}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.8 }}>
              {timeSince(displayDate)}
            </div>
          </div>
        </div>

        {/* Rating + Platform */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          ...(isListView && { flex: '0 0 120px' }),
        }}>
          <StarRating rating={review.rating} size={13} />
          <PlatformBadge platform={review.platform} />
        </div>

        {/* Comment text — uses comment field from API */}
        <p style={{
          margin: 0,
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: isListView ? 2 : 3,
          WebkitBoxOrient: 'vertical',
          flex: 1,
        }}>
          {commentText ? `"${commentText}"` : <em style={{ opacity: 0.4 }}>No comment</em>}
        </p>

        {/* Status badges */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
          ...(isListView && { flex: '0 0 auto' }),
        }}>
          {/* Only show SentimentBadge if sentiment exists */}
          {review.sentiment && <SentimentBadge sentiment={review.sentiment} />}

          {review.isReplied && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '0.7rem', color: '#10b981',
              background: 'rgba(16,185,129,0.1)',
              padding: '3px 10px', borderRadius: '20px', fontWeight: 500,
            }}>
              <CheckCircle size={10} /> Replied
            </span>
          )}

          {!review.isReplied && review.status === 'pending' && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '0.7rem', color: '#f59e0b',
              background: 'rgba(245,158,11,0.1)',
              padding: '3px 10px', borderRadius: '20px', fontWeight: 500,
              animation: 'pulse-amber 2s infinite',
            }}>
              <Clock size={10} /> Pending
            </span>
          )}
        </div>

        {/* Topics — optional, not in current API */}
        {review.topics && review.topics.length > 0 && (
          <div style={{
            display: 'flex', gap: '6px', flexWrap: 'wrap',
            ...(isListView && { flex: '0 0 auto' }),
          }}>
            {review.topics.slice(0, isListView ? 5 : 3).map((t: string) => (
              <span key={t} style={{
                background: 'rgba(112,51,245,0.1)',
                color: 'var(--accent-primary)',
                padding: '2px 8px', borderRadius: '12px',
                fontSize: '0.68rem', fontWeight: 500,
              }}>
                #{t}
              </span>
            ))}
            {review.topics.length > (isListView ? 5 : 3) && (
              <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                +{review.topics.length - (isListView ? 5 : 3)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Side Panel ───────────────────────────────────────────────
const ReviewSidePanel: React.FC<{
  review: Review;
  onClose: () => void;
}> = ({ review, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isVisible, setIsVisible] = useState(false);
  const [editableReply, setEditableReply] = useState(review.generatedReply || '');

  const aiReplyStatus  = useSelector((s: RootState) => s.reputation.aiReplyStatus[review._id]);
  const publishStatus  = useSelector((s: RootState) => s.reputation.publishStatus[review._id]);
  const resolveStatus  = useSelector((s: RootState) => s.reputation.resolveStatus[review._id]);

  const isGenerating = aiReplyStatus  === 'loading';
  const isPublishing = publishStatus  === 'loading';
  const isPublished  = publishStatus  === 'done' || review.isReplied;
  const isResolving  = resolveStatus  === 'loading';

  // ── Resolve display fields ──
  const commentText: string  = (review as any).content || (review as any).comment || '';

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    return () => setIsVisible(false);
  }, []);

  useEffect(() => {
    setEditableReply(review.generatedReply || '');
  }, [review._id, review.generatedReply]);

  const handleGenerateReply = async () => {
    const result = await dispatch(generateAiReply(review._id));
    if (generateAiReply.fulfilled.match(result)) {
      toast.success('AI reply generated!');
    } else {
      toast.error((result.payload as string) || 'Failed to generate reply');
    }
  };

  const handlePublish = async () => {
    if (!editableReply.trim()) { toast.error('Reply cannot be empty'); return; }
    const result = await dispatch(publishReply({ reviewId: review._id, replyText: editableReply }));
    if (publishReply.fulfilled.match(result)) {
      toast.success('Reply published successfully!');
    } else {
      toast.error((result.payload as string) || 'Failed to publish reply');
    }
  };

  const handleResolve = async () => {
    const result = await dispatch(resolveReview(review._id));
    if (resolveReview.fulfilled.match(result)) {
      toast.success('Marked as resolved');
    } else {
      toast.error((result.payload as string) || 'Failed to resolve review');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 998,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* Slide-in panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0,
        width: 'min(520px, 100vw)', height: '100vh',
        background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.98))',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
        zIndex: 999,
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px',
              borderRadius: '12px',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.95rem',
            }}>
              {review.reviewerName?.charAt(0) ?? '?'}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{review.reviewerName}</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                <StarRating rating={review.rating} size={12} />
                <PlatformBadge platform={review.platform} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {review.sentiment && <SentimentBadge sentiment={review.sentiment} />}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '6px',
                color: '#9ca3af', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                transition: 'all 0.3s ease',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Review comment */}
            <GlassCard style={{ padding: '18px' }}>
              <p style={{ margin: 0, lineHeight: 1.7, color: '#e5e7eb', fontSize: '0.9rem', fontStyle: 'italic' }}>
                {commentText
                  ? `"${commentText}"`
                  : <em style={{ opacity: 0.4 }}>No comment provided</em>
                }
              </p>

              {/* Topics — optional */}
              {review.topics && review.topics.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                  {review.topics.map((t: string, i: number) => (
                    <span key={t} style={{
                      background: 'rgba(112,51,245,0.12)',
                      color: 'var(--accent-primary)',
                      padding: '3px 10px', borderRadius: '20px',
                      fontSize: '0.72rem', fontWeight: 500,
                      animation: `fadeInUp 0.3s ease ${i * 0.1}s both`,
                    }}>
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* AI Reply section */}
            <div>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bot size={16} color="#7033f5" />
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>AI Reply</span>
                </div>
                <button
                  onClick={handleGenerateReply}
                  disabled={isGenerating}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'var(--accent-gradient)',
                    color: '#fff', border: 'none', borderRadius: '8px',
                    padding: '8px 16px', fontSize: '0.78rem', fontWeight: 600,
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                    opacity: isGenerating ? 0.7 : 1,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isGenerating ? <RefreshCw size={13} className="spin" /> : <Sparkles size={13} />}
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
              </div>

              <textarea
                value={editableReply}
                onChange={e => setEditableReply(e.target.value)}
                placeholder="AI reply will appear here. You can edit before publishing..."
                rows={5}
                style={{
                  width: '100%', maxWidth: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '14px',
                  color: '#e5e7eb', fontSize: '0.85rem', lineHeight: 1.6,
                  resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                  transition: 'all 0.3s ease',
                }}
                onFocus={e  => { e.currentTarget.style.borderColor = 'rgba(112,51,245,0.5)'; }}
                onBlur={e   => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                {/* Publish */}
                <button
                  onClick={handlePublish}
                  disabled={isPublishing || !!isPublished || !editableReply.trim()}
                  style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    background: isPublished ? 'rgba(16,185,129,0.15)' : 'var(--accent-gradient)',
                    color: isPublished ? '#10b981' : '#fff',
                    border: isPublished ? '1px solid rgba(16,185,129,0.3)' : 'none',
                    borderRadius: '10px', padding: '12px',
                    fontSize: '0.85rem', fontWeight: 600,
                    cursor: (isPublishing || isPublished) ? 'not-allowed' : 'pointer',
                    opacity: isPublishing ? 0.7 : 1,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isPublishing
                    ? <><RefreshCw size={14} className="spin" /> Publishing...</>
                    : isPublished
                      ? <><CheckCircle size={14} /> Published ✓</>
                      : <><Send size={14} /> Publish Reply</>
                  }
                </button>

                {/* Resolve */}
                {!review.isResolved && (
                  <button
                    onClick={handleResolve}
                    disabled={isResolving}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-secondary)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px', padding: '12px 18px',
                      fontSize: '0.85rem',
                      cursor: isResolving ? 'not-allowed' : 'pointer',
                      opacity: isResolving ? 0.7 : 1,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {isResolving ? <RefreshCw size={14} className="spin" /> : <Shield size={14} />}
                    {isResolving ? 'Resolving...' : 'Resolve'}
                  </button>
                )}
              </div>
            </div>

            {/* Published reply (if exists) */}
            {review.publishedReply && (
              <GlassCard style={{
                padding: '14px',
                borderLeft: '3px solid #10b981',
                animation: 'slideInRight 0.5s ease',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  marginBottom: '8px', color: '#10b981',
                  fontSize: '0.78rem', fontWeight: 600,
                }}>
                  <CheckCircle size={13} /> Your Reply (Published)
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {review.publishedReply}
                </p>
              </GlassCard>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

// ─── Main Inbox Page ─────────────────────────────────────────
const InboxPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const rawReviews    = useSelector((s: RootState) => s.reputation.reviews);
  const total         = useSelector((s: RootState) => s.reputation.reviewsTotal);
  const totalPages    = useSelector((s: RootState) => s.reputation.reviewsTotalPages);
  const currentPage   = useSelector((s: RootState) => s.reputation.reviewsCurrentPage);
  const reviewsLoad   = useSelector((s: RootState) => s.reputation.reviewsLoad);
  const activeReviewId= useSelector((s: RootState) => s.reputation.activeReviewId);
  const filters       = useSelector((s: RootState) => s.reputation.filters);
  const { user }      = useSelector((s: RootState) => (s as any).auth);
  const { activeBrandId } = useSelector((s: any) => s.workspace);

  // ── Normalize all reviews once ──
  const reviews = useMemo(() => rawReviews.map(normalizeReview), [rawReviews]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [localFilters, setLocalFilters] = useState<LocalFilters>({
    search:    filters.search    || '',
    platform:  filters.platform  || 'all',
    sentiment: filters.sentiment || 'all',
    status:    filters.status    || 'all',
    rating:    filters.rating    || '',
  });

  const activeReview = reviews.find((r: Review) => r._id === activeReviewId);
  const isLoading    = reviewsLoad.status === 'loading' || reviewsLoad.status === 'idle';

  const loadReviews = useCallback(() => {
    const params: Record<string, any> = {
      page: currentPage,
      limit: 20,
      brandId: activeBrandId || user?.id || 'demo',
    };
    if (filters.platform  !== 'all') params.platform  = filters.platform;
    if (filters.sentiment !== 'all') params.sentiment = filters.sentiment;
    if (filters.status    !== 'all') params.status    = filters.status;
    if (filters.rating)              params.rating    = filters.rating;
    if (filters.search)              params.search    = filters.search;
    dispatch(fetchReviews(params));
  }, [dispatch, currentPage, filters, user?.id, activeBrandId]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  useEffect(() => {
    setLocalFilters({
      search:    filters.search    || '',
      platform:  filters.platform  || 'all',
      sentiment: filters.sentiment || 'all',
      status:    filters.status    || 'all',
      rating:    filters.rating    || '',
    });
  }, [filters]);

  const FILTER_OPTIONS = {
    platform:  ['all', 'google', 'facebook', 'trustpilot', 'website'],
    sentiment: ['all', 'positive', 'negative', 'neutral', 'mixed'],
    status:    ['all', 'pending', 'replied', 'ignored'],
    rating:    ['', '5', '4', '3', '2', '1'],
  };

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
    if (key === 'search') {
      const timer = setTimeout(() => dispatch(setFilter({ [key]: value })), 300);
      return () => clearTimeout(timer);
    } else {
      dispatch(setFilter({ [key]: value }));
    }
  };

  // Client-side filter — searches both comment + content to be safe
  const filteredReviews = useMemo(() => {
    return reviews.filter((review: Review) => {
      if (localFilters.search?.trim()) {
        const q = localFilters.search.toLowerCase();
        const text = [
          review.reviewerName,
          (review as any).content,
          (review as any).comment,
          ...(review.topics ?? []),
        ].join(' ').toLowerCase();
        if (!text.includes(q)) return false;
      }
      if (localFilters.platform  !== 'all' && review.platform  !== localFilters.platform)  return false;
      if (localFilters.sentiment !== 'all' && review.sentiment !== localFilters.sentiment) return false;
      if (localFilters.status    !== 'all' && review.status    !== localFilters.status)    return false;
      if (localFilters.rating && review.rating !== parseInt(localFilters.rating))          return false;
      return true;
    });
  }, [reviews, localFilters]);

  const pendingCount     = reviews.filter((r: Review) => r.status === 'pending').length;
  const unresolvedCount  = reviews.filter((r: Review) => !r.isResolved && r.sentiment === 'negative').length;

  return (
    <div style={{ padding: 'clamp(16px, 2.5vw, 32px)', animation: 'fadeIn 0.5s ease' }}>

      {/* ── Summary cards ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '16px',
        marginBottom: '24px', flexWrap: 'wrap',
      }}>
        {[
          { icon: Inbox,        label: 'Total Reviews',   color: '#7033f5', value: total          },
          { icon: Clock,        label: 'Pending',          color: '#f59e0b', value: pendingCount   },
          { icon: AlertCircle,  label: 'Needs Attention',  color: '#ef4444', value: unresolvedCount },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px', padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: '12px',
              animation: `fadeInUp 0.4s ease ${i * 0.1}s both`,
              transition: 'all 0.3s ease',
              flex: '1 1 auto', minWidth: '200px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 4px 20px ${s.color}20`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: `${s.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} color={s.color} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {s.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Search + Filters ── */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '20px',
        flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={16} style={{
            position: 'absolute', left: '14px', top: '50%',
            transform: 'translateY(-50%)', color: '#6b7280',
            transition: 'color 0.3s ease',
          }} />
          <input
            placeholder="Search by name, comment, or topics..."
            value={localFilters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              paddingLeft: '42px', paddingRight: '16px', height: '44px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', color: '#e5e7eb',
              fontSize: '0.85rem', outline: 'none',
              transition: 'all 0.3s ease',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'rgba(112,51,245,0.5)';
              e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(112,51,245,0.1)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.boxShadow   = 'none';
            }}
          />
        </div>

        {/* Filter dropdowns */}
        {[
          { key: 'platform',  options: FILTER_OPTIONS.platform,  label: 'Platform'  },
          { key: 'sentiment', options: FILTER_OPTIONS.sentiment, label: 'Sentiment' },
          { key: 'status',    options: FILTER_OPTIONS.status,    label: 'Status'    },
          { key: 'rating',    options: FILTER_OPTIONS.rating,    label: 'Rating'    },
        ].map(f => (
          <select
            key={f.key}
            value={localFilters[f.key as keyof LocalFilters] || 'all'}
            onChange={e => handleFilterChange(f.key, e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', color: '#e5e7eb',
              padding: '10px 14px', fontSize: '0.8rem',
              outline: 'none', cursor: 'pointer',
              transition: 'all 0.3s ease', minWidth: '130px',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(112,51,245,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            {f.key === 'rating' ? (
              <>
                <option value="">All Ratings</option>
                {f.options.filter(o => o !== '').map(o => (
                  <option key={o} value={o} style={{ background: '#0f172a' }}>
                    {o} Star{o !== '1' ? 's' : ''}
                  </option>
                ))}
              </>
            ) : (
              f.options.map(o => (
                <option key={o} value={o} style={{ background: '#0f172a' }}>
                  {o === 'all' ? `All ${f.label}s` : o.charAt(0).toUpperCase() + o.slice(1)}
                </option>
              ))
            )}
          </select>
        ))}

        {/* Grid / List toggle */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.04)',
          borderRadius: '12px', padding: '4px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {(['grid', 'list'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} view`}
              style={{
                padding: '8px 12px', borderRadius: '10px',
                background: viewMode === mode ? 'rgba(112,51,245,0.2)' : 'transparent',
                color:      viewMode === mode ? '#a78bfa' : '#6b7280',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex', alignItems: 'center',
              }}
            >
              {mode === 'grid' ? <Grid size={16} /> : <List size={16} />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Active filter tags ── */}
      {(localFilters.platform !== 'all' || localFilters.sentiment !== 'all' ||
        localFilters.status   !== 'all' || localFilters.rating     !== '' ||
        localFilters.search) && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginBottom: '16px', flexWrap: 'wrap',
        }}>
          <FilterIcon size={14} color="#7033f5" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active filters:</span>

          {([
            { key: 'platform',  active: localFilters.platform  !== 'all', label: `Platform: ${localFilters.platform}`,   reset: 'all' },
            { key: 'sentiment', active: localFilters.sentiment !== 'all', label: `Sentiment: ${localFilters.sentiment}`, reset: 'all' },
            { key: 'status',    active: localFilters.status    !== 'all', label: `Status: ${localFilters.status}`,       reset: 'all' },
            { key: 'rating',    active: !!localFilters.rating,            label: `Rating: ${localFilters.rating} Star${localFilters.rating !== '1' ? 's' : ''}`, reset: '' },
            { key: 'search',    active: !!localFilters.search,            label: `Search: "${localFilters.search}"`,     reset: '' },
          ] as const).filter(f => f.active).map(f => (
            <span key={f.key} style={{
              background: 'rgba(112,51,245,0.15)', color: '#a78bfa',
              padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              {f.label}
              <button
                onClick={() => handleFilterChange(f.key, f.reset)}
                style={{
                  background: 'none', border: 'none', color: '#a78bfa',
                  cursor: 'pointer', padding: '0',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ── Results count ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '16px',
      }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Showing {filteredReviews.length} of {total} reviews
        </span>
      </div>

      {/* ── Error banner ── */}
      {reviewsLoad.error && (
        <div style={{
          marginBottom: '16px', padding: '14px 18px', borderRadius: '12px',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.25)',
          color: '#f87171', fontSize: '0.85rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          animation: 'shake 0.5s ease',
        }}>
          <span>⚠ {reviewsLoad.error}</span>
          <button
            onClick={loadReviews}
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171', padding: '6px 14px',
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '0.8rem', transition: 'all 0.3s ease',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Review grid / list ── */}
      {isLoading ? (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: '80px 20px', color: 'var(--text-secondary)',
        }}>
          <RefreshCw size={32} className="spin" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px',
          color: 'var(--text-secondary)', animation: 'fadeIn 0.5s ease',
        }}>
          <MessageSquare size={64} style={{ marginBottom: '16px', opacity: 0.2 }} />
          <p style={{ fontSize: '1rem', marginBottom: '8px' }}>No reviews found</p>
          <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'grid'
            ? 'repeat(auto-fill, minmax(320px, 1fr))'
            : '1fr',
          gap: '16px',
          paddingBottom: '24px',
        }}>
          {filteredReviews.map((r: Review, index: number) => (
            <ReviewCard
              key={r._id}
              review={r}
              index={index}
              viewMode={viewMode}
              onClick={() => dispatch(setActiveReview(r._id))}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '12px', paddingTop: '24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <button
            onClick={() => dispatch(setReviewsPage(currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', padding: '10px 18px',
              color: '#9ca3af',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.82rem', fontWeight: 500,
              transition: 'all 0.3s ease',
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            Previous
          </button>

          <div style={{ display: 'flex', gap: '6px' }}>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = currentPage <= 3
                ? i + 1
                : currentPage >= totalPages - 2
                  ? totalPages - 4 + i
                  : currentPage - 2 + i;
              if (pageNum < 1 || pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => dispatch(setReviewsPage(pageNum))}
                  style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: pageNum === currentPage ? 'var(--accent-gradient)' : 'rgba(255,255,255,0.05)',
                    border: pageNum === currentPage ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    color: pageNum === currentPage ? '#fff' : '#9ca3af',
                    cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => dispatch(setReviewsPage(currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', padding: '10px 18px',
              color: '#9ca3af',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.82rem', fontWeight: 500,
              transition: 'all 0.3s ease',
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* ── Side panel ── */}
      {activeReview && (
        <ReviewSidePanel
          review={activeReview}
          onClose={() => dispatch(setActiveReview(null))}
        />
      )}

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes spin        { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
        @keyframes fadeIn      { from { opacity: 0; }                to { opacity: 1; } }
        @keyframes fadeInUp    { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight{ from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes shake       { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
        @keyframes pulse-amber { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default InboxPage;