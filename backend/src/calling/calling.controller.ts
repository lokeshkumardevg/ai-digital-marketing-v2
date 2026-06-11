import { Controller, Post, Body, Get, Param, Logger } from '@nestjs/common';
import { CallingService } from './calling.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Controller('calling')
export class CallingController {
  private readonly logger = new Logger(CallingController.name);

  constructor(private readonly callingService: CallingService) {}

  @Post('campaign')
  async createCampaign(@Body() dto: CreateCampaignDto) {
    this.logger.log(`Received request to create bulk calling campaign: ${dto.name}`);
    const campaign = await this.callingService.createCampaign(dto);
    return { success: true, campaign };
  }

  @Get('campaigns')
  async getCampaigns() {
    return this.callingService.getCampaigns();
  }

  @Get('campaigns/:id/records')
  async getCampaignRecords(@Param('id') campaignId: string) {
    return this.callingService.getCampaignRecords(campaignId);
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    // This endpoint receives POST requests from the Voice AI API (e.g. Bland.ai or Vapi)
    // when a call status changes or completes.
    await this.callingService.handleWebhook(body);
    return { success: true };
  }
}
