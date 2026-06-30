import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import axios from 'axios';

/**
 * NOTE ON LINKEDIN API DIFFERENCES (vs Meta/Facebook):
 * ─────────────────────────────────────────────────────────────────────────
 * 1. Auth: LinkedIn has ONE user access token (no per-page token). The user
 *    must have admin access to the Organization, and your app must have the
 *    `r_organization_social` / `w_organization_social` (and `rw_organization_admin`
 *    for listing orgs) scopes approved.
 * 2. Comments & Reactions endpoints require Marketing Developer Platform (MDP)
 *    partner approval. Without approval, /socialActions calls will return 403.
 * 3. IDs are URNs, e.g. urn:li:organization:123456, urn:li:share:789, etc.
 *    They must be URL-encoded when used in path segments.
 * 4. There's no separate "replies" endpoint — replies are just comments whose
 *    `parentComment` field points to the parent comment's URN.
 * ─────────────────────────────────────────────────────────────────────────
 */

@Injectable()
export class LinkedInReviewsService {
  private base = 'https://api.linkedin.com/rest';
  private apiVersion = '202605'; // LinkedIn-Version header — active as of mid-2026. LinkedIn sunsets versions ~12 months after release, so revisit this periodically (see https://learn.microsoft.com/en-us/linkedin/marketing/versioning for the current active list).

  constructor(private usersService: UsersService) {}

  private headers(accessToken: string) {
    return {
      Authorization: `Bearer ${accessToken}`,
      'LinkedIn-Version': this.apiVersion,
      'X-Restli-Protocol-Version': '2.0.0',
    };
  }

