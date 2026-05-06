import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsSeeder } from './analytics.seeder';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly analyticsSeeder: AnalyticsSeeder,
  ) {}

  @Get('dashboard')
  async getDashboard(@Query('dateRange') dateRange?: string) {
    return this.analyticsService.getDashboardMetrics(dateRange);
  }

  @Post('sync/meta')
  @UseGuards(AuthGuard('jwt'))
  async syncMeta(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.analyticsService.syncMetaInsights(userId);
  }

  @Post('sync/google')
  @UseGuards(AuthGuard('jwt'))
  async syncGoogle(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.analyticsService.syncGoogleInsights(userId);
  }

  @Post('sync/x')
  @UseGuards(AuthGuard('jwt'))
  async syncX(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.analyticsService.syncTwitterInsights(userId);
  }

  @Post('sync/linkedin')
  @UseGuards(AuthGuard('jwt'))
  async syncLinkedIn(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.analyticsService.syncLinkedInInsights(userId);
  }

  @Get('insights')
  @UseGuards(AuthGuard('jwt'))
  async getInsights(
    @Query('platform') platform: 'google' | 'meta',
    @Query('customerId') customerId: string,
    @Req() req: any,
  ) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.analyticsService.getAdInsights(platform, userId, customerId);
  }
}
