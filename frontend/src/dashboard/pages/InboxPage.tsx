// ─── InboxPage.tsx ───────────────────────────────────────────
// Route: /reviews/inbox
//
// Left panel: filterable / searchable list of reviews.
// Right panel: selected review detail with AI reply + publish.

import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, RefreshCw, MessageSquare, CheckCircle, Clock,
  AlertCircle, Inbox, Bot, Sparkles, Send, Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { GlassCard } from '../components/GlassCard';
import type { AppDispatch } from '../../store';
import {
  fetchReviews, generateAiReply, publishReply, markReviewResolved,
  setActiveReview, setFilter, setPage, seedReviews, clearStatus,
  type Review,
} from '../../store/slices/reviewsSlice';
import { StarRating, PlatformBadge, SentimentBadge } from '../components/Reviewhelpers';

// ─── Review Card (list item) ──────────────────────────────────
const ReviewCard: React.FC<{ review: Review; isActive: boolean; onClick: () => void }> = ({ review, isActive, onClick }) => {
  const timeSince = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return 'Just now';
  };

  return (
    <div
      onClick={onClick}
      style={{
        padding: 'clamp(14px, 2.5vw, 24px)', borderRadius: '12px', cursor: 'pointer',
        background: isActive ? 'rgba(112,51,245,0.12)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isActive ? 'rgba(112,51,245,0.4)' : 'rgba(255,255,255,0.06)'}`,
        transition: 'all 0.15s ease', marginBottom: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
          {review.reviewerName.charAt(0)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{review.reviewerName}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{timeSince(review.reviewDate || review.createdAt)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <StarRating rating={review.rating} size={12} />
            <PlatformBadge platform={review.platform} />
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {review.content}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <SentimentBadge sentiment={review.sentiment} />
            {review.isReplied && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '20px' }}>
                <CheckCircle size={10} /> Replied
              </span>
            )}
            {!review.isReplied && review.status === 'pending' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '20px' }}>
                <Clock size={10} /> Pending
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Review Detail Panel ──────────────────────────────────────
const ReviewDetailPanel: React.FC<{ review: Review }> = ({ review }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { aiReplyStatus, publishStatus } = useSelector((s: any) => s.reviews);
  const [editableReply, setEditableReply] = useState(review.generatedReply || '');

  const isGenerating = aiReplyStatus[review._id] === 'loading';
  const isPublishing = publishStatus[review._id] === 'loading';
  const isPublished  = publishStatus[review._id] === 'done' || review.isReplied;

  useEffect(() => { setEditableReply(review.generatedReply || ''); }, [review._id]);

  const handleGenerateReply = async () => {
    const result = await dispatch(generateAiReply(review._id));
    if (generateAiReply.fulfilled.match(result)) {
      setEditableReply(result.payload.generatedReply);
      toast.success('AI reply generated!');
    } else {
      toast.error('Failed to generate reply');
    }
  };

  const handlePublish = async () => {
    if (!editableReply.trim()) { toast.error('Reply cannot be empty'); return; }
    const result = await dispatch(publishReply({ reviewId: review._id, replyText: editableReply }));
    if (publishReply.fulfilled.match(result)) toast.success('Reply published successfully!');
    else toast.error('Failed to publish reply');
  };

  const handleResolve = async () => {
    const result = await dispatch(markReviewResolved(review._id));
    if (markReviewResolved.fulfilled.match(result)) toast.success('Marked as resolved');
    else toast.error('Failed to resolve review');
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
          {review.reviewerName.charAt(0)}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>{review.reviewerName}</div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
            <StarRating rating={review.rating} size={14} />
            <PlatformBadge platform={review.platform} />
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <SentimentBadge sentiment={review.sentiment} />
        </div>
      </div>

      {/* Review Content */}
      <GlassCard style={{ padding: '16px' }}>
        <p style={{ margin: 0, lineHeight: 1.7, color: '#e5e7eb', fontSize: '0.9rem' }}>{review.content}</p>
        {review.topics?.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
            {review.topics.map(t => (
              <span key={t} style={{ background: 'rgba(112,51,245,0.15)', color: 'var(--accent-primary)', padding: '2px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 500 }}>
                #{t}
              </span>
            ))}
          </div>
        )}
      </GlassCard>

      {/* AI Reply Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={16} color="#7033f5" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>AI Reply</span>
          </div>
          <button
            onClick={handleGenerateReply}
            disabled={isGenerating}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '0.78rem', fontWeight: 600, cursor: isGenerating ? 'not-allowed' : 'pointer', opacity: isGenerating ? 0.7 : 1 }}
          >
            {isGenerating ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
            {isGenerating ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
        <textarea
          value={editableReply}
          onChange={e => setEditableReply(e.target.value)}
          placeholder="AI reply will appear here. You can edit before publishing..."
          rows={5}
          style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '14px', color: '#e5e7eb', fontSize: '0.85rem', lineHeight: 1.6, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
        />
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
          <button
            onClick={handlePublish}
            disabled={isPublishing || isPublished || !editableReply.trim()}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: isPublished ? 'rgba(16,185,129,0.15)' : 'var(--accent-gradient)', color: isPublished ? '#10b981' : '#fff', border: isPublished ? '1px solid rgba(16,185,129,0.3)' : 'none', borderRadius: '10px', padding: '11px', fontSize: '0.85rem', fontWeight: 600, cursor: (isPublishing || isPublished) ? 'not-allowed' : 'pointer', opacity: isPublishing ? 0.7 : 1 }}
          >
            {isPublishing ? <RefreshCw size={14} className="animate-spin" /> : isPublished ? <CheckCircle size={14} /> : <Send size={14} />}
            {isPublishing ? 'Publishing...' : isPublished ? 'Published' : 'Publish Reply'}
          </button>
          {!review.isResolved && (
            <button
              onClick={handleResolve}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '11px 16px', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              <Shield size={14} /> Resolve
            </button>
          )}
        </div>
      </div>

      {/* Published Reply */}
      {review.publishedReply && (
        <GlassCard style={{ padding: '14px', borderLeft: '3px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#10b981', fontSize: '0.78rem', fontWeight: 600 }}>
            <CheckCircle size={13} /> Your Reply (Published)
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {review.publishedReply}
          </p>
        </GlassCard>
      )}
    </div>
  );
};

// ─── Inbox Page ───────────────────────────────────────────────
const InboxPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { reviews, total, totalPages, currentPage, status, activeReviewId, filters } = useSelector((s: any) => s.reviews);
  const { user } = useSelector((state: any) => state.auth);
  const activeReview = reviews.find((r: Review) => r._id === activeReviewId);

  const loadReviews = useCallback(() => {
    const params: Record<string, any> = { page: currentPage, limit: 20, brandId: user?.id || 'demo' };
    if (filters.platform !== 'all') params.platform  = filters.platform;
    if (filters.sentiment !== 'all') params.sentiment = filters.sentiment;
    if (filters.status !== 'all')   params.status    = filters.status;
    if (filters.rating)             params.rating    = filters.rating;
    if (filters.search)             params.search    = filters.search;
    dispatch(fetchReviews(params));
  }, [dispatch, currentPage, filters, user.id]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const handleSeed = async () => {
    const result = await dispatch(seedReviews(user?.id || 'demo'));
    if (seedReviews.fulfilled.match(result)) {
      toast.success('Sample reviews loaded!');
      dispatch(clearStatus());
      loadReviews();
    } else {
      toast.error('Failed to load sample reviews');
    }
  };

  const FILTER_OPTIONS = {
    platform:  ['all', 'google', 'facebook', 'trustpilot', 'website'],
    sentiment: ['all', 'positive', 'negative', 'neutral', 'mixed'],
    status:    ['all', 'pending', 'replied', 'ignored'],
    rating:    ['', '5', '4', '3', '2', '1'],
  };

  const pendingCount    = reviews.filter((r: Review) => r.status === 'pending').length;
  const unresolvedCount = reviews.filter((r: Review) => !r.isResolved && r.sentiment === 'negative').length;

  return (
    <div style={{ display: 'flex', gap: '0', height: 'calc(100vh - 200px)',padding: 'clamp(14px, 2.5vw, 24px)' }}>

      {/* ── Left Panel: list + filters ── */}
      <div style={{ width: '380px', flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.07)', paddingRight: '20px' }}>
        {/* Summary badges */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          {[
            { icon: Inbox,       label: `${total} Total`,              color: '#7033f5' },
            { icon: Clock,       label: `${pendingCount} Pending`,     color: '#f59e0b' },
            { icon: AlertCircle, label: `${unresolvedCount} Unresolved`, color: '#ef4444' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Icon size={13} color={s.color} />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: s.color }}>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            placeholder="Search reviews..."
            value={filters.search}
            onChange={e => dispatch(setFilter({ search: e.target.value }))}
            style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '36px', paddingRight: '12px', height: '38px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#e5e7eb', fontSize: '0.82rem', outline: 'none' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
          {[
            { key: 'platform',  options: FILTER_OPTIONS.platform,  label: 'Platform' },
            { key: 'sentiment', options: FILTER_OPTIONS.sentiment, label: 'Sentiment' },
            { key: 'status',    options: FILTER_OPTIONS.status,    label: 'Status' },
            { key: 'rating',    options: FILTER_OPTIONS.rating,    label: 'Rating' },
          ].map(f => (
            <select
              key={f.key}
              value={(filters as any)[f.key]}
              onChange={e => dispatch(setFilter({ [f.key]: e.target.value }))}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#e5e7eb', padding: '8px 10px', fontSize: '0.78rem', outline: 'none', cursor: 'pointer' }}
            >
              {f.options.map(o => (
                <option key={o} value={o} style={{ background: '#0f172a' }}>
                  {o === '' ? 'All Ratings' : o === 'all' ? `All ${f.label}` : o.charAt(0).toUpperCase() + o.slice(1)}
                </option>
              ))}
            </select>
          ))}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {status === 'loading' ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <RefreshCw size={20} className="animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
              <MessageSquare size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p style={{ marginBottom: '16px', fontSize: '0.85rem' }}>No reviews found</p>
              <button onClick={handleSeed} style={{ background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                Load Sample Reviews
              </button>
            </div>
          ) : (
            reviews.map((r: Review) => (
              <ReviewCard key={r._id} review={r} isActive={r._id === activeReviewId} onClick={() => dispatch(setActiveReview(r._id))} />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <button onClick={() => dispatch(setPage(currentPage - 1))} disabled={currentPage === 1} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '6px 12px', color: '#9ca3af', cursor: 'pointer', fontSize: '0.78rem' }}>Prev</button>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{currentPage} / {totalPages}</span>
            <button onClick={() => dispatch(setPage(currentPage + 1))} disabled={currentPage === totalPages} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '6px 12px', color: '#9ca3af', cursor: 'pointer', fontSize: '0.78rem' }}>Next</button>
          </div>
        )}
      </div>

      {/* ── Right Panel: detail ── */}
      <div style={{ flex: 1, background: 'rgba(255,255,255,0.01)', borderRadius: '0 16px 16px 0', overflowY: 'auto' }}>
        {activeReview ? (
          <ReviewDetailPanel review={activeReview} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', gap: '16px' }}>
            <MessageSquare size={48} style={{ opacity: 0.2 }} />
            <p style={{ fontSize: '0.9rem' }}>Select a review to view details and reply</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;