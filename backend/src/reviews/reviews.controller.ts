import {
  Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
@UseGuards(AuthGuard('jwt'))
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // GET /reviews?brandId=&platform=&sentiment=&status=&page=&limit=
  @Get()
  async getReviews(@Query() query: any) {
    return this.reviewsService.getReviews(query);
  }

  // GET /reviews/dashboard/stats?brandId=
  @Get('dashboard/stats')
  async getDashboardStats(@Query('brandId') brandId: string) {
    return this.reviewsService.getDashboardStats(brandId);
  }

  // POST /reviews/seed — seed mock data for demo
  @Post('seed')
  async seedMockReviews(@Body('brandId') brandId: string) {
    return this.reviewsService.seedMockReviews(brandId || 'demo');
  }

  // POST /reviews/:id/generate-reply
  @Post(':id/generate-reply')
  async generateAiReply(@Param('id') id: string) {
    return this.reviewsService.generateAiReply(id);
  }

  // PUT /reviews/:id/publish-reply
  @Put(':id/publish-reply')
  async publishReply(@Param('id') id: string, @Body('replyText') replyText: string) {
    return this.reviewsService.publishReply(id, replyText);
  }

  // PATCH /reviews/:id/resolve
  @Patch(':id/resolve')
  async markResolved(@Param('id') id: string) {
    return this.reviewsService.markResolved(id);
  }

  // POST /reviews/:id/analyze
  @Post(':id/analyze')
  async analyzeSentiment(@Param('id') id: string) {
    return this.reviewsService.analyzeSentiment(id);
  }
}
