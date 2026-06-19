// ─── PostAdReviewsPage.tsx (DEMO VERSION — no Redux) ──────────
// All Redux/store imports removed. Uses local state + demo data.

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  Search, RefreshCw, MessageSquare, CheckCircle, Clock,
  AlertCircle, Inbox, Bot, Sparkles, Send, Shield,
  X, Grid, List, Filter as FilterIcon, ChevronDown,
  FileText, Megaphone,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Demo GlassCard (replaces imported component) ────────────
const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    ...style,
  }}>
    {children}
  </div>
);

// ─── Demo helper components (replaces Reviewhelpers imports) ──
const SentimentBadge: React.FC<{ sentiment: string }> = ({ sentiment }) => {
  const map: Record<string, { color: string; bg: string }> = {
    positive : { color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
    negative : { color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
    neutral  : { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
    mixed    : { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  };
  const s = map[sentiment] ?? { color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' };
  return (
    <span style={{
      fontSize: '0.68rem', fontWeight: 600, padding: '3px 9px',
      borderRadius: 999, color: s.color, background: s.bg,
    }}>
      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
    </span>
  );
};

// ─── Types ───────────────────────────────────────────────────
type PlatformTab = 'all' | 'meta' | 'x' | 'linkedin';
type SourceType  = 'post' | 'campaign';

interface PostComment {
  _id           : string;
  reviewerName  : string;
  content       : string;
  reviewDate    : string;
  isReplied     : boolean;
  isResolved    : boolean;
  sentiment     : string;
  topics        : string[];
  postId        : string;
  postTitle     : string;
  sourceType    : SourceType;
  source        : 'meta' | 'x' | 'linkedin';
  status        : string;
  generatedReply?: string;
  publishedReply?: string;
}

interface PostRef {
  id          : string;
  source      : 'meta' | 'x' | 'linkedin';
  sourceType  : SourceType;
  title       : string;
  commentCount: number;
}

interface LocalFilters {
  search     : string;
  platform   : string;
  sentiment  : string;
  status     : string;
  sourceType : string;
  postId     : string;
}

// ─── Demo data ────────────────────────────────────────────────
const DEMO_POSTS: PostRef[] = [
  { id: 'p1', source: 'meta',     sourceType: 'post',     title: 'Summer Sale Launch',       commentCount: 4 },
  { id: 'p2', source: 'meta',     sourceType: 'campaign', title: 'Brand Awareness Q3',       commentCount: 2 },
  { id: 'p3', source: 'x',        sourceType: 'post',     title: 'Product Announcement',     commentCount: 3 },
  { id: 'p4', source: 'linkedin', sourceType: 'post',     title: 'Company Milestone Update', commentCount: 2 },
  { id: 'p5', source: 'linkedin', sourceType: 'campaign', title: 'Talent Acquisition Drive', commentCount: 1 },
];

const DEMO_COMMENTS: PostComment[] = [
  {
    _id: 'c1', reviewerName: 'Alice Johnson', source: 'meta', sourceType: 'post',
    postId: 'p1', postTitle: 'Summer Sale Launch',
    content: 'Absolutely love the new summer collection! The quality is top notch and shipping was faster than expected. Will definitely be ordering again.',
    reviewDate: new Date(Date.now() - 2 * 3600000).toISOString(),
    isReplied: false, isResolved: false, sentiment: 'positive', status: 'pending',
    topics: ['quality', 'shipping', 'collection'],
  },
  {
    _id: 'c2', reviewerName: 'Bob Martinez', source: 'meta', sourceType: 'post',
    postId: 'p1', postTitle: 'Summer Sale Launch',
    content: 'The discount codes never worked at checkout. Really frustrating experience.',
    reviewDate: new Date(Date.now() - 5 * 3600000).toISOString(),
    isReplied: true, isResolved: false, sentiment: 'negative', status: 'replied',
    topics: ['checkout', 'discount'],
    publishedReply: 'Hi Bob! We are so sorry about the checkout issue. Our team has fixed this — please DM us and we will apply your discount manually.',
  },
  {
    _id: 'c3', reviewerName: 'Carol White', source: 'meta', sourceType: 'campaign',
    postId: 'p2', postTitle: 'Brand Awareness Q3',
    content: 'Never heard of this brand before but the ad caught my eye. Checking out the website now!',
    reviewDate: new Date(Date.now() - 24 * 3600000).toISOString(),
    isReplied: false, isResolved: false, sentiment: 'neutral', status: 'pending',
    topics: ['discovery', 'ad'],
  },
  {
    _id: 'c4', reviewerName: 'David Lee', source: 'meta', sourceType: 'campaign',
    postId: 'p2', postTitle: 'Brand Awareness Q3',
    content: 'Great brand, really impressed by the new direction. Looking forward to more campaigns like this.',
    reviewDate: new Date(Date.now() - 36 * 3600000).toISOString(),
    isReplied: true, isResolved: true, sentiment: 'positive', status: 'replied',
    topics: ['brand', 'campaign'],
    publishedReply: 'Thank you David! More exciting campaigns coming your way. Stay tuned!',
  },
  {
    _id: 'c5', reviewerName: 'Emma Chen', source: 'x', sourceType: 'post',
    postId: 'p3', postTitle: 'Product Announcement',
    content: 'This looks like exactly what I have been waiting for. The features are insane. Is there a beta signup?',
    reviewDate: new Date(Date.now() - 1 * 3600000).toISOString(),
    isReplied: false, isResolved: false, sentiment: 'positive', status: 'pending',
    topics: ['features', 'beta', 'product'],
  },
  {
    _id: 'c6', reviewerName: 'Frank Nguyen', source: 'x', sourceType: 'post',
    postId: 'p3', postTitle: 'Product Announcement',
    content: 'Seen this kind of announcement before and nothing came of it. Hope this one is actually real.',
    reviewDate: new Date(Date.now() - 3 * 3600000).toISOString(),
    isReplied: false, isResolved: false, sentiment: 'neutral', status: 'pending',
    topics: ['credibility'],
  },
  {
    _id: 'c7', reviewerName: 'Grace Kim', source: 'x', sourceType: 'post',
    postId: 'p3', postTitle: 'Product Announcement',
    content: 'The pricing is way too high compared to alternatives. You are losing customers before launch.',
    reviewDate: new Date(Date.now() - 6 * 3600000).toISOString(),
    isReplied: false, isResolved: false, sentiment: 'negative', status: 'pending',
    topics: ['pricing', 'competition'],
  },
  {
    _id: 'c8', reviewerName: 'Henry Patel', source: 'linkedin', sourceType: 'post',
    postId: 'p4', postTitle: 'Company Milestone Update',
    content: 'Congratulations on reaching this milestone! The team has worked incredibly hard and it truly shows. Excited for what comes next.',
    reviewDate: new Date(Date.now() - 12 * 3600000).toISOString(),
    isReplied: true, isResolved: true, sentiment: 'positive', status: 'replied',
    topics: ['milestone', 'teamwork'],
    publishedReply: 'Thank you so much, Henry! The journey has been amazing and we cannot wait to share the next chapter.',
  },
  {
    _id: 'c9', reviewerName: 'Isabel Torres', source: 'linkedin', sourceType: 'post',
    postId: 'p4', postTitle: 'Company Milestone Update',
    content: 'Great news but I would love to see more transparency around the numbers. What does this milestone actually represent?',
    reviewDate: new Date(Date.now() - 18 * 3600000).toISOString(),
    isReplied: false, isResolved: false, sentiment: 'neutral', status: 'pending',
    topics: ['transparency', 'metrics'],
  },
  {
    _id: 'c10', reviewerName: 'Jake Wilson', source: 'linkedin', sourceType: 'campaign',
    postId: 'p5', postTitle: 'Talent Acquisition Drive',
    content: 'Applied through this campaign and the process was super smooth. Great team culture from day one of interviews.',
    reviewDate: new Date(Date.now() - 48 * 3600000).toISOString(),
    isReplied: false, isResolved: false, sentiment: 'positive', status: 'pending',
    topics: ['hiring', 'culture', 'process'],
  },
  {
    _id: 'c11', reviewerName: 'Karen Singh', source: 'meta', sourceType: 'post',
    postId: 'p1', postTitle: 'Summer Sale Launch',
    content: 'Sizes run really small. Please update your size guide so customers know before buying.',
    reviewDate: new Date(Date.now() - 8 * 3600000).toISOString(),
    isReplied: false, isResolved: false, sentiment: 'negative', status: 'pending',
    topics: ['sizing', 'guide'],
  },
  {
    _id: 'c12', reviewerName: 'Leo Park', source: 'meta', sourceType: 'post',
    postId: 'p1', postTitle: 'Summer Sale Launch',
    content: 'The packaging is beautiful. Really elevated unboxing experience. Will share on my story!',
    reviewDate: new Date(Date.now() - 10 * 3600000).toISOString(),
    isReplied: false, isResolved: false, sentiment: 'positive', status: 'pending',
    topics: ['packaging', 'unboxing'],
  },
];

// ─── Platform display config ──────────────────────────────────
const PLATFORM_CFG = {
  meta     : { label: 'Meta',     dotColor: '#1877F2', badgeColor: '#3B82F6', badgeBg: 'rgba(59,130,246,0.12)'  },
  x        : { label: 'X',        dotColor: '#e5e7eb', badgeColor: '#E5E7EB', badgeBg: 'rgba(229,231,235,0.10)' },
  linkedin : { label: 'LinkedIn', dotColor: '#0A66C2', badgeColor: '#0A66C2', badgeBg: 'rgba(10,102,194,0.14)'  },
};

// ─── Small reusable pieces ────────────────────────────────────
function PlatformTabBtn({
  active, label, source, onClick,
}: {
  active: boolean; label: string; source: PlatformTab; onClick: () => void;
}) {
  const dotColor = source !== 'all' ? PLATFORM_CFG[source].dotColor : '#9CA3AF';
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '7px',
        padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600,
        border    : active ? '1px solid rgba(91,110,245,0.5)' : '1px solid rgba(255,255,255,0.08)',
        background: active ? 'rgba(91,110,245,0.16)' : 'transparent',
        color     : active ? '#A5B4FC' : '#9CA3AF',
        cursor    : 'pointer', transition: 'all .15s ease', whiteSpace: 'nowrap',
      }}
    >
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: dotColor, flexShrink: 0,
        opacity: active ? 1 : 0.5,
      }} />
      {label}
    </button>
  );
}

