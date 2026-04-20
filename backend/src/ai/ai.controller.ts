import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
  Request,
  Param,
  Delete,
  Query
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service';
import * as cheerio from 'cheerio';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private readonly aiService: AiService) {}

  // ── GENERATE TEXT ─────────────────────────────────────────

  @UseGuards(AuthGuard('jwt'))
  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateText(@Body() body: { prompt: string; context?: string }, @Request() req: any) {
    const context = body.context || '';
    const result = await this.aiService.generateContent(body.prompt, context);

    return {
      success: true,
      data: result,
      userId: req.user?.id
    };
  }

  // ── SEO AUDIT ─────────────────────────────────────────────

  @UseGuards(AuthGuard('jwt'))
  @Post('seo-audit')
  @HttpCode(HttpStatus.OK)
  async runSeoAudit(@Body() body: { url: string }) {
    try {
      const startTime = Date.now();

      const response = await fetch(body.url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
        }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const htmlText = await response.text();
      const loadTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';

      const $ = cheerio.load(htmlText);

      const meta = {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        h1: $('h1').first().text(),
        images: $('img').length
      };

      const prompt = `Analyze SEO for ${body.url}`;

      const aiResponse = await this.aiService.generateContent(prompt, 'SEO expert');

      return {
        success: true,
        data: {
          meta,
          loadTime,
          ai: aiResponse
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ── BRAND PROFILE ─────────────────────────────────────────

  @UseGuards(AuthGuard('jwt'))
  @Post('brand-profile')
  @HttpCode(HttpStatus.OK)
  async runBrandProfile(@Body() body: { url: string; brandName: string }) {
    const { url, brandName } = body;

    let scrapedContext = '';

    try {
      const res = await fetch(url);
      const html = await res.text();
      const $ = cheerio.load(html);

      scrapedContext = $('body').text().slice(0, 2000);
    } catch {
      scrapedContext = `${brandName} ${url}`;
    }

    const profile = await this.aiService.generateBrandProfile(
      url,
      brandName,
      scrapedContext
    );

    return {
      success: true,
      data: profile
    };
  }

  // ── MARKET RESEARCH ───────────────────────────────────────

  @UseGuards(AuthGuard('jwt'))
  @Post('market-research')
  @HttpCode(HttpStatus.OK)
  async runMarketResearch(
    @Body() body: { url: string; brandName: string },
    @Request() req: any
  ) {
    this.logger.log(`Market research for ${body.brandName}`);

    return this.aiService.runMarketResearch(
      body.url,
      body.brandName,
      req.user?.id
    );
  }

  // ── COMPETITOR ANALYSIS ───────────────────────────────────

  @UseGuards(AuthGuard('jwt'))
  @Post('competitor-analysis')
  @HttpCode(HttpStatus.OK)
  async runCompetitorAnalysis(
    @Body() body: { url: string; brandName: string },
    @Request() req: any
  ) {
    return this.aiService.runCompetitorAnalysis(
      body.url,
      body.brandName,
      req.user?.id
    );
  }

  // ── AUDIENCE INSIGHTS ─────────────────────────────────────

  @UseGuards(AuthGuard('jwt'))
  @Post('audience-insights')
  @HttpCode(HttpStatus.OK)
  async runAudienceInsights(
    @Body() body: { url: string; brandName: string },
    @Request() req: any
  ) {
    return this.aiService.runAudienceInsights(
      body.url,
      body.brandName,
      req.user?.id
    );
  }

  // ── CAMPAIGN STRATEGY ─────────────────────────────────────

  @UseGuards(AuthGuard('jwt'))
  @Post('campaign-strategy')
  @HttpCode(HttpStatus.OK)
  async runCampaignStrategy(
    @Body() body: { url: string; brandName: string },
    @Request() req: any
  ) {
    return this.aiService.runCampaignStrategy(
      body.url,
      body.brandName,
      req.user?.id
    );
  }

  // ── COPY GENERATION ───────────────────────────────────────

  @UseGuards(AuthGuard('jwt'))
  @Post('copy-generation')
  @HttpCode(HttpStatus.OK)
  async runCopyGeneration(
    @Body() body: { url: string; brandName: string },
    @Request() req: any
  ) {
    return this.aiService.runCopyGeneration(
      body.url,
      body.brandName,
      req.user?.id
    );
  }

  // ── CREATIVE TESTING ──────────────────────────────────────

  @UseGuards(AuthGuard('jwt'))
  @Post('creative-testing')
  @HttpCode(HttpStatus.OK)
  async runCreativeTesting(
    @Body() body: { url: string; brandName: string },
    @Request() req: any
  ) {
    return this.aiService.runCreativeTesting(
      body.url,
      body.brandName,
      req.user?.id
    );
  }

  // ── HISTORY ───────────────────────────────────────────────

  @UseGuards(AuthGuard('jwt'))
  @Get('history')
  async getHistory(@Query('limit') limit: string, @Request() req: any) {
    return this.aiService.getAnalysisHistory(
      req.user?.id,
      Math.min(parseInt(limit) || 50, 100)
    );
  }

  // ── DELETE ────────────────────────────────────────────────

  @UseGuards(AuthGuard('jwt'))
  @Delete('history/:id')
  async delete(@Param('id') id: string, @Request() req: any) {
    await this.aiService.deleteAnalysis(id, req.user?.id);

    return {
      success: true
    };
  }
}