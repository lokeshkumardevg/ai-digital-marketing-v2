import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { CampaignService } from './campaigns.service';

@Controller('campaign')
export class CampaignController {

  constructor(private readonly service: CampaignService) {}
  

 @Post('discover')
discover(@Body() body: { brandName: string; website: string }) {
  return this.service.discoverBrand(body);
}

  @Post('budget-breakdown')
budget(@Body() body : any) {
  return this.service.budgetBreakdown(body);
}

@Post('draft')
draft(@Body() body : any) {
  return this.service.createDraft(body);
}

@Post('publish/:id')
publish(@Param('id') id: string) {
  return this.service.publish(id);
}

@Get(':id/status')
status(@Param('id') id: string) {
  return this.service.getStatus(id);
}

@Get(':id/live-dashboard')
live(@Param('id') id: string) {
  return this.service.getLiveDashboard(id);
}

// ============================================
  // ✅ NEW SESSION APIs
  // ============================================

  // 🔹 RESTORE SESSION
  @Get('session/:userId')
  getSession(@Param('userId') userId: string) {
    return this.service.getSession(userId);
  }

  // 🔹 SAVE SESSION
  @Post('session/:userId')
  saveSession(
    @Param('userId') userId: string,
    @Body() body: any,
  ) {
    return this.service.saveSession(userId, body);
  }

  // 🔹 DELETE SESSION (RESET)
  @Delete('session/:userId')
  deleteSession(@Param('userId') userId: string) {
    return this.service.deleteSession(userId);
  }
  @Post('session/:userId/clear')
async clearSessionBeacon(@Param('userId') userId: string) {
  return this.service.deleteSession(userId);
}
}