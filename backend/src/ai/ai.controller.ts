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
import { SemrushService } from './semrush.service';
import * as cheerio from 'cheerio';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly aiService: AiService,
    private readonly semrushService: SemrushService,
  ) {}

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

  @UseGuards(AuthGuard('jwt'))
  @Post('generate-templates')
  @HttpCode(HttpStatus.OK)
  async generateMessageTemplates(
    @Body() body: { channel: 'whatsapp' | 'email' | 'both'; businessName: string; productOrService: string; tone?: string; context?: string },
    @Request() req: any,
  ) {
    const { channel, businessName, productOrService, tone, context } = body;
    const templates = await this.aiService.generateMessageTemplates(
      channel,
      businessName,
      productOrService,
      tone,
      context,
    );

    return {
      success: true,
      data: templates,
      userId: req.user?.id,
    };
  }

  // ── SEO AUDIT ─────────────────────────────────────────────

  @UseGuards(AuthGuard('jwt'))
  @Post('seo-audit')
  @HttpCode(HttpStatus.OK)
  async runSeoAudit(@Body() body: { url: string }) {
    try {
      const startTime = Date.now();
      const targetUrl = body.url.startsWith('http') ? body.url : `https://${body.url}`;
      const domain = new URL(targetUrl).hostname.replace('www.', '');

      // 1. Existing Scrape
      const fetchResponse = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
        }
      });

      let meta = { title: '', description: '', h1: '', images: 0 };
      if (fetchResponse.ok) {
        const htmlText = await fetchResponse.text();
        const $ = cheerio.load(htmlText);
        meta = {
          title: $('title').text(),
          description: $('meta[name="description"]').attr('content') || '',
          h1: $('h1').first().text(),
          images: $('img').length
        };
      }

      const loadTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';

      // 2. Semrush Integration
      const [semrushOverview, semrushKeywords, semrushBacklinks, semrushCompetitors] = await Promise.all([
        this.semrushService.getDomainOverview(domain),
        this.semrushService.getOrganicKeywords(domain),
        this.semrushService.getBacklinksOverview(domain),
        this.semrushService.getOrganicCompetitors(domain),
      ]);

      // 3. Enhanced AI Analysis
      const prompt = `
        You are a senior SEO & Market Intelligence strategist. Analyze this data for ${domain}:
        
        ON-PAGE META:
        Title: ${meta.title}
        Description: ${meta.description}
        H1: ${meta.h1}
        
        SEMRUSH MARKET DATA:
        Authority Score: ${semrushBacklinks?.ascore || 'N/A'}
        Organic Traffic: ${semrushOverview?.Ot || 'N/A'}
        Organic Keywords: ${semrushOverview?.Or || 'N/A'}
        Backlinks: ${semrushBacklinks?.total || 'N/A'}
        Ref. Domains: ${semrushBacklinks?.domains_num || 'N/A'}
        
        TOP KEYWORDS:
        ${JSON.stringify(semrushKeywords)}
        
        COMPETITOR LANDSCAPE:
        ${JSON.stringify(semrushCompetitors)}
        
        Provide a concise, high-impact SEO audit report. Include:
        1. A brief situational analysis of their market position vs competitors.
        2. A 3-point technical fix list for on-page meta.
        3. A high-level growth strategy (Keyword expansion + Backlink opportunity).
      `;

      const aiResponse = await this.aiService.generateContent(prompt, 'Executive SEO Strategist');

      return {
        success: true,
        data: {
          meta,
          loadTime,
          semrush: {
            overview: semrushOverview,
            keywords: semrushKeywords,
            backlinks: semrushBacklinks,
            competitors: semrushCompetitors
          },
          ai: aiResponse
        }
      };
    } catch (error: any) {
      this.logger.error(`SEO Audit failed: ${error.message}`);
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
const title = $('title').text();
const metaDesc = $('meta[name="description"]').attr('content') || '';

scrapedContext = `
TITLE: ${title}
DESCRIPTION: ${metaDesc}

CONTENT:
${$('body').text().replace(/\s+/g, ' ').slice(0, 3000)}
`;
      
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