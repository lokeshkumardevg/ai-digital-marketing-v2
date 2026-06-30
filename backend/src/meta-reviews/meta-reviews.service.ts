import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import axios from 'axios';

@Injectable()
export class MetaReviewsService {
  private graph = 'https://graph.facebook.com/v20.0';

  constructor(private usersService: UsersService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1 — Get all Pages this user manages
  // GET /meta-reviews/pages
  // ─────────────────────────────────────────────────────────────────────────
  async getPages(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.metaAccessToken) {
      throw new UnauthorizedException(
        'Meta not connected. Please connect Facebook first.',
      );
    }

    try {
      const res = await axios.get(`${this.graph}/me/accounts`, {
        params: {
          access_token: user.metaAccessToken,
          fields: 'id,name,access_token,picture',
        },
      });

      return (res.data.data || []).map((p: any) => ({
        pageId: p.id,
        pageName: p.name,
        pageAccessToken: p.access_token,
        picture: p.picture?.data?.url || null,
      }));
    } catch (e: any) {
      console.error('❌ getPages failed:', e.response?.data);
      throw new UnauthorizedException(
        e.response?.data?.error?.message || 'Failed to fetch Facebook Pages',
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2A — Get posts (original, limited — used for quick display)
  // GET /meta-reviews/pages/:pageId/posts?pageAccessToken=xxx&limit=10
  // ─────────────────────────────────────────────────────────────────────────
  async getPagePosts(
    userId: string,
    pageId: string,
    pageAccessToken: string,
    limit = 10,
  ) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    try {
      const res = await axios.get(`${this.graph}/${pageId}/posts`, {
        params: {
          access_token: pageAccessToken,
          fields:
            'id,message,created_time,full_picture,permalink_url,comments.summary(true){id}',
          limit,
        },
      });

      return (res.data.data || []).map((p: any) => ({
        postId: p.id,
        message: p.message || '(no caption)',
        title: (p.message || '(no caption)').slice(0, 80),
        createdAt: p.created_time,
        permalink: p.permalink_url || null,
        thumbnail: p.full_picture || null,
        commentCount: p.comments?.summary?.total_count ?? 0,
        source: 'meta',
        type: 'post',
      }));
    } catch (e: any) {
      console.error('❌ getPagePosts failed:', e.response?.data);
      throw new UnauthorizedException(
        e.response?.data?.error?.message || 'Failed to fetch posts',
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2B — Paginated post fetch (used internally by SyncService)
  // Returns posts + nextCursor for full pagination support
  // ─────────────────────────────────────────────────────────────────────────
  async getPagePostsPaginated(
    userId: string,
    pageId: string,
    pageAccessToken: string,
    limit = 25,
    after: string | null = null,
  ): Promise<{ posts: any[]; nextCursor: string | null }> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    try {
      const params: any = {
        access_token: pageAccessToken,
        fields:
          'id,message,created_time,full_picture,permalink_url,comments.summary(true){id}',
        limit,
      };
      if (after) params.after = after;

      const res = await axios.get(`${this.graph}/${pageId}/posts`, { params });

      const posts = (res.data.data || []).map((p: any) => ({
        postId: p.id,
        message: p.message || '(no caption)',
        title: (p.message || '(no caption)').slice(0, 80),
        createdAt: p.created_time,
        permalink: p.permalink_url || null,
        thumbnail: p.full_picture || null,
        commentCount: p.comments?.summary?.total_count ?? 0,
        source: 'meta',
        type: 'post',
      }));

      const nextCursor = res.data.paging?.cursors?.after ?? null;
      // If Facebook returns no 'next' link, stop pagination
      const hasNext = !!res.data.paging?.next;

      return { posts, nextCursor: hasNext ? nextCursor : null };
    } catch (e: any) {
      console.error('❌ getPagePostsPaginated failed:', e.response?.data);
      throw new UnauthorizedException(
        e.response?.data?.error?.message || 'Failed to fetch posts (paginated)',
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3A — Get comments (original — used for direct API call from UI)
  // GET /meta-reviews/posts/:postId/comments?pageAccessToken=xxx&limit=25
  // ─────────────────────────────────────────────────────────────────────────
  async getPostComments(
    userId: string,
    postId: string,
    pageAccessToken: string,
    limit = 25,
  ) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    try {
      const res = await axios.get(`${this.graph}/${postId}/comments`, {
        params: {
          access_token: pageAccessToken,
          fields:
            'id,message,from,created_time,like_count,comment_count,user_likes',
          limit,
        },
      });

      return (res.data.data || []).map((c: any) => ({
        commentId: c.id,
        source: 'meta',
        sourceRefId: postId,
        authorId: c.from?.id || null,
        authorName: c.from?.name || 'Facebook user',
        authorInitial: (c.from?.name || 'F').charAt(0).toUpperCase(),
        text: c.message || '',
        createdAt: c.created_time,
        likeCount: c.like_count ?? 0,
        replyCount: c.comment_count ?? 0,
        canReply: true,
      }));
    } catch (e: any) {
      console.error('❌ getPostComments failed:', e.response?.data);
      throw new UnauthorizedException(
        e.response?.data?.error?.message || 'Failed to fetch comments',
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3B — Paginated comment fetch (used internally by SyncService)
  // ─────────────────────────────────────────────────────────────────────────
  async getPostCommentsPaginated(
    userId: string,
    postId: string,
    pageAccessToken: string,
    limit = 25,
    after: string | null = null,
  ): Promise<{ comments: any[]; nextCursor: string | null }> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    try {
      const params: any = {
        access_token: pageAccessToken,
        fields:
          'id,message,from,created_time,like_count,comment_count',
        limit,
      };
      if (after) params.after = after;

      const res = await axios.get(`${this.graph}/${postId}/comments`, {
        params,
      });
      console.log(JSON.stringify(res.data.data, null, 2));
      const comments = (res.data.data || []).map((c: any) => ({
        commentId: c.id,
        source: 'meta',
        sourceRefId: postId,
        authorId: c.from?.id || null,
        authorName: c.from?.name || 'Facebook user',
        authorInitial: (c.from?.name || 'F').charAt(0).toUpperCase(),
        text: c.message || '',
        createdAt: c.created_time,
        likeCount: c.like_count ?? 0,
        replyCount: c.comment_count ?? 0,
        canReply: true,
        replies: [],
      }));

      const nextCursor = res.data.paging?.cursors?.after ?? null;
      const hasNext = !!res.data.paging?.next;

      return { comments, nextCursor: hasNext ? nextCursor : null };
    } catch (e: any) {
      console.error('❌ getPostCommentsPaginated failed:', e.response?.data);
      throw new UnauthorizedException(
        e.response?.data?.error?.message ||
          'Failed to fetch comments (paginated)',
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 4 — Reply to a comment
  // POST /meta-reviews/comments/:commentId/reply
  // Body: { message: string, pageAccessToken: string }
  // ─────────────────────────────────────────────────────────────────────────
  async replyToComment(
    userId: string,
    commentId: string,
    message: string,
    pageAccessToken: string,
  ) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    if (!message?.trim()) {
      throw new UnauthorizedException('Reply message cannot be empty');
    }

    try {
      const res = await axios.post(
        `${this.graph}/${commentId}/comments`,
        null,
        {
          params: {
            access_token: pageAccessToken,
            message: message.trim(),
          },
        },
      );
      return { success: true, commentId: res.data.id };
    } catch (e: any) {
      console.error('❌ replyToComment failed:', e.response?.data);
      throw new UnauthorizedException(
        e.response?.data?.error?.message || 'Failed to post reply',
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 5A — Get replies (original — direct UI call)
  // GET /meta-reviews/comments/:commentId/replies?pageAccessToken=xxx
  // ─────────────────────────────────────────────────────────────────────────
  async getCommentReplies(
    userId: string,
    commentId: string,
    pageAccessToken: string,
    limit = 25,
  ) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    try {
      const res = await axios.get(`${this.graph}/${commentId}/comments`, {
        params: {
          access_token: pageAccessToken,
          fields: 'id,message,from,created_time,like_count',
          limit,
        },
      });

      return (res.data.data || []).map((r: any) => ({
        replyId: r.id,
        source: 'meta',
        parentCommentId: commentId,
        authorId: r.from?.id || null,
        authorName: r.from?.name || 'Facebook user',
        authorInitial: (r.from?.name || 'F').charAt(0).toUpperCase(),
        text: r.message || '',
        createdAt: r.created_time,
        likeCount: r.like_count ?? 0,
      }));
    } catch (e: any) {
      console.error('❌ getCommentReplies failed:', e.response?.data);
      throw new UnauthorizedException(
        e.response?.data?.error?.message || 'Failed to fetch replies',
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 5B — Paginated reply fetch (used internally by SyncService)
  // ─────────────────────────────────────────────────────────────────────────
  async getCommentRepliesPaginated(
    userId: string,
    commentId: string,
    pageAccessToken: string,
    limit = 25,
    after: string | null = null,
  ): Promise<{ replies: any[]; nextCursor: string | null }> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    try {
      const params: any = {
        access_token: pageAccessToken,
        fields: 'id,message,from,created_time,like_count',
        limit,
      };
      if (after) params.after = after;

      const res = await axios.get(`${this.graph}/${commentId}/comments`, {
        params,
      });

      const replies = (res.data.data || []).map((r: any) => ({
        replyId: r.id,
        source: 'meta',
        parentCommentId: commentId,
        authorId: r.from?.id || null,
        authorName: r.from?.name || 'Facebook user',
        authorInitial: (r.from?.name || 'F').charAt(0).toUpperCase(),
        text: r.message || '',
        createdAt: r.created_time,
        likeCount: r.like_count ?? 0,
      }));

      const nextCursor = res.data.paging?.cursors?.after ?? null;
      const hasNext = !!res.data.paging?.next;

      return { replies, nextCursor: hasNext ? nextCursor : null };
    } catch (e: any) {
      console.error('❌ getCommentRepliesPaginated failed:', e.response?.data);
      throw new UnauthorizedException(
        e.response?.data?.error?.message ||
          'Failed to fetch replies (paginated)',
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BONUS — Aggregate feed (unchanged)
  // ─────────────────────────────────────────────────────────────────────────
  async getPageFeedWithCommentCounts(
    userId: string,
    pageId: string,
    pageAccessToken: string,
  ) {
    const posts = await this.getPagePosts(userId, pageId, pageAccessToken, 20);
    const totalComments = posts.reduce(
      (sum: number, p: { commentCount: number }) => sum + p.commentCount,
      0,
    );
    return {
      pageId,
      postCount: posts.length,
      totalComments,
      posts,
    };
  }
}