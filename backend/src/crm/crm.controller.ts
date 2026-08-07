import { Controller, Post, Body, Get, Param, Patch, Query, UseGuards, Req } from '@nestjs/common';
import { CrmService } from './crm.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('crm')
@UseGuards(AuthGuard('jwt'))
export class CrmController {
  constructor(
    private readonly crmService: CrmService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get('dashboard')
  async getCrmDashboard(@Req() req: any, @Query('dateRange') dateRange?: string) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.analyticsService.getDashboardMetrics(userId, dateRange);
  }

  @Post('contact')
  async createContact(@Body() body: any, @Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.crmService.createContact({ ...body, userId });
  }

  @Get('contacts')
  async getContacts(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.crmService.getAllContacts(userId);
  }

  @Post('audience/generate')
  async generateAiAudience(@Body('goal') goal: string, @Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.crmService.generateAiAudience(goal, userId);
  }

  @Get('audiences')
  async getAudiences(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.crmService.getAudiences(userId);
  }

  @Patch('contact/:id/score')
  async scoreLead(@Param('id') contactId: string, @Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.crmService.scoreLead(contactId, userId);
  }
}
