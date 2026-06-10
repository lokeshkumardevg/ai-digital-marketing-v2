import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { GoogleBusinessService } from './google-business.service';

@Controller('google-business')
export class GoogleBusinessController {
  constructor(
    private readonly googleBusinessService: GoogleBusinessService,
  ) {}

  // 🔐 OAuth callback -> get tokens
  @Post('oauth/token')
  async getTokens(@Body('code') code: string) {
    return this.googleBusinessService.getTokens(code);
  }

  // 🏢 Get accounts
  @Get('accounts')
  async getAccounts(@Query('accessToken') accessToken: string) {
    return this.googleBusinessService.getAccounts(accessToken);
  }

  // 📍 Get locations
  @Get('locations')
  async getLocations(
    @Query('accessToken') accessToken: string,
    @Query('accountId') accountId: string,
  ) {
    return this.googleBusinessService.getLocations(accessToken, accountId);
  }

  // ⭐ Get reviews
  @Get('reviews')
  async getReviews(
    @Query('accessToken') accessToken: string,
    @Query('accountId') accountId: string,
    @Query('locationId') locationId: string,
  ) {
    return this.googleBusinessService.getReviews(
      accessToken,
      accountId,
      locationId,
    );
  }

  // 💬 Reply to review
  @Post('reviews/reply')
  async reply(
    @Body()
    body: {
      accessToken: string;
      accountId: string;
      locationId: string;
      reviewId: string;
      comment: string;
    },
  ) {
    return this.googleBusinessService.replyToReview(
      body.accessToken,
      body.accountId,
      body.locationId,
      body.reviewId,
      body.comment,
    );
  }
}