import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Inbox, Clock, Search, Grid3x3, List,
  ChevronDown, ChevronRight, Send, RefreshCw, AlertCircle,
  Globe, MessageCircle, ExternalLink, CornerDownRight, Database,
  CheckCircle, Loader, X, Sparkles, Bot, Zap,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────
// API helper
// ─────────────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('access_token') || '';
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'API error');
  }
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────
interface MetaPage {
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  picture: string | null;
}

interface DbReply {
  replyId: string;
  parentCommentId: string;
  authorName: string;
  authorInitial: string;
  text: string;
  createdAt: string;
  likeCount: number;
}

interface DbComment {
  commentId: string;
  authorName: string;
  authorInitial: string;
  text: string;
  createdAt: string;
  likeCount: number;
  replyCount: number;
  replies: DbReply[];
}

// ai-generated map shape from DB
interface AiGeneratedEntry {
  reply: string;
  generatedAt: string;
}

interface DbPost {
  postId: string;
  pageId: string;
  pageName: string;
  message: string;
  title: string;
  permalink: string | null;
  thumbnail: string | null;
  postedAt: string;
  commentCount: number;
  comments: DbComment[];
  syncedAt: string | null;
  'ai-generated'?: Record<string, AiGeneratedEntry>;
}

interface DbPostsResponse {
  data: DbPost[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

interface DbPageStats {
  pageId: string;
  pageName: string | null;
  totalPosts: number;
  totalComments: number;
  totalReplies: number;
  lastSyncedAt: string | null;
}

interface SyncResult {
  synced: number;
  updated: number;
  failed: number;
  durationMs: number;
}

interface LiveReply {
  replyId: string;
  parentCommentId: string;
  authorName: string;
  authorInitial: string;
  text: string;
  createdAt: string;
  likeCount: number;
}

// AI reply generation result from backend
interface GenerateMetaReplyResult {
  source: string;
  postId: string;
  commentId: string;
  reply: string;
}

// Bulk generation result
interface GenerateMetaRepliesResult {
  source: string;
  processed: number;
  results: { postId: string; commentId: string; reply: string }[];
}

type PlatformTabKey = 'meta' | 'x' | 'linkedin';
type ViewMode = 'grid' | 'list';
type SyncStatus = 'idle' | 'syncing' | 'done' | 'error';

// ─────────────────────────────────────────────────────────────────────────
// Static config
// ─────────────────────────────────────────────────────────────────────────
const PLATFORM_CONFIG: Record<PlatformTabKey, { label: string }> = {
  meta:     { label: 'Meta'     },
  x:        { label: 'X'        },
  linkedin: { label: 'LinkedIn' },
};

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────
function timeAgo(iso?: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function formatSyncTime(iso: string | null): string {
  if (!iso) return 'Never synced';
  return `Last synced ${timeAgo(iso)} ago`;
}

// ─────────────────────────────────────────────────────────────────────────
// Presentational components
// ─────────────────────────────────────────────────────────────────────────
function AvatarCircle({ src, fallback, size = 36 }: {
  src?: string | null; fallback: string; size?: number;
}) {
  if (src) {
    return (
      <img src={src} alt="" className="par-avatar par-avatar-img" style={{ width: size, height: size }} />
    );
  }
  return (
    <div className="par-avatar" style={{ width: size, height: size, fontSize: Math.max(11, size * 0.38) }}>
      {fallback}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tint }: {
  icon: React.ElementType; label: string; value: number | string; tint: string;
}) {
  return (
    <div className="par-stat-card">
      <div className="par-stat-icon" style={{ background: tint }}>
        <Icon size={17} color="#fff" />
      </div>
      <div className="par-stat-text">
        <p className="par-stat-label">{label}</p>
        <p className="par-stat-value">{value}</p>
      </div>
    </div>
  );
}

function PlatformTab({ active, label, onClick }: {
  active: boolean; label: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className={`par-tab-btn${active ? ' is-active' : ''}`}>
      {label}
    </button>
  );
}

function SelectBox({ value, onChange, disabled, children, label }: {
  value: string; onChange: (v: string) => void; disabled?: boolean;
  children: React.ReactNode; label?: string;
}) {
  return (
    <div className="par-select-wrap">
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        disabled={disabled} aria-label={label} className="par-select"
      >
        {children}
      </select>
      <ChevronDown size={15} className="par-select-chevron" aria-hidden="true" />
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="par-banner par-banner-error" role="alert">
      <AlertCircle size={15} style={{ flexShrink: 0 }} />
      {message}
    </div>
  );
}

function ComingSoonBanner({ platform }: { platform: string }) {
  return (
    <div className="par-banner par-banner-warning">
      {platform} post review integration is coming soon. Connect it in Settings to activate.
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// AiReplyBubble — shows AI reply + "Post on Facebook" button
// ─────────────────────────────────────────────────────────────────────────
function AiReplyBubble({ reply, generatedAt, commentId, pageAccessToken, onPosted }: {
  reply: string;
  generatedAt?: string;
  commentId: string;
  pageAccessToken: string;
  onPosted?: () => void;
}) {
  const [posting, setPosting]     = useState(false);
  const [posted, setPosted]       = useState(false);
  const [postError, setPostError] = useState('');

  const handlePostToFb = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (posting || posted) return;
    setPosting(true); setPostError('');
    try {
      await apiFetch<{ success: boolean; commentId: string }>(
        `/meta-reviews/comments/${commentId}/reply`,
        { method: 'POST', body: JSON.stringify({ message: reply, pageAccessToken }) },
      );
      setPosted(true);
      onPosted?.();
    } catch (e: any) {
      setPostError(e.message || 'Failed to post reply');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="par-ai-bubble">
      <div className="par-ai-bubble-header">
        <Bot size={11} />
        <span>AI Reply</span>
        {generatedAt && <span className="par-ai-bubble-time">{timeAgo(generatedAt)}</span>}
      </div>
      <p className="par-ai-bubble-text">{reply}</p>
      <div className="par-ai-bubble-footer">
        {postError && <p className="par-ai-post-error">{postError}</p>}
        <button
          onClick={handlePostToFb}
          disabled={posting || posted}
          className={`par-post-fb-btn${posted ? ' par-post-fb-btn-done' : ''}`}
          title={posted ? 'Reply posted on Facebook' : 'Post this reply on Facebook'}
        >
          {posting
            ? <><Loader size={11} className="par-spin" />Posting…</>
            : posted
              ? <><CheckCircle size={11} />Posted on Facebook</>
              : <><Send size={11} />Post on Facebook</>
          }
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SyncBar — sync info + Sync button + global Generate All AI Replies button
// ─────────────────────────────────────────────────────────────────────────
function SyncBar({ syncedAt, status, result, onSync, totalPending, onGenerateAll, generatingAll }: {
  syncedAt: string | null; status: SyncStatus;
  result: SyncResult | null; onSync: () => void;
  totalPending: number;
  onGenerateAll: () => void;
  generatingAll: boolean;
}) {
  return (
    <div className="par-sync-bar">
      <div className="par-sync-info">
        <Database size={13} className="par-sync-db-icon" aria-hidden="true" />
        <span className="par-sync-time">{formatSyncTime(syncedAt)}</span>
        {status === 'done' && result && (
          <span className="par-sync-result">
            <CheckCircle size={12} />
            {result.synced} new · {result.updated} updated · {result.durationMs}ms
          </span>
        )}
        {status === 'error' && (
          <span className="par-sync-result par-sync-result-error">
            <AlertCircle size={12} /> Sync failed
          </span>
        )}
      </div>
      <div className="par-sync-actions">
        {/* Global: Generate All AI Replies across all posts */}
        <button
          onClick={onGenerateAll}
          disabled={generatingAll || totalPending === 0}
          className="par-ai-generate-all-btn"
          title={totalPending === 0 ? 'All comments already have AI replies' : `Generate AI replies for ${totalPending} pending comment${totalPending === 1 ? '' : 's'} across all posts`}
        >
          {generatingAll
            ? <><Loader size={12} className="par-spin" />Generating…</>
            : <><Zap size={12} />AI All ({totalPending})</>
          }
        </button>
        <button onClick={onSync} disabled={status === 'syncing'} className="par-sync-btn" aria-label="Sync page from Facebook">
          {status === 'syncing'
            ? <><Loader size={12} className="par-spin" />Syncing…</>
            : <><RefreshCw size={12} />Sync from Facebook</>
          }
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// PostCard
// ─────────────────────────────────────────────────────────────────────────
function PostCard({ post, pageName, pagePicture, commentCount, compact = false }: {
  post: DbPost; pageName: string; pagePicture: string | null;
  commentCount: number; compact?: boolean;
}) {
  return (
    <div className={`par-post-card${compact ? ' par-post-card-compact' : ''}`}>
      <div className="par-post-header">
        <AvatarCircle src={pagePicture} fallback={pageName?.[0]?.toUpperCase() ?? 'P'} size={compact ? 30 : 40} />
        <div className="par-post-meta">
          <p className={`par-post-page${compact ? ' par-post-page-compact' : ''}`}>{pageName || 'Page'}</p>
          <p className="par-post-sub">
            {timeAgo(post.postedAt)} ago
            <Globe size={11} className="par-post-globe" aria-hidden="true" />
          </p>
        </div>
      </div>
      {post.message && (
        <p className={`par-post-message${compact ? ' par-post-message-compact' : ''}`}>{post.message}</p>
      )}
      {post.thumbnail && (
        <img src={post.thumbnail} alt="" className={`par-post-image${compact ? ' par-post-image-compact' : ''}`} loading="lazy" />
      )}
      <div className={`par-post-footer${compact ? ' par-post-footer-compact' : ''}`}>
        <span className="par-post-footer-stat">
          <MessageCircle size={compact ? 12 : 13} />
          {commentCount} comment{commentCount === 1 ? '' : 's'}
        </span>
        {post.permalink && (
          <a href={post.permalink} target="_blank" rel="noreferrer" className="par-post-link" onClick={(e) => e.stopPropagation()}>
            View on Facebook <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// CommentCard — with AI generate reply button
// ─────────────────────────────────────────────────────────────────────────
function CommentCard({ comment, postId, pageAccessToken, aiEntry, onAiGenerated, onReplySuccess, compact = false }: {
  comment: DbComment;
  postId: string;
  pageAccessToken: string;
  aiEntry?: AiGeneratedEntry;         // existing ai-generated reply for this comment
  onAiGenerated: (commentId: string, entry: AiGeneratedEntry) => void;
  onReplySuccess?: () => void;
  compact?: boolean;
}) {
  const [replying, setReplying]     = useState(false);
  const [message, setMessage]       = useState('');
  const [sending, setSending]       = useState(false);
  const [replyError, setReplyError] = useState('');

  const [showReplies, setShowReplies]       = useState(false);
  const [liveReplies, setLiveReplies]       = useState<LiveReply[] | null>(null);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [repliesError, setRepliesError]     = useState('');

  // AI generation state
  const [generatingAi, setGeneratingAi]   = useState(false);
  const [aiError, setAiError]             = useState('');
  const [localAiEntry, setLocalAiEntry]   = useState<AiGeneratedEntry | undefined>(aiEntry);

  // Sync prop changes (when parent refreshes posts after bulk generate)
  useEffect(() => { setLocalAiEntry(aiEntry); }, [aiEntry]);

  const displayReplies: (DbReply | LiveReply)[] = liveReplies ?? comment.replies ?? [];
  const replyCount = liveReplies ? liveReplies.length : (comment.replyCount ?? comment.replies?.length ?? 0);
  const hasReplies = replyCount > 0 || showReplies;

  const fetchLiveReplies = useCallback(async () => {
    setLoadingReplies(true); setRepliesError('');
    try {
      const data = await apiFetch<LiveReply[]>(
        `/meta-reviews/comments/${comment.commentId}/replies?pageAccessToken=${encodeURIComponent(pageAccessToken)}`,
      );
      setLiveReplies(data);
    } catch (e: any) {
      setRepliesError(e.message || 'Failed to load replies');
    } finally {
      setLoadingReplies(false);
    }
  }, [comment.commentId, pageAccessToken]);

  const toggleReplies = () => {
    const next = !showReplies;
    setShowReplies(next);
    if (next && liveReplies === null) fetchLiveReplies();
  };

  const submit = async () => {
    if (!message.trim() || sending) return;
    setSending(true); setReplyError('');
    try {
      await apiFetch<{ success: boolean; commentId: string }>(
        `/meta-reviews/comments/${comment.commentId}/reply`,
        { method: 'POST', body: JSON.stringify({ message: message.trim(), pageAccessToken }) },
      );
      setReplying(false); setMessage('');
      setShowReplies(true);
      fetchLiveReplies();
      onReplySuccess?.();
    } catch (e: any) {
      setReplyError(e.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  // ── AI: generate single reply for this comment ──
  const handleGenerateAiReply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setGeneratingAi(true); setAiError('');
    try {
      const result = await apiFetch<GenerateMetaReplyResult>(
        `/generate-meta-reply/${encodeURIComponent(postId)}/${encodeURIComponent(comment.commentId)}`,
        { method: 'POST' },
      );
      const entry: AiGeneratedEntry = { reply: result.reply, generatedAt: new Date().toISOString() };
      setLocalAiEntry(entry);
      onAiGenerated(comment.commentId, entry);
    } catch (e: any) {
      setAiError(e.message || 'Failed to generate AI reply');
    } finally {
      setGeneratingAi(false);
    }
  };

  return (
    <div className="par-comment-thread">
      <div className="par-comment-row">
        <AvatarCircle fallback={comment.authorInitial} size={compact ? 26 : 32} />

        <div className="par-comment-col">
          <div className={`par-comment-bubble${compact ? ' par-comment-bubble-compact' : ''}`}>
            <p className="par-bubble-author">{comment.authorName}</p>
            <p className="par-bubble-text">{comment.text}</p>
          </div>

          <div className="par-comment-meta-row">
            <span className="par-comment-time">{timeAgo(comment.createdAt)}</span>
            {comment.likeCount > 0 && (
              <span className="par-comment-meta-item">👍 {comment.likeCount}</span>
            )}
            <button onClick={() => { setReplying(r => !r); setReplyError(''); }} className="par-comment-action">
              {replying ? 'Cancel' : 'Reply'}
            </button>
            {hasReplies && (
              <button onClick={toggleReplies} className="par-comment-action">
                {showReplies ? 'Hide' : 'View'} {replyCount} repl{replyCount === 1 ? 'y' : 'ies'}
              </button>
            )}

            {/* ── AI Generate button ── */}
            <button
              onClick={handleGenerateAiReply}
              disabled={generatingAi}
              className={`par-ai-gen-btn${localAiEntry ? ' par-ai-gen-btn-regen' : ''}`}
              title={localAiEntry ? 'Re-generate AI reply' : 'Generate AI reply'}
            >
              {generatingAi
                ? <><Loader size={10} className="par-spin" />Generating…</>
                : localAiEntry
                  ? <><Sparkles size={10} />Re-generate</>
                  : <><Sparkles size={10} />AI Reply</>
              }
            </button>
          </div>

          {aiError && <p className="par-reply-error">{aiError}</p>}

          {/* ── AI reply bubble ── */}
          {localAiEntry && (
            <AiReplyBubble
              reply={localAiEntry.reply}
              generatedAt={localAiEntry.generatedAt}
              commentId={comment.commentId}
              pageAccessToken={pageAccessToken}
            />
          )}

          {replying && (
            <div className="par-reply-row-inline">
              <AvatarCircle fallback="Y" size={26} />
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
                placeholder="Write a reply…"
                autoFocus
                className="par-reply-input"
              />
              <button onClick={submit} disabled={sending || !message.trim()} title="Send reply" aria-label="Send reply" className="par-send-btn">
                <Send size={13} />
              </button>
            </div>
          )}
          {replyError && <p className="par-reply-error">{replyError}</p>}

          {showReplies && (
            <div className="par-replies-wrap">
              {loadingReplies && <p className="par-replies-status">Loading replies…</p>}
              {repliesError && <p className="par-reply-error">{repliesError}</p>}
              {!loadingReplies && displayReplies.length === 0 && <p className="par-replies-status">No replies yet.</p>}
              {displayReplies.map((r) => (
                <div key={r.replyId} className="par-comment-row par-comment-row-nested">
                  <AvatarCircle fallback={r.authorInitial} size={compact ? 24 : 28} />
                  <div className="par-comment-col">
                    <p className="par-reply-indicator">
                      <CornerDownRight size={11} aria-hidden="true" />
                      Reply to {comment.authorName}
                    </p>
                    <div className={`par-comment-bubble${compact ? ' par-comment-bubble-compact' : ''}`}>
                      <p className="par-bubble-author">{r.authorName}</p>
                      <p className="par-bubble-text">{r.text}</p>
                    </div>
                    <div className="par-comment-meta-row">
                      <span className="par-comment-time">{timeAgo(r.createdAt)}</span>
                      {r.likeCount > 0 && <span className="par-comment-meta-item">👍 {r.likeCount}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// FeedPostSection
// ─────────────────────────────────────────────────────────────────────────
function FeedPostSection({ post, pageName, pagePicture, view, onOpenComments, onPostUpdated }: {
  post: DbPost; pageName: string; pagePicture: string | null;
  view: ViewMode; onOpenComments: (post: DbPost) => void;
  onPostUpdated: (updatedPost: DbPost) => void;
}) {
  const compact = view === 'grid';
  const comments = post.comments ?? [];
  const hasComments = comments.length > 0;
  const aiGenerated = post['ai-generated'] ?? {};
  const aiCount = Object.keys(aiGenerated).length;
  const pendingCount = comments.filter(c => !aiGenerated[c.commentId]).length;

  const [generatingPost, setGeneratingPost] = useState(false);
  const [postBulkDone, setPostBulkDone]     = useState(false);

  const handleGenerateForPost = async (e: React.MouseEvent) => {
    e.stopPropagation(); // don't open panel
    if (generatingPost || pendingCount === 0) return;
    setGeneratingPost(true); setPostBulkDone(false);
    try {
      const result = await apiFetch<GenerateMetaRepliesResult>('/generate-meta-replies', { method: 'POST' });
      const nextMap = { ...aiGenerated };
      for (const r of result.results) {
        if (r.postId === post.postId) {
          nextMap[r.commentId] = { reply: r.reply, generatedAt: new Date().toISOString() };
        }
      }
      onPostUpdated({ ...post, 'ai-generated': nextMap });
      setPostBulkDone(true);
    } catch {
      // silent — user can retry by opening panel
    } finally {
      setGeneratingPost(false);
    }
  };

  return (
    <div
      className={`par-feed-section${compact ? ' par-feed-section-compact' : ''} par-feed-section-clickable`}
      onClick={() => onOpenComments(post)}
      role="button" tabIndex={0}
      aria-label={`Open comments for ${post.title || 'this post'}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenComments(post); } }}
    >
      <PostCard post={post} pageName={pageName} pagePicture={pagePicture} commentCount={comments.length} compact={compact} />

      <div className={`par-comments-toggle${hasComments ? '' : ' is-disabled'}`}>
        <span className="par-comments-toggle-label">
          <MessageCircle size={13} aria-hidden="true" />
          {hasComments ? `${comments.length} comment${comments.length === 1 ? '' : 's'}` : 'No comments yet'}
        </span>
        <div className="par-comments-toggle-right">
          {aiCount > 0 && (
            <span className="par-ai-badge">
              <Bot size={10} /> {aiCount} AI
            </span>
          )}
          <ChevronRight size={14} aria-hidden="true" />
        </div>
      </div>

      {/* Per-post AI generate button */}
      {hasComments && (
        <button
          onClick={handleGenerateForPost}
          disabled={generatingPost || pendingCount === 0}
          className={`par-post-gen-btn${postBulkDone ? ' par-post-gen-btn-done' : ''}`}
          title={pendingCount === 0 ? 'All comments have AI replies' : `Generate AI replies for ${pendingCount} comment${pendingCount === 1 ? '' : 's'} in this post`}
        >
          {generatingPost
            ? <><Loader size={10} className="par-spin" />Generating…</>
            : postBulkDone || pendingCount === 0
              ? <><CheckCircle size={10} />{aiCount > 0 ? `${aiCount} AI replies ready` : 'All done'}</>
              : <><Sparkles size={10} />Generate {pendingCount} AI repl{pendingCount === 1 ? 'y' : 'ies'}</>
          }
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// CommentsSidePanel — comments + per-comment AI generate + Post on FB
// ─────────────────────────────────────────────────────────────────────────
function CommentsSidePanel({ post, pageName, pagePicture, pageAccessToken, onClose, onPostUpdated }: {
  post: DbPost; pageName: string; pagePicture: string | null;
  pageAccessToken: string; onClose: () => void;
  onPostUpdated: (updatedPost: DbPost) => void;
}) {
  const [aiGenerated, setAiGenerated] = useState<Record<string, AiGeneratedEntry>>(
    post['ai-generated'] ?? {},
  );

  useEffect(() => { setAiGenerated(post['ai-generated'] ?? {}); }, [post]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKeyDown); document.body.style.overflow = prev; };
  }, [onClose]);

  const comments = post.comments ?? [];
  const generatedCount = Object.keys(aiGenerated).length;

  const handleSingleAiGenerated = useCallback((commentId: string, entry: AiGeneratedEntry) => {
    setAiGenerated(prev => {
      const next = { ...prev, [commentId]: entry };
      onPostUpdated({ ...post, 'ai-generated': next });
      return next;
    });
  }, [post, onPostUpdated]);

  return (
    <div className="par-panel-layer">
      <div className="par-panel-backdrop" onClick={onClose} aria-hidden="true" />
      <aside className="par-panel" role="dialog" aria-modal="true" aria-label={`Comments on ${post.title || 'post'}`}>

        {/* Header */}
        <div className="par-panel-header">
          <div className="par-panel-header-main">
            <AvatarCircle src={pagePicture} fallback={pageName?.[0]?.toUpperCase() ?? 'P'} size={34} />
            <div className="par-panel-header-text">
              <p className="par-panel-header-page">{pageName || 'Page'}</p>
              <p className="par-panel-header-sub">{timeAgo(post.postedAt)} ago</p>
            </div>
          </div>
          <button onClick={onClose} className="par-panel-close" aria-label="Close comments panel">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="par-panel-body">
          {post.message && <p className="par-panel-post-message">{post.message}</p>}
          {post.thumbnail && <img src={post.thumbnail} alt="" className="par-panel-post-image" loading="lazy" />}
          {post.permalink && (
            <a href={post.permalink} target="_blank" rel="noreferrer" className="par-panel-post-link">
              View on Facebook <ExternalLink size={11} />
            </a>
          )}

          <div className="par-panel-divider" />

          <p className="par-panel-comments-heading">
            {comments.length} comment{comments.length === 1 ? '' : 's'}
            {generatedCount > 0 && (
              <span className="par-panel-ai-count"> · <Bot size={10} style={{display:'inline',verticalAlign:'middle'}} /> {generatedCount} AI repl{generatedCount === 1 ? 'y' : 'ies'}</span>
            )}
          </p>

          {comments.length === 0 ? (
            <p className="par-panel-empty">No comments on this post yet.</p>
          ) : (
            <div className="par-panel-comments-list">
              {comments.map((c) => (
                <CommentCard
                  key={c.commentId}
                  comment={c}
                  postId={post.postId}
                  pageAccessToken={pageAccessToken}
                  aiEntry={aiGenerated[c.commentId]}
                  onAiGenerated={handleSingleAiGenerated}
                />
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────
export default function PostAdReviews() {
  const [tab, setTab] = useState<PlatformTabKey>('meta');

  const [pages, setPages]                   = useState<MetaPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [loadingPages, setLoadingPages]     = useState(false);

  const [dbPosts, setDbPosts]           = useState<DbPost[]>([]);
  const [dbMeta, setDbMeta]             = useState<{ total: number; totalPages: number } | null>(null);
  const [currentPage, setCurrentPage]   = useState(1);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [pageStats, setPageStats]   = useState<DbPageStats | null>(null);

  const [selectedPostId, setSelectedPostId] = useState<string>('all');
  const [search, setSearch]                 = useState('');
  const [view, setView]                     = useState<ViewMode>('grid');
  const [error, setError]                   = useState('');

  const [panelPost, setPanelPost] = useState<DbPost | null>(null);

  // ── Global: generate AI replies for ALL posts / ALL pending comments ──
  const [globalGenerating, setGlobalGenerating] = useState(false);

  const LIMIT = 12;

  const selectedPage = useMemo(() => pages.find(p => p.pageId === selectedPageId) ?? null, [pages, selectedPageId]);

  // ── Update a post in state (called from panel when ai-generated map changes) ──
  const handlePostUpdated = useCallback((updatedPost: DbPost) => {
    setDbPosts(prev => prev.map(p => p.postId === updatedPost.postId ? updatedPost : p));
    // Also update panelPost so the panel re-renders with fresh data
    setPanelPost(prev => prev?.postId === updatedPost.postId ? updatedPost : prev);
  }, []);

  const loadPages = useCallback(async () => {
    setError(''); setLoadingPages(true);
    try {
      const data = await apiFetch<MetaPage[]>('/meta-reviews/pages');
      setPages(data);
      if (data.length > 0) setSelectedPageId(prev => prev || data[0].pageId);
    } catch (e: any) {
      setError(e.message || 'Failed to load Pages. Make sure Meta is connected.');
    } finally {
      setLoadingPages(false);
    }
  }, []);

  useEffect(() => { if (tab === 'meta') loadPages(); }, [tab, loadPages]);

  const loadPageStats = useCallback(async () => {
    if (!selectedPageId) return;
    try {
      const stats = await apiFetch<DbPageStats>(`/meta-reviews/db/pages/${selectedPageId}/stats`);
      setPageStats(stats);
    } catch { setPageStats(null); }
  }, [selectedPageId]);

  useEffect(() => { loadPageStats(); }, [loadPageStats]);

  const loadDbPosts = useCallback(async (page = 1) => {
    if (!selectedPageId) return;
    setError(''); setLoadingPosts(true);
    try {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const data = await apiFetch<DbPostsResponse>(
        `/meta-reviews/db/pages/${selectedPageId}/posts?page=${page}&limit=${LIMIT}${searchParam}`,
      );
      setDbPosts(data.data);
      setDbMeta(data.meta);
      setCurrentPage(page);
    } catch (e: any) {
      if (e.message?.includes('sync')) { setDbPosts([]); setDbMeta(null); }
      else setError(e.message || 'Failed to load posts from DB.');
    } finally {
      setLoadingPosts(false);
    }
  }, [selectedPageId, search]);

  useEffect(() => {
    setDbPosts([]); setCurrentPage(1); setSelectedPostId('all'); setPanelPost(null);
    if (selectedPageId) loadDbPosts(1);
  }, [selectedPageId]);

  useEffect(() => {
    if (!selectedPageId) return;
    const t = setTimeout(() => loadDbPosts(1), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleSync = useCallback(async () => {
    if (!selectedPage || syncStatus === 'syncing') return;
    setSyncStatus('syncing'); setSyncResult(null); setError('');
    try {
      const result = await apiFetch<SyncResult>(
        `/meta-reviews/sync/pages/${selectedPage.pageId}`,
        { method: 'POST', body: JSON.stringify({ pageAccessToken: selectedPage.pageAccessToken, pageName: selectedPage.pageName }) },
      );
      setSyncResult(result); setSyncStatus('done');
      await Promise.all([loadDbPosts(1), loadPageStats()]);
    } catch (e: any) {
      setSyncStatus('error');
      setError(e.message || 'Sync failed. Please try again.');
    }
  }, [selectedPage, syncStatus, loadDbPosts, loadPageStats]);

  useEffect(() => {
    if (selectedPage && !loadingPosts && dbPosts.length === 0 && syncStatus === 'idle' && pageStats !== null && pageStats.totalPosts === 0) {
      handleSync();
    }
  }, [selectedPage, loadingPosts, dbPosts.length, syncStatus, pageStats]);

  const displayedPosts = useMemo(() => {
    if (selectedPostId === 'all') return dbPosts;
    return dbPosts.filter(p => p.postId === selectedPostId);
  }, [dbPosts, selectedPostId]);

  const totalComments = useMemo(() => dbPosts.reduce((sum, p) => sum + (p.comments?.length ?? 0), 0), [dbPosts]);
  const totalAiGenerated = useMemo(
    () => dbPosts.reduce((sum, p) => sum + Object.keys(p['ai-generated'] ?? {}).length, 0),
    [dbPosts],
  );
  const totalPending = useMemo(
    () => dbPosts.reduce((sum, p) => {
      const ai = p['ai-generated'] ?? {};
      return sum + (p.comments ?? []).filter(c => !ai[c.commentId]).length;
    }, 0),
    [dbPosts],
  );

  // Global "Generate All" — generates AI replies for every pending comment across all loaded posts
  const handleGlobalGenerateAll = useCallback(async () => {
    if (globalGenerating || totalPending === 0) return;
    setGlobalGenerating(true);
    try {
      const result = await apiFetch<GenerateMetaRepliesResult>('/generate-meta-replies', { method: 'POST' });
      // Patch each post in state with newly generated replies
      setDbPosts(prev => prev.map(post => {
        const nextMap = { ...(post['ai-generated'] ?? {}) };
        for (const r of result.results) {
          if (r.postId === post.postId) {
            nextMap[r.commentId] = { reply: r.reply, generatedAt: new Date().toISOString() };
          }
        }
        return { ...post, 'ai-generated': nextMap };
      }));
      // Also update panelPost if open
      setPanelPost(prev => {
        if (!prev) return prev;
        const nextMap = { ...(prev['ai-generated'] ?? {}) };
        for (const r of result.results) {
          if (r.postId === prev.postId) {
            nextMap[r.commentId] = { reply: r.reply, generatedAt: new Date().toISOString() };
          }
        }
        return { ...prev, 'ai-generated': nextMap };
      });
    } catch (e: any) {
      setError(e.message || 'Failed to generate AI replies');
    } finally {
      setGlobalGenerating(false);
    }
  }, [globalGenerating, totalPending]);

  const emptyMessage = !selectedPage
    ? 'Connect your Facebook Page in Settings to get started.'
    : syncStatus === 'syncing'
      ? 'Syncing posts from Facebook…'
      : dbPosts.length === 0
        ? 'No posts synced yet. Click "Sync from Facebook" to pull your posts.'
        : 'No posts match the current filter.';

  return (
    <div className="par-page">
      {/* Header */}
      <div className="par-header">
        <h1 className="par-title">Post &amp; Ad Reviews</h1>
        <p className="par-subtitle">Track and reply to comments across your connected platforms, in one place.</p>
      </div>

      {/* Stats */}
      <div className="par-stats">
        <StatCard icon={Inbox} label="Comments in view" value={totalComments} tint="linear-gradient(135deg,#5B6EF5,#7C6EF5)" />
        <StatCard icon={Clock} label="Posts loaded" value={pageStats?.totalPosts ?? dbPosts.length} tint="linear-gradient(135deg,#FBBF24,#F59E0B)" />
        <StatCard icon={Bot} label="AI replies generated" value={totalAiGenerated} tint="linear-gradient(135deg,#34D399,#059669)" />
      </div>

      {/* Platform tabs */}
      <div className="par-tabs" role="tablist" aria-label="Platform">
        {(['meta', 'x', 'linkedin'] as PlatformTabKey[]).map(t => (
          <PlatformTab key={t} active={tab === t} label={PLATFORM_CONFIG[t].label} onClick={() => setTab(t)} />
        ))}
      </div>

      {tab !== 'meta' && <ComingSoonBanner platform={PLATFORM_CONFIG[tab].label} />}

      {tab === 'meta' && (
        <>
          {error && <ErrorBanner message={error} />}

          {/* Page selector */}
          <div className="par-selectors">
            <div className="par-field">
              <div className="par-field-label-row">
                <p className="par-field-label">Facebook Page</p>
                <button onClick={loadPages} disabled={loadingPages} className="par-refresh-btn" aria-label="Refresh pages list">
                  <RefreshCw size={12} className={loadingPages ? 'par-spin' : ''} /> Refresh
                </button>
              </div>
              <SelectBox
                label="Facebook Page" value={selectedPageId}
                onChange={(v) => { setSelectedPageId(v); setDbPosts([]); setSelectedPostId('all'); setSyncStatus('idle'); setSyncResult(null); setPageStats(null); setPanelPost(null); }}
                disabled={loadingPages || pages.length === 0}
              >
                {loadingPages ? <option>Loading Pages…</option>
                  : pages.length === 0 ? <option>No Pages found — connect Facebook in Settings</option>
                  : pages.map(p => <option key={p.pageId} value={p.pageId}>{p.pageName}</option>)}
              </SelectBox>
            </div>

            <div className="par-field">
              <p className="par-field-label">Filter by post</p>
              <SelectBox label="Filter by post" value={selectedPostId} onChange={setSelectedPostId} disabled={loadingPosts || dbPosts.length === 0}>
                {loadingPosts ? <option>Loading posts…</option>
                  : dbPosts.length === 0 ? <option>No posts yet — sync first</option>
                  : <>
                      <option value="all">All posts ({pageStats?.totalComments ?? totalComments} comments)</option>
                      {dbPosts.map(p => (
                        <option key={p.postId} value={p.postId}>
                          {p.title} ({p.comments?.length ?? 0} comments)
                        </option>
                      ))}
                    </>}
              </SelectBox>
            </div>
          </div>

          {/* Sync bar */}
          {selectedPage && (
            <SyncBar
              syncedAt={pageStats?.lastSyncedAt ?? null}
              status={syncStatus}
              result={syncResult}
              onSync={handleSync}
              totalPending={totalPending}
              onGenerateAll={handleGlobalGenerateAll}
              generatingAll={globalGenerating}
            />
          )}

          {/* Search + view toggle */}
          <div className="par-search-row">
            <div className="par-search-field">
              <Search size={14} className="par-search-icon" aria-hidden="true" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts by message…" className="par-search-input" aria-label="Search posts" />
            </div>
            <div className="par-view-toggle" role="group" aria-label="Feed layout">
              {(['grid', 'list'] as ViewMode[]).map(v => (
                <button key={v} onClick={() => setView(v)} aria-label={v === 'grid' ? 'Compact grid' : 'Full feed view'} aria-pressed={view === v} className={`par-view-btn${view === v ? ' is-active' : ''}`}>
                  {v === 'grid' ? <Grid3x3 size={14} /> : <List size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Result count + pagination */}
          <div className="par-result-row">
            <p className="par-result-count">
              {loadingPosts ? 'Loading posts…'
                : `Showing ${displayedPosts.length} post${displayedPosts.length === 1 ? '' : 's'}` + (dbMeta ? ` of ${dbMeta.total} total` : '')}
            </p>
            {dbMeta && dbMeta.totalPages > 1 && (
              <div className="par-pagination">
                <button onClick={() => loadDbPosts(currentPage - 1)} disabled={currentPage <= 1 || loadingPosts} className="par-page-btn">‹ Prev</button>
                <span className="par-page-info">{currentPage} / {dbMeta.totalPages}</span>
                <button onClick={() => loadDbPosts(currentPage + 1)} disabled={currentPage >= dbMeta.totalPages || loadingPosts} className="par-page-btn">Next ›</button>
              </div>
            )}
          </div>

          {/* Feed */}
          {syncStatus === 'syncing' && dbPosts.length === 0 ? (
            <div className="par-sync-loading">
              <Loader size={28} className="par-spin" />
              <p>Fetching all posts, comments and replies from Facebook…</p>
              <p className="par-sync-loading-sub">This may take a moment for large pages.</p>
            </div>
          ) : !loadingPosts && displayedPosts.length === 0 ? (
            <div className="par-empty">
              <p>{emptyMessage}</p>
              {dbPosts.length === 0 && selectedPage && syncStatus !== 'syncing' && (
                <button onClick={handleSync} className="par-sync-btn par-sync-btn-cta">
                  <RefreshCw size={13} /> Sync from Facebook
                </button>
              )}
            </div>
          ) : (
            <div className={`par-feed par-feed-${view}`}>
              {displayedPosts.map(post => (
                <FeedPostSection
                  key={post.postId}
                  post={post}
                  pageName={selectedPage?.pageName ?? post.pageName ?? ''}
                  pagePicture={selectedPage?.picture ?? null}
                  view={view}
                  onOpenComments={setPanelPost}
                  onPostUpdated={handlePostUpdated}
                />
              ))}
            </div>
          )}

          {/* Comments side panel */}
          {panelPost && (
            <CommentsSidePanel
              post={panelPost}
              pageName={selectedPage?.pageName ?? panelPost.pageName ?? ''}
              pagePicture={selectedPage?.picture ?? null}
              pageAccessToken={selectedPage?.pageAccessToken ?? ''}
              onClose={() => setPanelPost(null)}
              onPostUpdated={handlePostUpdated}
            />
          )}
        </>
      )}

      <style>{`
        :root {
          --par-accent-1: #5B6EF5;
          --par-accent-2: #22D3EE;
          --par-surface: rgba(255,255,255,0.03);
          --par-surface-hover: rgba(255,255,255,0.05);
          --par-border: rgba(255,255,255,0.07);
          --par-border-strong: rgba(255,255,255,0.14);
          --par-text-primary: #F5F5F5;
          --par-text-secondary: #9CA3AF;
          --par-text-tertiary: #6B7280;
          --par-danger: #F87171;
          --par-success: #34D399;
          --par-warning: #FBBF24;
          --par-bubble-bg: rgba(255,255,255,0.06);
          --par-ai-accent: #A78BFA;
          --par-ai-bg: rgba(167,139,250,0.08);
          --par-ai-border: rgba(167,139,250,0.22);
        }
        * { box-sizing: border-box; }

        .par-page { font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: var(--par-text-primary); width: 100%; max-width: 1280px; margin: 0 auto; padding: 16px; }
        @media (min-width: 640px)  { .par-page { padding: 24px; } }
        @media (min-width: 1024px) { .par-page { padding: 32px; } }

        .par-header { margin-bottom: 22px; }
        .par-title { margin: 0 0 6px; font-size: clamp(20px,4vw,28px); font-weight: 700; letter-spacing: -0.01em; }
        .par-subtitle { margin: 0; font-size: 13px; color: var(--par-text-secondary); max-width: 560px; }

        .par-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 22px; }
        @media (max-width: 900px) { .par-stats { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 560px) { .par-stats { grid-template-columns: 1fr; } }
        .par-stat-card { background: var(--par-surface); border: 1px solid var(--par-border); border-radius: 16px; padding: 16px 18px; display: flex; align-items: center; gap: 14px; min-width: 0; transition: border-color .15s, background .15s; }
        .par-stat-card:hover { border-color: var(--par-border-strong); background: var(--par-surface-hover); }
        .par-stat-icon { width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .par-stat-label { margin: 0; font-size: 12px; color: var(--par-text-secondary); }
        .par-stat-value { margin: 0; font-size: clamp(18px,3vw,22px); font-weight: 600; line-height: 1.3; }

        .par-tabs { display: flex; gap: 8px; margin-bottom: 18px; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
        .par-tabs::-webkit-scrollbar { display: none; }
        .par-tab-btn { flex: 0 0 auto; white-space: nowrap; padding: 8px 18px; border-radius: 999px; font-size: 13px; font-weight: 600; border: 1px solid var(--par-border); background: transparent; color: var(--par-text-secondary); cursor: pointer; transition: all .15s; }
        .par-tab-btn:hover { border-color: var(--par-border-strong); color: var(--par-text-primary); }
        .par-tab-btn.is-active { border-color: rgba(91,110,245,0.5); background: rgba(91,110,245,0.16); color: #A5B4FC; }

        .par-tab-btn:focus-visible, .par-refresh-btn:focus-visible, .par-view-btn:focus-visible,
        .par-comment-action:focus-visible, .par-send-btn:focus-visible, .par-select:focus-visible,
        .par-search-input:focus-visible, .par-reply-input:focus-visible, .par-post-link:focus-visible,
        .par-sync-btn:focus-visible, .par-page-btn:focus-visible, .par-feed-section-clickable:focus-visible,
        .par-panel-close:focus-visible, .par-panel-post-link:focus-visible, .par-ai-gen-btn:focus-visible,
        .par-ai-generate-all-btn:focus-visible { outline: 2px solid var(--par-accent-2); outline-offset: 2px; }

        .par-banner { padding: 12px 16px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .par-banner-error { background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); color: var(--par-danger); }
        .par-banner-warning { background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.2); color: var(--par-warning); padding: 14px 18px; border-radius: 12px; }
        .par-banner-success { background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.2); color: var(--par-success); }

        .par-sync-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 14px; margin-bottom: 16px; background: rgba(255,255,255,0.03); border: 1px solid var(--par-border); border-radius: 10px; flex-wrap: wrap; }
        .par-sync-info { display: flex; align-items: center; gap: 8px; min-width: 0; flex-wrap: wrap; }
        .par-sync-db-icon { color: var(--par-text-tertiary); flex-shrink: 0; }
        .par-sync-time { font-size: 12px; color: var(--par-text-tertiary); }
        .par-sync-result { display: flex; align-items: center; gap: 4px; font-size: 11.5px; color: var(--par-success); }
        .par-sync-result-error { color: var(--par-danger); }
        /* sync-actions: groups the two right-side buttons */
        .par-sync-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; flex-wrap: wrap; }
        .par-sync-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; font-size: 12.5px; font-weight: 600; border: 1px solid rgba(91,110,245,0.35); background: rgba(91,110,245,0.12); color: #A5B4FC; cursor: pointer; transition: all .15s; flex-shrink: 0; white-space: nowrap; }
        .par-sync-btn:hover:not(:disabled) { background: rgba(91,110,245,0.22); border-color: rgba(91,110,245,0.55); }
        .par-sync-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .par-sync-btn-cta { margin-top: 14px; font-size: 13px; padding: 9px 18px; }
        .par-sync-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 60px 20px; color: var(--par-text-secondary); border: 1px dashed var(--par-border); border-radius: 14px; text-align: center; }
        .par-sync-loading p { margin: 0; font-size: 14px; }
        .par-sync-loading-sub { font-size: 12px; color: var(--par-text-tertiary) !important; }

        /* Per-post generate button (on feed card) */
        .par-post-gen-btn { display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%; padding: 7px 10px; border-radius: 8px; font-size: 11.5px; font-weight: 700; border: 1px solid var(--par-ai-border); background: var(--par-ai-bg); color: var(--par-ai-accent); cursor: pointer; transition: all .15s; white-space: nowrap; }
        .par-post-gen-btn:hover:not(:disabled) { background: rgba(167,139,250,0.16); border-color: rgba(167,139,250,0.38); }
        .par-post-gen-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .par-post-gen-btn-done { background: rgba(52,211,153,0.07); border-color: rgba(52,211,153,0.2); color: var(--par-success); }

        /* Post on Facebook button (inside AI bubble) */
        .par-ai-bubble-footer { display: flex; align-items: center; justify-content: flex-end; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
        .par-ai-post-error { margin: 0; font-size: 10.5px; color: var(--par-danger); flex: 1; }
        .par-post-fb-btn { display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px; border-radius: 7px; font-size: 11.5px; font-weight: 700; border: 1px solid rgba(91,110,245,0.3); background: rgba(91,110,245,0.1); color: #A5B4FC; cursor: pointer; transition: all .15s; white-space: nowrap; }
        .par-post-fb-btn:hover:not(:disabled) { background: rgba(91,110,245,0.2); border-color: rgba(91,110,245,0.5); }
        .par-post-fb-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .par-post-fb-btn-done { border-color: rgba(52,211,153,0.25); background: rgba(52,211,153,0.08); color: var(--par-success); }

        /* AI count label in panel heading */
        .par-panel-ai-count { font-size: 11px; font-weight: 600; color: var(--par-ai-accent); margin-left: 2px; }

        .par-selectors { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        @media (max-width: 640px) { .par-selectors { grid-template-columns: 1fr; gap: 14px; } }
        .par-field { min-width: 0; }
        .par-field-label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; gap: 8px; }
        .par-field-label { margin: 0 0 8px; font-size: 11px; font-weight: 600; color: var(--par-text-tertiary); text-transform: uppercase; letter-spacing: 0.04em; }
        .par-field-label-row .par-field-label { margin: 0; }
        .par-refresh-btn { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--par-text-tertiary); background: none; border: none; cursor: pointer; padding: 4px; border-radius: 6px; transition: color .15s; }
        .par-refresh-btn:hover:not(:disabled) { color: var(--par-text-primary); }
        .par-refresh-btn:disabled { cursor: not-allowed; opacity: 0.6; }
        .par-select-wrap { position: relative; }
        .par-select { width: 100%; height: 42px; border-radius: 10px; border: 1px solid var(--par-border); background: var(--par-surface); color: var(--par-text-primary); font-size: 13px; padding: 0 36px 0 14px; appearance: none; cursor: pointer; transition: border-color .15s; }
        .par-select:disabled { color: var(--par-text-tertiary); cursor: not-allowed; }
        .par-select:hover:not(:disabled) { border-color: var(--par-border-strong); }
        .par-select-chevron { position: absolute; right: 12px; top: 14px; color: var(--par-text-tertiary); pointer-events: none; }

        .par-search-row { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; flex-wrap: wrap; }
        @media (max-width: 560px) { .par-search-row { flex-direction: column; align-items: stretch; } }
        .par-search-field { position: relative; flex: 1; min-width: 0; }
        @media (min-width: 561px) { .par-search-field { min-width: 220px; } }
        .par-search-icon { position: absolute; left: 13px; top: 13px; color: var(--par-text-tertiary); }
        .par-search-input { width: 100%; height: 40px; border-radius: 10px; border: 1px solid var(--par-border); background: var(--par-surface); color: var(--par-text-primary); font-size: 13px; padding: 0 14px 0 36px; outline: none; transition: border-color .15s; }
        .par-search-input:focus { border-color: rgba(91,110,245,0.5); }
        .par-view-toggle { display: flex; gap: 4px; flex-shrink: 0; background: rgba(255,255,255,0.04); border-radius: 10px; padding: 4px; align-self: flex-start; }
        @media (max-width: 560px) { .par-view-toggle { align-self: flex-end; } }
        .par-view-btn { width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer; background: transparent; color: var(--par-text-tertiary); display: flex; align-items: center; justify-content: center; transition: all .15s; }
        .par-view-btn:hover { color: var(--par-text-primary); }
        .par-view-btn.is-active { background: rgba(91,110,245,0.2); color: #A5B4FC; }

        .par-result-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; gap: 12px; flex-wrap: wrap; }
        .par-result-count { margin: 0; font-size: 12px; color: var(--par-text-tertiary); }
        .par-pagination { display: flex; align-items: center; gap: 8px; }
        .par-page-btn { padding: 5px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; border: 1px solid var(--par-border); background: var(--par-surface); color: var(--par-text-secondary); cursor: pointer; transition: all .15s; }
        .par-page-btn:hover:not(:disabled) { border-color: var(--par-border-strong); color: var(--par-text-primary); }
        .par-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .par-page-info { font-size: 12px; color: var(--par-text-tertiary); }

        .par-empty { text-align: center; padding: 48px 20px; color: var(--par-text-tertiary); border: 1px dashed var(--par-border); border-radius: 14px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .par-empty p { margin: 0; font-size: 14px; }

        .par-feed-list { display: flex; flex-direction: column; gap: 22px; }
        .par-feed-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 14px; align-items: start; }
        @media (max-width: 480px)  { .par-feed-grid { grid-template-columns: 1fr; } }
        @media (min-width: 760px)  { .par-feed-grid { grid-template-columns: repeat(3,1fr); } }
        @media (min-width: 1140px) { .par-feed-grid { grid-template-columns: repeat(4,1fr); } }

        .par-feed-section { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
        .par-feed-section-compact { background: var(--par-surface); border: 1px solid var(--par-border); border-radius: 14px; padding: 12px; gap: 10px; transition: border-color .15s, background .15s, transform .12s; }
        .par-feed-section-compact:hover { border-color: var(--par-border-strong); }
        .par-feed-section-clickable { cursor: pointer; }
        .par-feed-section-clickable:hover .par-comments-toggle { background: rgba(255,255,255,0.07); border-color: var(--par-border-strong); color: var(--par-text-primary); }
        .par-feed-section-clickable:active { transform: scale(0.997); }

        .par-post-card { background: var(--par-surface); border: 1px solid var(--par-border); border-radius: 14px; padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; }
        .par-post-card-compact { background: transparent; border: none; padding: 0; gap: 8px; }
        .par-post-header { display: flex; align-items: center; gap: 10px; }
        .par-post-meta { min-width: 0; }
        .par-post-page { margin: 0; font-size: 14px; font-weight: 700; }
        .par-post-page-compact { font-size: 12.5px; }
        .par-post-sub { margin: 0; font-size: 12px; color: var(--par-text-tertiary); display: flex; align-items: center; gap: 4px; }
        .par-post-globe { flex-shrink: 0; }
        .par-post-message { margin: 0; font-size: 14px; line-height: 1.55; color: #E5E7EB; white-space: pre-wrap; overflow-wrap: break-word; word-break: break-word; }
        .par-post-message-compact { font-size: 12.5px; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; white-space: normal; }
        .par-post-image { width: 100%; max-height: 360px; object-fit: cover; border-radius: 10px; border: 1px solid var(--par-border); display: block; }
        .par-post-image-compact { max-height: 130px; border-radius: 8px; }
        .par-post-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; padding-top: 10px; border-top: 1px solid var(--par-border); }
        .par-post-footer-compact { padding-top: 8px; }
        .par-post-footer-stat { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--par-text-secondary); }
        .par-post-footer-compact .par-post-footer-stat { font-size: 11px; }
        .par-post-link { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: #A5B4FC; text-decoration: none; }
        .par-post-link:hover { text-decoration: underline; }

        .par-comments-toggle { display: flex; align-items: center; justify-content: space-between; width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--par-border); border-radius: 10px; padding: 9px 12px; color: var(--par-text-secondary); font-size: 12.5px; font-weight: 600; transition: background .15s, border-color .15s, color .15s; }
        .par-comments-toggle.is-disabled { opacity: 0.65; }
        .par-comments-toggle-label { display: flex; align-items: center; gap: 6px; }
        .par-comments-toggle-right { display: flex; align-items: center; gap: 8px; }

        /* AI badge on feed card */
        .par-ai-badge { display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 999px; font-size: 10px; font-weight: 700; background: var(--par-ai-bg); border: 1px solid var(--par-ai-border); color: var(--par-ai-accent); }

        /* Generate All AI button (inside SyncBar) */
        .par-ai-generate-all-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; font-size: 12.5px; font-weight: 700; border: 1px solid var(--par-ai-border); background: rgba(167,139,250,0.12); color: var(--par-ai-accent); cursor: pointer; transition: all .15s; flex-shrink: 0; white-space: nowrap; }
        .par-ai-generate-all-btn:hover:not(:disabled) { background: rgba(167,139,250,0.22); border-color: rgba(167,139,250,0.38); }
        .par-ai-generate-all-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Per-comment AI Generate button */
        .par-ai-gen-btn { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; height: 22px; border-radius: 999px; font-size: 10.5px; font-weight: 700; border: 1px solid var(--par-ai-border); background: var(--par-ai-bg); color: var(--par-ai-accent); cursor: pointer; transition: all .15s; white-space: nowrap; }
        .par-ai-gen-btn:hover:not(:disabled) { background: rgba(167,139,250,0.18); border-color: rgba(167,139,250,0.4); }
        .par-ai-gen-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .par-ai-gen-btn-regen { background: transparent; border-color: rgba(167,139,250,0.15); color: var(--par-text-tertiary); }
        .par-ai-gen-btn-regen:hover:not(:disabled) { background: var(--par-ai-bg); color: var(--par-ai-accent); border-color: var(--par-ai-border); }

        /* AI reply bubble */
        .par-ai-bubble { margin-top: 6px; padding: 9px 12px; background: var(--par-ai-bg); border: 1px solid var(--par-ai-border); border-radius: 12px; border-top-left-radius: 4px; }
        .par-ai-bubble-header { display: flex; align-items: center; gap: 5px; margin-bottom: 5px; font-size: 10.5px; font-weight: 700; color: var(--par-ai-accent); text-transform: uppercase; letter-spacing: 0.04em; }
        .par-ai-bubble-time { font-weight: 400; color: var(--par-text-tertiary); text-transform: none; letter-spacing: 0; margin-left: 2px; }
        .par-ai-bubble-text { margin: 0; font-size: 12.5px; color: #D1D5DB; line-height: 1.55; }

        /* Comment thread */
        .par-comment-thread { min-width: 0; }
        .par-comment-row { display: flex; gap: 8px; align-items: flex-start; min-width: 0; }
        .par-comment-row-nested { margin-top: 8px; margin-left: 14px; padding-left: 12px; border-left: 2px solid rgba(165,180,252,0.3); }
        .par-reply-indicator { margin: 0; padding-left: 12px; display: flex; align-items: center; gap: 4px; font-size: 10.5px; font-weight: 700; color: #A5B4FC; text-transform: uppercase; letter-spacing: 0.03em; }
        .par-replies-wrap { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
        .par-replies-status { margin: 0; padding-left: 12px; font-size: 11.5px; color: var(--par-text-tertiary); }
        .par-comment-col { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }

        .par-avatar {
          border-radius: 50%;
          background: linear-gradient(135deg, var(--par-accent-1), var(--par-accent-2));
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; color: var(--text-primary); flex-shrink: 0;
        }
        .par-avatar-img { object-fit: cover; }

        .par-comment-bubble {
          background: var(--par-bubble-bg);
          border-radius: 16px;
          padding: 8px 12px;
          display: inline-block;
          max-width: 100%;
        }
        .par-comment-bubble-own { background: var(--par-bubble-bg-own); }
        .par-bubble-author {
          margin: 0 0 1px; font-size: 12.5px; font-weight: 700; color: var(--par-text-primary);
          overflow-wrap: break-word; word-break: break-word;
        }
        .par-bubble-text {
          margin: 0; font-size: 13px; color: #D1D5DB; line-height: 1.5;
          overflow-wrap: break-word; word-break: break-word;
        }

        .par-comment-meta-row {
          display: flex; align-items: center; gap: 12px;
          padding-left: 12px; flex-wrap: wrap;
        }
        .par-avatar { border-radius: 50%; background: linear-gradient(135deg, var(--par-accent-1), var(--par-accent-2)); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; flex-shrink: 0; }
        .par-avatar-img { object-fit: cover; border-radius: 50%; }
        .par-comment-bubble { background: var(--par-bubble-bg); border-radius: 16px; padding: 8px 12px; display: inline-block; max-width: 100%; }
        .par-comment-bubble-compact { padding: 6px 10px; border-radius: 13px; }
        .par-bubble-author { margin: 0 0 1px; font-size: 12.5px; font-weight: 700; overflow-wrap: break-word; word-break: break-word; }
        .par-bubble-text { margin: 0; font-size: 13px; color: #D1D5DB; line-height: 1.5; overflow-wrap: break-word; word-break: break-word; }
        .par-comment-meta-row { display: flex; align-items: center; gap: 8px; padding-left: 12px; flex-wrap: wrap; }
        .par-comment-time { font-size: 11px; color: var(--par-text-tertiary); }
        .par-comment-meta-item { font-size: 11px; color: var(--par-text-tertiary); }
        .par-comment-action { font-size: 11.5px; font-weight: 700; color: var(--par-text-secondary); background: none; border: none; cursor: pointer; padding: 0; transition: color .15s; }
        .par-comment-action:hover { color: var(--par-text-primary); }
        .par-reply-row-inline { display: flex; gap: 8px; align-items: center; margin-top: 4px; }
        .par-reply-input { flex: 1; min-width: 0; height: 34px; border-radius: 999px; border: 1px solid var(--par-border); background: rgba(255,255,255,0.05); color: var(--par-text-primary); font-size: 12.5px; padding: 0 14px; outline: none; transition: border-color .15s; }
        .par-reply-input:focus { border-color: rgba(91,110,245,0.5); }
        .par-send-btn {
          width: 32px; height: 32px; border-radius: 50%; border: none;
          background: linear-gradient(135deg, var(--par-accent-1), var(--par-accent-2));
          color: var(--text-primary); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: opacity .15s ease, transform .1s ease;
        }
        .par-send-btn { width: 32px; height: 32px; border-radius: 50%; border: none; background: linear-gradient(135deg,var(--par-accent-1),var(--par-accent-2)); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: opacity .15s, transform .1s; }
        .par-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .par-send-btn:not(:disabled):hover { transform: translateY(-1px); }
        .par-reply-error { margin: 2px 0 0 12px; font-size: 11px; color: var(--par-danger); }

        /* Side panel */
        .par-panel-layer { position: fixed; inset: 0; z-index: 1000; }
        .par-panel-backdrop { position: absolute; inset: 0; background: rgba(8,9,14,0.6); backdrop-filter: blur(2px); animation: par-fade-in .18s ease; }
        .par-panel { position: absolute; top: 0; right: 0; height: 100%; width: min(440px, 100vw); background: #14151C; border-left: 1px solid var(--par-border-strong); box-shadow: -16px 0 40px rgba(0,0,0,0.35); display: flex; flex-direction: column; animation: par-slide-in .22s cubic-bezier(.16,1,.3,1); }
        @media (max-width: 480px) { .par-panel { width: 100vw; } }
        .par-panel-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 16px 18px; border-bottom: 1px solid var(--par-border); flex-shrink: 0; }
        .par-panel-header-main { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .par-panel-header-text { min-width: 0; }
        .par-panel-header-page { margin: 0; font-size: 14px; font-weight: 700; }
        .par-panel-header-sub { margin: 0; font-size: 11.5px; color: var(--par-text-tertiary); }
        .par-panel-close { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--par-border); background: var(--par-surface); color: var(--par-text-secondary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; transition: all .15s; }
        .par-panel-close:hover { color: var(--par-text-primary); border-color: var(--par-border-strong); background: var(--par-surface-hover); }
        .par-panel-body { flex: 1; overflow-y: auto; padding: 18px; }
        .par-panel-post-message { margin: 0 0 12px; font-size: 13.5px; line-height: 1.6; color: #E5E7EB; white-space: pre-wrap; overflow-wrap: break-word; word-break: break-word; }
        .par-panel-post-image { width: 100%; max-height: 280px; object-fit: cover; border-radius: 10px; border: 1px solid var(--par-border); display: block; margin-bottom: 12px; }
        .par-panel-post-link { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: #A5B4FC; text-decoration: none; }
        .par-panel-post-link:hover { text-decoration: underline; }
        .par-panel-divider { height: 1px; background: var(--par-border); margin: 16px 0; }
        .par-panel-comments-heading { margin: 0 0 14px; font-size: 12px; font-weight: 700; color: var(--par-text-tertiary); text-transform: uppercase; letter-spacing: 0.04em; }
        .par-panel-comments-list { display: flex; flex-direction: column; gap: 16px; }
        .par-panel-empty { margin: 0; font-size: 13px; color: var(--par-text-tertiary); }

        @keyframes par-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes par-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .par-spin { animation: par-spin 1s linear infinite; }
        @keyframes par-spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .par-spin { animation: none; }
          .par-panel-backdrop, .par-panel { animation: none; }
          * { transition: none !important; }
        }
      `}</style>
    </div>
  );
}