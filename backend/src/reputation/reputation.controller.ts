import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
} from '@nestjs/common';
import { ReputationService } from './reputation.service';
import { CreateLeadDto, CreateLeadsBulkDto } from '../dto/create-lead.dto';

@Controller('reputation')
export class ReputationController {
    constructor(private readonly reputationService: ReputationService) { }

    // ═══════════════════════════════════════════════════════════
    // ─── 1. FULLY STATIC ROUTES (must come first) ──────────────
    // ═══════════════════════════════════════════════════════════

    /**
     * GET /reputation/dashboard/stats?brandId=xxx
     * KPI cards: total reviews, avg rating, sentiment %, response rate, platform breakdown, trend.
     */
    @Get('dashboard/stats')
    getDashboardStats(@Query('brandId') brandId: string) {
        return this.reputationService.getDashboardStats(brandId);
    }

    /**
     * GET /reputation/reviews/stats?brandId=xxx
     * Aggregate review stats (avg rating, rating distribution).
     * Must be before :id routes.
     */
    @Get('reviews/stats')
    getReviewStats(@Query('brandId') brandId: string) {
        return this.reputationService.getDashboardStats(brandId);
    }

    /**
     * POST /reputation/reviews/seed?brandId=xxx
     * Seed mock reviews for a brand (dev/demo use).
     */
    @Post('reviews/seed')
    seedMockReviews(@Query('brandId') brandId: string) {
        return this.reputationService.seedMockReviews(brandId);
    }

    /**
     * POST /reputation/reviews/ai-draft-batch?brandId=xxx
     * Batch-generate AI replies for all pending reviews.
     */
    @Post('reviews/ai-draft-batch')
    aiDraftBatch(@Query('brandId') brandId: string) {
        // Placeholder — iterate pending reviews and call generateAiReply per item
        return { message: 'Batch draft triggered', brandId };
    }

    /**
     * POST /reputation/customers/import?brandId=xxx
     * Bulk import customers (CSV / Shopify).
     * Must be before :id routes.
     */
    @Post('customers/import')
    importCustomers(
        @Query('brandId') brandId: string,
        @Body() dto: { customers: any[] },
    ) {
        return this.reputationService.importCustomers(brandId, dto.customers);
    }

    /**
     * GET /reputation/analytics/rating-trend?brandId=xxx&months=6
     * Monthly review volume + avg rating (bar + line chart).
     */
    @Get('analytics/rating-trend')
    getRatingTrend(
        @Query('brandId') brandId: string,
        @Query('months') months: number,
    ) {
        return this.reputationService.getRatingTrend(brandId, months);
    }

    /**
     * GET /reputation/analytics/sentiment-trend?brandId=xxx
     * Monthly sentiment breakdown: positive / neutral / negative.
     */
    @Get('analytics/sentiment-trend')
    getSentimentTrend(@Query('brandId') brandId: string) {
        return this.reputationService.getSentimentTrend(brandId);
    }

    /**
     * GET /reputation/analytics/topic-breakdown?brandId=xxx
     * Per-topic positive vs negative counts (topics analysis bar).
     */
    @Get('analytics/topic-breakdown')
    getTopicBreakdown(@Query('brandId') brandId: string) {
        return this.reputationService.getTopicBreakdown(brandId);
    }

    /**
     * POST /reputation/recommendations/generate?brandId=xxx
     * Generate fresh AI recommendations from recent reviews.
     */
    @Post('recommendations/generate')
    generateInsights(@Query('brandId') brandId: string) {
        return this.reputationService.generateInsights(brandId);
    }

    // ═══════════════════════════════════════════════════════════
    // ─── 2. COLLECTION-LEVEL ROUTES ────────────────────────────
    // ═══════════════════════════════════════════════════════════

