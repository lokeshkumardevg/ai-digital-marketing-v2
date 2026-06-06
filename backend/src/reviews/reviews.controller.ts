import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ─── 1. FULLY STATIC ROUTES (must come first) ─────────────────────────────

  /**
   * GET /reviews/dashboard/stats?brandId=xxx
   * Must be declared before :id to avoid "dashboard" being captured as an ID.
   */
  @Get('dashboard/stats')
  getDashboardStats(@Query('brandId') brandId: string) {
    return this.reviewsService.getDashboardStats(brandId);
  }

  /**
   * POST /reviews/seed?brandId=xxx
   * Seed mock reviews for a brand.
   */
  @Post('seed')
  seedMockReviews(@Query('brandId') brandId: string) {
    return this.reviewsService.seedMockReviews(brandId);
  }

  // ─── 2. COLLECTION-LEVEL ROUTES ───────────────────────────────────────────

  /**
   * GET /reviews?brandId=xxx&platform=google&page=1&limit=20
   */
  @Get()
  getReviews(
    @Query('brandId') brandId?: string,
    @Query('platform') platform?: string,
    @Query('sentiment') sentiment?: string,
    @Query('status') status?: string,
    @Query('rating') rating?: number,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewsService.getReviews({
      brandId,
      platform,
      sentiment,
      status,
      rating,
      search,
      page,
      limit,
    });
  }

  // ─── 3. PARAMETERIZED NESTED ROUTES (static segment + :id) ────────────────

  /**
   * POST /reviews/:id/generate-reply
   * Generate an AI reply for a specific review.
   */
  @Post(':id/generate-reply')
  generateAiReply(@Param('id') id: string) {
    return this.reviewsService.generateAiReply(id);
  }

  /**
   * Post /reviews/:id/publish-reply
   * Publish a reply to a specific review.
   */
  @Post(':id/publish-reply')
  publishReply(
    @Param('id') id: string,
    @Body('replyText') replyText: string,
  ) {
    return this.reviewsService.publishReply(id, replyText);
  }

  /**
   * PATCH /reviews/:id/resolve
   * Mark a review as resolved.
   */
  @Patch(':id/resolve')
  markResolved(@Param('id') id: string) {
    return this.reviewsService.markResolved(id);
  }

  /**
   * POST /reviews/:id/analyze-sentiment
   * Run AI sentiment analysis on a specific review.
   */
  @Post(':id/analyze-sentiment')
  analyzeSentiment(@Param('id') id: string) {
    return this.reviewsService.analyzeSentiment(id);
  }

  // ─── 4. FULLY DYNAMIC ROUTES (must come last) ─────────────────────────────

  /**
   * GET /reviews/:id
   * Must be declared AFTER all static and nested routes.
   */
  @Get(':id')
  getReviewById(@Param('id') id: string) {
    return this.reviewsService.getReviews({ search: id }); // adjust to your actual single-review method
  }
}