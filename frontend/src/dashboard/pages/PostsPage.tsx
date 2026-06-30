import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Inbox, Clock, Search, Grid3x3, List,
  ChevronDown, Send, RefreshCw, AlertCircle,
  Globe, MessageCircle, ExternalLink,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────
// API helper — reads JWT from localStorage, calls your NestJS backend
// ─────────────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:3000';

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
// Types — match exactly what MetaReviewsService returns
// ─────────────────────────────────────────────────────────────────────────
interface MetaPage {
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  picture: string | null;
}

interface MetaPost {
  postId: string;
  title: string;
  message: string;
  createdAt: string;
  permalink: string | null;
  thumbnail: string | null;
  commentCount: number;
}

interface MetaComment {
  commentId: string;
  sourceRefId: string;   // postId this comment belongs to
  authorName: string;
  authorInitial: string;
  text: string;
  createdAt: string;
  likeCount: number;
  replyCount: number;
  canReply: boolean;
}

type PlatformTabKey = 'meta' | 'x' | 'linkedin';
type ViewMode = 'grid' | 'list';

// ─────────────────────────────────────────────────────────────────────────
// Static config
// ─────────────────────────────────────────────────────────────────────────
const PLATFORM_CONFIG: Record<PlatformTabKey, { label: string; color: string; bg: string }> = {
  meta:     { label: 'Meta',     color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  x:        { label: 'X',        color: '#E5E7EB', bg: 'rgba(229,231,235,0.10)' },
  linkedin: { label: 'LinkedIn', color: '#0A66C2', bg: 'rgba(10,102,194,0.14)' },
};

// ─────────────────────────────────────────────────────────────────────────
// Pure helpers
// ─────────────────────────────────────────────────────────────────────────
function timeAgo(iso?: string): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// ─────────────────────────────────────────────────────────────────────────
// Presentational components
// ─────────────────────────────────────────────────────────────────────────
function AvatarCircle({
  src, fallback, size = 36,
}: { src?: string | null; fallback: string; size?: number }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="par-avatar par-avatar-img"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="par-avatar"
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.38) }}
    >
      {fallback}
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, tint,
}: {
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

function PlatformTab({
  active, label, onClick,
}: {
  active: boolean; label: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`par-tab-btn${active ? ' is-active' : ''}`}
    >
      {label}
    </button>
  );
}

