import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LinkedInReviewsService } from './linkedin-reviews.service';
import { AuthGuard } from '@nestjs/passport';
@UseGuards(AuthGuard('jwt'))// adjust path to your existing auth guard

@Controller('linkedin-reviews')
export class LinkedInReviewsController {
  constructor(private readonly linkedInReviewsService: LinkedInReviewsService) {}

  // ───────────────────────────────────────────────────────────────────────
  // GET /linkedin-reviews/organizations
  // ───────────────────────────────────────────────────────────────────────
  @Get('organizations')
  async getOrganizations(@Req() req: any) {
    return this.linkedInReviewsService.getOrganizations(req.user.id);
  }

  // ───────────────────────────────────────────────────────────────────────
  // GET /linkedin-reviews/pages/:orgUrn/posts?limit=10
  // orgUrn must be URL-encoded, e.g. urn%3Ali%3Aorganization%3A12345
  // ───────────────────────────────────────────────────────────────────────
  @Get('pages/:orgUrn/posts')
  async getOrgPosts(
    @Req() req: any,
    @Param('orgUrn') orgUrn: string,
    @Query('limit') limit?: string,
  ) {
    return this.linkedInReviewsService.getOrgPosts(
      req.user.id,
      decodeURIComponent(orgUrn),
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  // ───────────────────────────────────────────────────────────────────────
  // GET /linkedin-reviews/pages/:orgUrn/posts/paginated?limit=25&start=0
  // ───────────────────────────────────────────────────────────────────────
  @Get('pages/:orgUrn/posts/paginated')
  async getOrgPostsPaginated(
    @Req() req: any,
    @Param('orgUrn') orgUrn: string,
    @Query('limit') limit?: string,
    @Query('start') start?: string,
  ) {
    return this.linkedInReviewsService.getOrgPostsPaginated(
      req.user.id,
      decodeURIComponent(orgUrn),
      limit ? parseInt(limit, 10) : undefined,
      start ? parseInt(start, 10) : undefined,
    );
  }

  // ───────────────────────────────────────────────────────────────────────
  // GET /linkedin-reviews/posts/:postUrn/comments?limit=25
  // ───────────────────────────────────────────────────────────────────────
  @Get('posts/:postUrn/comments')
  async getPostComments(
    @Req() req: any,
    @Param('postUrn') postUrn: string,
    @Query('limit') limit?: string,
  ) {
    return this.linkedInReviewsService.getPostComments(
      req.user.id,
      decodeURIComponent(postUrn),
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  // ───────────────────────────────────────────────────────────────────────
  // GET /linkedin-reviews/posts/:postUrn/comments/paginated?limit=25&start=0
  // ───────────────────────────────────────────────────────────────────────
  @Get('posts/:postUrn/comments/paginated')
  async getPostCommentsPaginated(
    @Req() req: any,
    @Param('postUrn') postUrn: string,
    @Query('limit') limit?: string,
    @Query('start') start?: string,
  ) {
    return this.linkedInReviewsService.getPostCommentsPaginated(
      req.user.id,
      decodeURIComponent(postUrn),
      limit ? parseInt(limit, 10) : undefined,
      start ? parseInt(start, 10) : undefined,
    );
  }

  // ───────────────────────────────────────────────────────────────────────
  // POST /linkedin-reviews/comments/reply
  // Body: { targetUrn: string, message: string, actorUrn: string }
  // actorUrn = the urn:li:organization:xxxx of the page replying
  // ───────────────────────────────────────────────────────────────────────
  @Post('comments/reply')
  async replyToComment(
    @Req() req: any,
    @Body('targetUrn') targetUrn: string,
    @Body('message') message: string,
    @Body('actorUrn') actorUrn: string,
  ) {
    return this.linkedInReviewsService.replyToComment(
      req.user.id,
      targetUrn,
      message,
      actorUrn,
    );
  }

  // ───────────────────────────────────────────────────────────────────────
  // GET /linkedin-reviews/posts/:postUrn/comments/:commentUrn/replies?limit=25
  // ───────────────────────────────────────────────────────────────────────
  @Get('posts/:postUrn/comments/:commentUrn/replies')
  async getCommentReplies(
    @Req() req: any,
    @Param('postUrn') postUrn: string,
    @Param('commentUrn') commentUrn: string,
    @Query('limit') limit?: string,
  ) {
    return this.linkedInReviewsService.getCommentReplies(
      req.user.id,
      decodeURIComponent(postUrn),
      decodeURIComponent(commentUrn),
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  // ───────────────────────────────────────────────────────────────────────
  // GET /linkedin-reviews/posts/:postUrn/comments/:commentUrn/replies/paginated
  // ───────────────────────────────────────────────────────────────────────
  @Get('posts/:postUrn/comments/:commentUrn/replies/paginated')
  async getCommentRepliesPaginated(
    @Req() req: any,
    @Param('postUrn') postUrn: string,
    @Param('commentUrn') commentUrn: string,
    @Query('limit') limit?: string,
    @Query('start') start?: string,
  ) {
    return this.linkedInReviewsService.getCommentRepliesPaginated(
      req.user.id,
      decodeURIComponent(postUrn),
      decodeURIComponent(commentUrn),
      limit ? parseInt(limit, 10) : undefined,
      start ? parseInt(start, 10) : undefined,
    );
  }

  // ───────────────────────────────────────────────────────────────────────
  // GET /linkedin-reviews/pages/:orgUrn/feed
  // ───────────────────────────────────────────────────────────────────────
  @Get('pages/:orgUrn/feed')
  async getOrgFeed(@Req() req: any, @Param('orgUrn') orgUrn: string) {
    return this.linkedInReviewsService.getOrgFeedWithCommentCounts(
      req.user.id,
      decodeURIComponent(orgUrn),
    );
  }
}