import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../users/schemas/user.schema';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('insights')
  async getInsights(
    @Query('platform') platform: 'google' | 'meta',
    @Req() req: any,
  ) {
    return this.analyticsService.getAdInsights(platform, req.user.sub);
  }

  // Backward compatibility
  @Get('dashboard')
  async getDashboard() {
    return this.analyticsService.getDashboardMetrics();
  }
}