function SelectBox({
  value, onChange, disabled, children, label,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <div className="par-select-wrap">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label={label}
        className="par-select"
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
// PostCard — renders the post the way it looks on Meta itself:
// page avatar + name, timestamp, message, image, then an engagement bar.
// ─────────────────────────────────────────────────────────────────────────
function PostCard({
  post, pageName, pagePicture, commentCount,
}: {
  post: MetaPost;
  pageName: string;
  pagePicture: string | null;
  commentCount: number;
}) {
  return (
    <div className="par-post-card">
      <div className="par-post-header">
        <AvatarCircle src={pagePicture} fallback={pageName?.[0]?.toUpperCase() ?? 'P'} size={40} />
        <div className="par-post-meta">
          <p className="par-post-page">{pageName || 'Page'}</p>
          <p className="par-post-sub">
            {timeAgo(post.createdAt)} ago
            <Globe size={11} className="par-post-globe" aria-hidden="true" />
          </p>
        </div>
      </div>

      {post.message && <p className="par-post-message">{post.message}</p>}

      {post.thumbnail && (
        <img src={post.thumbnail} alt="" className="par-post-image" loading="lazy" />
      )}

      <div className="par-post-footer">
        <span className="par-post-footer-stat">
          <MessageCircle size={13} />
          {commentCount} comment{commentCount === 1 ? '' : 's'}
        </span>
        {post.permalink && (
          <a href={post.permalink} target="_blank" rel="noreferrer" className="par-post-link">
            View on Facebook <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// CommentCard — threaded bubble, the way comments look on Meta itself:
// avatar + rounded bubble (bold name, then text), like/reply meta line below,
// inline reply box, and the sent reply nested underneath as its own bubble.
// ─────────────────────────────────────────────────────────────────────────
function CommentCard({
  comment,
  pageAccessToken,
  onReplySuccess,
}: {
  comment: MetaComment;
  pageAccessToken: string;
  onReplySuccess?: () => void;
}) {
  const [replying, setReplying]     = useState(false);
  const [message, setMessage]       = useState('');
  const [sending, setSending]       = useState(false);
  const [sentReply, setSentReply]   = useState<string | null>(null);
  const [replyError, setReplyError] = useState('');

  const submit = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    setReplyError('');
    try {
      // POST /meta-reviews/comments/:commentId/reply
      await apiFetch<{ success: boolean; commentId: string }>(
        `/meta-reviews/comments/${comment.commentId}/reply`,
        {
          method: 'POST',
          body: JSON.stringify({ message: message.trim(), pageAccessToken }),
        },
      );
      setSentReply(message.trim());
      setReplying(false);
      setMessage('');
      onReplySuccess?.();
    } catch (e: any) {
      setReplyError(e.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const toggleReply = () => {
    setReplying((r) => !r);
    setReplyError('');
  };

  return (
    <div className="par-comment-thread">
      <div className="par-comment-row">
        <AvatarCircle fallback={comment.authorInitial} size={32} />

        <div className="par-comment-col">
          <div className="par-comment-bubble">
            <p className="par-bubble-author">{comment.authorName}</p>
            <p className="par-bubble-text">{comment.text}</p>
          </div>

          <div className="par-comment-meta-row">
            <span className="par-comment-time">{timeAgo(comment.createdAt)}</span>
            {comment.likeCount > 0 && (
              <span className="par-comment-meta-item">👍 {comment.likeCount}</span>
            )}
            <button onClick={toggleReply} className="par-comment-action">
              {replying ? 'Cancel' : 'Reply'}
            </button>
            {comment.replyCount > 0 && (
              <span className="par-comment-meta-item">
                {comment.replyCount} repl{comment.replyCount === 1 ? 'y' : 'ies'}
              </span>
            )}
          </div>

          {replying && (
            <div className="par-reply-row-inline">
              <AvatarCircle fallback="Y" size={26} />
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder="Write a reply…"
                autoFocus
                className="par-reply-input"
              />
              <button
                onClick={submit}
                disabled={sending || !message.trim()}
                title="Send reply"
                aria-label="Send reply"
                className="par-send-btn"
              >
                <Send size={13} />
              </button>
            </div>
          )}
          {replyError && <p className="par-reply-error">{replyError}</p>}

          {sentReply && (
            <div className="par-comment-row par-comment-row-nested">
              <AvatarCircle fallback="Y" size={28} />
              <div className="par-comment-col">
                <div className="par-comment-bubble par-comment-bubble-own">
                  <p className="par-bubble-author">You</p>
                  <p className="par-bubble-text">{sentReply}</p>
                </div>
                <div className="par-comment-meta-row">
                  <span className="par-comment-time">Just now</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// FeedPostSection — one post followed by its own comment thread, the way
// a Page's feed reads on Meta: post first, comments underneath it.
// ─────────────────────────────────────────────────────────────────────────
function FeedPostSection({
  post, comments, pageAccessToken, pageName, pagePicture, view, onReplySuccess,
}: {
  post: MetaPost;
  comments: MetaComment[];
  pageAccessToken: string;
  pageName: string;
  pagePicture: string | null;
  view: ViewMode;
  onReplySuccess?: () => void;
}) {
  return (
    <div className="par-feed-section">
      <PostCard
        post={post}
        pageName={pageName}
        pagePicture={pagePicture}
        commentCount={comments.length}
      />

      {comments.length === 0 ? (
        <p className="par-no-comments">No comments yet for this post.</p>
      ) : (
        <div className={`par-comments-list par-${view}`}>
          {comments.map((c) => (
            <CommentCard
              key={c.commentId}
              comment={c}
              pageAccessToken={pageAccessToken}
              onReplySuccess={onReplySuccess}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────
export default function PostAdReviews() {
  const [tab, setTab] = useState<PlatformTabKey>('meta');

  // ── Meta data ────────────────────────────────────────────────────────
  const [pages, setPages]                   = useState<MetaPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [posts, setPosts]                   = useState<MetaPost[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string>('all');
  const [comments, setComments]             = useState<MetaComment[]>([]);

  // ── UI ──────────────────────────────────────────────────────────────
  const [loadingPages,    setLoadingPages]    = useState(false);
  const [loadingPosts,    setLoadingPosts]    = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [error,           setError]           = useState('');
  const [search,          setSearch]          = useState('');
  const [view,            setView]            = useState<ViewMode>('list');

  // ── Step 1: load Pages when Meta tab is active ──────────────────────
  const loadPages = useCallback(async () => {
    setError('');
    setLoadingPages(true);
    try {
      // GET /meta-reviews/pages
      const data = await apiFetch<MetaPage[]>('/meta-reviews/pages');
      setPages(data);
      // Auto-select first page only if nothing is selected yet
      if (data.length > 0) {
        setSelectedPageId((prev) => prev || data[0].pageId);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load Pages. Make sure Meta is connected.');
    } finally {
      setLoadingPages(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'meta') {
      loadPages();
    }
  }, [tab, loadPages]);

  // Derive selected page object from selectedPageId
  const selectedPage = useMemo(
    () => pages.find((p) => p.pageId === selectedPageId) ?? null,
    [pages, selectedPageId],
  );

  // ── Step 2: load posts when selectedPage changes ─────────────────────
  const loadPosts = useCallback(async () => {
    if (!selectedPage) return;
    setError('');
    setLoadingPosts(true);
    setPosts([]);
    setComments([]);
    setSelectedPostId('all');
    try {
      // GET /meta-reviews/pages/:pageId/posts?pageAccessToken=xxx&limit=15
      const data = await apiFetch<MetaPost[]>(
        `/meta-reviews/pages/${selectedPage.pageId}/posts` +
        `?pageAccessToken=${encodeURIComponent(selectedPage.pageAccessToken)}&limit=15`,
      );
      setPosts(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load posts for this Page.');
    } finally {
      setLoadingPosts(false);
    }
  }, [selectedPage]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // ── Step 3: load comments when selectedPostId or posts change ────────
  const loadComments = useCallback(async () => {
    if (!selectedPage || posts.length === 0) {
      setComments([]);
      return;
    }
    setError('');
    setLoadingComments(true);
    try {
      const token = encodeURIComponent(selectedPage.pageAccessToken);

      if (selectedPostId === 'all') {
        // GET /meta-reviews/posts/:postId/comments for each post in parallel
        const results = await Promise.all(
          posts.map((p) =>
            apiFetch<MetaComment[]>(
              `/meta-reviews/posts/${p.postId}/comments?pageAccessToken=${token}`,
            ).catch(() => [] as MetaComment[]),
          ),
        );
        setComments(results.flat());
      } else {
        // GET /meta-reviews/posts/:postId/comments for the selected post
        const data = await apiFetch<MetaComment[]>(
          `/meta-reviews/posts/${selectedPostId}/comments?pageAccessToken=${token}`,
        );
        setComments(data);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load comments.');
    } finally {
      setLoadingComments(false);
    }
  }, [selectedPage, posts, selectedPostId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // ── Derived values ────────────────────────────────────────────────────
  const filteredComments = useMemo(
    () =>
      comments.filter((c) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          c.text?.toLowerCase().includes(q) ||
          c.authorName?.toLowerCase().includes(q)
        );
      }),
    [comments, search],
  );

  const totalCommentsInPage = posts.reduce<number>(
    (sum, p) => sum + p.commentCount, 0,
  );

  // Group comments under the post they belong to, in the same order the
  // post selector lists them, so the feed reads top-to-bottom like the
  // real Page timeline: post, then its comments, then the next post.
  const groupedFeed = useMemo(() => {
    const relevantPosts = selectedPostId === 'all'
      ? posts
      : posts.filter((p) => p.postId === selectedPostId);

    return relevantPosts
      .map((p) => ({
        post: p,
        comments: filteredComments.filter((c) => c.sourceRefId === p.postId),
      }))
      // While searching, hide posts that have no matching comments so the
      // feed only shows results; otherwise show every post (even with 0
      // comments yet) just like the real feed would.
      .filter((g) => !search || g.comments.length > 0);
  }, [posts, filteredComments, selectedPostId, search]);

  const emptyMessage = pages.length === 0
    ? 'Connect your Facebook Page in Settings to get started.'
    : posts.length === 0
      ? 'No posts found for this Page.'
      : search
        ? 'No comments match the current filter.'
        : 'No posts found for this Page.';

  return (
    <div className="par-page">
      {/* ── Page header ── */}
      <div className="par-header">
        <h1 className="par-title">Post &amp; Ad Reviews</h1>
        <p className="par-subtitle">
          Track and reply to comments across your connected platforms, in one place.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="par-stats">
        <StatCard
          icon={Inbox}
          label="Comments loaded"
          value={comments.length}
          tint="linear-gradient(135deg,#5B6EF5,#7C6EF5)"
        />
        <StatCard
          icon={Clock}
          label="Posts loaded"
          value={posts.length}
          tint="linear-gradient(135deg,#FBBF24,#F59E0B)"
        />
        <StatCard
          icon={Inbox}
          label="Pages connected"
          value={pages.length}
          tint="linear-gradient(135deg,#34D399,#059669)"
        />
      </div>

      {/* ── Platform tabs ── */}
      <div className="par-tabs" role="tablist" aria-label="Platform">
        {(['meta', 'x', 'linkedin'] as PlatformTabKey[]).map((t) => (
          <PlatformTab
            key={t}
            active={tab === t}
            label={PLATFORM_CONFIG[t].label}
            onClick={() => setTab(t)}
          />
        ))}
      </div>

      {/* ── Non-Meta platforms placeholder ── */}
      {tab !== 'meta' && (
        <ComingSoonBanner platform={PLATFORM_CONFIG[tab].label} />
      )}

      {/* ── Meta content ── */}
      {tab === 'meta' && (
        <>
          {error && <ErrorBanner message={error} />}

          {/* Page + post selectors */}
          <div className="par-selectors">
            <div className="par-field">
              <div className="par-field-label-row">
                <p className="par-field-label">Facebook Page</p>
                <button
                  onClick={loadPages}
                  disabled={loadingPages}
                  className="par-refresh-btn"
                  aria-label="Refresh pages"
                >
                  <RefreshCw
                    size={12}
                    className={loadingPages ? 'par-spin' : ''}
                  />
                  Refresh
                </button>
              </div>

              <SelectBox
                label="Facebook Page"
                value={selectedPageId}
                onChange={(v) => {
                  setSelectedPageId(v);
                  setPosts([]);
                  setComments([]);
                  setSelectedPostId('all');
                }}
                disabled={loadingPages || pages.length === 0}
              >
                {loadingPages ? (
                  <option>Loading Pages…</option>
                ) : pages.length === 0 ? (
                  <option>No Pages found — connect Facebook in Settings</option>
                ) : (
                  pages.map((p) => (
                    <option key={p.pageId} value={p.pageId}>
                      {p.pageName}
                    </option>
                  ))
                )}
              </SelectBox>
            </div>

            <div className="par-field">
              <p className="par-field-label">Select post</p>
              <SelectBox
                label="Select post"
                value={selectedPostId}
                onChange={(v) => setSelectedPostId(v)}
                disabled={loadingPosts || posts.length === 0}
              >
                {loadingPosts ? (
                  <option>Loading posts…</option>
                ) : posts.length === 0 ? (
                  <option>No posts found for this Page</option>
                ) : (
                  <>
                    <option value="all">
                      All posts ({totalCommentsInPage} comments)
                    </option>
                    {posts.map((p) => (
                      <option key={p.postId} value={p.postId}>
                        {p.title} ({p.commentCount} comments)
                      </option>
                    ))}
                  </>
                )}
              </SelectBox>
            </div>
          </div>

          {/* Search + view toggle */}
          <div className="par-search-row">
            <div className="par-search-field">
              <Search size={14} className="par-search-icon" aria-hidden="true" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or comment…"
                className="par-search-input"
                aria-label="Search comments"
              />
            </div>

            <div className="par-view-toggle" role="group" aria-label="Comment layout">
              {(['list', 'grid'] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  title={v === 'list' ? 'Single column (thread view)' : 'Multi-column'}
                  aria-label={v === 'list' ? 'Single column' : 'Multi-column'}
                  aria-pressed={view === v}
                  className={`par-view-btn${view === v ? ' is-active' : ''}`}
                >
                  {v === 'list' ? <List size={14} /> : <Grid3x3 size={14} />}
                </button>
              ))}
            </div>
          </div>

          <p className="par-result-count">
            {loadingComments
              ? 'Loading comments…'
              : `Showing ${filteredComments.length} of ${comments.length} comments`}
          </p>

          {/* Feed: each post rendered like it appears on Meta, with its
              own comment thread directly underneath it. */}
          {!loadingComments && groupedFeed.length === 0 ? (
            <div className="par-empty">
              <p>{emptyMessage}</p>
            </div>
          ) : (
            <div className="par-feed">
              {groupedFeed.map(({ post, comments: postComments }) => (
                <FeedPostSection
                  key={post.postId}
                  post={post}
                  comments={postComments}
                  pageAccessToken={selectedPage?.pageAccessToken ?? ''}
                  pageName={selectedPage?.pageName ?? ''}
                  pagePicture={selectedPage?.picture ?? null}
                  view={view}
                  onReplySuccess={loadComments}
                />
              ))}
            </div>
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
          --par-bubble-bg-own: rgba(91,110,245,0.14);
        }

        * { box-sizing: border-box; }

        .par-page {
          font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          color: var(--par-text-primary);
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 16px;
        }
        @media (min-width: 640px)  { .par-page { padding: 24px; } }
        @media (min-width: 1024px) { .par-page { padding: 32px; } }

        /* Header */
        .par-header { margin-bottom: 22px; }
        .par-title {
          margin: 0 0 6px;
          font-size: clamp(20px, 4vw, 28px);
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .par-subtitle {
          margin: 0;
          font-size: 13px;
          color: var(--par-text-secondary);
          max-width: 560px;
        }

        /* Stat cards */
        .par-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 22px;
        }
        @media (max-width: 900px) { .par-stats { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .par-stats { grid-template-columns: 1fr; } }

        .par-stat-card {
          background: var(--par-surface);
          border: 1px solid var(--par-border);
          border-radius: 16px;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
          transition: border-color .15s ease, background .15s ease;
        }
        .par-stat-card:hover {
          border-color: var(--par-border-strong);
          background: var(--par-surface-hover);
        }
        .par-stat-icon {
          width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .par-stat-text { min-width: 0; }
        .par-stat-label { margin: 0; font-size: 12px; color: var(--par-text-secondary); }
        .par-stat-value {
          margin: 0; font-size: clamp(18px, 3vw, 22px); font-weight: 600;
          color: var(--par-text-primary); line-height: 1.3;
        }

        /* Platform tabs */
        .par-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 18px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding-bottom: 2px;
        }
        .par-tabs::-webkit-scrollbar { display: none; }
        .par-tab-btn {
          flex: 0 0 auto;
          white-space: nowrap;
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid var(--par-border);
          background: transparent;
          color: var(--par-text-secondary);
          cursor: pointer;
          transition: all .15s ease;
        }
        .par-tab-btn:hover { border-color: var(--par-border-strong); color: var(--par-text-primary); }
        .par-tab-btn.is-active {
          border-color: rgba(91,110,245,0.5);
          background: rgba(91,110,245,0.16);
          color: #A5B4FC;
        }
        .par-tab-btn:focus-visible,
        .par-refresh-btn:focus-visible,
        .par-view-btn:focus-visible,
        .par-comment-action:focus-visible,
        .par-send-btn:focus-visible,
        .par-select:focus-visible,
        .par-search-input:focus-visible,
        .par-reply-input:focus-visible,
        .par-post-link:focus-visible {
          outline: 2px solid var(--par-accent-2);
          outline-offset: 2px;
        }

        /* Banners */
        .par-banner {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .par-banner-error {
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.2);
          color: var(--par-danger);
        }
        .par-banner-warning {
          background: rgba(251,191,36,0.08);
          border: 1px solid rgba(251,191,36,0.2);
          color: var(--par-warning);
          padding: 14px 18px;
          border-radius: 12px;
        }

        /* Selectors */
        .par-selectors {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 18px;
        }
        @media (max-width: 640px) {
          .par-selectors { grid-template-columns: 1fr; gap: 14px; }
        }
        .par-field { min-width: 0; }
        .par-field-label-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 8px; gap: 8px;
        }
        .par-field-label {
          margin: 0 0 8px;
          font-size: 11px; font-weight: 600; color: var(--par-text-tertiary);
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .par-field-label-row .par-field-label { margin: 0; }
        .par-refresh-btn {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; color: var(--par-text-tertiary);
          background: none; border: none; cursor: pointer;
          padding: 4px; border-radius: 6px;
          transition: color .15s ease;
        }
        .par-refresh-btn:hover:not(:disabled) { color: var(--par-text-primary); }
        .par-refresh-btn:disabled { cursor: not-allowed; opacity: 0.6; }

        .par-select-wrap { position: relative; }
        .par-select {
          width: 100%; height: 42px; border-radius: 10px;
          border: 1px solid var(--par-border);
          background: var(--par-surface);
          color: var(--par-text-primary);
          font-size: 13px; padding: 0 36px 0 14px;
          appearance: none; cursor: pointer;
          transition: border-color .15s ease;
        }
        .par-select:disabled { color: var(--par-text-tertiary); cursor: not-allowed; }
        .par-select:hover:not(:disabled) { border-color: var(--par-border-strong); }
        .par-select-chevron {
          position: absolute; right: 12px; top: 14px;
          color: var(--par-text-tertiary); pointer-events: none;
        }

        /* Search row */
        .par-search-row {
          display: flex; gap: 10px; align-items: center;
          margin-bottom: 14px; flex-wrap: wrap;
        }
        @media (max-width: 560px) {
          .par-search-row { flex-direction: column; align-items: stretch; }
        }
        .par-search-field { position: relative; flex: 1; min-width: 0; }
        @media (min-width: 561px) { .par-search-field { min-width: 220px; } }
        .par-search-icon { position: absolute; left: 13px; top: 13px; color: var(--par-text-tertiary); }
        .par-search-input {
          width: 100%; height: 40px; border-radius: 10px;
          border: 1px solid var(--par-border);
          background: var(--par-surface);
          color: var(--par-text-primary); font-size: 13px;
          padding: 0 14px 0 36px; outline: none;
          transition: border-color .15s ease;
        }
        .par-search-input:focus { border-color: rgba(91,110,245,0.5); }

        .par-view-toggle {
          display: flex; gap: 4px; flex-shrink: 0;
          background: rgba(255,255,255,0.04);
          border-radius: 10px; padding: 4px;
          align-self: flex-start;
        }
        @media (max-width: 560px) { .par-view-toggle { align-self: flex-end; } }
        .par-view-btn {
          width: 32px; height: 32px; border-radius: 8px; border: none;
          cursor: pointer; background: transparent; color: var(--par-text-tertiary);
          display: flex; align-items: center; justify-content: center;
          transition: all .15s ease;
        }
        .par-view-btn:hover { color: var(--par-text-primary); }
        .par-view-btn.is-active { background: rgba(91,110,245,0.2); color: #A5B4FC; }

        .par-result-count { font-size: 12px; color: var(--par-text-tertiary); margin: 0 0 14px; }

        /* Empty state */
        .par-empty {
          text-align: center; padding: 48px 20px; color: var(--par-text-tertiary);
          border: 1px dashed var(--par-border); border-radius: 14px;
        }
        .par-empty p { margin: 0; font-size: 14px; }

        /* ── Feed: stacked post + comments sections, top to bottom ── */
        .par-feed {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        .par-feed-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* ── Post card — mirrors how the post looks on Meta ── */
        .par-post-card {
          background: var(--par-surface);
          border: 1px solid var(--par-border);
          border-radius: 14px;
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .par-post-header { display: flex; align-items: center; gap: 10px; }
        .par-post-meta { min-width: 0; }
        .par-post-page {
          margin: 0; font-size: 14px; font-weight: 700; color: var(--par-text-primary);
        }
        .par-post-sub {
          margin: 0; font-size: 12px; color: var(--par-text-tertiary);
          display: flex; align-items: center; gap: 4px;
        }
        .par-post-globe { flex-shrink: 0; }
        .par-post-message {
          margin: 0; font-size: 14px; line-height: 1.55; color: #E5E7EB;
          white-space: pre-wrap; overflow-wrap: break-word; word-break: break-word;
        }
        .par-post-image {
          width: 100%; max-height: 360px; object-fit: cover;
          border-radius: 10px; border: 1px solid var(--par-border);
          display: block;
        }
        .par-post-footer {
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; flex-wrap: wrap;
          padding-top: 10px; border-top: 1px solid var(--par-border);
        }
        .par-post-footer-stat {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: var(--par-text-secondary);
        }
        .par-post-link {
          display: flex; align-items: center; gap: 4px;
          font-size: 12px; font-weight: 600; color: #A5B4FC;
          text-decoration: none;
        }
        .par-post-link:hover { text-decoration: underline; }

        .par-no-comments {
          margin: 0; padding: 0 4px; font-size: 12.5px; color: var(--par-text-tertiary);
        }

        /* ── Comments list under a post ── */
        .par-comments-list.par-list {
          display: flex; flex-direction: column; gap: 14px;
        }
        .par-comments-list.par-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 14px;
          align-items: start;
        }
        @media (max-width: 480px) {
          .par-comments-list.par-grid { grid-template-columns: 1fr; }
        }

        /* ── Comment thread — avatar + bubble, like Meta's comment UI ── */
        .par-comment-thread { min-width: 0; }
        .par-comment-row { display: flex; gap: 8px; align-items: flex-start; min-width: 0; }
        .par-comment-row-nested { margin-top: 10px; margin-left: 6px; }
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
        .par-comment-time { font-size: 11px; color: var(--par-text-tertiary); }
        .par-comment-meta-item { font-size: 11px; color: var(--par-text-tertiary); }
        .par-comment-action {
          font-size: 11.5px; font-weight: 700; color: var(--par-text-secondary);
          background: none; border: none; cursor: pointer; padding: 0;
          transition: color .15s ease;
        }
        .par-comment-action:hover { color: var(--par-text-primary); }

        /* Reply box */
        .par-reply-row-inline { display: flex; gap: 8px; align-items: center; margin-top: 4px; }
        .par-reply-input {
          flex: 1; min-width: 0; height: 34px; border-radius: 999px;
          border: 1px solid var(--par-border);
          background: rgba(255,255,255,0.05);
          color: var(--par-text-primary); font-size: 12.5px; padding: 0 14px; outline: none;
          transition: border-color .15s ease;
        }
        .par-reply-input:focus { border-color: rgba(91,110,245,0.5); }
        .par-send-btn {
          width: 32px; height: 32px; border-radius: 50%; border: none;
          background: linear-gradient(135deg, var(--par-accent-1), var(--par-accent-2));
          color: var(--text-primary); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: opacity .15s ease, transform .1s ease;
        }
        .par-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .par-send-btn:not(:disabled):hover { transform: translateY(-1px); }
        .par-reply-error { margin: 2px 0 0 12px; font-size: 11px; color: var(--par-danger); }

        .par-spin { animation: par-spin 1s linear infinite; }
        @keyframes par-spin { to { transform: rotate(360deg); } }

        @media (prefers-reduced-motion: reduce) {
          .par-spin { animation: none; }
          * { transition: none !important; }
        }
      `}</style>
    </div>
  );
}