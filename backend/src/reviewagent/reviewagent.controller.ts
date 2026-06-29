import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ReviewAgentService } from './reviewagent.service';

@Controller()
export class ReviewAgentController {
  constructor(private readonly reviewAgentService: ReviewAgentService) {}

  @Get()
  home() {
    return { message: 'Review Agents API is running' };
  }

  @Get('check')
  check() {
    return this.reviewAgentService.checkCounts();
  }

  // ─── Agent 1 · GOOGLE ────────────────────────────────────────────────────

  // (bulk) generate replies for all pending Google reviews
  @Post('generate-reviews')
  generateReviews() {
    return this.reviewAgentService.generateGoogleReviews();
  }

  // (single) generate / re-generate reply for one Google review
  @Post('generate-reply/:id')
  generateReply(@Param('id') id: string) {
    return this.reviewAgentService.generateSingleGoogleReply(id);
  }

  // ─── Agent 1 · META ──────────────────────────────────────────────────────

  // (bulk) generate replies for all unprocessed Meta comments
  @Post('generate-meta-replies')
  generateMetaReplies() {
    return this.reviewAgentService.generateMetaReplies();
  }

  // (single) generate / re-generate reply for one specific Meta comment
  @Post('generate-meta-reply/:postId/:commentId')
  generateMetaReply(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.reviewAgentService.generateSingleMetaReply(postId, commentId);
  }

  // ─── Agent 1 · BOTH SOURCES ──────────────────────────────────────────────

  // (bulk) generate replies for Google + Meta together
  @Post('generate-all-replies')
  generateAllReplies() {
    return this.reviewAgentService.generateReviews('all');
  }

  // ─── Agent 2 ─────────────────────────────────────────────────────────────

  // analyze sentiment / issues / recommendations for low-rated Google reviews
  @Get('analyze-comments')
  analyzeComments() {
    return this.reviewAgentService.analyzeComments();
  }

  // fetch all saved recommendations  · optional: ?brandId=...&userId=...
  @Get('recommendations')
  getAllRecommendations(
    @Query('brandId') brandId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.reviewAgentService.getAllRecommendations(brandId, userId);
  }

  // ─── Run both agents ─────────────────────────────────────────────────────

  @Post('run-all')
  runAll() {
    return this.reviewAgentService.runAll();
  }
}