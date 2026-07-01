import { Controller, Post, Body, Get, Param, Patch, Query, UseGuards, Req } from '@nestjs/common';
import { CrmService } from './crm.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('crm')
export class CrmController {
  constructor(
    private readonly crmService: CrmService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get('dashboard')
  @UseGuards(AuthGuard('jwt'))
  async getCrmDashboard(@Req() req: any, @Query('dateRange') dateRange?: string) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.analyticsService.getDashboardMetrics(userId, dateRange);
  }

  @Post('contact')
  async createContact(@Body() body: any) {
    return this.crmService.createContact(body);
  }

  @Get('contacts')
  async getContacts() {
    return this.crmService.getAllContacts();
  }

  @Post('audience/generate')
  async generateAiAudience(@Body('goal') goal: string) {
    return this.crmService.generateAiAudience(goal);
  }

  @Get('audiences')
  async getAudiences() {
    return this.crmService.getAudiences();
  }

  @Patch('contact/:id/score')
  async scoreLead(@Param('id') contactId: string) {
    return this.crmService.scoreLead(contactId);
  }
}
