import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  async getCampaigns() {
    return this.campaignsService.getAllCampaigns();
  }

  @Post('auto-generate')
  async generateCampaign(@Body() body: { name: string; audienceId: string; platform: string; productUrl: string; baseBudget: number }) {
    return this.campaignsService.autoGenerateCampaign(body);
  }

  @Patch(':id/launch')
  async launchCampaign(@Param('id') campaignId: string) {
    return this.campaignsService.launchCampaign(campaignId);
  }
  @Post('deep-research')
  async deepResearch(@Body() body: { url: string }) {
    return this.campaignsService.deepResearch(body.url);
  }
}
