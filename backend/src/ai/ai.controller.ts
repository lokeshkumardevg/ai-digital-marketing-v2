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
import { UsersService } from '../users/users.service';
import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from '../brand/brand.schema';

@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly aiService: AiService,
    private readonly semrushService: SemrushService,
    private readonly usersService: UsersService,
    @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
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
  async runSeoAudit(@Body() body: { url: string }, @Request() req: any) {
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

      let semrushOverview: any = null;
      let semrushKeywords: any[] = [];
      let semrushBacklinks: any = null;
      let semrushCompetitors: any[] = [];
      let semrushTrafficSeries: any[] = [];
      let isGsc = false;

      try {
        if (req.user?.id) {
          const user = await this.usersService.findById(req.user.id);
          if (user) {
            const gscData = await this.semrushService.getGoogleSearchConsoleData(domain, user, this.usersService);
            if (gscData) {
              semrushOverview = gscData.overview;
              semrushKeywords = gscData.keywords;
              semrushBacklinks = gscData.backlinks;
              semrushCompetitors = gscData.competitors;
              semrushTrafficSeries = gscData.trafficSeries || [];
              isGsc = true;
              this.logger.log(`Using live Google Search Console data for domain ${domain}`);
            }
          }
        }
      } catch (err: any) {
        this.logger.error(`Failed to fetch GSC data, falling back to Semrush: ${err.message}`);
      }

      if (!isGsc) {
        // 2. Semrush Integration
        const [overview, keywords, backlinks, competitors] = await Promise.all([
          this.semrushService.getDomainOverview(domain),
          this.semrushService.getOrganicKeywords(domain),
          this.semrushService.getBacklinksOverview(domain),
          this.semrushService.getOrganicCompetitors(domain),
        ]);
        semrushOverview = overview;
        semrushKeywords = keywords || [];
        semrushBacklinks = backlinks;
        semrushCompetitors = competitors || [];
      }

      // 3. Enhanced AI Analysis
      const prompt = `
        You are a senior SEO & Market Intelligence strategist. Analyze this data for ${domain}:
        
        ON-PAGE META:
        Title: ${meta.title}
        Description: ${meta.description}
        H1: ${meta.h1}
        
        ${isGsc ? 'GOOGLE SEARCH CONSOLE LIVE DATA:' : 'SEMRUSH MARKET DATA:'}
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
            competitors: semrushCompetitors,
            trafficSeries: semrushTrafficSeries
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
  @Get('brand-profile')
  @HttpCode(HttpStatus.OK)
  async getBrandProfile(@Query('projectId') projectId: string, @Query('url') url: string) {
    if (!projectId) {
      return { success: false, error: 'projectId is required' };
    }

    const profile = await this.aiService.getBrandProfile(projectId);
    
    if (!profile) {
      return { success: false, data: null };
    }
    
    if (profile.url !== url) {
      // If the url changed, we invalidate it by returning null.
      // It will be overwritten on the next POST.
      return { success: false, data: null };
    }

    return {
      success: true,
      data: profile.data,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('brand-profile')
  @HttpCode(HttpStatus.OK)
  async runBrandProfile(@Body() body: { projectId: string; url: string; brandName: string }) {
    const { projectId, url, brandName } = body;
  async runBrandProfile(
    @Body() body: { url: string; brandName: string },
    @Request() req: any,
  ) {
    const { url, brandName } = body;

    let scrapedContext = '';

    let browser: any = null;
    let title = '';
    let metaDesc = '';
    let bodyText = '';
    let scrapedSuccessfully = false;

    // 1. Try Playwright first
    try {
      this.logger.log(`Manual Profile: Playwright scraping ${url}`);
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 });
      
      title = await page.title();
      metaDesc = await page.$eval('meta[name="description"]', (el: any) => el.getAttribute('content')).catch(() => '');
      bodyText = await page.evaluate(() => {
        const scripts = document.querySelectorAll('script, style, noscript, iframe, nav, footer');
        scripts.forEach(s => s.remove());
        return document.body.innerText || '';
      });

      scrapedSuccessfully = true;
      await browser.close();
    } catch (err: any) {
      this.logger.warn(`Playwright manual scrape failed: ${err.message}. Trying Axios fallback.`);
      if (browser) {
        try { await browser.close(); } catch {}
      }
    }

    // 2. Try Axios + Cheerio Fallback
    if (!scrapedSuccessfully) {
      try {
        const response = await axios.get(url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          }
        });
        const $ = cheerio.load(response.data);
        title = $('title').text() || '';
        metaDesc = $('meta[name="description"]').attr('content') || '';
        $('script, style, noscript, iframe, nav, footer').remove();
        bodyText = $('body').text() || '';
        scrapedSuccessfully = true;
      } catch (err: any) {
        this.logger.error(`Axios manual scrape fallback failed: ${err.message}`);
      }
    }

    if (scrapedSuccessfully) {
      scrapedContext = `
TITLE: ${title}
DESCRIPTION: ${metaDesc}

CONTENT:
${bodyText.replace(/\s+/g, ' ').slice(0, 3500)}
`;
    } else {
      scrapedContext = `${brandName} ${url}`;
    }

    const profile = await this.aiService.generateBrandProfile(
      url,
      brandName,
      scrapedContext
    );

    if (projectId && profile.success) {
      await this.aiService.saveBrandProfile(projectId, url, brandName, profile);
    }
    // Save generated profile to database
    const brandData = profile.data?.brand || profile;
    await this.brandModel.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { brandProfile: brandData } }
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