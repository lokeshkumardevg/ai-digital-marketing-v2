import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostReview, PostReviewDocument } from './post-review.schema';
import { MetaReviewsService } from './meta-reviews.service';

@Injectable()
export class PostReviewSyncService {
  private readonly logger = new Logger(PostReviewSyncService.name);

  constructor(
    @InjectModel(PostReview.name)
    private postReviewModel: Model<PostReviewDocument>,
    private metaReviewsService: MetaReviewsService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC — Sync ALL posts + comments + replies for a given page
  //
  // Called automatically when posts are first fetched, and manually via
  // the "Refresh" button on the UI.
  //
  // Flow:
  //   1. Fetch ALL posts for the page (paginated via 'after' cursor)
  //   2. For each post → fetch ALL comments
  //   3. For each comment → fetch ALL replies
  //   4. Upsert into post-reviews collection (postId is the unique key)
  //   5. Return summary { synced, updated, failed }
  // ─────────────────────────────────────────────────────────────────────────
  async syncPage(
    userId: string,
    pageId: string,
    pageName: string,
    pageAccessToken: string,
  ): Promise<{ synced: number; updated: number; failed: number }> {
    this.logger.log(`🔄 Starting sync — userId:${userId} pageId:${pageId}`);

    const allPosts = await this.fetchAllPosts(userId, pageId, pageAccessToken);
    this.logger.log(`📦 Total posts fetched: ${allPosts.length}`);

    let synced = 0;
    let updated = 0;
    let failed = 0;

    for (const post of allPosts) {
      try {
        // ── 1. Fetch all comments for this post ──────────────────────────
        const comments = await this.fetchAllComments(
          userId,
          post.postId,
          pageAccessToken,
        );

        // ── 2. For each comment, fetch all replies ───────────────────────
        const commentsWithReplies = await Promise.all(
          comments.map(async (comment) => {
            const replies =
              comment.replyCount > 0
                ? await this.fetchAllReplies(
                    userId,
                    comment.commentId,
                    pageAccessToken,
                  )
                : [];
            return { ...comment, replies };
          }),
        );

        // ── 3. Upsert into DB ─────────────────────────────────────────────
        const existing = await this.postReviewModel.findOne({
          postId: post.postId,
        });

        const docPayload = {
          userId,
          pageId,
          pageName,
          postId: post.postId,
          message: post.message,
          title: post.title,
          permalink: post.permalink,
          thumbnail: post.thumbnail,
          postedAt: post.createdAt,
          commentCount: post.commentCount,
          comments: commentsWithReplies,
          syncedAt: new Date(),
        };

        if (existing) {
          await this.postReviewModel.updateOne(
            { postId: post.postId },
            { $set: docPayload },
          );
          updated++;
        } else {
          await this.postReviewModel.create(docPayload);
          synced++;
        }
      } catch (err) {
        this.logger.error(`❌ Failed to sync postId:${post.postId}`, err);
        failed++;
      }
    }

    this.logger.log(
      `✅ Sync complete — synced:${synced} updated:${updated} failed:${failed}`,
    );
    return { synced, updated, failed };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE — Paginated post fetch (ALL posts, no limit cap)
  // Uses Facebook's 'after' cursor for pagination
  // ─────────────────────────────────────────────────────────────────────────
  private async fetchAllPosts(
    userId: string,
    pageId: string,
    pageAccessToken: string,
  ): Promise<any[]> {
    const allPosts: any[] = [];
    let after: string | null = null;

    do {
      const result: any = await this.metaReviewsService.getPagePostsPaginated(
        userId,
        pageId,
        pageAccessToken,
        25,   // batch size per request
        after,
      );
      allPosts.push(...result.posts);
      after = result.nextCursor || null;
    } while (after);

    return allPosts;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE — Paginated comment fetch (ALL comments for a post)
  // ─────────────────────────────────────────────────────────────────────────
  private async fetchAllComments(
    userId: string,
    postId: string,
    pageAccessToken: string,
  ): Promise<any[]> {
    const allComments: any[] = [];
    let after: string | null = null;

    do {
      const result: any =
        await this.metaReviewsService.getPostCommentsPaginated(
          userId,
          postId,
          pageAccessToken,
          25,
          after,
        );
      allComments.push(...result.comments);
      after = result.nextCursor || null;
    } while (after);

    return allComments;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE — Paginated reply fetch (ALL replies for a comment)
  // ─────────────────────────────────────────────────────────────────────────
  private async fetchAllReplies(
    userId: string,
    commentId: string,
    pageAccessToken: string,
  ): Promise<any[]> {
    const allReplies: any[] = [];
    let after: string | null = null;

    do {
      const result: any =
        await this.metaReviewsService.getCommentRepliesPaginated(
          userId,
          commentId,
          pageAccessToken,
          25,
          after,
        );
      allReplies.push(...result.replies);
      after = result.nextCursor || null;
    } while (after);

    return allReplies;
  }
}