    /**
     * GET /reputation/reviews?brandId=xxx&platform=google&sentiment=positive&status=pending&rating=5&search=shipping&page=1&limit=20
     */
    @Get('reviews')
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
        return this.reputationService.getReviews({
            brandId, platform, sentiment, status, rating, search, page, limit,
        });
    }

    /**
     * GET /reputation/customers?brandId=xxx&page=1&limit=20
     */
    @Get('customers')
    getCustomers(
        @Query('brandId') brandId: string,
        @Query('page') page: number,
        @Query('limit') limit: number,
    ) {
        return this.reputationService.getCustomers(brandId, page, limit);
    }

    /**
     * POST /reputation/customers?brandId=xxx
     */
    @Post('customers')
    createCustomer(
        @Query('brandId') brandId: string,
        @Body() dto: {
            firstName: string;
            lastName: string;
            email: string;
            phone?: string;
            source?: 'manual' | 'csv' | 'shopify';
        },
    ) {
        return this.reputationService.createCustomer(brandId, dto);
    }

    /**
     * GET /reputation/recommendations?brandId=xxx
     */
    @Get('recommendations')
    getInsights(@Query('brandId') brandId: string) {
        return this.reputationService.getInsights(brandId);
    }

    // ═══════════════════════════════════════════════════════════
    // ─── 3. PARAMETERIZED NESTED ROUTES (:id + static segment) ─
    // ═══════════════════════════════════════════════════════════

    /**
     * POST /reputation/reviews/:id/generate-reply
     * Generate an AI reply draft for a review.
     */
    @Post('reviews/:id/generate-reply')
    generateAiReply(@Param('id') id: string) {
        return this.reputationService.generateAiReply(id);
    }

    /**
     * POST /reputation/reviews/:id/publish-reply
     * Publish (save) a reply to a review.
     */
    @Post('reviews/:id/publish-reply')
    publishReply(
        @Param('id') id: string,
        @Body('replyText') replyText: string,
    ) {
        return this.reputationService.publishReply(id, replyText);
    }

    /**
     * PATCH /reputation/reviews/:id/resolve
     * Mark a review as resolved.
     */
    @Patch('reviews/:id/resolve')
    markResolved(@Param('id') id: string) {
        return this.reputationService.markResolved(id);
    }

    /**
     * POST /reputation/reviews/:id/analyze-sentiment
     * Run AI sentiment analysis on a specific review.
     */
    @Post('reviews/:id/analyze-sentiment')
    analyzeSentiment(@Param('id') id: string) {
        return this.reputationService.analyzeSentiment(id);
    }

    /**
     * POST /reputation/customers/:id/send-request?brandId=xxx
     * Send a review request email/SMS to a customer.
     */
    @Post('customers/:id/send-request')
    sendReviewRequest(
        @Param('id') id: string,
        @Query('brandId') brandId: string,
    ) {
        return this.reputationService.sendReviewRequest(id, brandId);
    }

    /**
     * PATCH /reputation/customers/:id?brandId=xxx
     * Update customer details.
     */
    @Patch('customers/:id')
    updateCustomer(
        @Param('id') id: string,
        @Query('brandId') brandId: string,
        @Body() dto: any,
    ) {
        return this.reputationService.updateCustomer(id, brandId, dto);
    }

    /**
     * DELETE /reputation/customers/:id?brandId=xxx
     */
    @Delete('customers/:id')
    deleteCustomer(
        @Param('id') id: string,
        @Query('brandId') brandId: string,
    ) {
        return this.reputationService.deleteCustomer(id, brandId);
    }

    /**
     * PATCH /reputation/recommendations/:id/read?brandId=xxx
     * Mark a recommendation as read.
     */
    @Patch('recommendations/:id/read')
    markInsightRead(
        @Param('id') id: string,
        @Query('brandId') brandId: string,
    ) {
        return this.reputationService.markInsightRead(id, brandId);
    }

    // ═══════════════════════════════════════════════════════════
    // ─── 4. FULLY DYNAMIC ROUTES (must come last) ──────────────
    // ═══════════════════════════════════════════════════════════

    /**
     * GET /reputation/reviews/:id
     * Must be declared AFTER all static and nested routes.
     */
    @Get('reviews/:id')
    getReviewById(@Param('id') id: string) {
        return this.reputationService.getReviewById(id);
    }

    /**
     * GET /reputation/customers/:id?brandId=xxx
     * Must be declared AFTER all static and nested routes.
     */
    @Get('customers/:id')
    getCustomerById(
        @Param('id') id: string,
        @Query('brandId') brandId: string,
    ) {
        return this.reputationService.getCustomerById(id, brandId);
    }

    // POST /reputation/leads/bulk
@Post('leads/bulk')
async createLeadsBulk(@Body() dto: CreateLeadsBulkDto) {
  return this.reputationService.createLeadsBulk(dto.leads);
}
}