  // FINDER-type queries (e.g. GET /posts?q=author) require this extra header
  // or LinkedIn returns "Invalid query parameters passed to request".
  private finderHeaders(accessToken: string) {
    return {
      ...this.headers(accessToken),
      'X-RestLi-Method': 'FINDER',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1 — Get all Organizations (Pages) this user administers
  // GET /linkedin-reviews/organizations
  // ─────────────────────────────────────────────────────────────────────────
  async getOrganizations(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.linkedinAccessToken) {
      throw new UnauthorizedException(
        'LinkedIn not connected. Please connect LinkedIn first.',
      );
    }

    try {
      // Step 1: get the list of org URNs this user administers
      // (the `projection` param is NOT allowed on this REST endpoint)
      const accessToken: string = user.linkedinAccessToken;
      const aclRes = await axios.get(`${this.base}/organizationAcls`, {
        headers: this.headers(accessToken),
        params: {
          q: 'roleAssignee',
          role: 'ADMINISTRATOR',
        },
      });

      const orgUrns: string[] = (aclRes.data.elements || []).map(
        (el: any) => el.organization,
      );
      if (orgUrns.length === 0) return [];

      // Step 2: fetch organization details individually (id, name, logo)
      const orgs = await Promise.all(
        orgUrns.map(async (urn: string) => {
          try {
            const orgId = urn.split(':').pop();
            const res = await axios.get(
              `${this.base}/organizations/${orgId}`,
              { headers: this.headers(accessToken) },
            );
            const org = res.data;
            return {
              pageId: org.id,
              pageUrn: urn,
              pageName:
                org.localizedName ||
                org.name?.localized?.en_US ||
                'Unnamed Organization',
              picture: org.logoV2?.original ?? null,
            };
          } catch (e: any) {
            console.error(
              `❌ Failed to fetch org details for ${urn}:`,
              e.response?.data,
            );
            return {
              pageId: urn.split(':').pop(),
              pageUrn: urn,
              pageName: 'Unnamed Organization',
              picture: null,
            };
          }
        }),
      );

      return orgs;
    } catch (e: any) {
      console.error('❌ getOrganizations failed:', e.response?.data);
      throw new UnauthorizedException(
        e.response?.data?.message || 'Failed to fetch LinkedIn Organizations',
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2A — Get posts (quick display)
  // GET /linkedin-reviews/pages/:orgUrn/posts?limit=10
  // ─────────────────────────────────────────────────────────────────────────
  async getOrgPosts(userId: string, orgUrn: string, limit = 10) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.linkedinAccessToken) {
      throw new UnauthorizedException('User not connected to LinkedIn');
    }

    try {
      const res = await axios.get(`${this.base}/posts`, {
        headers: this.finderHeaders(user.linkedinAccessToken),
        params: {
          q: 'author',
          author: orgUrn,
          count: limit,
          sortBy: 'LAST_MODIFIED',
        },
      });
      console.log("res ->>",res);
      return (res.data.elements || []).map((p: any) => this.mapPost(p));
    } catch (e: any) {
      console.error('❌ getOrgPosts failed:', e.response?.data);
      throw new UnauthorizedException(
        e.response?.data?.message || 'Failed to fetch posts',
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2B — Paginated post fetch (used internally by SyncService)
  // ─────────────────────────────────────────────────────────────────────────
  async getOrgPostsPaginated(
    userId: string,
    orgUrn: string,
    limit = 25,
    start = 0,
  ): Promise<{ posts: any[]; nextStart: number | null }> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.linkedinAccessToken) {
      throw new UnauthorizedException('User not connected to LinkedIn');
    }

    try {
      const res = await axios.get(`${this.base}/posts`, {
        headers: this.finderHeaders(user.linkedinAccessToken),
        params: {
          q: 'author',
          author: orgUrn,
          count: limit,
          start,
          sortBy: 'LAST_MODIFIED',
        },
      });

      const posts = (res.data.elements || []).map((p: any) => this.mapPost(p));
      const total = res.data.paging?.total ?? 0;
      const newStart = start + limit;
      const nextStart = newStart < total ? newStart : null;

      return { posts, nextStart };
    } catch (e: any) {
      console.error('❌ getOrgPostsPaginated failed:', e.response?.data);
      throw new UnauthorizedException(
        e.response?.data?.message || 'Failed to fetch posts (paginated)',
      );
    }
  }

  private mapPost(p: any) {
    const text = p.commentary || p.specificContent?.['com.linkedin.ugc.ShareContent']
      ?.shareCommentary?.text || '(no caption)';
    return {
      postId: p.id,
      postUrn: p.id, // already a urn:li:share / urn:li:ugcPost
      message: text,
      title: text.slice(0, 80),
      createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
      permalink: p.id
        ? `https://www.linkedin.com/feed/update/${encodeURIComponent(p.id)}`
        : null,
      thumbnail:
        p.content?.media?.id || p.content?.article?.thumbnail || null,
      commentCount: undefined, // not returned inline — fetch via socialActions
      source: 'linkedin',
      type: 'post',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3A — Get comments (direct UI call)
  // GET /linkedin-reviews/posts/:postUrn/comments?limit=25
  // Requires MDP partner approval for /socialActions/{urn}/comments
  // ─────────────────────────────────────────────────────────────────────────
  async getPostComments(userId: string, postUrn: string, limit = 25) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.linkedinAccessToken) {
      throw new UnauthorizedException('User not connected to LinkedIn');
    }

    try {
      const res = await axios.get(
        `${this.base}/socialActions/${encodeURIComponent(postUrn)}/comments`,
        {
          headers: this.headers(user.linkedinAccessToken),
          params: { count: limit },
        },
      );

      return (res.data.elements || []).map((c: any) =>
        this.mapComment(c, postUrn),
      );
    } catch (e: any) {
      console.error('❌ getPostComments failed:', e.response?.data);
      throw new UnauthorizedException(
        e.response?.data?.message || 'Failed to fetch comments',
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3B — Paginated comment fetch (used internally by SyncService)
  // ─────────────────────────────────────────────────────────────────────────
  async getPostCommentsPaginated(
    userId: string,
    postUrn: string,
    limit = 25,
    start = 0,
  ): Promise<{ comments: any[]; nextStart: number | null }> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.linkedinAccessToken) {
      throw new UnauthorizedException('User not connected to LinkedIn');
    }

    try {
      const res = await axios.get(
        `${this.base}/socialActions/${encodeURIComponent(postUrn)}/comments`,
        {
          headers: this.headers(user.linkedinAccessToken),
          params: { count: limit, start },
        },
      );

      const comments = (res.data.elements || []).map((c: any) =>
        this.mapComment(c, postUrn),
      );
      const total = res.data.paging?.total ?? 0;
      const newStart = start + limit;
      const nextStart = newStart < total ? newStart : null;

      return { comments, nextStart };
    } catch (e: any) {
      console.error('❌ getPostCommentsPaginated failed:', e.response?.data);
      throw new UnauthorizedException(
        e.response?.data?.message ||
          'Failed to fetch comments (paginated)',
      );
    }
  }

  private mapComment(c: any, postUrn: string) {
    return {
      commentId: c.$URN || c.id,
      source: 'linkedin',
      sourceRefId: postUrn,
      authorId: c.actor || null,
      authorName: c.actorName || 'LinkedIn user', // resolve via /people if needed
      authorInitial: (c.actorName || 'L').charAt(0).toUpperCase(),
      text: c.message?.text || '',
      createdAt: c.created?.time
        ? new Date(c.created.time).toISOString()
        : null,
      likeCount: c.likesSummary?.totalLikes ?? 0,
      replyCount: c.commentsSummary?.aggregatedTotalComments ?? 0,
      canReply: true,
      replies: [],
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 4 — Reply to a comment / post
  // POST /linkedin-reviews/comments/reply
  // Body: { targetUrn: string (post or parent comment URN), message: string }
  // ─────────────────────────────────────────────────────────────────────────
  async replyToComment(
    userId: string,
    targetUrn: string,
    message: string,
    actorUrn: string, // e.g. urn:li:organization:12345 — pass the org URN the comment belongs to
  ) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.linkedinAccessToken) {
      throw new UnauthorizedException('User not connected to LinkedIn');
    }
    if (!message?.trim()) {
      throw new UnauthorizedException('Reply message cannot be empty');
    }
    if (!actorUrn) {
      throw new UnauthorizedException('actorUrn (organization URN) is required');
    }

    try {
      const res = await axios.post(
        `${this.base}/socialActions/${encodeURIComponent(targetUrn)}/comments`,
        {
          actor: actorUrn, // posting as the org
          message: { text: message.trim() },
        },
        { headers: this.headers(user.linkedinAccessToken) },
      );
      return { success: true, commentId: res.data.id || res.headers['x-restli-id'] };
    } catch (e: any) {
      console.error('❌ replyToComment failed:', e.response?.data);
      throw new UnauthorizedException(
        e.response?.data?.message || 'Failed to post reply',
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 5A — Get replies to a comment (direct UI call)
  // GET /linkedin-reviews/comments/:commentUrn/replies?limit=25
  // LinkedIn has no dedicated replies endpoint — filter comments by parentComment
  // ─────────────────────────────────────────────────────────────────────────
  async getCommentReplies(
    userId: string,
    postUrn: string,
    commentUrn: string,
    limit = 25,
  ) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.linkedinAccessToken) {
      throw new UnauthorizedException('User not connected to LinkedIn');
    }

    try {
      const res = await axios.get(
        `${this.base}/socialActions/${encodeURIComponent(postUrn)}/comments`,
        {
          headers: this.headers(user.linkedinAccessToken),
          params: { count: limit, parentComment: commentUrn },
        },
      );

      return (res.data.elements || []).map((r: any) => ({
        replyId: r.$URN || r.id,
        source: 'linkedin',
        parentCommentId: commentUrn,
        authorId: r.actor || null,
        authorName: r.actorName || 'LinkedIn user',
        authorInitial: (r.actorName || 'L').charAt(0).toUpperCase(),
        text: r.message?.text || '',
        createdAt: r.created?.time
          ? new Date(r.created.time).toISOString()
          : null,
        likeCount: r.likesSummary?.totalLikes ?? 0,
      }));
    } catch (e: any) {
      console.error('❌ getCommentReplies failed:', e.response?.data);
      throw new UnauthorizedException(
        e.response?.data?.message || 'Failed to fetch replies',
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 5B — Paginated reply fetch (used internally by SyncService)
  // ─────────────────────────────────────────────────────────────────────────
  async getCommentRepliesPaginated(
    userId: string,
    postUrn: string,
    commentUrn: string,
    limit = 25,
    start = 0,
  ): Promise<{ replies: any[]; nextStart: number | null }> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.linkedinAccessToken) {
      throw new UnauthorizedException('User not connected to LinkedIn');
    }

    try {
      const res = await axios.get(
        `${this.base}/socialActions/${encodeURIComponent(postUrn)}/comments`,
        {
          headers: this.headers(user.linkedinAccessToken),
          params: { count: limit, start, parentComment: commentUrn },
        },
      );

      const replies = (res.data.elements || []).map((r: any) => ({
        replyId: r.$URN || r.id,
        source: 'linkedin',
        parentCommentId: commentUrn,
        authorId: r.actor || null,
        authorName: r.actorName || 'LinkedIn user',
        authorInitial: (r.actorName || 'L').charAt(0).toUpperCase(),
        text: r.message?.text || '',
        createdAt: r.created?.time
          ? new Date(r.created.time).toISOString()
          : null,
        likeCount: r.likesSummary?.totalLikes ?? 0,
      }));

      const total = res.data.paging?.total ?? 0;
      const newStart = start + limit;
      const nextStart = newStart < total ? newStart : null;

      return { replies, nextStart };
    } catch (e: any) {
      console.error(
        '❌ getCommentRepliesPaginated failed:',
        e.response?.data,
      );
      throw new UnauthorizedException(
        e.response?.data?.message ||
          'Failed to fetch replies (paginated)',
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BONUS — Aggregate feed
  // ─────────────────────────────────────────────────────────────────────────
  async getOrgFeedWithCommentCounts(userId: string, orgUrn: string) {
    const posts = await this.getOrgPosts(userId, orgUrn, 20);

    // Comment counts aren't included inline in /posts; fetch per post via
    // socialActions if you need exact totals (extra API calls, rate-limit aware).
    let totalComments = 0;
    for (const p of posts) {
      try {
        const c = await this.getPostComments(userId, p.postUrn, 1);
        // socialActions response includes paging.total even with count=1
        totalComments += c.length; // replace with res.data.paging?.total if exposed
      } catch {
        // skip posts where comments aren't accessible
      }
    }

    return {
      pageId: orgUrn,
      postCount: posts.length,
      totalComments,
      posts,
    };
  }
}