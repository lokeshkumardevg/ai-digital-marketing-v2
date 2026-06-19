import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import axios from 'axios';

@Injectable()
export class MetaReviewsService {
  private graph = 'https://graph.facebook.com/v20.0';

  constructor(private usersService: UsersService) {}

  // ─────────────────────────────────────────────────────────────────────
  // STEP 1 — Get all Pages this user manages (reuses existing getMetaPages logic)
  // GET /meta-reviews/pages
  // Returns: [{ pageId, pageName, pageAccessToken, picture }]
  // ─────────────────────────────────────────────────────────────────────
  async getPages(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.metaAccessToken) {
      throw new UnauthorizedException('Meta not connected. Please connect Facebook first.');
    }

    try {
      const res = await axios.get(`${this.graph}/me/accounts`, {
        params: {
          access_token: user.metaAccessToken,
          fields: 'id,name,access_token,picture',
        },
      });

      // Normalize — frontend uses pageId/pageAccessToken consistently
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

  // ─────────────────────────────────────────────────────────────────────
  // STEP 2 — Get posts for a specific Page
  // GET /meta-reviews/pages/:pageId/posts?pageAccessToken=xxx&limit=10
  // Returns: [{ postId, message, createdAt, permalink, commentCount, thumbnail }]
  // ─────────────────────────────────────────────────────────────────────
  async getPagePosts(
    userId: string,
    pageId: string,
    pageAccessToken: string,
    limit = 10,
  ) {
    // Validate user owns this request
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    try {
      const res = await axios.get(`${this.graph}/${pageId}/posts`, {
        params: {
          access_token: pageAccessToken,
          fields: 'id,message,created_time,full_picture,permalink_url,comments.summary(true){id}',
          limit,
        },
      });

      return (res.data.data || []).map((p: any) => ({
        postId: p.id,
        message: p.message || '(no caption)',
        // Short title for the dropdown — first 80 chars
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

  // ─────────────────────────────────────────────────────────────────────
  // STEP 3 — Get comments for a specific post
  // GET /meta-reviews/posts/:postId/comments?pageAccessToken=xxx&limit=25
  // Returns: [{ commentId, authorName, text, createdAt, likeCount, canReply }]
  // ─────────────────────────────────────────────────────────────────────
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
          fields: 'id,message,from,created_time,like_count,comment_count,user_likes',
          limit,
        },
      });

      return (res.data.data || []).map((c: any) => ({
        commentId: c.id,
        source: 'meta',
        sourceRefId: postId,
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

  // ─────────────────────────────────────────────────────────────────────
  // STEP 4 — Reply to a comment
  // POST /meta-reviews/comments/:commentId/reply
  // Body: { message: string, pageAccessToken: string }
  // Returns: { commentId: string } — the newly created reply comment
  // ─────────────────────────────────────────────────────────────────────
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
      // Posting to /{commentId}/comments creates a reply to that comment
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

  // ─────────────────────────────────────────────────────────────────────
  // BONUS — Get all posts + their comments in one call
  // GET /meta-reviews/pages/:pageId/feed?pageAccessToken=xxx
  // Useful for the dashboard aggregate stats (total comments per page)
  // ─────────────────────────────────────────────────────────────────────
  async getPageFeedWithCommentCounts(
    userId: string,
    pageId: string,
    pageAccessToken: string,
  ) {
    const posts = await this.getPagePosts(userId, pageId, pageAccessToken, 20);
    const totalComments = posts.reduce((sum: number, p: { commentCount: number }) => sum + p.commentCount, 0);
    return {
      pageId,
      postCount: posts.length,
      totalComments,
      posts,
    };
  }
}