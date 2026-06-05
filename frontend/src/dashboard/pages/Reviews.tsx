import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Star, Search, Filter, RefreshCw, MessageSquare, ThumbsUp, ThumbsDown,
  CheckCircle, Clock, AlertCircle, TrendingUp, BarChart2, Sparkles,
  Send, ChevronDown, Globe,  X as XIcon, LayoutDashboard,
  Inbox, Zap, Eye, MoreHorizontal, Bot, Shield,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import toast from 'react-hot-toast';
import { GlassCard } from '../components/GlassCard';
import type { AppDispatch } from '../../store';
import {
  fetchReviews, fetchReviewStats, seedReviews, generateAiReply,
  publishReply, markReviewResolved, setActiveReview, setFilter, resetFilters,
  setPage, type Review,
} from '../../store/slices/reviewsSlice';

// ─── Helpers ─────────────────────────────────────────────────
const PLATFORM_META: Record<string, { color: string; icon: string; bg: string }> = {
  google:     { color: '#ea4335', icon: 'G', bg: 'rgba(234,67,53,0.12)' },
  facebook:   { color: '#1877f2', icon: 'f', bg: 'rgba(24,119,242,0.12)' },
  trustpilot: { color: '#00b67a', icon: '★', bg: 'rgba(0,182,122,0.12)' },
  website:    { color: '#a855f7', icon: '⊕', bg: 'rgba(168,85,247,0.12)' },
};

const SENTIMENT_META: Record<string, { color: string; label: string; bg: string }> = {
  positive: { color: '#10b981', label: 'Positive', bg: 'rgba(16,185,129,0.12)' },
  negative: { color: '#ef4444', label: 'Negative', bg: 'rgba(239,68,68,0.12)' },
  neutral:  { color: '#f59e0b', label: 'Neutral',  bg: 'rgba(245,158,11,0.12)' },
  mixed:    { color: '#6366f1', label: 'Mixed',    bg: 'rgba(99,102,241,0.12)' },
};

const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 14 }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} size={size} fill={s <= rating ? '#f59e0b' : 'none'} color={s <= rating ? '#f59e0b' : '#374151'} />
    ))}
  </div>
);

const PlatformBadge: React.FC<{ platform: string }> = ({ platform }) => {
  const meta = PLATFORM_META[platform] || PLATFORM_META.website;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: meta.bg, color: meta.color,
      padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700,
    }}>
      <span style={{ fontSize: '11px' }}>{meta.icon}</span>
      {platform.charAt(0).toUpperCase() + platform.slice(1)}
    </span>
  );
};

const SentimentBadge: React.FC<{ sentiment: string }> = ({ sentiment }) => {
  const meta = SENTIMENT_META[sentiment] || SENTIMENT_META.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      background: meta.bg, color: meta.color,
      padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600,
    }}>
      {sentiment === 'positive' ? '😊' : sentiment === 'negative' ? '😞' : '😐'} {meta.label}
    </span>
  );
};

