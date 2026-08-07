import { Controller, Post, Body, Get, Param, Logger, UseGuards, Req } from '@nestjs/common';
import { CallingService } from './calling.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('calling')
export class CallingController {
  private readonly logger = new Logger(CallingController.name);

  constructor(private readonly callingService: CallingService) {}

  @Post('campaign')
  @UseGuards(AuthGuard('jwt'))
  async createCampaign(@Body() dto: CreateCampaignDto, @Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    this.logger.log(`Received request to create bulk calling campaign: ${dto.name} by user: ${userId}`);
    const campaign = await this.callingService.createCampaign({ ...dto, userId });
    return { success: true, campaign };
  }

  @Get('campaigns')
  @UseGuards(AuthGuard('jwt'))
  async getCampaigns(@Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.callingService.getCampaigns(userId);
  }

  @Get('campaigns/:id/records')
  @UseGuards(AuthGuard('jwt'))
  async getCampaignRecords(@Param('id') campaignId: string, @Req() req: any) {
    const userId = req.user?.id ?? req.user?.sub;
    return this.callingService.getCampaignRecords(campaignId, userId);
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    // This endpoint receives POST requests from the Voice AI API (e.g. Bland.ai or Vapi)
    // when a call status changes or completes. Webhook remains public.
    await this.callingService.handleWebhook(body);
    return { success: true };
  }
}
