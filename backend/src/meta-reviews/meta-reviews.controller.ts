import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MetaReviewsService } from './meta-reviews.service';

@Controller('meta-reviews')
@UseGuards(AuthGuard('jwt'))
export class MetaReviewsController {
  constructor(private readonly svc: MetaReviewsService) { }

  // ── GET /meta-reviews/pages ─────────────────────────────────────────
  // Step 1 — get all Pages this user manages
  // Frontend uses this to populate the "select a Page" dropdown
  @Get('pages')
  getPages(@Request() req: any) {
    const userId = req.user.sub || req.user.userId || req.user._id;
    return this.svc.getPages(userId);
  }

  // ── GET /meta-reviews/pages/:pageId/posts ───────────────────────────
  // Step 2 — get posts for a specific Page
  // Query: pageAccessToken (from step 1 response), limit (optional, default 10)
  @Get('pages/:pageId/posts')
  getPagePosts(
    @Request() req: any,
    @Param('pageId') pageId: string,
    @Query('pageAccessToken') pageAccessToken: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.sub || req.user.userId || req.user._id;
    return this.svc.getPagePosts(
      userId,
      pageId,
      pageAccessToken,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  // ── GET /meta-reviews/posts/:postId/comments ────────────────────────
  // Step 3 — get comments for a specific post
  // Query: pageAccessToken, limit (optional, default 25)
  @Get('posts/:postId/comments')
  getPostComments(
    @Request() req: any,
    @Param('postId') postId: string,
    @Query('pageAccessToken') pageAccessToken: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.sub || req.user.userId || req.user._id;
    return this.svc.getPostComments(
      userId,
      postId,
      pageAccessToken,
      limit ? parseInt(limit, 10) : 25,
    );
  }

  // ── POST /meta-reviews/comments/:commentId/reply ─────────────────────
  // Step 4 — reply to a specific comment
  // Body: { message: string, pageAccessToken: string }
  @Post('comments/:commentId/reply')
  replyToComment(
    @Request() req: any,
    @Param('commentId') commentId: string,
    @Body() body: { message: string; pageAccessToken: string },
  ) {
    const userId = req.user.sub || req.user.userId || req.user._id;
    return this.svc.replyToComment(
      userId,
      commentId,
      body.message,
      body.pageAccessToken,
    );
  }

  // ── GET /meta-reviews/pages/:pageId/feed ────────────────────────────
  // Bonus — all posts + comment counts in one call (for dashboard stats)
  // Query: pageAccessToken
  @Get('pages/:pageId/feed')
  getPageFeed(
    @Request() req: any,
    @Param('pageId') pageId: string,
    @Query('pageAccessToken') pageAccessToken: string,
  ) {
    const userId = req.user.sub || req.user.userId || req.user._id;
    return this.svc.getPageFeedWithCommentCounts(userId, pageId, pageAccessToken);
  }
  @Get('comments/:commentId/replies')
  async getCommentReplies(
    @Request() req: any,
    @Param('commentId') commentId: string,
    @Query('pageAccessToken') pageAccessToken: string,
    @Query('limit') limit?: string,
  ) {
    return this.svc.getCommentReplies(
      req.user.id,
      commentId,
      pageAccessToken,
      limit ? parseInt(limit, 10) : 25,
    );
  }
}