// ─── Dashboard Tab ────────────────────────────────────────────
const DashboardTab: React.FC = () => {
  const { stats, statsStatus } = useSelector((s: any) => s.reviews);
  const dispatch = useDispatch<AppDispatch>();
  const { activeBrandId } = useSelector((s: any) => s.workspace);

  useEffect(() => {
    if (statsStatus === 'idle') {
      dispatch(fetchReviewStats(activeBrandId || 'demo'));
    }
  }, [statsStatus, dispatch, activeBrandId]);

  if (statsStatus === 'loading' || !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'var(--accent-primary)' }}>
          <RefreshCw size={36} className="animate-spin" />
          <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const STAT_CARDS = [
    { label: 'Total Reviews', value: stats.totalReviews.toLocaleString(), icon: MessageSquare, color: '#7033f5', bg: 'rgba(112,51,245,0.12)', trend: '+18.6%', trendUp: true },
    { label: 'Average Rating', value: `${stats.averageRating} ★`, icon: Star, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', trend: '+0.2', trendUp: true },
    { label: 'Positive Sentiment', value: `${stats.positiveSentiment}%`, icon: ThumbsUp, color: '#10b981', bg: 'rgba(16,185,129,0.12)', trend: '+6.3%', trendUp: true },
    { label: 'Negative Sentiment', value: `${stats.negativeSentiment}%`, icon: ThumbsDown, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', trend: '-2.1%', trendUp: false },
    { label: 'Response Rate', value: `${stats.responseRate}%`, icon: Send, color: '#6366f1', bg: 'rgba(99,102,241,0.12)', trend: '+5.7%', trendUp: true },
    { label: 'Review Growth', value: `+${stats.reviewGrowth}%`, icon: TrendingUp, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', trend: '+24%', trendUp: true },
  ];

  const platformData = Object.entries(stats.byPlatform || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: PLATFORM_META[name]?.color || '#7033f5',
  }));

  const ratingData = [1, 2, 3, 4, 5].map(r => ({
    star: `${r} Star`,
    count: stats.ratingDistribution?.[r] || 0,
  }));

  const trendData = (stats.trend || []).map((t: any) => ({
    date: t._id,
    reviews: t.count,
    rating: Math.round(t.avgRating * 10) / 10,
  }));

  const RATING_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
        {STAT_CARDS.map(card => {
          const Icon = card.icon;
          return (
            <GlassCard key={card.label} style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.2 }}>{card.label}</span>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, lineHeight: 1, marginBottom: '8px' }}>{card.value}</div>
              <div style={{ fontSize: '0.72rem', color: card.trendUp ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                {card.trendUp ? '↑' : '↓'} {card.trend} vs last period
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px' }}>
        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Reviews Over Time</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px' }}>Daily</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="reviewGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7033f5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7033f5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#4b5563" tick={{ fontSize: 10 }} />
              <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="reviews" stroke="#7033f5" fill="url(#reviewGradient)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Reviews by Platform</h3>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={platformData} dataKey="value" innerRadius={40} outerRadius={60} strokeWidth={0}>
                  {platformData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {platformData.map(p => (
                <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{(p.value as number).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <GlassCard>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Ratings Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ratingData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="star" stroke="#4b5563" tick={{ fontSize: 10 }} />
              <YAxis stroke="#4b5563" tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {ratingData.map((_, i) => <Cell key={i} fill={RATING_COLORS[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Platform Overview */}
        <GlassCard>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Platform Overview</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {Object.entries(stats.byPlatform || {}).map(([platform, count]) => {
              const meta = PLATFORM_META[platform];
              return (
                <div key={platform} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: meta?.bg, color: meta?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                      {meta?.icon}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: meta?.color }}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{(count as number).toLocaleString()}</div>
                  <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '4px' }}>↑ 12% vs last month</div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      {/* AI Insights */}
      <GlassCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Sparkles size={18} color="#f59e0b" />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>AI Insights</h3>
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--accent-primary)', cursor: 'pointer' }}>View all</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { icon: '🚚', title: 'Shipping complaints increased 24%', sub: 'Compared to last month', color: '#ef4444', bg: 'rgba(239,68,68,0.07)' },
            { icon: '❤️', title: 'Customers love your product quality', sub: 'Positive mentions increased 18%', color: '#10b981', bg: 'rgba(16,185,129,0.07)' },
            { icon: '⚡', title: 'Great opportunity to ask for reviews', sub: 'Review conversion rate is 32%', color: '#f59e0b', bg: 'rgba(245,158,11,0.07)' },
            { icon: '🤖', title: 'New AI suggested campaign ready', sub: 'Increase reviews for summer collection', color: '#7033f5', bg: 'rgba(112,51,245,0.07)' },
          ].map((insight) => (
            <div key={insight.title} style={{ background: insight.bg, borderRadius: '12px', padding: '16px', border: `1px solid ${insight.color}22` }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>{insight.icon}</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '4px', lineHeight: 1.3 }}>{insight.title}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{insight.sub}</div>
              <button style={{ marginTop: '12px', fontSize: '0.72rem', color: insight.color, background: 'transparent', border: `1px solid ${insight.color}44`, borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>View details</button>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

// ─── Review Card ──────────────────────────────────────────────
const ReviewCard: React.FC<{
  review: Review;
  isActive: boolean;
  onClick: () => void;
}> = ({ review, isActive, onClick }) => {
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
        padding: '16px', borderRadius: '12px', cursor: 'pointer',
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
  const isPublished = publishStatus[review._id] === 'done' || review.isReplied;

  useEffect(() => {
    setEditableReply(review.generatedReply || '');
  }, [review._id, review.generatedReply]);

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
    if (publishReply.fulfilled.match(result)) {
      toast.success('Reply published successfully!');
    } else {
      toast.error('Failed to publish reply');
    }
  };

  const handleResolve = async () => {
    await dispatch(markReviewResolved(review._id));
    toast.success('Marked as resolved');
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Reviewer */}
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
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <SentimentBadge sentiment={review.sentiment} />
        </div>
      </div>

      {/* Review Content */}
      <GlassCard style={{ padding: '16px' }}>
        <p style={{ margin: 0, lineHeight: 1.7, color: '#e5e7eb', fontSize: '0.9rem' }}>{review.content}</p>
        {review.topics?.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
            {review.topics.map(t => (
              <span key={t} style={{ background: 'rgba(112,51,245,0.15)', color: 'var(--accent-primary)', padding: '2px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 500 }}>#{t}</span>
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
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--accent-gradient)', color: '#fff',
              border: 'none', borderRadius: '8px', padding: '7px 14px',
              fontSize: '0.78rem', fontWeight: 600, cursor: isGenerating ? 'not-allowed' : 'pointer',
              opacity: isGenerating ? 0.7 : 1, transition: 'opacity 0.2s',
            }}
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
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px', padding: '14px', color: '#e5e7eb', fontSize: '0.85rem',
            lineHeight: 1.6, resize: 'vertical', outline: 'none', fontFamily: 'inherit',
          }}
        />

        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
          <button
            onClick={handlePublish}
            disabled={isPublishing || isPublished || !editableReply.trim()}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              background: isPublished ? 'rgba(16,185,129,0.15)' : 'var(--accent-gradient)',
              color: isPublished ? '#10b981' : '#fff',
              border: isPublished ? '1px solid rgba(16,185,129,0.3)' : 'none',
              borderRadius: '10px', padding: '11px', fontSize: '0.85rem', fontWeight: 600,
              cursor: isPublishing || isPublished ? 'not-allowed' : 'pointer',
              opacity: isPublishing ? 0.7 : 1, transition: 'all 0.2s',
            }}
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

      {/* Previously Published Reply */}
      {review.publishedReply && (
        <GlassCard style={{ padding: '14px', borderLeft: '3px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#10b981', fontSize: '0.78rem', fontWeight: 600 }}>
            <CheckCircle size={13} /> Your Reply (Published)
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{review.publishedReply}</p>
        </GlassCard>
      )}
    </div>
  );
};

// ─── Inbox Tab ────────────────────────────────────────────────
const InboxTab: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { reviews, total, totalPages, currentPage, status, activeReviewId, filters } = useSelector((s: any) => s.reviews);
  const { activeBrandId } = useSelector((s: any) => s.workspace);
  const activeReview = reviews.find((r: Review) => r._id === activeReviewId);

  const loadReviews = useCallback(() => {
    const params: any = { page: currentPage, limit: 20, brandId: activeBrandId || 'demo' };
    if (filters.platform !== 'all') params.platform = filters.platform;
    if (filters.sentiment !== 'all') params.sentiment = filters.sentiment;
    if (filters.status !== 'all') params.status = filters.status;
    if (filters.rating) params.rating = filters.rating;
    if (filters.search) params.search = filters.search;
    dispatch(fetchReviews(params));
  }, [dispatch, currentPage, filters, activeBrandId]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const handleSeed = async () => {
    const result = await dispatch(seedReviews(activeBrandId || 'demo'));
    if (seedReviews.fulfilled.match(result)) {
      toast.success('Sample reviews loaded!');
      loadReviews();
      dispatch({ type: 'reviews/clearStatus' });
    }
  };

  const FILTER_OPTIONS = {
    platform: ['all', 'google', 'facebook', 'trustpilot', 'website'],
    sentiment: ['all', 'positive', 'negative', 'neutral', 'mixed'],
    status: ['all', 'pending', 'replied', 'ignored'],
    rating: ['', '5', '4', '3', '2', '1'],
  };

  const pendingCount = reviews.filter((r: Review) => r.status === 'pending').length;
  const unresolvedCount = reviews.filter((r: Review) => !r.isResolved && r.sentiment === 'negative').length;

  return (
    <div style={{ display: 'flex', gap: '0', height: 'calc(100vh - 200px)' }}>
      {/* Left Panel - Filter + List */}
      <div style={{ width: '380px', flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.07)', paddingRight: '20px' }}>
        {/* Stats Bar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          {[
            { icon: Inbox, label: `${total} Total`, color: '#7033f5' },
            { icon: Clock, label: `${pendingCount} Pending`, color: '#f59e0b' },
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
            { key: 'platform', options: FILTER_OPTIONS.platform, label: 'Platform' },
            { key: 'sentiment', options: FILTER_OPTIONS.sentiment, label: 'Sentiment' },
            { key: 'status', options: FILTER_OPTIONS.status, label: 'Status' },
            { key: 'rating', options: FILTER_OPTIONS.rating, label: 'Rating' },
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

        {/* Review List */}
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
              <ReviewCard
                key={r._id}
                review={r}
                isActive={r._id === activeReviewId}
                onClick={() => dispatch(setActiveReview(r._id))}
              />
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

      {/* Right Panel - Detail */}
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

// ─── Main Reviews Page ────────────────────────────────────────
export const Reviews: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inbox'>('dashboard');
  const dispatch = useDispatch<AppDispatch>();
  const { activeBrandId } = useSelector((s: any) => s.workspace);
  const { stats } = useSelector((s: any) => s.reviews);

  const handleRefresh = () => {
    dispatch({ type: 'reviews/clearStatus' });
    dispatch(fetchReviewStats(activeBrandId || 'demo'));
  };

  const TABS = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'inbox', label: 'Reviews Inbox', icon: Inbox },
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: 0, marginBottom: '6px' }}>
            Review <span className="text-gradient">Management</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            AI-powered reputation intelligence across all platforms
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.1)', padding: '8px 16px', borderRadius: '24px', color: '#10b981', fontSize: '0.82rem', fontWeight: 600 }}>
            <Zap size={14} /> AI Active
          </div>
          <button
            onClick={handleRefresh}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 16px', fontSize: '0.82rem', cursor: 'pointer' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '4px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: isActive ? 'var(--accent-gradient)' : 'transparent',
                color: isActive ? '#fff' : '#9ca3af',
                border: 'none', borderRadius: '8px',
                padding: '9px 20px', fontSize: '0.85rem', fontWeight: isActive ? 600 : 500,
                cursor: 'pointer', transition: 'all 0.18s ease',
                boxShadow: isActive ? '0 4px 12px rgba(112,51,245,0.25)' : 'none',
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' ? <DashboardTab /> : <InboxTab />}
    </div>
  );
};
