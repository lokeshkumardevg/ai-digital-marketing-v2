import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleBusinessService } from './google-business.service';

@Controller('google-business')
export class GoogleBusinessController {
  constructor(
    private readonly googleBusinessService: GoogleBusinessService,
  ) {}

  @Get('accounts')
  @UseGuards(AuthGuard('jwt'))
  getAccounts(@Request() req: any) {
    const userId = req.user.sub || req.user.userId || req.user._id;
    return this.googleBusinessService.getAccounts(userId);
  }

  @Get('locations')
  @UseGuards(AuthGuard('jwt'))
  getLocations(
    @Request() req: any,
    @Query('accountId') accountId: string,
  ) {
    const userId = req.user.sub || req.user.userId || req.user._id;
    return this.googleBusinessService.getLocations(userId, accountId);
  }

  @Get('reviews')
  @UseGuards(AuthGuard('jwt'))
  getReviews(
    @Request() req: any,
    @Query('accountId') accountId: string,
    @Query('locationId') locationId: string,
  ) {
    const userId = req.user.sub || req.user.userId || req.user._id;
    return this.googleBusinessService.getReviews(userId, accountId, locationId);
  }

  @Post('reviews/reply')
  @UseGuards(AuthGuard('jwt'))
  reply(
    @Request() req: any,
    @Body() body: {
      accountId: string;
      locationId: string;
      reviewId: string;
      comment: string;
    },
  ) {
    const userId = req.user.sub || req.user.userId || req.user._id;
    return this.googleBusinessService.replyToReview(
      userId,
      body.accountId,
      body.locationId,
      body.reviewId,
      body.comment,
    );
  }
}