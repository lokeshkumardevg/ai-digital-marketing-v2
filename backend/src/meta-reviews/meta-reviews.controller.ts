import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MetaReviewsService } from './meta-reviews.service';
import { PostReviewSyncService } from './post-review-sync.service';
import { PostReviewQueryService } from './post-review-query.service';

@UseGuards(AuthGuard('jwt'))
@Controller('meta-reviews')
export class MetaReviewsController {
  constructor(
    private metaReviewsService: MetaReviewsService,
    private syncService: PostReviewSyncService,
    private queryService: PostReviewQueryService,
  ) {}

  // ───────────────────────────────────────────────────────────────────────
  // EXISTING — Facebook API direct calls (unchanged behaviour)
  // ───────────────────────────────────────────────────────────────────────

  // GET /meta-reviews/pages
  @Get('pages')
  getPages(@Req() req: any) {
    return this.metaReviewsService.getPages(req.user.id);
  }

  // GET /meta-reviews/pages/:pageId/posts?pageAccessToken=&limit=
  @Get('pages/:pageId/posts')
  getPagePosts(
    @Req() req: any,
    @Param('pageId') pageId: string,
    @Query('pageAccessToken') pageAccessToken: string,
    @Query('limit') limit?: number,
  ) {
    return this.metaReviewsService.getPagePosts(
      req.user.id,
      pageId,
      pageAccessToken,
      limit,
    );
  }

  // GET /meta-reviews/posts/:postId/comments?pageAccessToken=&limit=
  @Get('posts/:postId/comments')
  getPostComments(
    @Req() req: any,
    @Param('postId') postId: string,
    @Query('pageAccessToken') pageAccessToken: string,
    @Query('limit') limit?: number,
  ) {
    return this.metaReviewsService.getPostComments(
      req.user.id,
      postId,
      pageAccessToken,
      limit,
    );
  }

  // POST /meta-reviews/comments/:commentId/reply
  @Post('comments/:commentId/reply')
  replyToComment(
    @Req() req: any,
    @Param('commentId') commentId: string,
    @Body() body: { message: string; pageAccessToken: string },
  ) {
    return this.metaReviewsService.replyToComment(
      req.user.id,
      commentId,
      body.message,
      body.pageAccessToken,
    );
  }

  // GET /meta-reviews/comments/:commentId/replies?pageAccessToken=&limit=
  @Get('comments/:commentId/replies')
  getCommentReplies(
    @Req() req: any,
    @Param('commentId') commentId: string,
    @Query('pageAccessToken') pageAccessToken: string,
    @Query('limit') limit?: number,
  ) {
    return this.metaReviewsService.getCommentReplies(
      req.user.id,
      commentId,
      pageAccessToken,
      limit,
    );
  }

  // GET /meta-reviews/pages/:pageId/feed?pageAccessToken=
  @Get('pages/:pageId/feed')
  getPageFeed(
    @Req() req: any,
    @Param('pageId') pageId: string,
    @Query('pageAccessToken') pageAccessToken: string,
  ) {
    return this.metaReviewsService.getPageFeedWithCommentCounts(
      req.user.id,
      pageId,
      pageAccessToken,
    );
  }

  // ───────────────────────────────────────────────────────────────────────
  // NEW — Sync endpoints (writes to DB)
  // ───────────────────────────────────────────────────────────────────────

  /**
   * POST /meta-reviews/sync/pages/:pageId
   * Body: { pageAccessToken: string, pageName: string }
   *
   * Triggered by:
   *   - UI "Refresh" button click (manual)
   *   - Auto-called from getPagePosts if no DB data exists yet
   *
   * Fetches ALL posts → ALL comments → ALL replies for the page,
   * then upserts everything into the post-reviews collection.
   *
   * Response: { synced, updated, failed, durationMs }
   */
  @Post('sync/pages/:pageId')
  async syncPage(
    @Req() req: any,
    @Param('pageId') pageId: string,
    @Body() body: { pageAccessToken: string; pageName: string },
  ) {
    const start = Date.now();
    const result = await this.syncService.syncPage(
      req.user.id,
      pageId,
      body.pageName || '',
      body.pageAccessToken,
    );
    return { ...result, durationMs: Date.now() - start };
  }

  // ───────────────────────────────────────────────────────────────────────
  // NEW — DB Read endpoints (no Facebook API call, reads from MongoDB)
  // ───────────────────────────────────────────────────────────────────────

  /**
   * GET /meta-reviews/db/pages/:pageId/posts
   * Query: ?page=1&limit=10&search=hello
   *
   * Returns paginated posts from DB for a page.
   * Includes commentCount, thumbnail, permalink, syncedAt.
   * No Facebook API hit.
   */
  @Get('db/pages/:pageId/posts')
  getDbPosts(
    @Req() req: any,
    @Param('pageId') pageId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    return this.queryService.getPostsByPage(
      req.user.id,
      pageId,
      Number(page),
      Number(limit),
      search,
    );
  }

  /**
   * GET /meta-reviews/db/posts/:postId
   *
   * Returns a single post with ALL its comments and replies from DB.
   * No Facebook API hit.
   */
  @Get('db/posts/:postId')
  getDbPost(@Req() req: any, @Param('postId') postId: string) {
    return this.queryService.getPostById(req.user.id, postId);
  }

  /**
   * GET /meta-reviews/db/pages/:pageId/comments
   * Query: ?page=1&limit=20&search=hello
   *
   * Returns all comments across all posts for a page (flat list).
   * Useful for a "all comments" inbox view.
   */
  @Get('db/pages/:pageId/comments')
  getDbComments(
    @Req() req: any,
    @Param('pageId') pageId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.queryService.getCommentsByPage(
      req.user.id,
      pageId,
      Number(page),
      Number(limit),
      search,
    );
  }

  /**
   * GET /meta-reviews/db/pages/:pageId/stats
   *
   * Returns aggregate stats for the page from DB:
   * totalPosts, totalComments, totalReplies, lastSyncedAt
   */
  @Get('db/pages/:pageId/stats')
  getDbPageStats(
    @Req() req: any,
    @Param('pageId') pageId: string,
  ) {
    return this.queryService.getPageStats(req.user.id, pageId);
  }
}