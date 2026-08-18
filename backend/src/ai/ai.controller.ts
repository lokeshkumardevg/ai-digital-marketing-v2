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

  @Post('generate-image')
  @UseGuards(AuthGuard('jwt'))
  async generateImage(@Body() body: { prompt: string }) {
    if (!body.prompt) {
      throw new Error('Prompt is required');
    }
    const result = await this.aiService.generateImage({
      prompt: body.prompt,
      size: '1024x1024'
    });
    return {
      success: true,
      url: result,
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

      // Start PageSpeed Insights API (Lighthouse) call in the background to run in parallel
      const lighthousePromise = (async () => {
        try {
          this.logger.log(`Fetching Lighthouse scores from PageSpeed Insights for ${targetUrl}`);
          const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(targetUrl)}&category=SEO&category=PERFORMANCE&category=ACCESSIBILITY&category=BEST_PRACTICES`;
          const psiResponse = await fetch(psiUrl);
          if (psiResponse.ok) {
            const psiData: any = await psiResponse.json();
            const categories = psiData?.lighthouseResult?.categories;
            if (categories) {
              this.logger.log(`Successfully fetched Lighthouse scores from PageSpeed Insights for ${domain}`);
              return {
                performance: Math.round((categories.performance?.score || 0) * 100),
                accessibility: Math.round((categories.accessibility?.score || 0) * 100),
                bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
                seo: Math.round((categories.seo?.score || 0) * 100),
              };
            }
          }
        } catch (err: any) {
          this.logger.warn(`Failed to fetch PageSpeed Insights Lighthouse scores: ${err.message}`);
        }
        return null;
      })();

      // 1. Playwright Scraping with Cheerio fallback
      let meta = { title: '', description: '', h1: '', images: 0, content: '' };
      let browser;
      try {
        this.logger.log(`Starting Playwright browser for scraping: ${targetUrl}`);
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        });
        const page = await context.newPage();
        await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 12000 });
        await page.waitForTimeout(2000); // Allow lazy-loaded content to render

        const title = await page.title();
        const description = await page.evaluate(() => {
          const el = document.querySelector('meta[name="description"]') || document.querySelector('meta[property="og:description"]');
          return el ? el.getAttribute('content') || '' : '';
        });
        const h1 = await page.evaluate(() => {
          const el = document.querySelector('h1');
          return el ? el.innerText || el.textContent || '' : '';
        });
        const imagesCount = await page.evaluate(() => {
          return document.querySelectorAll('img').length;
        });
        const bodyText = await page.evaluate(() => {
          const scriptTags = document.querySelectorAll('script, style, iframe, noscript');
          scriptTags.forEach(t => t.remove());
          return document.body.innerText || document.body.textContent || '';
        });

        meta = {
          title: title.trim(),
          description: description.trim(),
          h1: h1.trim(),
          images: imagesCount,
          content: bodyText.replace(/\s+/g, ' ').trim().substring(0, 5000)
        };
      } catch (err: any) {
        this.logger.warn(`Playwright scrape failed, falling back to cheerio/fetch: ${err.message}`);
        try {
          const fetchResponse = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
            }
          });
          if (fetchResponse.ok) {
            const htmlText = await fetchResponse.text();
            const $ = cheerio.load(htmlText);
            $('script, style, iframe, noscript').remove();
            const bodyText = $('body').text() || '';
            meta = {
              title: $('title').text().trim(),
              description: ($('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '').trim(),
              h1: ($('h1').first().text() || '').trim(),
              images: $('img').length,
              content: bodyText.replace(/\s+/g, ' ').trim().substring(0, 5000)
            };
          }
        } catch (_) {}
      } finally {
        if (browser) {
          await browser.close().catch(() => {});
        }
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

      // 3. Enhanced AI Analysis via FastAPI Python Agent
      let aiResponse: any = null;
      try {
        this.logger.log(`Invoking Python SEO Audit Agent for domain ${domain}`);
        const agentPayload = {
          domain,
          scrapedTitle: meta.title || '',
          scrapedMetaDesc: meta.description || '',
          scrapedH1: meta.h1 || '',
          scrapedContent: meta.content || '',
          authorityScore: String(semrushBacklinks?.ascore || 'N/A'),
          organicTraffic: String(semrushOverview?.Ot || 'N/A'),
          organicKeywords: String(semrushOverview?.Or || 'N/A'),
          backlinks: String(semrushBacklinks?.total || 'N/A'),
          refDomains: String(semrushBacklinks?.domains_num || 'N/A'),
          topKeywords: semrushKeywords || [],
          competitors: semrushCompetitors || []
        };

        const agentServerUrl = process.env.AGENT_SERVER_URL || 'http://localhost:8003';
        const agentResponse = await fetch(`${agentServerUrl}/api/v1/seo-audit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(agentPayload)
        });

        if (!agentResponse.ok) {
          throw new Error(`Agent server returned status ${agentResponse.status}`);
        }

        aiResponse = await agentResponse.json();
      } catch (agentErr: any) {
        this.logger.error(`Python SEO Agent failed, falling back to local basic generation: ${agentErr.message}`);
        // Fallback to plain prompt analysis if FastAPI fails
        const fallbackPrompt = `
          You are a senior SEO strategist. Analyze this data for ${domain}:
          Title: ${meta.title}
          Description: ${meta.description}
          H1: ${meta.h1}
          Scraped Content: ${meta.content}
          Authority Score: ${semrushBacklinks?.ascore}
          Organic Traffic: ${semrushOverview?.Ot}
          Keywords: ${JSON.stringify(semrushKeywords)}
          
          Provide:
          1. Situation overview.
          2. On-page recommendations.
          3. Topics and competitor keyword gaps.
          
          Return as a valid JSON object matching:
          {
            "executiveStrategy": "...",
            "metaGenerator": { "suggestedTitle": "...", "suggestedDescription": "...", "seoReasoning": "..." },
            "contentGap": [ { "topic": "...", "competitorSource": "Competitor", "importance": "High", "description": "..." } ],
            "articleRecommendations": [ { "title": "...", "keywords": ["..."], "targetAudience": "...", "outline": "..." } ]
          }
        `;
        try {
          aiResponse = await this.aiService.generateContent(fallbackPrompt, 'Executive SEO Strategist', {
            name: 'seo_audit_analysis',
            schema: {
              type: 'object',
              properties: {
                executiveStrategy: { type: 'string' },
                metaGenerator: {
                  type: 'object',
                  properties: {
                    suggestedTitle: { type: 'string' },
                    suggestedDescription: { type: 'string' },
                    seoReasoning: { type: 'string' }
                  },
                  required: ['suggestedTitle', 'suggestedDescription', 'seoReasoning'],
                  additionalProperties: false
                },
                contentGap: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      topic: { type: 'string' },
                      competitorSource: { type: 'string' },
                      importance: { type: 'string' },
                      description: { type: 'string' }
                    },
                    required: ['topic', 'competitorSource', 'importance', 'description'],
                    additionalProperties: false
                  }
                },
                articleRecommendations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      keywords: { type: 'array', items: { type: 'string' } },
                      targetAudience: { type: 'string' },
                      outline: { type: 'string' }
                    },
                    required: ['title', 'keywords', 'targetAudience', 'outline'],
                    additionalProperties: false
                  }
                }
              },
              required: ['executiveStrategy', 'metaGenerator', 'contentGap', 'articleRecommendations'],
              additionalProperties: false
            }
          });
        } catch (fbErr: any) {
          this.logger.error(`AI local fallback also failed: ${fbErr.message}`);
          aiResponse = {
            executiveStrategy: "Failed to load audit analysis. Please check your AI agent services.",
            metaGenerator: { suggestedTitle: meta.title || "Optimized Title", suggestedDescription: meta.description || "Optimized Description", seoReasoning: "No reasoning available due to agent service error." },
            contentGap: [],
            articleRecommendations: []
          };
        }
      }

      let lighthouseScores = await lighthousePromise;
      if (!lighthouseScores) {
        this.logger.log(`Calculating dynamic Lighthouse fallback scores for ${domain}`);
        const responseTimeSeconds = parseFloat(loadTime || '0.5');
        const calculatedPerformance = Math.max(45, Math.round(100 - (responseTimeSeconds * 12) - (meta.images > 10 ? 8 : 0)));
        
        const hasTitle = !!meta.title;
        const optimalTitleLen = meta.title && meta.title.length >= 10 && meta.title.length <= 60;
        const hasDesc = !!meta.description;
        const optimalDescLen = meta.description && meta.description.length >= 50 && meta.description.length <= 160;
        const hasH1 = !!meta.h1;
        
        let calculatedSeo = 100;
        if (!hasTitle) calculatedSeo -= 25;
        else if (!optimalTitleLen) calculatedSeo -= 10;
        if (!hasDesc) calculatedSeo -= 25;
        else if (!optimalDescLen) calculatedSeo -= 10;
        if (!hasH1) calculatedSeo -= 15;
        calculatedSeo = Math.max(40, calculatedSeo);

        const isHttps = targetUrl.startsWith('https://');
        const calculatedBestPractices = Math.max(60, 100 - (isHttps ? 0 : 20) - (meta.images > 15 ? 10 : 0));
        const calculatedAccessibility = Math.max(55, 100 - (meta.images * 2.5 > 30 ? 30 : Math.round(meta.images * 2.5)));

        lighthouseScores = {
          performance: calculatedPerformance,
          accessibility: calculatedAccessibility,
          bestPractices: calculatedBestPractices,
          seo: calculatedSeo
        };
      }

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
          ai: aiResponse,
          lighthouseScores
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
  async runBrandProfile(
    @Body() body: { projectId: string; url: string; brandName: string },
    @Request() req: any,
  ) {
    const { projectId, url, brandName } = body;

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
      metaDesc = await page
        .$eval('meta[name="description"]', (el: any) => el.getAttribute('content'))
        .catch(() => '');
      bodyText = await page.evaluate(() => {
        const scripts = document.querySelectorAll('script, style, noscript, iframe, nav, footer');
        scripts.forEach((s) => s.remove());
        return document.body.innerText || '';
      });

      scrapedSuccessfully = true;
    } catch (err: any) {
      this.logger.warn(`Playwright manual scrape failed: ${err.message}. Trying Axios fallback.`);
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch {
          // ignore close errors
        }
      }
    }

    // 2. Try Axios + Cheerio Fallback
    if (!scrapedSuccessfully) {
      try {
        const response = await axios.get(url, {
          timeout: 10000,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
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
    if (req.user?.id) {
      const brandData = profile.data?.brand || profile;
      await this.brandModel.findOneAndUpdate(
        { userId: req.user.id },
        { $set: { brandProfile: brandData } }
      );
    }

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

  // ── KEYWORD RESEARCH ──────────────────────────────────────

  @UseGuards(AuthGuard('jwt'))
  @Post('keyword-research')
  @HttpCode(HttpStatus.OK)
  async runKeywordResearch(
    @Body() body: { url: string; brandName: string; industry?: string },
    @Request() req: any
  ) {
    this.logger.log(`Keyword research for ${body.brandName}`);
    return this.aiService.runKeywordResearch(
      body.url,
      body.brandName,
      body.industry,
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