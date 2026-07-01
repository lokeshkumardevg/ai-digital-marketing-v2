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
  @UseGuards(AuthGuard('jwt'))
  async getDashboard(@Req() req: any, @Query('dateRange') dateRange?: string) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.analyticsService.getDashboardMetrics(userId, dateRange);
  }

  @Post('disconnect/meta')
  @UseGuards(AuthGuard('jwt'))
  async disconnectMeta(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.analyticsService.disconnectMeta(userId);
  }

  @Post('disconnect/google')
  @UseGuards(AuthGuard('jwt'))
  async disconnectGoogle(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.analyticsService.disconnectGoogle(userId);
  }

  @Post('disconnect/x')
  @UseGuards(AuthGuard('jwt'))
  async disconnectX(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.analyticsService.disconnectTwitter(userId);
  }

  @Post('disconnect/linkedin')
  @UseGuards(AuthGuard('jwt'))
  async disconnectLinkedIn(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.analyticsService.disconnectLinkedIn(userId);
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