function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '3px 9px',
      borderRadius: 999, color, background: bg, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

function SourceTypePill({ sourceType }: { sourceType: SourceType }) {
  const isCampaign = sourceType === 'campaign';
  return (
    <span style={{
      display: 'flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 999,
      color     : isCampaign ? '#FBBF24' : '#60A5FA',
      background: isCampaign ? 'rgba(251,191,36,0.10)' : 'rgba(96,165,250,0.10)',
    }}>
      {isCampaign ? <Megaphone size={10} /> : <FileText size={10} />}
      {isCampaign ? 'Campaign' : 'Post'}
    </span>
  );
}

// ─── Comment Card ─────────────────────────────────────────────
const CommentCard: React.FC<{
  comment  : PostComment;
  index    : number;
  onClick  : () => void;
  viewMode : 'grid' | 'list';
}> = ({ comment, index, onClick, viewMode }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), index * 60);
    return () => clearTimeout(t);
  }, [index]);

  const getSentimentColor = (s: string) => {
    switch (s) {
      case 'positive': return { bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.4)',  glow: 'rgba(16,185,129,0.2)'  };
      case 'negative': return { bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.4)',   glow: 'rgba(239,68,68,0.2)'   };
      case 'neutral':  return { bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.4)',  glow: 'rgba(59,130,246,0.2)'  };
      default:         return { bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.4)', glow: 'rgba(107,114,128,0.2)' };
    }
  };

  const timeSince = (dateStr: string) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    return 'Just now';
  };

  const colors     = getSentimentColor(comment.sentiment);
  const isListView = viewMode === 'list';
  const platform   = PLATFORM_CFG[comment.source];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background  : isHovered ? colors.bg : 'rgba(255,255,255,0.02)',
        border      : `1px solid ${isHovered ? colors.border : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '16px',
        padding     : 'clamp(16px, 2vw, 24px)',
        cursor      : 'pointer',
        transition  : 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        transform   : isVisible
          ? `translateY(0) scale(${isHovered ? 1.02 : 1})`
          : 'translateY(30px) scale(0.95)',
        opacity     : isVisible ? 1 : 0,
        boxShadow   : isHovered
          ? `0 8px 32px ${colors.glow}, 0 2px 8px rgba(0,0,0,0.3)`
          : '0 2px 8px rgba(0,0,0,0.2)',
        position    : 'relative', overflow: 'hidden',
        ...(isListView && { display: 'flex', alignItems: 'center', gap: '16px' }),
      }}
    >
      {/* Accent bar on hover */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: `linear-gradient(90deg, ${colors.border}, transparent)`,
        opacity: isHovered ? 1 : 0, transition: 'opacity 0.3s ease',
      }} />

      <div style={{
        display      : 'flex',
        flexDirection: isListView ? 'row' : 'column',
        gap          : '12px',
        flex         : 1,
        ...(isListView && { alignItems: 'center' }),
      }}>
        {/* Avatar + name */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          ...(isListView && { flex: '0 0 220px' }),
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #7033f5, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
            transition: 'transform 0.3s ease, border-radius 0.3s ease',
            transform: isHovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1) rotate(0deg)',
          }}>
            {comment.reviewerName.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px', color: '#f5f5f5' }}>
              {comment.reviewerName}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>
              {timeSince(comment.reviewDate)}
              {comment.postTitle && (
                <> · <span style={{ color: '#7C86FF' }}>{comment.postTitle}</span></>
              )}
            </div>
          </div>
        </div>

        {/* Platform + source type */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          ...(isListView && { flex: '0 0 160px' }),
        }}>
          {platform && (
            <Pill label={platform.label} color={platform.badgeColor} bg={platform.badgeBg} />
          )}
          <SourceTypePill sourceType={comment.sourceType} />
        </div>

        {/* Comment text */}
        <p style={{
          margin: 0, fontSize: '0.82rem', color: '#9CA3AF', lineHeight: 1.5,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: isListView ? 2 : 3,
          WebkitBoxOrient: 'vertical',
          flex: 1,
        }}>
          {comment.content
            ? `"${comment.content}"`
            : <em style={{ opacity: 0.4 }}>No comment</em>
          }
        </p>

        {/* Status badges */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
          ...(isListView && { flex: '0 0 auto' }),
        }}>
          {comment.sentiment && <SentimentBadge sentiment={comment.sentiment} />}

          {comment.isReplied && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '0.7rem', color: '#10b981',
              background: 'rgba(16,185,129,0.1)',
              padding: '3px 10px', borderRadius: '20px', fontWeight: 500,
            }}>
              <CheckCircle size={10} /> Replied
            </span>
          )}

          {!comment.isReplied && comment.status === 'pending' && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '0.7rem', color: '#f59e0b',
              background: 'rgba(245,158,11,0.1)',
              padding: '3px 10px', borderRadius: '20px', fontWeight: 500,
            }}>
              <Clock size={10} /> Pending
            </span>
          )}
        </div>

        {/* Topics */}
        {comment.topics.length > 0 && (
          <div style={{
            display: 'flex', gap: '6px', flexWrap: 'wrap',
            ...(isListView && { flex: '0 0 auto' }),
          }}>
            {comment.topics.slice(0, isListView ? 5 : 3).map((t) => (
              <span key={t} style={{
                background: 'rgba(112,51,245,0.1)',
                color     : '#A78BFA',
                padding   : '2px 8px', borderRadius: '12px',
                fontSize  : '0.68rem', fontWeight: 500,
              }}>
                #{t}
              </span>
            ))}
            {comment.topics.length > (isListView ? 5 : 3) && (
              <span style={{ fontSize: '0.68rem', color: '#6B7280' }}>
                +{comment.topics.length - (isListView ? 5 : 3)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Side Panel ───────────────────────────────────────────────
const CommentSidePanel: React.FC<{
  comment  : PostComment;
  comments : PostComment[];
  onClose  : () => void;
  onUpdate : (updated: PostComment) => void;
}> = ({ comment, onClose, onUpdate }) => {
  const [isVisible, setIsVisible]         = useState(false);
  const [editableReply, setEditableReply] = useState(comment.generatedReply || '');
  const [isGenerating, setIsGenerating]   = useState(false);
  const [isPublishing, setIsPublishing]   = useState(false);
  const [isResolving, setIsResolving]     = useState(false);

  const isPublished = comment.isReplied;
  const platform    = PLATFORM_CFG[comment.source];

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    return () => setIsVisible(false);
  }, []);

  useEffect(() => {
    setEditableReply(comment.generatedReply || '');
  }, [comment._id, comment.generatedReply]);

  const handleGenerateReply = async () => {
    setIsGenerating(true);
    // Simulate AI generation delay
    await new Promise(r => setTimeout(r, 1200));
    const replies: Record<string, string> = {
      positive : `Thank you so much for the kind words! We truly appreciate your support and are thrilled you had a great experience. Looking forward to connecting with you again soon!`,
      negative : `We're really sorry to hear this wasn't the experience you expected. Your feedback matters to us — please DM us directly and we'll make this right for you as quickly as possible.`,
      neutral  : `Thanks for sharing your thoughts! We'd love to hear more about your experience. Feel free to reach out directly if there's anything we can help with.`,
      mixed    : `Thank you for taking the time to share your feedback! We're glad some parts worked well, and we'd love to address the areas that didn't. Please reach out so we can assist further.`,
    };
    const generated = replies[comment.sentiment] ?? replies.neutral;
    setEditableReply(generated);
    onUpdate({ ...comment, generatedReply: generated });
    setIsGenerating(false);
    toast.success('AI reply generated!');
  };

  const handlePublish = async () => {
    if (!editableReply.trim()) { toast.error('Reply cannot be empty'); return; }
    setIsPublishing(true);
    await new Promise(r => setTimeout(r, 800));
    onUpdate({ ...comment, isReplied: true, publishedReply: editableReply, status: 'replied' });
    setIsPublishing(false);
    toast.success('Reply published!');
  };

  const handleResolve = async () => {
    setIsResolving(true);
    await new Promise(r => setTimeout(r, 600));
    onUpdate({ ...comment, isResolved: true });
    setIsResolving(false);
    toast.success('Marked as resolved');
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          zIndex: 998, opacity: isVisible ? 1 : 0, transition: 'opacity 0.4s ease',
        }}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0,
        width: 'min(520px, 100vw)', height: '100vh',
        background: 'linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.98))',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
        zIndex: 999,
        transform : isVisible ? 'translateX(0)' : 'translateX(100%)',
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
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #7033f5, #4f46e5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.95rem',
            }}>
              {comment.reviewerName.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f5f5f5' }}>{comment.reviewerName}</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                {platform && <Pill label={platform.label} color={platform.badgeColor} bg={platform.badgeBg} />}
                <SourceTypePill sourceType={comment.sourceType} />
              </div>
              {comment.postTitle && (
                <div style={{ fontSize: '0.7rem', color: '#7C86FF', marginTop: '3px' }}>{comment.postTitle}</div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {comment.sentiment && <SentimentBadge sentiment={comment.sentiment} />}
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '6px',
                color: '#9ca3af', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Comment text */}
            <GlassCard style={{ padding: '18px' }}>
              <p style={{ margin: 0, lineHeight: 1.7, color: '#e5e7eb', fontSize: '0.9rem', fontStyle: 'italic' }}>
                {comment.content ? `"${comment.content}"` : <em style={{ opacity: 0.4 }}>No comment provided</em>}
              </p>
              {comment.topics.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                  {comment.topics.map((t) => (
                    <span key={t} style={{
                      background: 'rgba(112,51,245,0.12)', color: '#A78BFA',
                      padding: '3px 10px', borderRadius: '20px',
                      fontSize: '0.72rem', fontWeight: 500,
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
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f5f5f5' }}>AI Reply</span>
                </div>
                <button
                  onClick={handleGenerateReply}
                  disabled={isGenerating}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'linear-gradient(135deg, #7033f5, #4f46e5)',
                    color: '#fff', border: 'none', borderRadius: '8px',
                    padding: '8px 16px', fontSize: '0.78rem', fontWeight: 600,
                    cursor: isGenerating ? 'not-allowed' : 'pointer',
                    opacity: isGenerating ? 0.7 : 1, transition: 'all 0.3s ease',
                  }}
                >
                  {isGenerating ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={13} />}
                  {isGenerating ? 'Generating...' : 'Generate'}
                </button>
              </div>

              <textarea
                value={editableReply}
                onChange={e => setEditableReply(e.target.value)}
                placeholder="Click Generate to create an AI reply, or type your own..."
                rows={5}
                style={{
                  width: '100%', maxWidth: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '14px',
                  color: '#e5e7eb', fontSize: '0.85rem', lineHeight: 1.6,
                  resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                }}
                onFocus={e  => { e.currentTarget.style.borderColor = 'rgba(112,51,245,0.5)'; }}
                onBlur={e   => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  onClick={handlePublish}
                  disabled={isPublishing || isPublished || !editableReply.trim()}
                  style={{
                    flex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    background  : isPublished ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg, #7033f5, #4f46e5)',
                    color       : isPublished ? '#10b981' : '#fff',
                    border      : isPublished ? '1px solid rgba(16,185,129,0.3)' : 'none',
                    borderRadius: '10px', padding: '12px',
                    fontSize: '0.85rem', fontWeight: 600,
                    cursor: (isPublishing || isPublished) ? 'not-allowed' : 'pointer',
                    opacity: isPublishing ? 0.7 : 1, transition: 'all 0.3s ease',
                  }}
                >
                  {isPublishing
                    ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Publishing...</>
                    : isPublished
                      ? <><CheckCircle size={14} /> Published ✓</>
                      : <><Send size={14} /> Publish Reply</>
                  }
                </button>

                {!comment.isResolved && (
                  <button
                    onClick={handleResolve}
                    disabled={isResolving}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#9CA3AF',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px', padding: '12px 18px',
                      fontSize: '0.85rem',
                      cursor: isResolving ? 'not-allowed' : 'pointer',
                      opacity: isResolving ? 0.7 : 1, transition: 'all 0.3s ease',
                    }}
                  >
                    {isResolving ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Shield size={14} />}
                    {isResolving ? 'Resolving...' : 'Resolve'}
                  </button>
                )}
              </div>
            </div>

            {/* Published reply */}
            {comment.publishedReply && (
              <GlassCard style={{ padding: '14px', borderLeft: '3px solid #10b981', borderRadius: '0 12px 12px 0' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  marginBottom: '8px', color: '#10b981',
                  fontSize: '0.78rem', fontWeight: 600,
                }}>
                  <CheckCircle size={13} /> Your Reply (Published)
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#9CA3AF', lineHeight: 1.6 }}>
                  {comment.publishedReply}
                </p>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Post Selector ────────────────────────────────────────────
function PostSelector({
  posts, selectedPostId, onChange,
}: {
  posts: PostRef[]; selectedPostId: string; onChange: (id: string) => void;
}) {
  const totalComments = posts.reduce((s, p) => s + p.commentCount, 0);
  return (
    <div style={{ marginBottom: '18px' }}>
      <p style={{
        fontSize: '11px', fontWeight: 600, color: '#6B7280',
        textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px',
      }}>
        Select post or campaign
      </p>
      <div style={{ position: 'relative', maxWidth: 460 }}>
        <select
          value={selectedPostId}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', height: 42, borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.03)',
            color: '#F5F5F5', fontSize: 13,
            padding: '0 36px 0 14px',
            appearance: 'none', cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="all" style={{ background: '#0f172a' }}>
            All posts &amp; campaigns ({totalComments} comments)
          </option>
          {posts.map(p => (
            <option key={p.id} value={p.id} style={{ background: '#0f172a' }}>
              {PLATFORM_CFG[p.source].label} · {p.sourceType === 'campaign' ? 'Campaign' : 'Post'} — {p.title} ({p.commentCount})
            </option>
          ))}
        </select>
        <ChevronDown size={16} style={{ position: 'absolute', right: 12, top: 13, color: '#6B7280', pointerEvents: 'none' }} />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
const PostAdReviewsPage: React.FC = () => {
  // All state is local — no Redux
  const [comments, setComments]     = useState<PostComment[]>(DEMO_COMMENTS);
  const [activeId, setActiveId]     = useState<string | null>(null);
  const [viewMode, setViewMode]     = useState<'grid' | 'list'>('grid');
  const [platformTab, setPlatformTab] = useState<PlatformTab>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  const [localFilters, setLocalFilters] = useState<LocalFilters>({
    search: '', platform: 'all', sentiment: 'all',
    status: 'all', sourceType: 'all', postId: 'all',
  });

  const activeComment = comments.find(c => c._id === activeId) ?? null;

  // Posts visible in selector based on active platform tab
  const visiblePosts = useMemo(
    () => platformTab === 'all' ? DEMO_POSTS : DEMO_POSTS.filter(p => p.source === platformTab),
    [platformTab]
  );

  const handlePlatformTab = (tab: PlatformTab) => {
    setPlatformTab(tab);
    setLocalFilters(prev => ({
      ...prev,
      platform: tab === 'all' ? 'all' : tab,
      postId  : 'all',
    }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleUpdateComment = (updated: PostComment) => {
    setComments(prev => prev.map(c => c._id === updated._id ? updated : c));
    setActiveId(null);
  };

  // Client-side filter
  const filteredComments = useMemo(() => {
    return comments.filter(c => {
      if (localFilters.search.trim()) {
        const q    = localFilters.search.toLowerCase();
        const text = [c.reviewerName, c.content, c.postTitle, ...c.topics].join(' ').toLowerCase();
        if (!text.includes(q)) return false;
      }
      if (platformTab             !== 'all' && c.source      !== platformTab)              return false;
      if (localFilters.sentiment  !== 'all' && c.sentiment   !== localFilters.sentiment)   return false;
      if (localFilters.status     !== 'all' && c.status      !== localFilters.status)      return false;
      if (localFilters.sourceType !== 'all' && c.sourceType  !== localFilters.sourceType)  return false;
      if (localFilters.postId     !== 'all' && c.postId      !== localFilters.postId)      return false;
      return true;
    });
  }, [comments, localFilters, platformTab]);

  const totalPages   = Math.ceil(filteredComments.length / PAGE_SIZE);
  const pagedComments = filteredComments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const pendingCount = comments.filter(c => c.status    === 'pending').length;
  const flaggedCount = comments.filter(c => c.sentiment === 'negative' && !c.isResolved).length;

  const FILTER_OPTIONS = {
    sentiment  : ['all', 'positive', 'negative', 'neutral', 'mixed'],
    status     : ['all', 'pending', 'replied'],
    sourceType : ['all', 'post', 'campaign'],
  };

  return (
    <div style={{ padding: 'clamp(16px, 2.5vw, 32px)' }}>

      {/* ── Stat cards ── */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { icon: Inbox,       label: 'Total comments',  color: '#7033f5', value: comments.length },
          { icon: Clock,       label: 'Pending',          color: '#f59e0b', value: pendingCount    },
          { icon: AlertCircle, label: 'Needs attention',  color: '#ef4444', value: flaggedCount    },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px', padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: '12px',
              flex: '1 1 auto', minWidth: '180px',
            }}>
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
                <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>
                  {s.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Platform tabs ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <PlatformTabBtn active={platformTab === 'all'}      label="All"      source="all"      onClick={() => handlePlatformTab('all')}      />
        <PlatformTabBtn active={platformTab === 'meta'}     label="Meta"     source="meta"     onClick={() => handlePlatformTab('meta')}     />
        <PlatformTabBtn active={platformTab === 'x'}        label="X"        source="x"        onClick={() => handlePlatformTab('x')}        />
        <PlatformTabBtn active={platformTab === 'linkedin'} label="LinkedIn" source="linkedin" onClick={() => handlePlatformTab('linkedin')} />
      </div>

      {/* ── Post selector ── */}
      <PostSelector
        posts={visiblePosts}
        selectedPostId={localFilters.postId}
        onChange={id => handleFilterChange('postId', id)}
      />

      {/* ── Search + filters + view toggle ── */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '16px',
        flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: '1 1 300px' }}>
          <Search size={16} style={{
            position: 'absolute', left: '14px', top: '50%',
            transform: 'translateY(-50%)', color: '#6b7280',
          }} />
          <input
            placeholder="Search by name, comment, or post..."
            value={localFilters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              paddingLeft: '42px', paddingRight: '16px', height: '44px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', color: '#e5e7eb',
              fontSize: '0.85rem', outline: 'none',
            }}
          />
        </div>

        {[
          { key: 'sentiment',  options: FILTER_OPTIONS.sentiment,  label: 'Sentiment' },
          { key: 'status',     options: FILTER_OPTIONS.status,     label: 'Status'    },
          { key: 'sourceType', options: FILTER_OPTIONS.sourceType, label: 'Type'      },
        ].map(f => (
          <select
            key={f.key}
            value={localFilters[f.key as keyof LocalFilters]}
            onChange={e => handleFilterChange(f.key, e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', color: '#e5e7eb',
              padding: '10px 14px', fontSize: '0.8rem',
              outline: 'none', cursor: 'pointer', minWidth: '130px',
            }}
          >
            {f.options.map(o => (
              <option key={o} value={o} style={{ background: '#0f172a' }}>
                {o === 'all' ? `All ${f.label}s` : o.charAt(0).toUpperCase() + o.slice(1)}
              </option>
            ))}
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
              style={{
                padding: '8px 12px', borderRadius: '10px',
                background: viewMode === mode ? 'rgba(112,51,245,0.2)' : 'transparent',
                color: viewMode === mode ? '#a78bfa' : '#6b7280',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
              }}
            >
              {mode === 'grid' ? <Grid size={16} /> : <List size={16} />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Active filter tags ── */}
      {(localFilters.sentiment !== 'all' || localFilters.status !== 'all' ||
        localFilters.sourceType !== 'all' || localFilters.postId !== 'all' ||
        localFilters.search) && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginBottom: '16px', flexWrap: 'wrap',
        }}>
          <FilterIcon size={14} color="#7033f5" />
          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>Active filters:</span>
          {([
            { key: 'sentiment',  active: localFilters.sentiment  !== 'all', label: `Sentiment: ${localFilters.sentiment}`,  reset: 'all' },
            { key: 'status',     active: localFilters.status     !== 'all', label: `Status: ${localFilters.status}`,        reset: 'all' },
            { key: 'sourceType', active: localFilters.sourceType !== 'all', label: `Type: ${localFilters.sourceType}`,      reset: 'all' },
            { key: 'postId',     active: localFilters.postId     !== 'all', label: `Post: ${DEMO_POSTS.find(p => p.id === localFilters.postId)?.title ?? localFilters.postId}`, reset: 'all' },
            { key: 'search',     active: !!localFilters.search,             label: `Search: "${localFilters.search}"`,      reset: '' },
          ] as const).filter(f => f.active).map(f => (
            <span key={f.key} style={{
              background: 'rgba(112,51,245,0.15)', color: '#a78bfa',
              padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              {f.label}
              <button
                onClick={() => handleFilterChange(f.key, f.reset)}
                style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ── Count row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
          Showing {filteredComments.length} of {comments.length} comments
        </span>
      </div>

      {/* ── Comment grid / list ── */}
      {filteredComments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6B7280' }}>
          <MessageSquare size={64} style={{ marginBottom: '16px', opacity: 0.2 }} />
          <p style={{ fontSize: '1rem', marginBottom: '8px', color: '#9CA3AF' }}>No comments found</p>
          <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>
            {localFilters.postId !== 'all'
              ? 'No comments for the selected post. Try another post or clear filters.'
              : 'Try adjusting your filters or search terms.'
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr',
          gap: '16px',
          paddingBottom: '24px',
        }}>
          {pagedComments.map((c, index) => (
            <CommentCard
              key={c._id}
              comment={c}
              index={index}
              viewMode={viewMode}
              onClick={() => setActiveId(c._id)}
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
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', padding: '10px 18px',
              color: '#9ca3af', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.82rem', fontWeight: 500,
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            Previous
          </button>
          <div style={{ display: 'flex', gap: '6px' }}>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: pageNum === currentPage ? 'linear-gradient(135deg, #7033f5, #4f46e5)' : 'rgba(255,255,255,0.05)',
                    border: pageNum === currentPage ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    color: pageNum === currentPage ? '#fff' : '#9ca3af',
                    cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px', padding: '10px 18px',
              color: '#9ca3af', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.82rem', fontWeight: 500,
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* ── Side panel ── */}
      {activeComment && (
        <CommentSidePanel
          comment={activeComment}
          comments={comments}
          onClose={() => setActiveId(null)}
          onUpdate={handleUpdateComment}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default PostAdReviewsPage;