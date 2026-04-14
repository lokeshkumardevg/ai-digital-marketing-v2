import { Controller, Post, Get, Body, HttpCode, HttpStatus, Logger, UseGuards, Request, Param, Delete, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('market-research')
  @HttpCode(HttpStatus.OK)
  async runMarketResearch(
    @Body() body: { url: string; brandName: string },
    @Request() req: any,
  ) {
    this.logger.log(`Market research request for: ${body.brandName}`);
    return this.aiService.runMarketResearch(body.url, body.brandName, req.user?.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('competitor-analysis')
  @HttpCode(HttpStatus.OK)
  async runCompetitorAnalysis(
    @Body() body: { url: string; brandName: string },
    @Request() req: any,
  ) {
    this.logger.log(`Competitor analysis request for: ${body.brandName}`);
    return this.aiService.runCompetitorAnalysis(body.url, body.brandName, req.user?.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('audience-insights')
  @HttpCode(HttpStatus.OK)
  async runAudienceInsights(
    @Body() body: { url: string; brandName: string },
    @Request() req: any,
  ) {
    this.logger.log(`Audience insights request for: ${body.brandName}`);
    return this.aiService.runAudienceInsights(body.url, body.brandName, req.user?.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('campaign-strategy')
  @HttpCode(HttpStatus.OK)
  async runCampaignStrategy(
    @Body() body: { url: string; brandName: string },
    @Request() req: any,
  ) {
    this.logger.log(`Campaign strategy request for: ${body.brandName}`);
    return this.aiService.runCampaignStrategy(body.url, body.brandName, req.user?.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('copy-generation')
  @HttpCode(HttpStatus.OK)
  async runCopyGeneration(
    @Body() body: { url: string; brandName: string },
    @Request() req: any,
  ) {
    this.logger.log(`Copy generation request for: ${body.brandName}`);
    return this.aiService.runCopyGeneration(body.url, body.brandName, req.user?.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('creative-testing')
  @HttpCode(HttpStatus.OK)
  async runCreativeTesting(
    @Body() body: { url: string; brandName: string },
    @Request() req: any,
  ) {
    this.logger.log(`Creative testing request for: ${body.brandName}`);
    return this.aiService.runCreativeTesting(body.url, body.brandName, req.user?.id);
  }

  /**
   * GET /ai/history - Fetch user's analysis history
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('history')
  @HttpCode(HttpStatus.OK)
  async getAnalysisHistory(
    @Query('limit') limit: string = '50',
    @Request() req: any,
  ) {
    this.logger.log(`Fetching analysis history for user: ${req.user?.id}`);
    const limitNum = Math.min(parseInt(limit) || 50, 100); // Cap at 100
    return this.aiService.getAnalysisHistory(req.user?.id, limitNum);
  }

  /**
   * DELETE /ai/history/:id - Delete a specific analysis
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete('history/:id')
  @HttpCode(HttpStatus.OK)
  async deleteAnalysis(
    @Param('id') analysisId: string,
    @Request() req: any,
  ) {
    this.logger.log(`Deleting analysis ${analysisId} for user: ${req.user?.id}`);
    await this.aiService.deleteAnalysis(analysisId, req.user?.id);
    return { success: true, message: 'Analysis deleted' };
  }
}