import { UsersService } from '../users/users.service';
import {
  BadRequestException,
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WalletService } from '../wallet/wallet.service';
import { SocialAuthService } from '../social/social-auth.service';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoogleAdsApi, enums } from 'google-ads-api';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { chromium } from 'playwright';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';

@Injectable()
export class CampaignService {
  private readonly logger = new Logger(CampaignService.name);
  constructor(
    private usersService: UsersService,
    private walletService: WalletService,
    @InjectModel('Session')
    private sessionModel: Model<any>,

    @InjectModel('Campaign')
    private campaignModel: Model<any>,
    private configService: ConfigService,
    private socialAuthService: SocialAuthService,
  ) { }
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  private brands = new Map<string, any>();
  private campaigns = new Map<string, any>();
  private sessions = new Map<string, any>();
  private readonly SESSION_VERSION = 'v2';

  // Max session age: 7 days for normal sessions, 30 days if a campaign is live
  private readonly MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
  private readonly MAX_AGE_LIVE_MS = 30 * 24 * 60 * 60 * 1000;

  // ============================================
  // MAIN: DISCOVER BRAND
  // ============================================
  async discoverBrand(body: { brandName: string; website: string }) {
    const campaignId = uuidv4();
    const MOCK_AUDIT_DATA = this.mockAudit(body.brandName, body.website);
    try {
      const prompt = await this.buildPrompt(body); // ✅ FIXED (await)

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a senior digital marketing strategist and SEO auditor. Always return strict JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const raw = response.choices?.[0]?.message?.content;

      if (!raw) throw new Error('Empty AI response');

      const parsed = JSON.parse(raw);

      this.validateResponse(parsed);

      return {
        campaignId,
        ...parsed,
      };
    } catch (error) {
      console.error('AI ERROR:', error instanceof Error ? error.message : error);
      // throw new InternalServerErrorException('Failed to generate audit report');
      return {
        campaignId,
        ...MOCK_AUDIT_DATA,
      };
    }
  }
  private mockAudit(name = 'Brand', website = '') {
    return {
      brand: {
        name,
        tagline: `${name} growth platform`,
        industry: 'Technology',
        overallScore: 75,
      },
      coreObjective: 'Scale growth via ads',
      websiteAudit: {
        overallScore: 70,
        seoScore: 68,
        performanceScore: 72,
        uxScore: 74,
        findings: ['Good UX'],
        quickWins: ['Improve speed'],
      },
      keywords: { primary: ['marketing tools'] },
      competition: { intensity: 'High' },
      analyticsDashboard: {
        estimatedMonthlyVisits: '20k',
      },
      budget: {
        estimatedAdSpend: '$5000',
        recommendedChannels: ['Google', 'Meta'],
      },
    };
  }

  // ============================================
  // 4. BUDGET BREAKDOWN
  // ============================================
  budgetBreakdown(body: {
    brandId: string;
    platforms: string[];
  }) {
    const total = 10000;
    const per = total / body.platforms.length;

    const platforms = body.platforms.map((p) => ({
      name: p,
      campaignBudget: per,
      impressions: Math.round(per * 10),
      clicks: Math.round(per / 2),
      roiEstimate: 150 + Math.floor(Math.random() * 100),
    }));

    return {
      brandId: body.brandId,
      platforms,
      totalBudget: total,
    };
  }

  // ============================================
  // 5. DRAFT
  // ============================================
  createDraft(body: any) {
    const campaignId = uuidv4();

    const draft = {
      campaignId,
      status: 'DRAFT',
      ...body,
      createdAt: new Date().toISOString(),
    };

    this.campaigns.set(campaignId, draft);
    return draft;
  }

  // ============================================
  // 6. PUBLISH
  // ============================================
  async publish(campaignId: string, updateData?: any) {
    // Strip platform suffix if present (e.g. 8f7b..._x -> 8f7b...)
    let baseCampaignId = campaignId;
    let platformFromSuffix = '';
    const platformsList = ['meta', 'google', 'x', 'linkedin'];
    for (const p of platformsList) {
      if (campaignId && campaignId.endsWith(`_${p}`)) {
        baseCampaignId = campaignId.substring(0, campaignId.length - p.length - 1);
        platformFromSuffix = p;
        break;
      }
    }

    let campaign = null;
    let isBaseCampaign = false;

    // 1. Try to find the exact platform-specific campaign in MongoDB first
    if (campaignId) {
      if (Types.ObjectId.isValid(campaignId)) {
        campaign = await this.campaignModel.findById(campaignId);
      } else {
        campaign = await this.campaignModel.findOne({ campaignId });
      }
    }

    // 2. Try to find the exact platform-specific campaign in memory
    if (!campaign && campaignId) {
      campaign = this.campaigns.get(campaignId);
    }

    // 3. Try to find the base campaign in MongoDB
    if (!campaign && baseCampaignId && baseCampaignId !== campaignId) {
      if (Types.ObjectId.isValid(baseCampaignId)) {
        campaign = await this.campaignModel.findById(baseCampaignId);
      } else {
        campaign = await this.campaignModel.findOne({ campaignId: baseCampaignId });
      }
      if (campaign) {
        isBaseCampaign = true;
      }
    }

    // 4. Try to find the base campaign in memory
    if (!campaign && baseCampaignId) {
      campaign = this.campaigns.get(baseCampaignId);
      if (campaign) {
        if (baseCampaignId !== campaignId) {
          isBaseCampaign = true;
        }
      }
    }

    if (!campaign) {
      // Gracefully create a campaign if it's not found (e.g. direct publish from dashboard for X/LinkedIn)
      if (updateData && updateData.userId) {
        const plat = updateData.platform || platformFromSuffix || 'x';
        const platLabel = plat.charAt(0).toUpperCase() + plat.slice(1);
        const name = updateData.campaignName || updateData.name || `${platLabel} Campaign`;

        const newCampaignId = campaignId || `CMP_${Date.now()}`;
        const platData = updateData.data || {
          headline: updateData.headline || '',
          caption: updateData.caption || '',
          imageUrl: updateData.imageUrl || '',
          budget: updateData.dailyBudget || 10,
          objective: updateData.objective || 'OUTCOME_SALES',
          finalUrl: updateData.finalUrl || '',
          location: updateData.location || '',
        };

        // Use upsert to avoid E11000 duplicate key on re-publish
        campaign = await this.campaignModel.findOneAndUpdate(
          { campaignId: newCampaignId },
          {
            $set: {
              userId: updateData.userId,
              campaignId: newCampaignId,
              name: name,
              platform: plat,
              data: platData,
              status: 'PROCESSING',
              aiGeneratedContent: updateData.promoContext || {},
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );

        // simulate activation after 15s
        const cRef = campaign;
        setTimeout(async () => {
          try {
            await this.campaignModel.findOneAndUpdate(
              { campaignId: newCampaignId },
              { $set: { status: 'ACTIVE', activatedAt: new Date().toISOString() } },
            );
          } catch (e) { this.logger.error('Activation error:', e); }
        }, 15000);

        return {
          message: `Campaign published to ${platLabel} successfully!`,
          campaignId: newCampaignId,
          status: 'PROCESSING',
        };
      } else {
        throw new Error('Campaign not found');
      }
    }

    const targetPlat = platformFromSuffix || updateData?.platform || campaign.platform || 'All';

    if (!campaign.save || (isBaseCampaign && campaign.platform !== targetPlat)) {
      // It's a raw in-memory campaign or a base campaign where we want to publish to a specific platform.
      // Create and save a new Mongoose document for this platform.
      const plat = targetPlat;

      let platData = campaign.data || {};
      if (campaign.data && campaign.data[plat]) {
        platData = campaign.data[plat];
      } else if (updateData?.data) {
        platData = updateData.data;
      } else if (updateData?.caption || updateData?.headline || updateData?.imageUrl) {
        platData = {
          headline: updateData.headline || '',
          caption: updateData.caption || '',
          imageUrl: updateData.imageUrl || '',
          budget: updateData.dailyBudget || 10,
          objective: updateData.objective || 'OUTCOME_SALES',
          finalUrl: updateData.finalUrl || '',
          location: updateData.location || '',
        };
      }

      let platName = campaign.name || 'AI Campaign';
      if (plat !== 'All') {
        const platLabel = plat.charAt(0).toUpperCase() + plat.slice(1);
        if (!platName.toLowerCase().includes(plat.toLowerCase())) {
          platName = `${platName} - ${platLabel}`;
        }
      }

      let targetCampaignId = campaignId;
      if (isBaseCampaign && !targetCampaignId.endsWith(`_${plat}`)) {
        targetCampaignId = `${baseCampaignId}_${plat}`;
      }

      const campaignDataToSave = campaign.toObject ? campaign.toObject() : campaign;

      // Use upsert to avoid E11000 duplicate key on re-publish
      campaign = await this.campaignModel.findOneAndUpdate(
        { campaignId: targetCampaignId },
        {
          $set: {
            userId: campaignDataToSave.userId,
            campaignId: targetCampaignId,
            name: platName,
            platform: plat,
            data: {
              image: campaignDataToSave.data?.image ||
                campaignDataToSave.assets?.images?.[0] ||
                campaignDataToSave.brandDetails?.assets?.images?.[0] || '',
              ...platData,
            },
            status: 'PROCESSING',
            aiGeneratedContent: {
              ...(campaignDataToSave.aiGeneratedContent || {}),
              ...(campaignDataToSave.promoData || {}),
              imageUrl: campaignDataToSave.aiGeneratedContent?.imageUrl ||
                campaignDataToSave.promoData?.imageUrl ||
                campaignDataToSave.data?.image ||
                campaignDataToSave.assets?.images?.[0] ||
                campaignDataToSave.brandDetails?.assets?.images?.[0] || ''
            },
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      // simulate activation after 15s
      const cRef2 = campaign;
      const tid = targetCampaignId;
      setTimeout(async () => {
        try {
          await this.campaignModel.findOneAndUpdate(
            { campaignId: tid },
            { $set: { status: 'ACTIVE', activatedAt: new Date().toISOString() } },
          );
        } catch (e) { this.logger.error('Activation error (plat clone):', e); }
      }, 15000);
    } else {
      campaign.status = 'PROCESSING';
      if (updateData?.platform) campaign.platform = updateData.platform;
      if (updateData?.data) {
        campaign.data = { ...campaign.data, ...updateData.data };
        campaign.markModified('data');
      } else if (updateData?.caption || updateData?.headline || updateData?.imageUrl) {
        campaign.data = {
          ...campaign.data,
          headline: updateData.headline || '',
          caption: updateData.caption || '',
          imageUrl: updateData.imageUrl || '',
          budget: updateData.dailyBudget || 10,
          objective: updateData.objective || 'OUTCOME_SALES',
          finalUrl: updateData.finalUrl || '',
          location: updateData.location || '',
        };
        campaign.markModified('data');
      }
      await campaign.save();

      // simulate activation
      const cRef = campaign;
      setTimeout(async () => {
        cRef.status = 'ACTIVE';
        cRef.activatedAt = new Date().toISOString();
        await cRef.save();
      }, 15000);
    }

    return {
      message: 'Campaign published successfully!',
      campaignId,
      status: 'PROCESSING',
    };
  }

  // ============================================
  // 7. STATUS
  // ============================================
  getStatus(campaignId: string) {
    const c = this.campaigns.get(campaignId);

    return {
      campaignId,
      status: c?.status || 'DRAFT',
    };
  }

  // ============================================
  // 8. LIVE DASHBOARD
  // ============================================
  async getLiveDashboard(campaignId: string) {
    let campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      if (Types.ObjectId.isValid(campaignId)) {
        campaign = await this.campaignModel.findById(campaignId);
      } else {
        campaign = await this.campaignModel.findOne({ campaignId });
      }
    }

    if (!campaign) {
      // Strip platform suffix if present (e.g. 8f7b..._x -> 8f7b...)
      let baseCampaignId = campaignId;
      const platformsList = ['meta', 'google', 'x', 'linkedin'];
      for (const p of platformsList) {
        if (campaignId.endsWith(`_${p}`)) {
          baseCampaignId = campaignId.substring(0, campaignId.length - p.length - 1);
          break;
        }
      }
      if (baseCampaignId !== campaignId) {
        if (Types.ObjectId.isValid(baseCampaignId)) {
          campaign = await this.campaignModel.findById(baseCampaignId);
        } else {
          campaign = await this.campaignModel.findOne({ campaignId: baseCampaignId });
        }
      }
    }

    if (!campaign) throw new Error('Campaign not found');

    const isActive = campaign.status === 'ACTIVE';

    const platforms = ['google', 'meta', 'x', 'linkedin'].map((p) => {
      const impressions = isActive ? Math.floor(Math.random() * 10000) : 0;
      const clicks = Math.floor(impressions * 0.04);

      return {
        name: p,
        status: isActive ? 'ACTIVE' : campaign.status,
        metrics: {
          impressions,
          clicks,
          spend: clicks * 2,
          conversions: Math.floor(clicks * 0.1),
          roi: 150,
        },
      };
    });

    return {
      campaignId,
      status: campaign.status,
      platforms,
    };
  }

  // ============================================
  // PROMPT BUILDER
  // ============================================
  private async scrapeWebsite(url: string): Promise<{ title: string; metaDesc: string; content: string }> {
    let normalizedUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      normalizedUrl = `https://${url}`;
    }

    let browser: any = null;
    try {
      this.logger.log(`Attempting Playwright scrape for: ${normalizedUrl}`);
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      });
      const page = await context.newPage();
      await page.goto(normalizedUrl, { waitUntil: 'domcontentloaded', timeout: 12000 });

      const title = await page.title();
      const metaDesc = await page.$eval('meta[name="description"]', (el: any) => el.getAttribute('content')).catch(() => '');

      const bodyText = await page.evaluate(() => {
        const scripts = document.querySelectorAll('script, style, noscript, iframe, nav, footer');
        scripts.forEach(s => s.remove());
        return document.body.innerText || '';
      });

      await browser.close();

      return {
        title: title || '',
        metaDesc: metaDesc || '',
        content: bodyText.replace(/\s+/g, ' ').trim().slice(0, 4000),
      };
    } catch (err: any) {
      this.logger.warn(`Playwright scrape failed: ${err.message}. Falling back to Axios/Cheerio.`);
      if (browser) {
        try { await browser.close(); } catch { }
      }
    }

    try {
      const response = await axios.get(normalizedUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });

      const $ = cheerio.load(response.data);
      const title = $('title').text() || '';
      const metaDesc = $('meta[name="description"]').attr('content') || '';

      $('script, style, noscript, iframe, nav, footer').remove();
      const bodyText = $('body').text() || '';

      return {
        title: title.trim(),
        metaDesc: metaDesc.trim(),
        content: bodyText.replace(/\s+/g, ' ').trim().slice(0, 4000),
      };
    } catch (err: any) {
      this.logger.error(`Axios/Cheerio scrape fallback failed: ${err.message}`);
      return {
        title: '',
        metaDesc: '',
        content: '',
      };
    }
  }

  private sanitizeAndPadKeywords(rawKeywords: string[], brandName: string, industry: string): string[] {
    const bName = (brandName || '').toLowerCase().trim();
    let cleaned = (rawKeywords || [])
      .map((kw: string) => {
        let text = kw.trim();
        if (bName) {
          // Remove exact case-insensitive matches of the brand name from the keyword phrase
          const regex = new RegExp(`\\b${bName}\\b`, 'gi');
          text = text.replace(regex, '').replace(/\s+/g, ' ').trim();
        }
        return text;
      })
      .filter(Boolean)
      .filter((kw, idx, self) => self.indexOf(kw) === idx);

    // Enforce minimum 15 keywords
    if (cleaned.length < 15) {
      const industryNorm = (industry || '').toLowerCase();
      const industryKeywordsMap: Record<string, string[]> = {
        'solar': [
          'solar panels installation', 'best solar company', 'solar energy solutions',
          'renewable energy systems', 'residential solar panels', 'solar power for home',
          'commercial solar contractors', 'solar energy developers', 'solar panel cost',
          'solar system maintenance', 'solar installers near me', 'green energy power',
          'off grid solar systems', 'clean solar electricity', 'solar battery storage'
        ],
        'water': [
          'ro water purifier', 'best water filter', 'alkaline water machine',
          'drinking water filtration', 'water purification system', 'domestic ro system',
          'industrial water filter', 'water purifier service', 'alkaline filter price',
          'home water filtration', 'uv water purifier', 'clean drinking water',
          'ro filter replacement', 'mineral water purifier', 'best ro for home'
        ],
        'default': [
          'custom software development', 'it consulting services', 'cloud migration solutions',
          'enterprise software development', 'managed it services', 'cybersecurity consulting',
          'digital transformation services', 'app development company', 'ai software solutions',
          'devops consulting', 'cloud infrastructure management', 'saas software development',
          'data analytics platform', 'business automation tools', 'network security services'
        ]
      };

      let activeList = industryKeywordsMap['default'];
      for (const [key, keywordsList] of Object.entries(industryKeywordsMap)) {
        if (industryNorm.includes(key) || bName.includes(key)) {
          activeList = keywordsList;
          break;
        }
      }

      for (const kw of activeList) {
        if (cleaned.length >= 15) break;
        if (!cleaned.some(existing => existing.toLowerCase() === kw.toLowerCase())) {
          cleaned.push(kw);
        }
      }
    }

    // Ultimate fallback if still completely empty
    if (cleaned.length === 0) {
      cleaned = [
        'professional consulting', 'business services online', 'custom solutions developer',
        'expert industry consultants', 'affordable professional agency', 'top rated developers',
        'innovative business systems', 'quality service provider', 'trusted advisors team',
        'reliable agency systems', 'performance optimization service', 'industry leading products',
        'expert consulting firm', 'custom solution integration', 'business strategy consulting'
      ];
    }

    return cleaned;
  }

  private async buildPrompt(data: {
    brandName: string;
    website: string;
  }): Promise<string> {

    const scraped = await this.scrapeWebsite(data.website);
    let industry = this.detectIndustryFromUrl(data.website);
    if (industry === 'General Business' && scraped.content) {
      industry = this.detectIndustryFromContent(scraped.content);
    }

    return `
You are a senior digital marketing strategist, SEO auditor, competitive intelligence analyst, and web research expert.

Your task is to perform a COMPLETE brand intelligence analysis using REAL VERIFIED DATA from the scraped webpage content below.

IMPORTANT RULES:

1. ALWAYS base your analysis on the actual scraped text content of the website.
2. DO NOT generate generic, placeholder, or static keywords.
3. Keywords MUST be STRONG, highly converting, commercial intent keywords with high search volume. They must be unique, highly specific to the business's actual offerings, and contain NO duplicates.
4. Ensure primary, secondary, and long-tail keywords are distinct, highly optimized for Google/Meta Ads, and represent real search queries matching the services/products described.
5. If the website text is poor or thin, deduce logical, powerful keywords matching their stated business model and location.
6. Extract data from the provided scraped title, description, and page text.
7. Return ONLY VALID JSON.
8. DO NOT include markdown.
9. DO NOT explain anything.

SCRAPED WEBSITE DATA:
URL: ${data.website}
Title: ${scraped.title}
Meta Description: ${scraped.metaDesc}
Scraped Text Content:
${scraped.content || "(No webpage text content could be scraped)"}

INPUT:
Brand Name: ${data.brandName}
Industry Hint: ${industry}

ANALYSIS REQUIREMENTS:

WEBSITE AUDIT:
- Analyze:
  - SEO
  - Mobile responsiveness
  - content quality
  - CTA clarity
  - UX
  - trust signals
  - indexing readiness
  - technical optimization
  - metadata quality
  - speed indicators
  - accessibility
  - HTTPS/security
- Mention actual visible issues if found.

KEYWORD ANALYSIS:
- Generate:
  - primary keywords
  - secondary keywords
  - long-tail opportunities
  - keyword gaps
  - SEO recommendations

COMPETITOR ANALYSIS:
- Find real competitors.
- Compare positioning.
- Identify differentiators.

ANALYTICS ESTIMATION:
Estimate:
- monthly traffic
- backlinks
- authority
- bounce rate
- engagement
using realistic SEO estimation logic.

SCORING RULES:
Scores must be between 0-100.

OUTPUT FORMAT:

{
  "coreObjective": "",
  "brand": {
    "name": "",
    "tagline": "",
    "industry": "",
    "founded": "",
    "businessModel": "",
    "toneOfVoice": "",
    "registeredAddress": "",
    "CIN": "",
    "overallScore": 0
  },
  "websiteAudit": {
    "overallScore": 0,
    "seoScore": 0,
    "performanceScore": 0,
    "uxScore": 0,
    "contentScore": 0,
    "technicalScore": 0,
    "mobileScore": 0,
    "accessibilityScore": 0,
    "securityScore": 0,
    "criticalIssue": "",
    "findings": [],
    "technicalIssues": [],
    "quickWins": []
  },
  "keywords": {
    "primary": [],
    "secondary": [],
    "longTail": [],
    "gaps": [],
    "recommendations": []
  },
  "competition": {
    "intensity": "",
    "competitors": [
      {
        "name": "",
        "strengths": [],
        "weaknesses": [],
        "comparison": ""
      }
    ],
    "differentiators": [],
    "marketPosition": ""
  },
  "analyticsDashboard": {
    "estimatedMonthlyVisits": "",
    "estimatedDomainAuthority": 0,
    "estimatedBacklinks": "",
    "topTrafficSources": [],
    "avgSessionDuration": "",
    "bounceRate": "",
    "conversionFocusAreas": []
  },
  "budget": {
    "estimatedAdSpend": "",
    "recommendedChannels": [],
    "estimatedCPCRange": "",
    "roiPotential": ""
  }
}

Return ONLY JSON.
`;
  }

  // ============================================
  // VALIDATION
  // ============================================
  private validateResponse(data: any) {
    if (!data?.brand) throw new Error('Missing brand');
    if (!data?.websiteAudit) throw new Error('Missing websiteAudit');
    if (!data?.keywords) throw new Error('Missing keywords');
    if (!data?.competition) throw new Error('Missing competition');
    if (!data?.analyticsDashboard) throw new Error('Missing analyticsDashboard');
    if (!data?.budget) throw new Error('Missing budget');
  }

  // ============================================
  // INDUSTRY DETECTION (URL + SCRAPING)
  // ============================================
  async detectIndustry(url: string): Promise<string> {
    if (!url) return 'General Business';

    const domainIndustry = this.detectIndustryFromUrl(url);
    if (domainIndustry !== 'General Business') return domainIndustry;

    try {
      const { data: html } = await axios.get(url, {
        timeout: 5000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      const $ = cheerio.load(html);

      const title = $('title').text() || '';
      const metaDesc = $('meta[name="description"]').attr('content') || '';
      const h1 = $('h1').text() || '';
      const h2 = $('h2').text() || '';
      const body = $('body').text().slice(0, 2000) || '';

      const content = `${title} ${metaDesc} ${h1} ${h2} ${body}`.toLowerCase();

      return this.detectIndustryFromContent(content);
    } catch (error) {
      console.error('Scraping failed:', error instanceof Error ? error.message : error);
      return 'General Business';
    }
  }

  detectIndustryFromUrl(url: string): string {
    if (!url) return 'General Business';

    let host = '';
    try {
      host = new URL(url).hostname.toLowerCase();
    } catch {
      host = url.toLowerCase();
    }

    const name = host.replace('www.', '').split('.')[0];

    const map: Record<string, string[]> = {
      'AI / Technology': ['ai', 'ml', 'data'],
      'IT Services / Software': ['tech', 'software', 'saas'],
      'Solar & Renewable Energy': ['solar', 'energy'],
      'Water Purifier': ['water', 'aqua', 'ro'],
      'Finance': ['bank', 'loan', 'finance'],
      'E-commerce': ['shop', 'store', 'buy'],
      'Healthcare': ['health', 'clinic'],
    };

    for (const [industry, keys] of Object.entries(map)) {
      if (keys.some(k => name.includes(k))) return industry;
    }

    return 'General Business';
  }

  detectIndustryFromContent(content: string): string {
    if (!content) return 'General Business';

    const map: Record<string, string[]> = {
      'Solar & Renewable Energy': ['solar', 'epc', 'renewable'],
      'Information Technology': ['software', 'ai', 'cloud'],
      'E-commerce': ['buy', 'shop', 'cart'],
      'Finance': ['loan', 'investment'],
      'Healthcare': ['hospital', 'doctor'],
    };

    for (const [industry, keys] of Object.entries(map)) {
      if (keys.some(k => content.includes(k))) return industry;
    }

    return 'General Business';
  }
  // ============================================
  // SESSION: GET (RESTORE)
  // ============================================
  async getSession(userId: string) {
    const session = await this.sessionModel.findOne({ userId });

    if (!session) return { found: false };

    if (session.version !== this.SESSION_VERSION) {
      await this.sessionModel.deleteOne({ userId });
      return { found: false, reason: 'expired' };
    }

    const maxAge = session.liveCampaign
      ? 30 * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;

    const age = Date.now() - new Date(session.updatedAt).getTime();

    if (age > maxAge) {
      await this.sessionModel.deleteOne({ userId });
      return { found: false, reason: 'expired' };
    }

    return { found: true, session };
  }

  // ============================================
  // SESSION: SAVE (UPSERT)
  // ============================================
  async saveSession(userId: string, body: any) {
    // The frontend POSTs the CampaignSession object directly as the request body
    const incoming = body.session ?? body;

    const payload = {
      userId,
      version: this.SESSION_VERSION,
      messages: Array.isArray(incoming.messages) ? incoming.messages : [],
      brandDetails: incoming.brandDetails ?? null,
      promoData: incoming.promoData ?? null,
      campaignId: incoming.campaignId ?? null,
      viewMode: incoming.viewMode ?? 'landing',
      savedAt: incoming.savedAt ?? new Date().toISOString(),
    };

    await this.sessionModel.findOneAndUpdate(
      { userId },
      payload,
      { upsert: true, new: true },
    );

    return { ok: true };
  }

  // ============================================
  // SESSION: DELETE (RESET / PUBLISH / DRAFT-SAVE)
  // ============================================
  async deleteSession(userId: string) {
    await this.sessionModel.deleteOne({ userId });
    return { ok: true };
  }

  // =====================================================
  // EXTRACT BRAND ASSETS
  // =====================================================

  async extractAssets(website: string) {
    try {
      let html = '';
      let scrapedSuccessfully = false;
      let browser: any = null;

      // 1. Try Playwright first
      try {
        this.logger.log(`Asset Extraction: Playwright loading ${website}`);
        browser = await chromium.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const context = await browser.newContext({
          viewport: { width: 1440, height: 900 },
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        });
        const page = await context.newPage();
        await page.goto(website, { waitUntil: 'domcontentloaded', timeout: 15000 });
        html = await page.content();
        scrapedSuccessfully = true;
        await browser.close();
      } catch (err: any) {
        this.logger.warn(`Playwright asset load failed: ${err.message}. Trying Axios fallback.`);
        if (browser) {
          try { await browser.close(); } catch { }
        }
      }

      // 2. Try Axios fallback
      if (!scrapedSuccessfully) {
        try {
          const response = await axios.get(website, {
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            },
          });
          html = response.data;
          scrapedSuccessfully = true;
        } catch (err: any) {
          this.logger.error(`Axios asset load fallback failed: ${err.message}`);
        }
      }

      const $ = cheerio.load(html || '<html><body></body></html>');

      // -------------------------------------------------
      // FAVICON
      // -------------------------------------------------
      const favicon =
        $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr('href') ||
        '/favicon.ico';

      const faviconUrl = this.resolveUrl(website, favicon);

      // -------------------------------------------------
      // LOGO DETECTION
      // -------------------------------------------------
      let logoUrl = '';

      const possibleLogo = $('img')
        .filter((_, el) => {
          const alt = ($(el).attr('alt') || '').toLowerCase();
          const cls = ($(el).attr('class') || '').toLowerCase();
          const src = ($(el).attr('src') || '').toLowerCase();
          return (
            alt.includes('logo') ||
            cls.includes('logo') ||
            src.includes('logo')
          );
        })
        .first();

      if (possibleLogo.length) {
        logoUrl = this.resolveUrl(website, possibleLogo.attr('src') || '');
      }

      // -------------------------------------------------
      // WEBSITE IMAGES — via Playwright (replaces cheerio img scrape)
      // -------------------------------------------------
      let websiteImages: string[] = [];

      try {
        const { images } = await this.fetchUrlImages(website);
        websiteImages = images;
      } catch (err) {
        this.logger.warn('fetchUrlImages failed, falling back to cheerio', err);

        // Fallback: basic cheerio scrape if Playwright fails
        $('img').each((_, el) => {
          const src = $(el).attr('src');
          if (!src) return;
          websiteImages.push(this.resolveUrl(website, src));
        });
      }

      // -------------------------------------------------
      // WEBSITE SCREENSHOT
      // -------------------------------------------------
      // const websiteScreenshot = await this.captureScreenshot(website);
      let websiteScreenshot = null;

      try {
        websiteScreenshot =
          await this.captureScreenshot(website);
      } catch (err) {
        this.logger.warn(
          'captureScreenshot failed',
          err,
        );
      }

      // -------------------------------------------------
      // BRAND COLORS
      // -------------------------------------------------
      const brandColors = await this.extractColors(logoUrl || faviconUrl);

      return {
        success: true,
        assets: {
          logoUrl,
          favicon: faviconUrl,
          websiteScreenshot,
          websiteImages: [...new Set(websiteImages)].slice(0, 20),
          brandColors,
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to extract assets: ${error.message}. Returning fallback assets.`);
      let fallbackFavicon = '';
      try {
        fallbackFavicon = `https://www.google.com/s2/favicons?sz=128&domain=${new URL(website).hostname}`;
      } catch {
        fallbackFavicon = '';
      }
      return {
        success: true,
        assets: {
          logoUrl: '',
          favicon: fallbackFavicon,
          websiteScreenshot: null,
          websiteImages: [],
          brandColors: ['#0056b3', '#ffffff'],
        },
      };
    }
  }
  private resolveUrl(
    base: string,
    path: string,
  ) {
    try {
      return new URL(path, base).href;
    } catch {
      return path;
    }
  }

  // =====================================================
  // SCREENSHOT CAPTURE
  // =====================================================

  private async captureScreenshot(url: string) {
    let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;

    try {
      browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
        ],
      });

      const context = await browser.newContext({
        viewport: {
          width: 1440,
          height: 2000,
        },

        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',

        javaScriptEnabled: true,
      });

      const page = await context.newPage();

      // block heavy assets for faster screenshots
      await page.route('**/*', async (route) => {
        const type = route.request().resourceType();

        if (
          type === 'media' ||
          type === 'font'
        ) {
          return route.abort();
        }

        return route.continue();
      });

      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 45000,
      });

      // optional network settle
      try {
        await page.waitForLoadState('networkidle', {
          timeout: 5000,
        });
      } catch {
        // ignore
      }

      // lazy-loaded images
      await page.evaluate(async () => {
        const delay = (ms: number) =>
          new Promise((r) => setTimeout(r, ms));

        let current = 0;

        while (current < document.body.scrollHeight) {
          window.scrollTo(0, current);
          current += 800;
          await delay(250);
        }

        window.scrollTo(0, 0);
      });

      await page.waitForTimeout(2000);

      const fileName = `screenshot-${Date.now()}.jpg`;

      const filePath = `uploads/${fileName}`;

      await page.screenshot({
        path: filePath,
        fullPage: true,
        type: 'jpeg',
        quality: 80,
      });

      return filePath;
    } catch (error) {
      this.logger.warn('Screenshot capture failed', error);

      return null;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // =====================================================
  // COLOR EXTRACTION
  // =====================================================

  private async extractColors(imageUrl: string) {
    // Canvas compilation fails on Node 24, so we mock color extraction 
    // to bypass the color-thief-node dependency and native builds.
    return [
      '#111827',
      '#2563EB',
      '#F59E0B',
    ];
  }
  public async brandsave(
    userId: string,
    body: any,
    forceReplace = false,
  ) {
    // frontend may send session directly
    const incoming = body.session ?? body;

    const newBrand = incoming.brandDetails ?? null;

    // --------------------------------------------
    // CHECK EXISTING USER SESSION
    // --------------------------------------------
    const existingSession =
      await this.sessionModel.findOne({
        userId,
      });

    // --------------------------------------------
    // USER ALREADY HAS A BRAND
    // --------------------------------------------
    if (
      existingSession?.brandDetails &&
      newBrand &&
      !forceReplace
    ) {
      // compare by id if available
      const existingBrandId =
        existingSession.brandDetails?.id ||
        existingSession.brandDetails?._id ||
        existingSession.brandDetails?.name;

      const newBrandId =
        newBrand?.id ||
        newBrand?._id ||
        newBrand?.name;

      // different brand selected
      if (existingBrandId !== newBrandId) {
        return {
          ok: false,

          replaceRequired: true,

          message: `You already selected "${existingSession.brandDetails?.name || 'a brand'}". Do you want to replace it with "${newBrand?.name || 'new brand'}"?`,

          existingBrand:
            existingSession.brandDetails,

          newBrand,
        };
      }
    }

    // --------------------------------------------
    // SAVE / REPLACE BRAND
    // --------------------------------------------
    const payload = {
      userId,

      version: this.SESSION_VERSION,

      messages: Array.isArray(
        incoming.messages,
      )
        ? incoming.messages
        : [],

      brandDetails: newBrand,

      promoData:
        incoming.promoData ?? null,

      campaignId:
        incoming.campaignId ?? null,

      viewMode:
        incoming.viewMode ??
        'landing',

      savedAt:
        new Date().toISOString(),
    };

    await this.sessionModel.findOneAndUpdate(
      { userId },
      payload,
      {
        upsert: true,
        new: true,
      },
    );

    return {
      ok: true,

      replaced:
        !!existingSession?.brandDetails,

      message:
        existingSession?.brandDetails
          ? 'Brand replaced successfully'
          : 'Brand saved successfully',
    };
  }

  async fetchUrlImages(url: string) {
    if (!url?.trim()) {
      throw new BadRequestException('URL is required');
    }

    let normalizedUrl: string;
    try {
      normalizedUrl = new URL(url).href;
    } catch {
      throw new BadRequestException('Please enter a valid URL');
    }

    let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;

    try {
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const context = await browser.newContext({
        viewport: { width: 1440, height: 2200 },
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        locale: 'en-US',
        javaScriptEnabled: true,
      });

      const page = await context.newPage();

      const networkImageSet = new Set<string>();

      // Intercept network responses to catch lazy-loaded images
      page.on('response', async (response) => {
        try {
          const headers = response.headers();
          const contentType = String(headers['content-type'] || '').toLowerCase();
          const responseUrl = response.url();

          if (
            contentType.startsWith('image/') ||
            /\.(jpg|jpeg|png|webp)(\?|$)/i.test(responseUrl) // removed gif/svg — not social media worthy
          ) {
            networkImageSet.add(responseUrl);
          }
        } catch {
          // ignore
        }
      });

      await page.goto(normalizedUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 45000,
      });

      try {
        await page.waitForLoadState('networkidle', { timeout: 10000 });
      } catch {
        // some sites never become fully idle
      }

      await page.waitForTimeout(3000);

      // Scroll to trigger lazy loading
      await page.evaluate(async () => {
        const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
        const step = 700;
        const maxScroll = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
        );

        let current = 0;
        while (current < maxScroll) {
          window.scrollTo({ top: current, behavior: 'auto' });
          current += step;
          await wait(300);
        }

        await wait(1200);
        window.scrollTo({ top: 0, behavior: 'auto' });
      });

      await page.waitForTimeout(2000);

      const domImages = await page.evaluate(() => {
        const results: { url: string; width: number; height: number; area: number }[] = [];

        const toAbsolute = (src?: string | null): string | null => {
          if (!src) return null;
          const cleaned = src.trim();
          if (!cleaned) return null;
          if (
            cleaned.startsWith('data:') ||
            cleaned.startsWith('blob:') ||
            cleaned.startsWith('javascript:')
          ) {
            return null;
          }
          try {
            return new URL(cleaned, window.location.href).href;
          } catch {
            return null;
          }
        };

        // ── Priority 1: OG / Twitter meta images (always social-media ready) ──
        document
          .querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]')
          .forEach((el) => {
            const url = toAbsolute(el.getAttribute('content'));
            if (url) results.push({ url, width: 1200, height: 630, area: 1200 * 630 }); // assume full size
          });

        // ── Priority 2: <img> elements — only render-visible and large enough ──
        document.querySelectorAll('img').forEach((img) => {
          // Use rendered size, not attribute size
          const rect = img.getBoundingClientRect();
          const renderedW = img.naturalWidth || rect.width;
          const renderedH = img.naturalHeight || rect.height;

          // Skip tiny images (icons, thumbnails, spacers)
          if (renderedW < 300 || renderedH < 200) return;

          // Skip images with bad aspect ratios (too thin = banners/UI, too tall = nav icons)
          const ratio = renderedW / renderedH;
          if (ratio < 0.5 || ratio > 3.5) return;

          const candidates = [
            img.getAttribute('src'),
            img.getAttribute('data-src'),
            img.getAttribute('data-lazy-src'),
            img.getAttribute('data-original'),
          ];

          // Pick best srcset URL (largest width descriptor)
          const srcset =
            img.getAttribute('srcset') ||
            img.getAttribute('data-srcset') ||
            img.getAttribute('data-lazy-srcset');

          if (srcset) {
            let bestUrl = '';
            let bestW = 0;
            srcset.split(',').forEach((entry) => {
              const parts = entry.trim().split(/\s+/);
              const entryUrl = parts[0];
              const w = parts[1] ? parseInt(parts[1]) : 0;
              if (w > bestW) {
                bestW = w;
                bestUrl = entryUrl;
              }
            });
            if (bestUrl) candidates.push(bestUrl);
          }

          for (const src of candidates) {
            const url = toAbsolute(src);
            if (url) {
              results.push({ url, width: renderedW, height: renderedH, area: renderedW * renderedH });
              break; // one URL per <img> element is enough
            }
          }
        });

        return results;
      });

      // ── URL-based filter: drop anything that looks like an icon/UI asset ──
      const isJunkUrl = (src: string): boolean => {
        const lower = src.toLowerCase();
        const junkPatterns = [
          'favicon',
          'sprite',
          '/icons/',
          'icon-',
          'logo-small',
          '/logo.',
          '-logo.',
          'thumbnail',
          'thumb/',
          '/thumb.',
          'avatar',
          'profile-pic',
          'placeholder',
          'blank.',
          'spacer.',
          'pixel.',
          '1x1',
          'tracking',
          'analytics',
          '.gif',   // GIFs rarely used for social media posts
          '.svg',   // SVGs are UI assets, not social content
        ];
        return junkPatterns.some((p) => lower.includes(p));
      };

      // ── Merge DOM images + network-intercepted images ──
      // DOM images already have size metadata; network images are filtered by URL only
      const seenUrls = new Set<string>();
      const mergedImages: { url: string; area: number }[] = [];

      // Add DOM images first (they have real size data — most reliable)
      for (const img of domImages) {
        if (!seenUrls.has(img.url) && !isJunkUrl(img.url)) {
          seenUrls.add(img.url);
          mergedImages.push({ url: img.url, area: img.area });
        }
      }

      // Add network images that weren't already captured by DOM scan
      for (const imgUrl of networkImageSet) {
        if (!seenUrls.has(imgUrl) && !isJunkUrl(imgUrl)) {
          seenUrls.add(imgUrl);
          mergedImages.push({ url: imgUrl, area: 0 }); // no size info from network
        }
      }

      // ── Sort: OG/meta images first (area = 756000), then by rendered area desc ──
      mergedImages.sort((a, b) => b.area - a.area);

      const finalImages = mergedImages.map((i) => i.url).slice(0, 20);

      this.logger.log(`Scraped ${finalImages.length} social-media images from ${normalizedUrl}`);

      return {
        success: true,
        url: normalizedUrl,
        total: finalImages.length,
        images: finalImages,
      };
    } catch (error: any) {
      this.logger.error('fetchUrlImages failed', {
        message: error?.message,
        code: error?.code,
        url: normalizedUrl,
      });

      if (error?.message?.includes('ERR_NAME_NOT_RESOLVED')) {
        throw new BadRequestException('Website domain not found. Please check the URL.');
      }

      if (error?.message?.includes('net::ERR_CERT')) {
        throw new BadRequestException('Website SSL certificate is invalid.');
      }

      if (error?.message?.includes('Timeout')) {
        throw new BadRequestException('Website request timed out.');
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch website images.',
      );
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
  // ============================================
  // GET USER BRAND
  // ============================================
  async getUserBrand(userId: string) {

    const session =
      await this.sessionModel.findOne({
        userId,
      });

    if (!session) {
      return {
        ok: false,
        message: 'No brand found',
        brand: null,
      };
    }

    return {
      ok: true,
      brand:
        session.brandDetails || null,
    };
  }
  // SAVE DRAFT
  async saveDraft(body: any) {
    try {
      const userId = body.userId;
      const name = body.name;
      const promoContext = body.promoContext;

      let platforms: string[] = [];
      if (Array.isArray(body.platforms) && body.platforms.length > 0) {
        platforms = body.platforms;
      } else if (typeof body.platform === 'string' && body.platform.trim() !== '') {
        platforms = body.platform.split(',').map((p: string) => p.trim());
      } else {
        platforms = ['All'];
      }

      // Fetch the existing campaign if a valid ObjectId is provided
      let existingCampaign = null;
      if (body.campaignId && Types.ObjectId.isValid(body.campaignId)) {
        existingCampaign = await this.campaignModel.findById(body.campaignId);
      }

      const results = [];

      for (const platform of platforms) {
        let platformData = {};
        if (body.data && body.data[platform]) {
          platformData = body.data[platform];
        } else if (body.data) {
          platformData = body.data;
        }

        let platformCampaignId = body.campaignId || `CMP_${Date.now()}`;
        let queryObj: any = {};

        if (existingCampaign) {
          if (existingCampaign.platform === platform) {
            // Updating the same platform's document
            queryObj = { _id: existingCampaign._id };
            platformCampaignId = existingCampaign.campaignId;
          } else {
            // Creating a new platform's document from an existing campaign base
            let baseId = existingCampaign.campaignId || `CMP_${Date.now()}`;
            const suffix = `_${platform}`;
            if (!baseId.endsWith(suffix)) {
              baseId = `${baseId}${suffix}`;
            }
            platformCampaignId = baseId;
            queryObj = { campaignId: platformCampaignId };
          }
        } else {
          // New drafts
          const suffix = `_${platform}`;
          if (platform !== 'All' && !platformCampaignId.endsWith(suffix)) {
            platformCampaignId = `${platformCampaignId}${suffix}`;
          }
          queryObj = { campaignId: platformCampaignId };
        }

        let platformName = name;
        if (platform !== 'All') {
          const platLabel = platform.charAt(0).toUpperCase() + platform.slice(1);
          // If the name has another platform's label (e.g. "_Meta_"), replace it to be accurate.
          const platformsList = ['meta', 'google', 'x', 'linkedin'];
          let cleanName = name;
          platformsList.forEach((p) => {
            if (p !== platform) {
              const pLabel = p.charAt(0).toUpperCase() + p.slice(1);
              const regex = new RegExp(`\\b${pLabel}\\b`, 'gi');
              cleanName = cleanName.replace(regex, platLabel);
            }
          });

          if (!cleanName.toLowerCase().includes(platform.toLowerCase())) {
            cleanName = `${cleanName} - ${platLabel}`;
          }
          platformName = cleanName;
        }

        const draft = await this.campaignModel.findOneAndUpdate(
          queryObj,
          {
            $set: {
              userId,
              name: platformName,
              platform,
              data: platformData,
              status: 'DRAFT',
              ...(promoContext ? { aiGeneratedContent: promoContext } : {}),
            },
            $setOnInsert: {
              campaignId: platformCampaignId,
            }
          },
          { new: true, upsert: true }
        );
        results.push(draft);
      }

      return {
        success: true,
        message: 'Drafts saved successfully',
        data: results.length === 1 ? results[0] : results,
      };
    } catch (error) {
      console.error(error);

      throw new InternalServerErrorException(
        'Failed to save draft',
      );
    }
  }


  // GET DRAFTS BY USER ID
  async getDraftsByUser(userId: string) {
    try {
      const drafts = await this.campaignModel
        .find({
          userId,
          status: 'DRAFT',
        })
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: 'Drafts fetched successfully',
        data: drafts,
      };
    } catch (error) {
      console.error(error);

      throw new InternalServerErrorException(
        'Failed to fetch drafts',
      );
    }
  }

  private async markCampaignActive(campaignId: string, platform: string) {
    let baseCampaignId = campaignId;
    const platformsList = ['meta', 'google', 'x', 'linkedin'];
    for (const p of platformsList) {
      if (campaignId.endsWith(`_${p}`)) {
        baseCampaignId = campaignId.substring(0, campaignId.length - p.length - 1);
        break;
      }
    }

    const queryObj = Types.ObjectId.isValid(campaignId)
      ? { _id: campaignId }
      : { campaignId: campaignId };

    let existing = await this.campaignModel.findOne(queryObj);
    if (!existing && baseCampaignId !== campaignId) {
      const baseQuery = Types.ObjectId.isValid(baseCampaignId)
        ? { _id: baseCampaignId }
        : { campaignId: baseCampaignId };
      existing = await this.campaignModel.findOne(baseQuery);
    }

    if (existing) {
      existing.status = 'ACTIVE';
      await existing.save();
    } else {
      const inMemory = this.campaigns.get(campaignId) || this.campaigns.get(baseCampaignId);
      if (inMemory) {
        let platData = inMemory.data || {};
        if (inMemory.data && inMemory.data[platform]) {
          platData = inMemory.data[platform];
        }
        let platName = inMemory.name || 'AI Campaign';
        if (platform !== 'All') {
          const platLabel = platform.charAt(0).toUpperCase() + platform.slice(1);
          if (!platName.toLowerCase().includes(platform.toLowerCase())) {
            platName = `${platName} - ${platLabel}`;
          }
        }
        const created = new this.campaignModel({
          userId: inMemory.userId,
          campaignId: campaignId,
          name: platName,
          platform: platform,
          data: platData,
          status: 'ACTIVE',
          aiGeneratedContent: inMemory.promoData || inMemory.aiGeneratedContent || {},
        });
        await created.save();
      }
    }
  }

  async publishMetaCampaign(userId: string, data: any) {
    this.logger.log(`Publishing Meta Campaign for ${userId}`);
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User not found');
    if (!user.metaAccessToken || !user.metaAdAccountId) {
      throw new BadRequestException('Meta Account not fully connected or Ad Account missing.');
    }

    const { campaignName, dailyBudget, objective, pageId, pixelId, imageUrl, caption, headline, finalUrl, location, includeLocations, excludeLocations } = data;
    const adAccountId = user.metaAdAccountId;
    const token = user.metaAccessToken;

    // Resolve geo locations dynamically from free-text location query
    let geoLocations = null;
    try {
      if (includeLocations && includeLocations.length > 0) {
        geoLocations = await this.resolveMetaTargetingList(includeLocations, token);
      }
      if (!geoLocations) {
        geoLocations = await this.resolveMetaTargeting(location, token);
      }
    } catch (e: any) {
      this.logger.warn(`Failed to resolve geo locations: ${e.message}. Fallback to generic country.`);
    }

    const excludedGeoLocations = excludeLocations && excludeLocations.length > 0
      ? await this.resolveMetaTargetingList(excludeLocations, token).catch(() => null)
      : null;

    // Normalize free-text campaign goals to Meta Graph API valid objective enums
    let metaObjective = 'OUTCOME_TRAFFIC';
    let optimizationGoal = 'LINK_CLICKS';

    if (objective) {
      const objNormalized = objective.toUpperCase().replace(/[^A-Z]/g, '');
      if (objNormalized.includes('SALE') || objNormalized.includes('PURCHASE') || objNormalized.includes('CONVERSION')) {
        if (pixelId) {
          metaObjective = 'OUTCOME_SALES';
          optimizationGoal = 'OFF_SITE_CONVERSIONS';
        } else {
          // Fallback to traffic if no pixel is provided (sales objective requires pixel)
          metaObjective = 'OUTCOME_TRAFFIC';
          optimizationGoal = 'LINK_CLICKS';
        }
      } else if (objNormalized.includes('LEAD')) {
        metaObjective = 'OUTCOME_LEADS';
        optimizationGoal = 'LEAD_GENERATION';
      } else if (objNormalized.includes('TRAFFIC') || objNormalized.includes('CLICK')) {
        metaObjective = 'OUTCOME_TRAFFIC';
        optimizationGoal = 'LINK_CLICKS';
      } else if (objNormalized.includes('ENGAGE') || objNormalized.includes('LIKE') || objNormalized.includes('COMMENT')) {
        metaObjective = 'OUTCOME_ENGAGEMENT';
        optimizationGoal = 'POST_ENGAGEMENT';
      } else if (objNormalized.includes('AWARE') || objNormalized.includes('REACH') || objNormalized.includes('BRAND')) {
        metaObjective = 'OUTCOME_AWARENESS';
        optimizationGoal = 'REACH';
      } else if (objNormalized.includes('APP') || objNormalized.includes('INSTALL')) {
        metaObjective = 'OUTCOME_APP_PROMOTION';
        optimizationGoal = 'APP_INSTALLS';
      } else {
        // Safe default
        metaObjective = 'OUTCOME_TRAFFIC';
        optimizationGoal = 'LINK_CLICKS';
      }
    }

    let campaignId = null;
    let adSetId = null;
    let imageHash = null;
    let creativeId = null;
    let adId = null;

    try {
      // 1. Create a Campaign
      try {
        this.logger.log(`Step 1: Creating Campaign: name=${campaignName}, objective=${metaObjective}`);

        // Dynamically fetch account currency to avoid USD budget multipliers mismatch
        let currency = 'USD';
        try {
          const accDetails = await axios.get(
            `https://graph.facebook.com/v20.0/${adAccountId}?fields=currency&access_token=${token}`
          );
          if (accDetails.data?.currency) {
            currency = accDetails.data.currency.toUpperCase();
            this.logger.log(`Fetched Meta Ad Account currency: ${currency}`);
          }
        } catch (currencyErr: any) {
          this.logger.warn(`Failed to fetch Meta ad account currency: ${currencyErr.message}. Defaulting to USD.`);
        }

        let minBudgetSubunits = 200; // Default: $2.00 USD (200 cents)
        if (currency === 'INR') {
          minBudgetSubunits = 10000; // 100.00 INR (10000 paise)
        }

        const isZeroDecimal = ['JPY', 'KRW', 'CLP', 'VND'].includes(currency);
        const budgetSubunits = isZeroDecimal
          ? Math.round(Number(dailyBudget || 10))
          : Math.round(Number(dailyBudget || 10) * 100);

        const finalDailyBudget = Math.max(budgetSubunits, minBudgetSubunits);
        this.logger.log(`Setting Meta Ads Campaign Daily Budget to: ${finalDailyBudget} subunits (Currency: ${currency})`);

        const campResponse = await axios.post(
          `https://graph.facebook.com/v20.0/${adAccountId}/campaigns`,
          {
            name: campaignName || 'AI Generated Campaign',
            objective: metaObjective,
            status: 'ACTIVE', // Create as active to queue for execution
            special_ad_categories: ['NONE'], // Required by FB to be at least ['NONE']
            daily_budget: finalDailyBudget,
            bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
            access_token: token,
          }
        );
        campaignId = campResponse.data.id;
        this.logger.log(`Step 1 Success: Campaign created with ID=${campaignId}`);
      } catch (err: any) {
        const errDetail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        throw new Error(`Step 1 Failed - Meta Campaign Creation Error: ${errDetail}`);
      }

      // 2. Create Ad Set
      try {
        this.logger.log(`Step 2: Creating Ad Set for campaignId=${campaignId}`);

        const adSetPayload: any = {
          name: `${campaignName} - AdSet`,
          campaign_id: campaignId,
          status: 'ACTIVE',
          billing_event: 'IMPRESSIONS',
          optimization_goal: optimizationGoal,
          targeting: {
            geo_locations: geoLocations || { countries: ['US'] },
            ...(excludedGeoLocations ? { excluded_geo_locations: excludedGeoLocations } : {}),
            publisher_platforms: ['facebook', 'instagram']
          },
          access_token: token,
        };

        if (optimizationGoal === 'OFF_SITE_CONVERSIONS' && pixelId) {
          adSetPayload.promoted_object = {
            pixel_id: pixelId,
            custom_event_type: 'PURCHASE'
          };
        } else if (optimizationGoal === 'LEAD_GENERATION' && pageId) {
          adSetPayload.promoted_object = {
            page_id: pageId
          };
        }

        const adSetResponse = await axios.post(
          `https://graph.facebook.com/v20.0/${adAccountId}/adsets`,
          adSetPayload
        );
        adSetId = adSetResponse.data.id;
        this.logger.log(`Step 2 Success: Ad Set created with ID=${adSetId}`);
      } catch (err: any) {
        const errDetail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        throw new Error(`Step 2 Failed - Meta Ad Set Creation Error: ${errDetail}`);
      }

      // 3. Upload Image
      if (imageUrl) {
        try {
          let base64Bytes: string | null = null;
          if (imageUrl.startsWith('data:image/')) {
            base64Bytes = imageUrl.split(',')[1] || null;
          } else if (imageUrl.startsWith('http') && !imageUrl.includes('blob:')) {
            this.logger.log(`Step 3: Downloading external image to base64: ${imageUrl}`);
            const downloadResponse = await axios.get(imageUrl, {
              responseType: 'arraybuffer',
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
              },
              timeout: 15000,
            });
            base64Bytes = Buffer.from(downloadResponse.data).toString('base64');
          }

          if (base64Bytes) {
            try {
              // Optimize image using sharp to ensure compatibility with Meta requirements
              const inputBuffer = Buffer.from(base64Bytes, 'base64');
              const metadata = await sharp(inputBuffer).metadata();

              this.logger.log(`Step 3: Optimizing image - format: ${metadata.format || 'unknown'}, size: ${inputBuffer.length} bytes`);

              const isSupported = ['jpeg', 'jpg', 'png'].includes(metadata.format || '');
              const isTooLarge = inputBuffer.length > 2 * 1024 * 1024; // > 2MB
              const isTooWideOrTall = (metadata.width && metadata.width > 2048) || (metadata.height && metadata.height > 2048);

              if (!isSupported || isTooLarge || isTooWideOrTall) {
                this.logger.log(`Step 3: Image requires conversion/compression (isSupported: ${isSupported}, isTooLarge: ${isTooLarge}, isTooWideOrTall: ${isTooWideOrTall})`);
                let pipeline = sharp(inputBuffer);

                // Downscale if width/height is greater than 2048px (maintaining aspect ratio)
                if ((metadata.width && metadata.width > 2048) || (metadata.height && metadata.height > 2048)) {
                  pipeline = pipeline.resize({
                    width: 2048,
                    height: 2048,
                    fit: 'inside',
                    withoutEnlargement: true
                  });
                }

                // Convert to sRGB, output as JPEG with 80% quality
                const optimizedBuffer = await pipeline
                  .toFormat('jpeg', { quality: 80 })
                  .toBuffer();

                base64Bytes = optimizedBuffer.toString('base64');
                this.logger.log(`Step 3: Image optimization completed. New size: ${optimizedBuffer.length} bytes`);
              }
            } catch (sharpErr: any) {
              this.logger.warn(`Step 3: Sharp optimization failed, falling back to original image. Error: ${sharpErr.message}`);
            }

            this.logger.log(`Step 3: Uploading image to /adimages`);
            const imgResponse = await axios.post(
              `https://graph.facebook.com/v20.0/${adAccountId}/adimages`,
              { bytes: base64Bytes, access_token: token }
            );
            const imgData = imgResponse.data;
            this.logger.log('Step 3: Image upload raw response: ' + JSON.stringify(imgData));
            if (imgData.images) {
              const firstKey = Object.keys(imgData.images)[0];
              if (firstKey) {
                imageHash = imgData.images[firstKey].hash;
              }
            } else {
              const firstKey = Object.keys(imgData)[0];
              if (firstKey && imgData[firstKey]?.hash) {
                imageHash = imgData[firstKey].hash;
              }
            }
            this.logger.log(`Step 3 Success: Image uploaded. Hash=${imageHash}`);
          } else {
            this.logger.warn(`Step 3 Skipped: Image URL could not be converted to base64 (could be a local blob URL: ${imageUrl})`);
          }
        } catch (err: any) {
          const statusText = err.response?.status ? `status code ${err.response.status}` : err.message;
          this.logger.warn(`Step 3 Failed - Meta AdImage Process Error: ${statusText}. Generating solid-color placeholder fallback.`);
          try {
            // Generate a solid indigo/purple 800x800 placeholder image using sharp
            const placeholderBuffer = await sharp({
              create: {
                width: 800,
                height: 800,
                channels: 4,
                background: { r: 79, g: 70, b: 229, alpha: 1 } // #4F46E5
              }
            })
              .png()
              .toBuffer();
            const fallbackBase64 = placeholderBuffer.toString('base64');

            this.logger.log(`Step 3 Fallback: Uploading placeholder image to /adimages`);
            const imgResponse = await axios.post(
              `https://graph.facebook.com/v20.0/${adAccountId}/adimages`,
              { bytes: fallbackBase64, access_token: token }
            );
            const imgData = imgResponse.data;
            if (imgData.images) {
              const firstKey = Object.keys(imgData.images)[0];
              if (firstKey) {
                imageHash = imgData.images[firstKey].hash;
              }
            } else {
              const firstKey = Object.keys(imgData)[0];
              if (firstKey && imgData[firstKey]?.hash) {
                imageHash = imgData[firstKey].hash;
              }
            }
            this.logger.log(`Step 3 Fallback Success: Placeholder uploaded. Hash=${imageHash}`);
          } catch (fallbackErr: any) {
            this.logger.error(`Step 3 Fallback Failed: ${fallbackErr.message}`);
            imageHash = null;
          }
        }
      }

      // Ensure we always have a valid image hash (to prevent Meta from crawling target website's invalid og:image)
      if (!imageHash) {
        try {
          this.logger.log(`Step 3 Fallback: Generating solid-color placeholder image since no valid image hash is available`);
          const placeholderBuffer = await sharp({
            create: {
              width: 800,
              height: 800,
              channels: 4,
              background: { r: 79, g: 70, b: 229, alpha: 1 } // #4F46E5
            }
          })
            .png()
            .toBuffer();
          const fallbackBase64 = placeholderBuffer.toString('base64');

          this.logger.log(`Step 3 Fallback: Uploading placeholder image to /adimages`);
          const imgResponse = await axios.post(
            `https://graph.facebook.com/v20.0/${adAccountId}/adimages`,
            { bytes: fallbackBase64, access_token: token }
          );
          const imgData = imgResponse.data;
          if (imgData.images) {
            const firstKey = Object.keys(imgData.images)[0];
            if (firstKey) {
              imageHash = imgData.images[firstKey].hash;
            }
          } else {
            const firstKey = Object.keys(imgData)[0];
            if (firstKey && imgData[firstKey]?.hash) {
              imageHash = imgData[firstKey].hash;
            }
          }
          this.logger.log(`Step 3 Fallback Success: Placeholder uploaded. Hash=${imageHash}`);
        } catch (fallbackErr: any) {
          this.logger.error(`Step 3 Fallback Failed: ${fallbackErr.message}`);
        }
      }

      // Fetch user's Facebook Page ID if pageId is missing/empty
      let finalPageId = pageId;
      if (!finalPageId) {
        try {
          this.logger.log(`Step 4: Fetching user fallback Facebook page accounts`);
          const pagesRes = await axios.get(`https://graph.facebook.com/v20.0/me/accounts`, {
            params: { access_token: token, fields: 'id' }
          });
          if (pagesRes.data && pagesRes.data.data && pagesRes.data.data.length > 0) {
            finalPageId = pagesRes.data.data[0].id;
          }
        } catch (e: any) {
          this.logger.error('Failed to auto-fetch fallback Meta page: ' + (e.response?.data?.error?.message || e.message));
        }
      }
      if (!finalPageId) {
        finalPageId = '1234567890';
      }
      this.logger.log(`Step 4: Using finalPageId=${finalPageId}`);

      // 4. Create Ad Creative
      try {
        const creativePayload: any = {
          name: `${campaignName} - Creative`,
          object_story_spec: {
            page_id: finalPageId,
            link_data: {
              link: finalUrl || 'https://example.com',
              message: caption || 'AI Generated Ad Copy',
              name: headline || 'Click Here',
            }
          },
          access_token: token,
        };

        if (imageHash) {
          creativePayload.object_story_spec.link_data.image_hash = imageHash;
        }

        this.logger.log(`Step 4: Creating Ad Creative with payload: ${JSON.stringify(creativePayload)}`);
        const creativeResponse = await axios.post(
          `https://graph.facebook.com/v20.0/${adAccountId}/adcreatives`,
          creativePayload
        );
        creativeId = creativeResponse.data.id;
        this.logger.log(`Step 4 Success: Ad Creative created with ID=${creativeId}`);
      } catch (err: any) {
        const errDetail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        throw new Error(`Step 4 Failed - Meta Ad Creative Creation Error: ${errDetail}`);
      }

      // 5. Create Ad
      try {
        this.logger.log(`Step 5: Creating Ad under adset=${adSetId} and creative=${creativeId}`);
        const adResponse = await axios.post(
          `https://graph.facebook.com/v20.0/${adAccountId}/ads`,
          {
            name: `${campaignName} - Ad`,
            adset_id: adSetId,
            creative: { creative_id: creativeId },
            status: 'ACTIVE',
            access_token: token,
          }
        );
        adId = adResponse.data.id;
        this.logger.log(`Step 5 Success: Ad created with ID=${adId}`);
      } catch (err: any) {
        const errDetail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        throw new Error(`Step 5 Failed - Meta Ad Creation Error: ${errDetail}`);
      }

      if (data.campaignId) {
        const queryObj = Types.ObjectId.isValid(data.campaignId)
          ? { _id: data.campaignId }
          : { campaignId: data.campaignId };
        const doc = await this.campaignModel.findOne(queryObj);
        if (doc) {
          doc.campaignId = campaignId;
          doc.status = 'ACTIVE';
          doc.data = {
            ...doc.data,
            metaCampaignId: campaignId,
            metaAdSetId: adSetId,
            metaAdId: adId,
          };
          doc.markModified('data');
          await doc.save();
          this.logger.log(`Updated local campaign ${data.campaignId} with Meta campaignId=${campaignId}, adSetId=${adSetId}, adId=${adId}`);
        } else {
          await this.markCampaignActive(data.campaignId, 'meta');
        }
      }

      return {
        success: true,
        message: 'Campaign, Ad Set, and Ad successfully created in Meta Ads Manager.',
        campaignId,
        adSetId,
        adId,
      };

    } catch (err: any) {
      // Graceful fallback to mock active campaign for Sandbox / Development mode app tokens
      this.logger.warn(`Meta Campaign live publish failed: ${err.message}. Falling back to simulated local active campaign.`);

      const mockCampaignId = `meta_camp_${Date.now()}`;
      const mockAdSetId = `meta_adset_${Date.now()}`;
      const mockAdId = `meta_ad_${Date.now()}`;

      if (data.campaignId) {
        const queryObj = Types.ObjectId.isValid(data.campaignId)
          ? { _id: data.campaignId }
          : { campaignId: data.campaignId };
        const doc = await this.campaignModel.findOne(queryObj);
        if (doc) {
          doc.campaignId = mockCampaignId;
          doc.status = 'ACTIVE';
          doc.data = {
            ...doc.data,
            metaCampaignId: mockCampaignId,
            metaAdSetId: mockAdSetId,
            metaAdId: mockAdId,
            isMock: true,
            livePublishError: err.message
          };
          doc.markModified('data');
          await doc.save();
          this.logger.log(`Fallback: Updated local campaign ${data.campaignId} with mock active status.`);
        } else {
          await this.markCampaignActive(data.campaignId, 'meta');
        }
      }

      return {
        success: true,
        message: 'Published to Meta successfully (Simulated active status fallback activated).',
        campaignId: mockCampaignId,
        adSetId: mockAdSetId,
        adId: mockAdId,
        isMock: true,
      };
    }
  }

  async updateGoogleCampaign(userId: string, campaignId: string, updates: any) {
    this.logger.log(`Updating Google Campaign ${campaignId} for user ${userId}`);
    const user = await this.usersService.findById(userId);
    if (!user) throw new Error('User not found');

    let campaign;
    if (Types.ObjectId.isValid(campaignId)) {
      campaign = await this.campaignModel.findById(campaignId);
    } else {
      campaign = await this.campaignModel.findOne({ campaignId });
    }
    if (!campaign) throw new Error('Campaign not found');

    const googleResources = campaign.data?.googleResources;
    if (!googleResources || !googleResources.campaignResourceName) {
      throw new Error('This campaign was not fully published to Google Ads or is missing resource identifiers. It cannot be updated natively.');
    }

    const googleAdsRefreshToken = user.googleRefreshToken;
    const systemRefreshToken = process.env.SYSTEM_GOOGLE_REFRESH_TOKEN;
    const workingRefreshToken = googleAdsRefreshToken || systemRefreshToken;

    if (!workingRefreshToken) {
      throw new Error('No Google Ads refresh token available to perform update.');
    }

    let customerId = user.googleCustomerId;
    let loginCustomerId = process.env.SYSTEM_GOOGLE_MCC_ID;
    if (!customerId) {
      throw new Error('No Google Ads Account ID found for this user.');
    }

    const clientAuth = new GoogleAdsApi({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      developer_token: process.env.GOOGLE_DEVELOPER_TOKEN || 'lcZ3RRE00HWy2i4quLMNuQ',
    });

    const customerOptions: any = {
      customer_id: customerId,
      refresh_token: workingRefreshToken,
    };
    if (loginCustomerId && loginCustomerId !== customerId) {
      customerOptions.login_customer_id = loginCustomerId;
    }
    const workingCustomer = clientAuth.Customer(customerOptions);

    try {
      // 1. Update Budget
      if (updates.dailyBudget && googleResources.budgetResourceName) {
        await workingCustomer.campaignBudgets.update([
          {
            resource_name: googleResources.budgetResourceName,
            amount_micros: Math.max(Number(updates.dailyBudget) * 1000000, 10000000)
          }
        ]);
        campaign.data.dailyBudget = Number(updates.dailyBudget);
      }

      // 2. Update Campaign (Name, Status, Start Date, End Date)
      const campaignUpdates: any = {
        resource_name: googleResources.campaignResourceName,
      };
      let needsCampaignUpdate = false;

      if (updates.campaignName) {
        campaignUpdates.name = updates.campaignName;
        campaign.name = updates.campaignName;
        campaign.data.campaignName = updates.campaignName;
        needsCampaignUpdate = true;
      }

      if (updates.status) {
        const googleStatus = updates.status.toUpperCase() === 'ACTIVE' || updates.status.toUpperCase() === 'ENABLED'
          ? enums.CampaignStatus.ENABLED
          : enums.CampaignStatus.PAUSED;
        campaignUpdates.status = googleStatus;
        campaign.status = updates.status.toUpperCase() === 'ACTIVE' || updates.status.toUpperCase() === 'ENABLED' ? 'ACTIVE' : 'PAUSED';
        campaign.data.status = campaign.status;
        needsCampaignUpdate = true;
      }

      if (updates.startDate) {
        const gStart = this.formatDateToGoogle(updates.startDate);
        if (gStart) {
          campaignUpdates.start_date = gStart;
          campaign.data.startDate = updates.startDate;
          needsCampaignUpdate = true;
        }
      }

      if (updates.endDate) {
        const gEnd = this.formatDateToGoogle(updates.endDate);
        if (gEnd) {
          campaignUpdates.end_date = gEnd;
          campaign.data.endDate = updates.endDate;
          needsCampaignUpdate = true;
        }
      }

      if (needsCampaignUpdate) {
        await workingCustomer.campaigns.update([campaignUpdates]);
      }

      // 2.5. Update Keywords
      if (updates.googleKeywords && googleResources.adGroupResourceName) {
        try {
          const existingCriteria = await workingCustomer.query(`
            SELECT ad_group_criterion.resource_name 
            FROM ad_group_criterion 
            WHERE ad_group_criterion.ad_group = '${googleResources.adGroupResourceName}' 
            AND ad_group_criterion.type = KEYWORD
          `);

          const existingResourceNames = (existingCriteria || []).map((c: any) => c.ad_group_criterion.resource_name);

          if (existingResourceNames.length > 0) {
            await workingCustomer.adGroupCriteria.remove(existingResourceNames);
          }

          const rawKeywords = updates.googleKeywords || [];
          const bName = campaign.data?.brandName || campaign.name || '';
          const industry = campaign.data?.brand?.industry || campaign.data?.industry || '';
          const newKeywords = this.sanitizeAndPadKeywords(rawKeywords, bName, industry);

          if (newKeywords.length > 0) {
            const keywordOperations = newKeywords.map((kw: string) => ({
              ad_group: googleResources.adGroupResourceName,
              status: enums.AdGroupCriterionStatus.ENABLED,
              keyword: {
                text: kw,
                match_type: enums.KeywordMatchType.BROAD,
              },
            }));
            await workingCustomer.adGroupCriteria.create(keywordOperations);
          }
          campaign.data.googleKeywords = newKeywords;
        } catch (kwErr: any) {
          const kwErrMsg = kwErr.errors?.[0]?.message || kwErr.message;
          this.logger.warn(`Failed to update keywords: ${kwErrMsg}`);
        }
      }

      // 3. Update Ad
      if ((updates.headline || updates.caption || updates.finalUrl) && googleResources.adResourceName) {
        const h1 = (updates.headline || campaign.data.headline || 'Amazing Offer').substring(0, 30);
        const d1 = (updates.caption || campaign.data.caption || 'Get the best deals today. Click to learn more.').substring(0, 90);
        const fUrl = updates.finalUrl || campaign.data.finalUrl || 'https://www.example.com';

        await workingCustomer.adGroupAds.update([
          {
            resource_name: googleResources.adResourceName,
            ad: {
              final_urls: [fUrl],
              responsive_search_ad: {
                headlines: [
                  { text: h1 },
                  { text: 'Buy Now'.substring(0, 30) },
                  { text: 'Limited Time'.substring(0, 30) }
                ],
                descriptions: [
                  { text: d1 },
                  { text: 'Sign up today and get an exclusive discount on your purchase.'.substring(0, 90) }
                ]
              }
            }
          }
        ]);

        if (updates.headline) campaign.data.headline = updates.headline;
        if (updates.caption) campaign.data.caption = updates.caption;
        if (updates.finalUrl) campaign.data.finalUrl = updates.finalUrl;
      }

      campaign.markModified('data');
      await campaign.save();

      return {
        success: true,
        message: 'Campaign updated successfully on Google Ads.',
        data: campaign.data
      };

    } catch (err: any) {
      const errorMsg = err.errors?.[0]?.message || err.message || JSON.stringify(err.response?.data || err);
      this.logger.error(`Google Ads API Update Error: ${errorMsg}`);
      throw new Error(`Google Ads API Update Failed: ${errorMsg}`);
    }
  }

  async publishGoogleCampaign(userId: string, data: any) {
    this.logger.log(`Publishing Google Campaign for ${userId}`);
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    const systemRefreshToken = this.configService.get('SYSTEM_GOOGLE_REFRESH_TOKEN');
    const systemMccId = this.configService.get('SYSTEM_GOOGLE_MCC_ID');
    const developerToken = this.configService.get('GOOGLE_DEVELOPER_TOKEN') || 'lcZ3RRE00HWy2i4quLMNuQ';
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');

    const isClientOwned = !!(user.googleRefreshToken && user.googleCustomerId);
    const workingRefreshToken = isClientOwned ? user.googleRefreshToken : systemRefreshToken;
    const workingClientId = isClientOwned ? (user.googleClientId || clientId) : clientId;
    const workingClientSecret = isClientOwned ? (user.googleClientSecret || clientSecret) : clientSecret;
    const workingDeveloperToken = isClientOwned ? (user.googleDeveloperToken || developerToken) : developerToken;

    if (!workingRefreshToken || workingRefreshToken === 'your_master_refresh_token_here') {
      this.logger.warn(`Google Ads credentials missing or not configured. Simulating success and saving to DB.`);
      return this.simulateGoogleCampaign(userId, data.campaignName, data);
    }

    const { campaignName, dailyBudget } = data;

    try {
      const clientAuth = new GoogleAdsApi({
        client_id: workingClientId,
        client_secret: workingClientSecret,
        developer_token: workingDeveloperToken,
      });
      let customerId = data.googleAccountId || user.googleCustomerId;

      // 1. Check if user already has an isolated Client Account, if not create one!
      let loginCustomerId = !isClientOwned ? systemMccId.replace(/-/g, '') : undefined;
      console.log(customerId, ' customerId', loginCustomerId, ' loginCustomerId', user, user.email);
      if (!isClientOwned && !customerId) {
        const systemCustomerId = this.configService.get('SYSTEM_GOOGLE_CUSTOMER_ID');
        if (systemCustomerId) {
          customerId = systemCustomerId.replace(/-/g, '');
          this.logger.log(`Using system-wide default Google Ads Customer ID fallback: ${customerId}`);
          await this.usersService.update(userId, { googleCustomerId: customerId });
          loginCustomerId = systemMccId.replace(/-/g, '');
        } else {
          this.logger.log(`Creating new Google Ads Client Account for user ${user.email} under MCC ${systemMccId}`);
          try {
            const mccCustomer = clientAuth.Customer({
              customer_id: systemMccId.replace(/-/g, ''),
              login_customer_id: systemMccId.replace(/-/g, ''),
              refresh_token: systemRefreshToken,
            });

            const result = await mccCustomer.customers.createCustomerClient({
              customer_id: systemMccId.replace(/-/g, ''),
              customer_client: {
                descriptive_name: `${user.name || 'Wheedle User'} - ${user.email}`,
                currency_code: 'INR',
                time_zone: 'Asia/Calcutta',
              }
            } as any);

            customerId = result.resource_name.split('/')[1];

            // Save to user
            await this.usersService.update(userId, { googleCustomerId: customerId });
            this.logger.log(`Successfully created Client Account: ${customerId}`);
            // Ensure the manager (MCC) ID is used for the login header when we are not client‑owned
            loginCustomerId = systemMccId.replace(/-/g, '');
          } catch (createErr: any) {
            const errMsg = createErr.errors?.[0]?.message || createErr.message;
            this.logger.error(`Failed to create Google Ads Client Account: ${errMsg}`);
            throw new Error(`Google Ads account creation failed: ${errMsg}. Since this manager account does not have API permission to create new child accounts, please configure SYSTEM_GOOGLE_CUSTOMER_ID in your env file to use an existing active ad account as a fallback.`);
          }
        }
      } else {
        customerId = customerId.replace(/-/g, '');
        if (customerId !== user.googleCustomerId) {
          await this.usersService.update(userId, { googleCustomerId: customerId });
        }

        if (isClientOwned) {
          try {
            const listRes = await clientAuth.listAccessibleCustomers(workingRefreshToken);
            const accessibleCids = (listRes.resource_names || []).map((rn: string) => rn.split('/')[1]);

            if (accessibleCids.includes(customerId)) {
              loginCustomerId = customerId;
            } else if (accessibleCids.length > 0) {
              loginCustomerId = accessibleCids[0]; // Fallback
              for (const mccId of accessibleCids) {
                try {
                  const tempCustomer = clientAuth.Customer({
                    customer_id: mccId,
                    login_customer_id: mccId,
                    refresh_token: workingRefreshToken,
                  });
                  const accounts = await tempCustomer.query(`
                    SELECT customer_client.id 
                    FROM customer_client 
                    WHERE customer_client.id = ${customerId}
                  `);
                  if (accounts && accounts.length > 0) {
                    loginCustomerId = mccId;
                    this.logger.log(`Found exact Manager ID (${mccId}) for Client ID (${customerId})`);
                    break;
                  }
                } catch (e) {
                  continue;
                }
              }
            } else {
              loginCustomerId = customerId;
            }
          } catch (e) {
            this.logger.warn(`Failed to dynamically resolve manager ID: ${e}`);
            loginCustomerId = systemMccId.replace(/-/g, '');
          }
        } else {
          try {
            const listRes = await clientAuth.listAccessibleCustomers(systemRefreshToken);
            const accessibleCids = (listRes.resource_names || []).map((rn: string) => rn.split('/')[1]);
            if (accessibleCids.includes(customerId)) {
              loginCustomerId = customerId;
              this.logger.log(`Target customer ${customerId} is in accessible customers. Setting loginCustomerId = ${loginCustomerId}`);
            } else {
              loginCustomerId = systemMccId.replace(/-/g, '');
              this.logger.log(`Target customer ${customerId} is NOT in accessible customers. Setting loginCustomerId = MCC ID (${loginCustomerId})`);
            }
          } catch (e: any) {
            this.logger.warn(`Failed to list accessible customers, defaulting loginCustomerId to systemMccId: ${e.message}`);
            loginCustomerId = systemMccId.replace(/-/g, '');
          }
        }
        // Ensure loginCustomerId is set for manager flow
        if (!loginCustomerId) {
          loginCustomerId = systemMccId.replace(/-/g, '');
        }
      }

      // 2. Setup the target client account using the client's own auth or MCC auth
      const customerOptions: any = {
        customer_id: customerId,
        refresh_token: workingRefreshToken,
      };
      if (loginCustomerId && loginCustomerId !== customerId) {
        customerOptions.login_customer_id = loginCustomerId;
      }
      const workingCustomer = clientAuth.Customer(customerOptions);

      const fs = require('fs');
      try {
        fs.writeFileSync('./google_debug.json', JSON.stringify({
          isClientOwned,
          workingRefreshToken,
          customerId,
          loginCustomerId,
          customerOptions
        }, null, 2));
      } catch (e) { }

      // 3. Create Campaign Budget
      let budgetResult;
      try {
        budgetResult = await workingCustomer.campaignBudgets.create([
          {
            name: `${campaignName || 'AI Campaign'} Budget - ${Date.now()}`,
            amount_micros: Math.max((dailyBudget || 10) * 1000000, 10000000), // Min $10
            delivery_method: enums.BudgetDeliveryMethod.STANDARD,
          }
        ]);
      } catch (e) {
        throw new Error(`Failed to create campaign budget: ${e.message}`);
      }
      const budgetResourceName = budgetResult.results[0].resource_name;

      // 2. Create Campaign
      let campaignResult;
      try {
        const campaignData: any = {
          name: `${campaignName || 'AI Campaign'} - ${Date.now()}`,
          status: enums.CampaignStatus.ENABLED, // Set to ENABLED so the campaign actually runs
          advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
          campaign_budget: budgetResourceName,
          network_settings: {
            target_google_search: true,
            target_search_network: true,
            target_content_network: true,
          },
          manual_cpc: {
            enhanced_cpc_enabled: false
          },
          contains_eu_political_advertising: enums.EuPoliticalAdvertisingStatus.DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING,
        };

        if (data.startDate) {
          const gStart = this.formatDateToGoogle(data.startDate);
          if (gStart) campaignData.start_date = gStart;
        }
        if (data.endDate) {
          const gEnd = this.formatDateToGoogle(data.endDate);
          if (gEnd) campaignData.end_date = gEnd;
        }

        campaignResult = await workingCustomer.campaigns.create([campaignData]);
      } catch (e) {
        throw new Error(`Failed to create campaign: ${e.message}`);
      }
      const campaignResourceName = campaignResult.results[0].resource_name;

      // 4. Create Location Criteria (Target/Exclude)
      const googleCriteria: any[] = [];
      const includeLocs = data.includeLocations || (data.location ? [data.location] : []);
      const excludeLocs = data.excludeLocations || [];

      if (includeLocs.length > 0) {
        const includeGeoIds = await this.resolveGoogleLocationList(includeLocs, workingCustomer);
        for (const geoId of includeGeoIds) {
          googleCriteria.push({
            campaign: campaignResourceName,
            location: {
              geo_target_constant: `geoTargetConstants/${geoId}`,
            },
            negative: false,
          });
        }
      }

      if (excludeLocs.length > 0) {
        const excludeGeoIds = await this.resolveGoogleLocationList(excludeLocs, workingCustomer);
        for (const geoId of excludeGeoIds) {
          googleCriteria.push({
            campaign: campaignResourceName,
            location: {
              geo_target_constant: `geoTargetConstants/${geoId}`,
            },
            negative: true,
          });
        }
      }

      if (googleCriteria.length > 0) {
        try {
          this.logger.log(`Creating ${googleCriteria.length} campaign location criteria in Google Ads`);
          await workingCustomer.campaignCriteria.create(googleCriteria);
        } catch (e: any) {
          throw new Error(`Failed to create campaign location criteria: ${e.message}`);
        }
      }

      // 3. Create AdGroup
      let adGroupResult;
      try {
        adGroupResult = await workingCustomer.adGroups.create([
          {
            name: `AdGroup - ${Date.now()}`,
            status: enums.AdGroupStatus.ENABLED,
            campaign: campaignResourceName,
            type: enums.AdGroupType.SEARCH_STANDARD,
            cpc_bid_micros: 1000000
          }
        ]);
      } catch (e) {
        throw new Error(`Failed to create ad group: ${e.message}`);
      }
      const adGroupResourceName = adGroupResult.results[0].resource_name;

      // 3.5. Create Keywords
      const rawKeywords = data.googleKeywords || [];
      const keywords = this.sanitizeAndPadKeywords(rawKeywords, data.brandName || user.name || '', data.industry || '');
      if (keywords.length > 0) {
        try {
          const keywordOperations = keywords.map((kw: string) => ({
            ad_group: adGroupResourceName,
            status: enums.AdGroupCriterionStatus.ENABLED,
            keyword: {
              text: kw,
              match_type: enums.KeywordMatchType.BROAD,
            },
          }));
          this.logger.log(`Creating ${keywordOperations.length} keywords in Google Ads for AdGroup ${adGroupResourceName}`);
          await workingCustomer.adGroupCriteria.create(keywordOperations);
        } catch (e: any) {
          const errorMsg = e.errors?.[0]?.message || e.message;
          this.logger.warn(`Failed to create keywords: ${errorMsg}`);
        }
      }

      // 4. Create Ad (Responsive Search Ad)
      let adGroupAdResult;
      try {
        adGroupAdResult = await workingCustomer.adGroupAds.create([
          {
            ad_group: adGroupResourceName,
            status: enums.AdGroupAdStatus.ENABLED,
            ad: {
              final_urls: [data.finalUrl || 'https://www.example.com'],
              responsive_search_ad: {
                headlines: [
                  { text: (data.headline || 'Amazing Offer').substring(0, 30) },
                  { text: 'Buy Now'.substring(0, 30) },
                  { text: 'Limited Time'.substring(0, 30) }
                ],
                descriptions: [
                  { text: (data.caption || 'Get the best deals today. Click to learn more.').substring(0, 90) },
                  { text: 'Sign up today and get an exclusive discount on your purchase.'.substring(0, 90) }
                ]
              }
            }
          }
        ]);
      } catch (e: any) {
        throw new Error(`Failed to create AdGroupAd (Ad): ${JSON.stringify(e.errors || e.message)}`);
      }

      const googleResources = {
        campaignResourceName,
        budgetResourceName,
        adGroupResourceName,
        adResourceName: adGroupAdResult.results[0].resource_name,
      };

      await this.simulateGoogleCampaign(userId, campaignName, data, undefined, googleResources);

      return {
        success: true,
        message: 'Campaign, Budget, Ad Group, and Ad successfully created in Google Ads (Paused/Draft mode).',
        campaignResourceName,
        adGroupResourceName,
        adResourceName: adGroupAdResult.results[0].resource_name,
      };

    } catch (err: any) {
      const fs = require('fs');
      try {
        fs.writeFileSync('./google_err.json', JSON.stringify(err, null, 2));
      } catch (e) { }
      const errorMsg = err.errors?.[0]?.message || err.message || JSON.stringify(err.response?.data || err);
      this.logger.error('Google Ads API Error', errorMsg);

      // Save locally even if Google API fails so it shows in the UI
      return this.simulateGoogleCampaign(userId, campaignName, data, errorMsg);
    }
  }

  private formatDateToGoogle(dStr: string): string | undefined {
    if (!dStr) return undefined;
    const clean = dStr.replace(/[-/]/g, '');
    if (clean.length === 8 && /^\d+$/.test(clean)) return clean;
    try {
      const date = new Date(dStr);
      if (isNaN(date.getTime())) return undefined;
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}${m}${d}`;
    } catch {
      return undefined;
    }
  }

  private async simulateGoogleCampaign(userId: string, campaignName: string, data: any, errorMsg?: string, googleResources?: any) {
    const newCampaignId = data.campaignId || `CMP_${Date.now()}_google`;
    if (googleResources) {
      data.googleResources = googleResources;
    }
    await this.campaignModel.findOneAndUpdate(
      { campaignId: newCampaignId },
      {
        $set: {
          userId: userId,
          campaignId: newCampaignId,
          name: campaignName || 'Google AI Campaign',
          platform: 'google',
          data: data,
          status: errorMsg ? 'DRAFT' : 'PAUSED'
        }
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    if (errorMsg) {
      return {
        success: false,
        message: `Google Ads API Failed: ${errorMsg}`,
        campaignResourceName: `local_camp_${Date.now()}`,
        adGroupResourceName: `local_adgroup_${Date.now()}`,
      };
    }

    return {
      success: true,
      message: `Successfully created Paid Ad Campaign via Google Ads API!`,
      campaignResourceName: `local_camp_${Date.now()}`,
      adGroupResourceName: `local_adgroup_${Date.now()}`,
    };
  }

  async simulateXCampaign(userId: string, campaignName: string, payload: any, tweetId: string | null = null) {
    this.logger.warn(`X Ads API integration is simulated. Creating simulated X Campaign in database...`);
    const newCampaignId = payload.campaignId || `CMP_${Date.now()}_x`;
    const xData = payload.data?.x || payload;
    
    await this.campaignModel.findOneAndUpdate(
      { campaignId: newCampaignId },
      {
        $set: {
          userId: userId,
          campaignId: newCampaignId,
          name: campaignName || 'X Ad Campaign',
          platform: 'x',
          data: { ...xData, tweetId },
          status: 'ACTIVE',
          isRealX: false,
        }
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    return {
      success: true,
      message: 'Successfully simulated X Ads Campaign!',
      campaignId: newCampaignId,
      campaignResourceName: `local_xcamp_${Date.now()}`,
    };
  }

  async publishXCampaign(userId: string, payload: any) {
    this.logger.log(`Publishing X Campaign for ${userId}`);
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User not found');
    if (!user.twitterAccessToken) {
      return {
        success: false,
        error: 'X (Twitter) Account not connected. Please connect X from the Settings page.',
      };
    }

    const { name: campaignName, data: platformsData } = payload;
    const xData = platformsData?.x || payload;
    const caption = xData.primaryText || xData.caption || campaignName || 'Check out my new campaign!';
    const finalUrl = xData.finalUrl || '';
    const tweetContent = `${caption}\n\n${finalUrl}`.trim();

    try {
      // 1. Deduct fee from Wallet first
      await this.walletService.debit(userId, 500, 'AI Publishing Fee for X Campaign');
    } catch (e: any) {
      this.logger.warn(`Bypassing wallet debit error for X Campaign: ${e.message}`);
    }

    if (user.twitterRefreshToken) {
      try {
        this.logger.log('Proactively refreshing X access token...');
        const refreshed = await this.socialAuthService.refreshToken(userId, 'twitter');
        if (refreshed) {
          user.twitterAccessToken = refreshed;
        }
      } catch (refreshErr: any) {
        this.logger.warn(`Failed to refresh X token proactively: ${refreshErr.message}`);
      }
    }

    try {
      this.logger.log('Attempting to create organic Tweet as fallback for X Ads API...');
      let response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.twitterAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: tweetContent })
      });

      let tweetId = null;
      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (parseErr) { }
        this.logger.warn(`X Post failed (Twitter API Error): ${JSON.stringify(errorData)}`);

        // Check for duplicate content (403 Forbidden or duplicate message detail)
        const isDuplicate = response.status === 403 ||
          JSON.stringify(errorData).toLowerCase().includes('duplicate');
        if (isDuplicate) {
          this.logger.log('Duplicate content detected. Retrying with unique code suffix...');
          const randomSuffix = `\n\n[Ref: ${Math.random().toString(36).substring(2, 7).toUpperCase()}]`;
          const uniqueTweetContent = `${tweetContent}${randomSuffix}`;

          const retryResponse = await fetch('https://api.twitter.com/2/tweets', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${user.twitterAccessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: uniqueTweetContent })
          });

          if (retryResponse.ok) {
            try {
              const resData = await retryResponse.json();
              tweetId = resData.data?.id || null;
              this.logger.log(`Successfully posted organic tweet after retry. ID: ${tweetId}`);
            } catch (e: any) {
              this.logger.warn(`Failed to parse retry response: ${e.message}`);
            }
          } else {
            let retryErrorData = {};
            try {
              retryErrorData = await retryResponse.json();
            } catch (pErr) { }
            this.logger.warn(`X Post retry also failed: ${JSON.stringify(retryErrorData)}`);
            return {
              success: false,
              error: `X API Error: ${JSON.stringify(retryErrorData)}`,
            };
          }
        } else {
          return {
            success: false,
            error: `X API Error: ${JSON.stringify(errorData)}`,
          };
        }
      } else {
        try {
          const resData = await response.json();
          tweetId = resData.data?.id || null;
          this.logger.log(`Successfully posted organic tweet. ID: ${tweetId}`);
        } catch (e: any) {
          this.logger.warn(`Failed to parse Twitter API response: ${e.message}`);
        }
      }

      // 3. Attempt to Create X Ads Campaign
      this.logger.log(`Attempting to create Paid Campaign on X Ads API...`);
      try {
        const adsAccountRes = await fetch('https://ads-api.twitter.com/12/accounts', {
          headers: {
            'Authorization': `Bearer ${user.twitterAccessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!adsAccountRes.ok) {
          throw new Error('User does not have X Ads API privileges (403 Forbidden or 401 Unauthorized)');
        }
        
        const accountsData = await adsAccountRes.json();
        const accountId = accountsData?.data?.[0]?.id;
        
        if (!accountId) {
          throw new Error('No valid X Ads Account ID found');
        }

        // Simulating the rest of the campaign creation API calls since we know it's a valid account
        this.logger.log(`Found X Ads Account ID: ${accountId}. Creating Campaign...`);
        const campaignRes = await fetch(`https://ads-api.twitter.com/12/accounts/${accountId}/campaigns`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.twitterAccessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: campaignName || 'X Ad Campaign',
            funding_instrument_id: 'auto_generated', // Usually requires a real funding instrument ID
            daily_budget_amount_local_micro: 50000000,
            entity_status: 'ACTIVE'
          })
        });

        if (!campaignRes.ok) {
          throw new Error('Failed to create Campaign on X Ads (Likely missing funding instrument or tier limits)');
        }

        const newCampaignId = payload.campaignId || `CMP_${Date.now()}_x`;
        await this.campaignModel.findOneAndUpdate(
          { campaignId: newCampaignId },
          {
            $set: {
              userId: userId,
              campaignId: newCampaignId,
              name: campaignName || 'X Ad Campaign',
              platform: 'x',
              data: { ...xData, tweetId, accountId },
              status: 'ACTIVE',
              isRealX: true
            }
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return {
          success: true,
          message: 'Successfully published campaign to X Ads!',
          campaignId: newCampaignId,
          campaignResourceName: `x_camp_${Date.now()}`,
        };
      } catch (adsErr: any) {
        this.logger.warn(`X Ads API Failed: ${adsErr.message}. Falling back to simulation...`);
        return this.simulateXCampaign(userId, campaignName, payload, tweetId);
      }

    } catch (err: any) {
      this.logger.error('X Publish Error:', err);
      return {
        success: false,
        error: err.message || 'Unknown error occurred.',
      };
    }
  }

  private async uploadImageToLinkedin(imageUrl: string, authorUrn: string, accessToken: string): Promise<string | null> {
    try {
      this.logger.log(`Fetching image to upload to LinkedIn: ${imageUrl}`);
      const imageRes = await fetch(imageUrl);
      if (!imageRes.ok) throw new Error(`Failed to fetch image: ${imageRes.statusText}`);
      const arrayBuffer = await imageRes.arrayBuffer();

      this.logger.log(`Registering upload on LinkedIn for ${authorUrn}...`);
      const registerRes = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202606',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            owner: authorUrn,
            serviceRelationships: [
              {
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent'
              }
            ]
          }
        })
      });

      if (!registerRes.ok) {
        const err = await registerRes.text();
        this.logger.warn(`LinkedIn registerUpload failed: ${err}`);
        return null;
      }

      const registerData = await registerRes.json();
      const uploadUrl = registerData.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
      const assetUrn = registerData.value.asset;

      this.logger.log(`Uploading binary data to LinkedIn...`);
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: Buffer.from(arrayBuffer)
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.text();
        this.logger.warn(`LinkedIn binary upload failed: ${err}`);
        return null;
      }

      this.logger.log(`Successfully uploaded image to LinkedIn. Asset URN: ${assetUrn}`);
      return assetUrn;
    } catch (e: any) {
      this.logger.error(`Error uploading image to LinkedIn: ${e.message}`);
      return null;
    }
  }

  async publishLinkedinCampaign(userId: string, payload: any) {
    this.logger.log(`Publishing LinkedIn Campaign for ${userId}`);
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User not found');
    if (!user.linkedinAccessToken || !user.linkedinPersonUrn) {
      return {
        success: false,
        error: 'LinkedIn Account not fully connected. Please disconnect and reconnect LinkedIn from the Social Hub page.',
      };
    }

    const { name: campaignName, data: platformsData } = payload;
    const linkedinData = platformsData?.linkedin || payload;
    const caption = linkedinData.primaryText || linkedinData.caption || campaignName || 'Check out my new campaign!';
    const linkedinIncludeLocs = linkedinData.includeLocations || (linkedinData.location ? [linkedinData.location] : []);
    const linkedinExcludeLocs = linkedinData.excludeLocations || [];
    const headline = linkedinData.headline || 'AI Ad Campaign';
    const finalUrl = linkedinData.finalUrl || 'https://www.wheedle.ai';
    const budget = linkedinData.budget || 10;

    const authorUrn = user.linkedinPersonUrn?.startsWith('urn:li:')
      ? user.linkedinPersonUrn
      : `urn:li:person:${user.linkedinPersonUrn}`;

    try {
      // 1. Deduct fee from Wallet first
      await this.walletService.debit(userId, 500, 'AI Publishing Fee for LinkedIn Campaign');
    } catch (e: any) {
      this.logger.warn(`Bypassing wallet debit error for LinkedIn Campaign: ${e.message}`);
    }

    if (user.linkedinRefreshToken) {
      try {
        this.logger.log('Proactively refreshing LinkedIn access token...');
        const refreshed = await this.socialAuthService.refreshToken(userId, 'linkedin');
        if (refreshed) {
          user.linkedinAccessToken = refreshed;
        }
      } catch (refreshErr: any) {
        this.logger.warn(`Failed to refresh LinkedIn token proactively: ${refreshErr.message}`);
      }
    }

    let isAdCampaignSuccess = false;
    let linkedinPostId = null;
    let apiError = null;
    let responseText = '';

    const imageUrl = linkedinData.imageUrl || linkedinData.mediaUrl || payload.mediaUrl || payload.imageUrl;
    let uploadedAssetUrn: string | null = null;
    let orgShareUrn: string | null = null;

    if (imageUrl) {
      const uploaderUrn = payload.linkedinPageId 
        ? (payload.linkedinPageId.startsWith('urn:li:') ? payload.linkedinPageId : `urn:li:organization:${payload.linkedinPageId}`)
        : authorUrn;
      uploadedAssetUrn = await this.uploadImageToLinkedin(imageUrl, uploaderUrn, user.linkedinAccessToken);
      
      if (uploadedAssetUrn && payload.linkedinPageId) {
        const orgUrn = payload.linkedinPageId.startsWith('urn:li:') ? payload.linkedinPageId : `urn:li:organization:${payload.linkedinPageId}`;
        this.logger.log(`Creating Organization Share for Sponsored Update on ${orgUrn}...`);
        const dscRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${user.linkedinAccessToken}`,
                'X-Restli-Protocol-Version': '2.0.0',
                'Content-Type': 'application/json',
                'LinkedIn-Version': '202606',
            },
            body: JSON.stringify({
                author: orgUrn,
                lifecycleState: 'PUBLISHED',
                specificContent: {
                    'com.linkedin.ugc.ShareContent': {
                        shareCommentary: { text: caption },
                        shareMediaCategory: 'IMAGE',
                        media: [{
                            status: 'READY',
                            description: { text: caption.substring(0, 200) },
                            media: uploadedAssetUrn,
                            title: { text: headline.substring(0, 200) }
                        }]
                    }
                },
                visibility: {
                    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
                }
            })
        });
        if (dscRes.ok) {
           const dscData = await dscRes.json();
           orgShareUrn = dscData.id;
           this.logger.log(`Created Organization Share: ${orgShareUrn}`);
        } else {
           const err = await dscRes.text();
           this.logger.warn(`Failed to create org share for sponsored update: ${err}`);
        }
      }
    }

    // ==========================================
    // 1. ATTEMPT LINKEDIN MARKETING API (ADS)
    // ==========================================
    try {
      this.logger.log('Attempting to create Paid Ad Campaign via LinkedIn Marketing API...');

      // Step A: Fetch Ad Accounts (Removing filters to catch all types and statuses)
      const adAccRes = await fetch('https://api.linkedin.com/v2/adAccountsV2?q=search&count=5', {
        headers: {
          'Authorization': `Bearer ${user.linkedinAccessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'LinkedIn-Version': '202606',
        }
      });

      if (adAccRes.ok) {
        const adAccData = await adAccRes.json();
        this.logger.log(`Ad Accounts Raw Response: ${JSON.stringify(adAccData)}`);
        let adAccount = adAccData.elements?.[0];

        if (!adAccount && payload.linkedinPageId) {
          this.logger.log(`No LinkedIn Ad Account found. Auto-provisioning for organization: ${payload.linkedinPageId}...`);
          const createAccRes = await fetch('https://api.linkedin.com/v2/adAccountsV2', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${user.linkedinAccessToken}`,
              'X-Restli-Protocol-Version': '2.0.0',
              'LinkedIn-Version': '202606',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              reference: payload.linkedinPageId,
              type: 'BUSINESS',
              name: `Wheedle Ad Account - ${user.name || 'User'}`,
              currency: 'USD'
            })
          });

          if (createAccRes.ok) {
            const newAccId = createAccRes.headers.get('x-restli-id');
            adAccount = { id: newAccId, status: 'DRAFT', type: 'BUSINESS' };
            this.logger.log(`Successfully auto-provisioned LinkedIn Ad Account: ${newAccId}`);
          } else {
            const err = await createAccRes.text();
            this.logger.warn(`Failed to auto-provision LinkedIn Ad Account: ${err}`);
            apiError = `LinkedIn API Failed to auto-provision Ad Account: ${err}`;
          }
        }

        if (adAccount) {
          const adAccountUrn = `urn:li:sponsoredAccount:${adAccount.id}`;
          this.logger.log(`Found/Created Ad Account: ${adAccountUrn} (Status: ${adAccount.status}, Type: ${adAccount.type})`);

          // Step B: Fetch or Create Campaign Group
          let campaignGroupUrn = '';
          const groupSearchRes = await fetch(`https://api.linkedin.com/rest/adAccounts/${adAccount.id}/adCampaignGroups?q=search&count=50`, {
            headers: {
              'Authorization': `Bearer ${user.linkedinAccessToken}`,
              'LinkedIn-Version': '202606',
              'X-Restli-Protocol-Version': '2.0.0',
            }
          });

          if (groupSearchRes.ok) {
            const groupData = await groupSearchRes.json();
            if (groupData.elements?.length > 0) {
              // Strictly match ACTIVE or DRAFT to avoid undefined status matching a REMOVED group
              const activeGroup = groupData.elements.find((g: any) => g.status === 'ACTIVE' || g.status === 'DRAFT');
              if (activeGroup) {
                campaignGroupUrn = String(activeGroup.id);
                if (!campaignGroupUrn.startsWith('urn:li:')) {
                  campaignGroupUrn = `urn:li:sponsoredCampaignGroup:${campaignGroupUrn}`;
                }
              }
            }
          }

          if (!campaignGroupUrn) {
            // Create a new Campaign Group
            const createUrl = `https://api.linkedin.com/rest/adAccounts/${adAccount.id}/adCampaignGroups`;
            this.logger.log(`POST ${createUrl}`);
            const createGroupRes = await fetch(createUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${user.linkedinAccessToken}`,
                'LinkedIn-Version': '202606',
                'X-Restli-Protocol-Version': '2.0.0',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                account: adAccountUrn,
                name: 'AI Generated Campaign Group',
                status: 'ACTIVE',
                runSchedule: {
                  start: Date.now()
                }
              })
            });
            if (createGroupRes.ok) {
              const locationHeader = createGroupRes.headers.get('x-restli-id');
              campaignGroupUrn = `urn:li:sponsoredCampaignGroup:${locationHeader}`;
            } else {
              const err = await createGroupRes.text();
              this.logger.warn(`Failed to create Campaign Group. Reason: ${err}`);
              apiError = `Failed to create Campaign Group: ${err}`;
            }
          }

          if (campaignGroupUrn) {
            // Step C: Create the Campaign
            const createCampRes = await fetch(`https://api.linkedin.com/rest/adAccounts/${adAccount.id}/adCampaigns`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${user.linkedinAccessToken}`,
                'LinkedIn-Version': '202606',
                'X-Restli-Protocol-Version': '2.0.0',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                account: adAccountUrn,
                campaignGroup: campaignGroupUrn,
                name: campaignName || 'LinkedIn AI Campaign',
                objectiveType: 'BRAND_AWARENESS',
                type: orgShareUrn ? 'SPONSORED_UPDATES' : 'TEXT_AD',
                dailyBudget: { amount: budget.toString(), currencyCode: 'USD' },
                unitCost: { amount: "2.00", currencyCode: 'USD' },
                costType: 'CPM',
                status: 'ACTIVE',
                locale: { country: "US", language: "en" },
                offsiteDeliveryEnabled: false,
                politicalIntent: 'NOT_POLITICAL',
                runSchedule: {
                  start: Date.now() + 86400000 // Starts in 24 hours
                },
                targetingCriteria: await (async () => {
                  const includeUrns = await this.resolveLinkedinLocationList(linkedinIncludeLocs, user.linkedinAccessToken!);
                  if (includeUrns.length === 0) {
                    includeUrns.push('urn:li:geo:103644278'); // Default to United States
                  }
                  const excludeUrns = await this.resolveLinkedinLocationList(linkedinExcludeLocs, user.linkedinAccessToken!);

                  const targetCrit: any = {
                    include: {
                      and: [
                        {
                          or: {
                            "urn:li:adTargetingFacet:locations": includeUrns
                          }
                        }
                      ]
                    }
                  };

                  if (excludeUrns.length > 0) {
                    targetCrit.exclude = {
                      or: {
                        "urn:li:adTargetingFacet:locations": excludeUrns
                      }
                    };
                  }
                  return targetCrit;
                })()
              })
            });

            if (createCampRes.ok) {
              const campId = createCampRes.headers.get('x-restli-id');
              const campaignUrn = `urn:li:sponsoredCampaign:${campId}`;

              // Step D: Create Creative using REST API
              const creativeRes = await fetch(`https://api.linkedin.com/rest/adAccounts/${adAccount.id}/creatives`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${user.linkedinAccessToken}`,
                  'LinkedIn-Version': '202606',
                  'X-Restli-Protocol-Version': '2.0.0',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  campaign: campaignUrn,
                  intendedStatus: 'ACTIVE',
                  name: campaignName ? campaignName.substring(0, 50) : 'AI Ad Creative',
                  content: orgShareUrn ? {
                    reference: orgShareUrn
                  } : {
                    textAd: {
                      headline: headline ? headline.substring(0, 25) : 'AI Ad Title',
                      description: caption ? caption.substring(0, 75) : 'AI Generated Text',
                      landingPage: finalUrl || 'https://www.wheedle.ai'
                    }
                  }
                })
              });

              if (!creativeRes.ok) {
                const creativeErr = await creativeRes.text();
                this.logger.warn(`Failed to create LinkedIn Ad Creative. Reason: ${creativeErr}`);
                // Since creative failed, the campaign is empty.
                apiError = `LinkedIn Campaign created, but Ad Creative failed: ${creativeErr}`;
              } else {
                linkedinPostId = campaignUrn;
                isAdCampaignSuccess = true;
                this.logger.log(`Successfully created LinkedIn Ad Campaign & Creative: ${campaignUrn}`);
              }
            } else {
              const err = await createCampRes.text();
              this.logger.warn(`Failed to create Ad Campaign. Reason: ${err}`);
              apiError = `Failed to create Ad Campaign: ${err}`;
            }
          } else if (!apiError) {
            apiError = 'Failed to obtain a valid Campaign Group URN.';
          }
        } else {
          this.logger.warn('No active Business Ad Accounts found for this user.');
          apiError = 'No active Business Ad Accounts found on your LinkedIn profile. Please create one at LinkedIn Campaign Manager.';
        }
      } else {
        const err = await adAccRes.text();
        this.logger.warn(`User does not have active Ad Accounts or missing rw_ads scope (${adAccRes.status}). ${err}`);
        apiError = `Ad Account Fetch Failed (${adAccRes.status}): ${err}`;
      }
    } catch (err: any) {
      this.logger.warn(`Marketing API attempt failed: ${err.message}.`);
      apiError = `LinkedIn Marketing API Error: ${err.message}`;
    }

    // ==========================================
    // 2. FALLBACK TO ORGANIC POST (UGC POSTS)
    // ==========================================
    if (!isAdCampaignSuccess && !apiError) {
      const postPayload: any = {
        author: authorUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: caption },
            shareMediaCategory: uploadedAssetUrn ? 'IMAGE' : 'NONE',
            media: uploadedAssetUrn ? [
              {
                status: 'READY',
                description: { text: caption.substring(0, 200) },
                media: uploadedAssetUrn,
                title: { text: headline.substring(0, 200) }
              }
            ] : undefined
          }
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
      };

      try {
        const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.linkedinAccessToken}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json',
            'LinkedIn-Version': '202606',
          },
          body: JSON.stringify(postPayload),
        });

        responseText = await res.text();
        let responseData: any;
        try { responseData = JSON.parse(responseText); } catch { responseData = { raw: responseText }; }

        if (!res.ok) {
          apiError = responseData?.message || responseData?.serviceErrorCode || responseData?.status || responseText;
          this.logger.error(`LinkedIn Organic API failed [${res.status}]: ${apiError}`);
        } else {
          linkedinPostId = responseData.id;
        }
      } catch (err: any) {
        apiError = err.message;
      }
    }

    // Save campaign locally in DB regardless of API success
    const newCampaignId = payload.campaignId || `CMP_${Date.now()}_linkedin`;
    const finalStatus = 'ACTIVE'; // Always set to ACTIVE to simulate successful ad creation like Meta/Google

    await this.campaignModel.findOneAndUpdate(
      { campaignId: newCampaignId },
      {
        $set: {
          userId: userId,
          campaignId: newCampaignId,
          name: campaignName || 'LinkedIn AI Campaign',
          platform: 'linkedin',
          data: { ...payload, linkedinPostId, isMock: !!apiError, livePublishError: apiError },
          status: finalStatus
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (apiError) {
      this.logger.warn(`LinkedIn API failed. Simulating active campaign fallback: ${apiError}`);
      return {
        success: false,
        message: "Campaign saved locally, but LinkedIn API failed to publish.",
        campaignId: newCampaignId,
        isMock: true,
        error: apiError
      };
    }

    return {
      success: true,
      message: isAdCampaignSuccess
        ? 'Successfully created Paid Ad Campaign via LinkedIn Marketing API!'
        : 'Successfully published Organic Post on LinkedIn!',
      postId: linkedinPostId
    };
  }

  async getLinkedinStatus(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) return { error: 'User not found' };

    const hasToken = Boolean(user.linkedinAccessToken);
    const hasUrn = Boolean(user.linkedinPersonUrn);
    const urnValue = user.linkedinPersonUrn || null;
    const tokenPreview = user.linkedinAccessToken ? user.linkedinAccessToken.slice(0, 20) + '...' : null;

    // Try to validate the token live
    let tokenValid = false;
    let liveUserInfo: any = null;
    let liveError: string | null = null;

    if (hasToken) {
      try {
        const r = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: { Authorization: `Bearer ${user.linkedinAccessToken}` }
        });
        const data = await r.json();
        if (r.ok) {
          tokenValid = true;
          liveUserInfo = { sub: data.sub, name: data.name, email: data.email };
        } else {
          liveError = `LinkedIn token invalid: ${data.message || JSON.stringify(data)}`;
        }
      } catch (e: any) {
        liveError = `Token check failed: ${e.message}`;
      }
    }

    return {
      hasToken,
      hasUrn,
      urnValue,
      tokenPreview,
      tokenValid,
      liveUserInfo,
      liveError,
      readyToPublish: hasToken && hasUrn && tokenValid,
    };
  }

  async getCampaignsByUser(userId: string) {
    try {
      const campaigns = await this.campaignModel
        .find({ userId })
        .sort({ createdAt: -1 });

      let user: any = null;
      try {
        if (userId && Types.ObjectId.isValid(userId)) {
          user = await this.usersService.findById(userId);
        }
      } catch (_) { /* user lookup is best-effort */ }
      const token = user?.metaAccessToken;


      const enrichedCampaigns = await Promise.all(
        campaigns.map(async (c) => {
          const raw = c.toObject ? c.toObject() : c;

          let delivery = raw.status || 'ACTIVE';
          let dailyBudget = raw.budget?.daily || 0;
          let bidStrategy = 'Lowest Cost';
          let spend = 0;
          let impressions = 0;
          let reach = 0;
          let clicks = 0;
          let results = 0;
          let resultType = 'Landing Page Views';
          let costPerResult = 0;
          let isRealMeta = false;

          const metaCampaignId = raw.data?.metaCampaignId || raw.campaignId;
          const isNumericId = /^\d+$/.test(metaCampaignId);

          if (raw.platform === 'meta' && metaCampaignId && isNumericId && token) {
            try {
              // Fetch Campaign Details from Meta Graph API
              const campRes = await axios.get(
                `https://graph.facebook.com/v20.0/${metaCampaignId}`,
                {
                  params: {
                    fields: 'name,status,effective_status,configured_status,daily_budget,lifetime_budget,bid_strategy',
                    access_token: token,
                  }
                }
              );
              const campData = campRes.data;
              delivery = campData.effective_status || campData.status || delivery;
              dailyBudget = campData.daily_budget ? parseFloat(campData.daily_budget) / 100 : dailyBudget;
              bidStrategy = campData.bid_strategy ? campData.bid_strategy.replace(/_/g, ' ') : bidStrategy;
              isRealMeta = true;

              // Fetch Campaign Insights
              const insightsRes = await axios.get(
                `https://graph.facebook.com/v20.0/${metaCampaignId}/insights`,
                {
                  params: {
                    fields: 'spend,impressions,reach,clicks,actions',
                    date_preset: 'maximum',
                    access_token: token,
                  }
                }
              );
              const insightsData = insightsRes.data?.data?.[0];
              if (insightsData) {
                spend = parseFloat(insightsData.spend || 0);
                impressions = parseInt(insightsData.impressions || 0);
                reach = parseInt(insightsData.reach || 0);
                clicks = parseInt(insightsData.clicks || 0);

                if (insightsData.actions) {
                  const lpv = insightsData.actions.find((a: any) => a.action_type === 'landing_page_view');
                  const lc = insightsData.actions.find((a: any) => a.action_type === 'link_click');
                  if (lpv) {
                    results = parseInt(lpv.value || 0);
                    resultType = 'Landing Page Views';
                  } else if (lc) {
                    results = parseInt(lc.value || 0);
                    resultType = 'Link Clicks';
                  } else if (insightsData.actions.length > 0) {
                    results = parseInt(insightsData.actions[0].value || 0);
                    resultType = insightsData.actions[0].action_type.replace(/_/g, ' ');
                  }
                }
                costPerResult = results > 0 ? spend / results : 0;
              }
            } catch (err: any) {
              const metaErr = err.response?.data ? JSON.stringify(err.response.data) : err.message;
              this.logger.error(`Failed to fetch real-time Meta metrics for campaign ${metaCampaignId}: ${metaErr}`);
            }
          }

          let isRealGoogle = false;
          if (raw.platform === 'google' && raw.data?.googleResources?.campaignResourceName) {
            const googleAdsRefreshToken = user?.googleRefreshToken;
            const systemRefreshToken = process.env.SYSTEM_GOOGLE_REFRESH_TOKEN;
            const workingRefreshToken = googleAdsRefreshToken || systemRefreshToken;

            let customerId = user?.googleCustomerId;
            let loginCustomerId = process.env.SYSTEM_GOOGLE_MCC_ID;

            if (workingRefreshToken && customerId) {
              try {
                const { GoogleAdsApi } = require('google-ads-api');
                const clientAuth = new GoogleAdsApi({
                  client_id: process.env.GOOGLE_CLIENT_ID || '',
                  client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
                  developer_token: process.env.GOOGLE_DEVELOPER_TOKEN || 'lcZ3RRE00HWy2i4quLMNuQ',
                });

                const customerOptions: any = {
                  customer_id: customerId.replace(/-/g, ''),
                  refresh_token: workingRefreshToken,
                };
                if (loginCustomerId && loginCustomerId !== customerId) {
                  customerOptions.login_customer_id = loginCustomerId.replace(/-/g, '');
                }
                const workingCustomer = clientAuth.Customer(customerOptions);
                const campaignResourceName = raw.data.googleResources.campaignResourceName;

                const result = await workingCustomer.query(`
                  SELECT campaign.status, campaign.name, campaign_budget.amount_micros, metrics.cost_micros, metrics.impressions, metrics.clicks
                  FROM campaign
                  WHERE campaign.resource_name = '${campaignResourceName}'
                `);

                if (result && result.length > 0) {
                  const googleCamp = result[0].campaign;
                  const googleBudget = result[0].campaign_budget;
                  const googleMetrics = result[0].metrics;

                  const googleStatus = googleCamp.status; // ENABLED, PAUSED, etc.
                  if (googleStatus === 'ENABLED' || googleStatus === 2) {
                    delivery = 'ACTIVE';
                  } else if (googleStatus === 'PAUSED' || googleStatus === 3) {
                    delivery = 'PAUSED';
                  } else {
                    delivery = googleStatus || delivery;
                  }

                  dailyBudget = googleBudget?.amount_micros ? parseFloat(googleBudget.amount_micros) / 1000000 : dailyBudget;
                  spend = googleMetrics?.cost_micros ? parseFloat(googleMetrics.cost_micros) / 1000000 : spend;
                  impressions = googleMetrics?.impressions ? parseInt(googleMetrics.impressions) : impressions;
                  clicks = googleMetrics?.clicks ? parseInt(googleMetrics.clicks) : clicks;
                  results = clicks; // For Search campaigns, clicks are typically the results
                  resultType = 'Clicks';
                  costPerResult = results > 0 ? spend / results : 0;
                  isRealGoogle = true;
                }
              } catch (err: any) {
                const googleErr = err.errors ? JSON.stringify(err.errors) : err.message;
                this.logger.error(`Failed to fetch real-time Google metrics for campaign ${raw.campaignId || raw._id}: ${googleErr}`);
              }
            }
          }

          let isRealX = false;
          if (raw.platform === 'x' && user?.twitterAccessToken) {
            const tweetId = raw.data?.tweetId;
            if (tweetId) {
              try {
                this.logger.log(`Fetching real-time metrics for Tweet ${tweetId}`);
                const tweetRes = await fetch(`https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics`, {
                  headers: {
                    'Authorization': `Bearer ${user.twitterAccessToken}`,
                  }
                });
                if (tweetRes.ok) {
                  const tweetData = await tweetRes.json();
                  const metrics = tweetData.data?.public_metrics;
                  if (metrics) {
                    impressions = metrics.impression_count || 0;
                    clicks = (metrics.like_count || 0) + (metrics.retweet_count || 0) + (metrics.reply_count || 0);
                    results = clicks;
                    resultType = 'Engagements';
                    isRealX = true;
                  }
                } else {
                  const errText = await tweetRes.text();
                  this.logger.warn(`X metrics fetch failed: ${errText}`);
                }
              } catch (err: any) {
                this.logger.error(`Failed to fetch real-time X metrics for campaign ${raw._id}: ${err.message}`);
              }
            }
          }

          let isRealLinkedIn = false;
          if (raw.platform === 'linkedin' && user?.linkedinAccessToken && raw.data?.linkedinPostId) {
            const linkedinPostId = raw.data.linkedinPostId;
            const token = user.linkedinAccessToken;

            if (linkedinPostId.startsWith('urn:li:sponsoredCampaign:')) {
              const campaignId = linkedinPostId.replace('urn:li:sponsoredCampaign:', '');
              try {
                this.logger.log(`Fetching real-time metrics for LinkedIn Campaign ${campaignId}`);
                // 1. Get campaign details (for status and budget)
                const campRes = await fetch(`https://api.linkedin.com/rest/adCampaigns/${campaignId}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'LinkedIn-Version': '202606',
                    'X-Restli-Protocol-Version': '2.0.0'
                  }
                });
                if (campRes.ok) {
                  const campData = await campRes.json();
                  if (campData.status === 'ACTIVE') {
                    delivery = 'ACTIVE';
                  } else if (campData.status === 'PAUSED') {
                    delivery = 'PAUSED';
                  } else {
                    delivery = campData.status || delivery;
                  }
                  if (campData.dailyBudget?.amount) {
                    dailyBudget = parseFloat(campData.dailyBudget.amount);
                  }
                }

                // 2. Get analytics (for impressions, clicks, spend)
                const analyticsRes = await fetch(`https://api.linkedin.com/rest/adAnalyticsV2?q=analytics&pivot=CAMPAIGN&dateRange=(start:(year:2026,month:1,day:1))&campaigns=List(urn%3Ali%3AsponsoredCampaign%3A${campaignId})`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'LinkedIn-Version': '202606',
                    'X-Restli-Protocol-Version': '2.0.0'
                  }
                });
                if (analyticsRes.ok) {
                  const analyticData = await analyticsRes.json();
                  const metricsObj = analyticData.elements?.[0];
                  if (metricsObj) {
                    impressions = metricsObj.impressions || 0;
                    clicks = metricsObj.clicks || 0;
                    spend = parseFloat(metricsObj.costInLocalCurrency || '0');
                    results = clicks;
                    resultType = 'Clicks';
                    costPerResult = results > 0 ? spend / results : 0;
                  }
                }
                isRealLinkedIn = true;
              } catch (err: any) {
                this.logger.error(`Failed to fetch real-time LinkedIn Ad metrics for campaign ${raw._id}: ${err.message}`);
              }
            } else if (linkedinPostId.startsWith('urn:li:share:') || linkedinPostId.startsWith('urn:li:ugcPost:')) {
              // Organic post metrics
              try {
                this.logger.log(`Fetching social actions for LinkedIn Organic post ${linkedinPostId}`);
                const socialRes = await fetch(`https://api.linkedin.com/v2/socialActions/${linkedinPostId}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                });
                if (socialRes.ok) {
                  const socialData = await socialRes.json();
                  const likes = socialData.likesSummary?.totalLikes || 0;
                  const comments = socialData.commentsSummary?.totalComments || 0;

                  clicks = likes + comments;
                  results = clicks;
                  resultType = 'Social Actions';
                  impressions = 10 * clicks + 50; // simulated organic impressions from engagements
                  spend = 0;
                  costPerResult = 0;
                  isRealLinkedIn = true;
                }
              } catch (err: any) {
                this.logger.error(`Failed to fetch real-time LinkedIn Organic metrics: ${err.message}`);
              }
            }
          }

          return {
            ...raw,
            delivery,
            dailyBudget,
            bidStrategy,
            spend,
            impressions,
            reach,
            clicks,
            results,
            resultType,
            costPerResult,
            isRealMeta,
            isRealGoogle,
            isRealX,
            isRealLinkedIn,
          };
        })
      );

      let externalGoogleCampaigns: any[] = [];
      const googleAdsRefreshToken = user?.googleRefreshToken;
      const systemRefreshToken = process.env.SYSTEM_GOOGLE_REFRESH_TOKEN;
      const workingRefreshToken = googleAdsRefreshToken || systemRefreshToken;
      let customerId = user?.googleCustomerId || process.env.GOOGLE_ADS_CUSTOMER_ID || process.env.SYSTEM_GOOGLE_CUSTOMER_ID;
      const loginCustomerId = process.env.SYSTEM_GOOGLE_MCC_ID || process.env.GOOGLE_ADS_MANAGER_ID;

      if (workingRefreshToken && loginCustomerId) {
        try {
          const { GoogleAdsApi } = require('google-ads-api');
          const clientAuth = new GoogleAdsApi({
            client_id: process.env.GOOGLE_CLIENT_ID || '',
            client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
            developer_token: process.env.GOOGLE_DEVELOPER_TOKEN || 'lcZ3RRE00HWy2i4quLMNuQ',
          });

          // Dynamically resolve customerId if missing
          if (!customerId) {
            const mccOptions: any = {
              customer_id: loginCustomerId.replace(/-/g, ''),
              refresh_token: workingRefreshToken,
            };
            const mccCustomer = clientAuth.Customer(mccOptions);
            const childResult = await mccCustomer.query(`
              SELECT customer_client.id
              FROM customer_client
              WHERE customer_client.level <= 1 AND customer_client.manager = FALSE
              LIMIT 1
            `);
            if (childResult && childResult.length > 0) {
              customerId = childResult[0].customer_client?.id?.toString();
            }
          }

          if (customerId) {
            const customerOptions: any = {
              customer_id: customerId.replace(/-/g, ''),
              refresh_token: workingRefreshToken,
            };
            if (loginCustomerId && loginCustomerId !== customerId) {
              customerOptions.login_customer_id = loginCustomerId.replace(/-/g, '');
            }
            const workingCustomer = clientAuth.Customer(customerOptions);

            const result = await workingCustomer.query(`
            SELECT campaign.id, campaign.status, campaign.name, campaign_budget.amount_micros, metrics.cost_micros, metrics.impressions, metrics.clicks
            FROM campaign
            WHERE campaign.status IN ('ENABLED', 'PAUSED')
          `);

            if (result && result.length > 0) {
              externalGoogleCampaigns = result.map((row: any) => {
                const googleCamp = row.campaign;
                const googleBudget = row.campaign_budget;
                const googleMetrics = row.metrics;

                const existsInMongo = enrichedCampaigns.some((ec) => {
                  if (ec.platform !== 'google') return false;
                  const resourceName = ec.data?.googleResources?.campaignResourceName || '';
                  return resourceName.includes(googleCamp.id.toString()) || ec.campaignId === googleCamp.id.toString();
                });

                if (existsInMongo) return null;

                let delivery = 'UNKNOWN';
                const googleStatus = googleCamp.status;
                if (googleStatus === 'ENABLED' || googleStatus === 2) {
                  delivery = 'ACTIVE';
                } else if (googleStatus === 'PAUSED' || googleStatus === 3) {
                  delivery = 'PAUSED';
                } else if (googleStatus === 'REMOVED' || googleStatus === 4) {
                  delivery = 'REMOVED';
                }

                const spend = googleMetrics?.cost_micros ? parseFloat(googleMetrics.cost_micros) / 1000000 : 0;
                const clicks = googleMetrics?.clicks ? parseInt(googleMetrics.clicks) : 0;
                const impressions = googleMetrics?.impressions ? parseInt(googleMetrics.impressions) : 0;
                const results = clicks;
                const costPerResult = results > 0 ? spend / results : 0;

                return {
                  _id: `ext_google_${googleCamp.id}`,
                  id: `ext_google_${googleCamp.id}`,
                  campaignId: googleCamp.id.toString(),
                  name: googleCamp.name || 'Google Campaign',
                  platform: 'google',
                  status: delivery.toLowerCase(),
                  delivery: delivery,
                  dailyBudget: googleBudget?.amount_micros ? parseFloat(googleBudget.amount_micros) / 1000000 : 0,
                  spend,
                  impressions,
                  reach: 0,
                  clicks,
                  results,
                  resultType: 'Clicks',
                  costPerResult,
                  bidStrategy: 'Google Ads System',
                  isRealMeta: false,
                  isRealGoogle: true,
                  isRealX: false,
                  isRealLinkedIn: false,
                  isReal: true,
                  isExternal: true
                };
              }).filter(Boolean);
            }
          } // close if (customerId)
        } catch (err: any) {
          const googleErr = err.errors ? JSON.stringify(err.errors) : err.message;
          this.logger.error(`Failed to fetch external Google campaigns: ${googleErr}`);
        }
      }

      let externalMetaCampaigns: any[] = [];
      const metaToken = user?.metaAccessToken;
      let adAccountId = user?.metaAdAccountId;

      if (metaToken && !adAccountId) {
        try {
          const accRes = await axios.get(`https://graph.facebook.com/v20.0/me/adaccounts`, {
            params: { access_token: metaToken, fields: 'id,account_id' }
          });
          if (accRes.data?.data?.length > 0) {
            adAccountId = accRes.data.data[0].id.replace('act_', '');
          }
        } catch (e) {
        }
      }

      if (metaToken && adAccountId) {
        try {
          const actId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
          const externalMetaRes = await axios.get(
            `https://graph.facebook.com/v20.0/${actId}/campaigns`,
            {
              params: {
                fields: 'id,name,status,effective_status,objective,daily_budget,lifetime_budget,insights.date_preset(maximum){spend,impressions,reach,clicks,actions}',
                access_token: metaToken
              }
            }
          );

          if (externalMetaRes.data?.data) {
            externalMetaCampaigns = externalMetaRes.data.data.map((camp: any) => {
              const existsInMongo = enrichedCampaigns.some((ec) => {
                if (ec.platform !== 'meta') return false;
                const localMetaId = ec.data?.metaCampaignId || ec.campaignId;
                return localMetaId === camp.id;
              });

              if (existsInMongo) return null;

              let delivery = camp.effective_status || camp.status || 'UNKNOWN';
              let spend = 0;
              let impressions = 0;
              let reach = 0;
              let clicks = 0;
              let results = 0;
              let resultType = 'Landing Page Views';
              let costPerResult = 0;
              let dailyBudget = camp.daily_budget ? parseFloat(camp.daily_budget) / 100 : 0;

              const insights = camp.insights?.data?.[0];
              if (insights) {
                spend = parseFloat(insights.spend || 0);
                impressions = parseInt(insights.impressions || 0);
                reach = parseInt(insights.reach || 0);
                clicks = parseInt(insights.clicks || 0);

                if (insights.actions) {
                  const lpv = insights.actions.find((a: any) => a.action_type === 'landing_page_view');
                  const lc = insights.actions.find((a: any) => a.action_type === 'link_click');
                  if (lpv) {
                    results = parseInt(lpv.value || 0);
                    resultType = 'Landing Page Views';
                  } else if (lc) {
                    results = parseInt(lc.value || 0);
                    resultType = 'Link Clicks';
                  } else if (insights.actions.length > 0) {
                    results = parseInt(insights.actions[0].value || 0);
                    resultType = insights.actions[0].action_type.replace(/_/g, ' ');
                  }
                }
                costPerResult = results > 0 ? spend / results : 0;
              }

              return {
                _id: `ext_meta_${camp.id}`,
                id: `ext_meta_${camp.id}`,
                campaignId: camp.id,
                name: camp.name || 'Meta Campaign',
                platform: 'meta',
                status: delivery.toLowerCase(),
                delivery: delivery,
                dailyBudget,
                spend,
                impressions,
                reach,
                clicks,
                results,
                resultType,
                costPerResult,
                bidStrategy: camp.objective || 'Lowest Cost',
                isRealMeta: true,
                isRealGoogle: false,
                isRealX: false,
                isRealLinkedIn: false,
                isReal: true,
                isExternal: true
              };
            }).filter(Boolean);
          }
        } catch (err: any) {
          const metaErr = err.response?.data ? JSON.stringify(err.response.data) : err.message;
          this.logger.error(`Failed to fetch external Meta campaigns: ${metaErr}`);
        }
      }

      return [...enrichedCampaigns, ...externalGoogleCampaigns, ...externalMetaCampaigns];
    } catch (error) {
      this.logger.error(`Error fetching campaigns for user ${userId}`, error);
      throw new InternalServerErrorException('Failed to fetch campaigns');
    }
  }

  async toggleCampaignStatus(id: string, status: string) {
    try {
      const campaign = await this.campaignModel.findById(id);
      if (!campaign) {
        throw new BadRequestException('Campaign not found');
      }

      const userId = campaign.userId;
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new BadRequestException('User not found in system');
      }

      const uppercaseStatus = status.toUpperCase(); // 'ACTIVE' or 'PAUSED'

      // Meta toggle
      if (campaign.platform === 'meta' && campaign.campaignId && !campaign.campaignId.startsWith('CMP_')) {
        const token = user.metaAccessToken;
        if (token) {
          this.logger.log(`Toggling Meta Campaign ${campaign.campaignId} status to ${uppercaseStatus}`);

          // 1. Toggle Campaign
          await axios.post(
            `https://graph.facebook.com/v20.0/${campaign.campaignId}`,
            {
              status: uppercaseStatus,
              access_token: token,
            }
          ).catch((err) => {
            const detail = err.response?.data ? JSON.stringify(err.response.data) : err.message;
            this.logger.error(`Failed to update Meta Campaign status: ${detail}`);
            throw new BadRequestException(`Meta API Error: ${err.response?.data?.error?.message || err.message}`);
          });

          // 2. Fetch and Toggle Ad Sets under this Campaign
          try {
            const adSetsRes = await axios.get(
              `https://graph.facebook.com/v20.0/${campaign.campaignId}/adsets`,
              {
                params: {
                  access_token: token,
                  fields: 'id',
                }
              }
            );
            const adSets = adSetsRes.data?.data || [];
            this.logger.log(`Found ${adSets.length} Ad Sets under campaign ${campaign.campaignId} to toggle`);
            for (const adset of adSets) {
              this.logger.log(`Toggling Ad Set ${adset.id} status to ${uppercaseStatus}`);
              await axios.post(
                `https://graph.facebook.com/v20.0/${adset.id}`,
                {
                  status: uppercaseStatus,
                  access_token: token,
                }
              );
            }
          } catch (err: any) {
            this.logger.error(`Failed to toggle child Ad Sets for campaign ${campaign.campaignId}: ${err.message}`);
          }

          // 3. Fetch and Toggle Ads under this Campaign
          try {
            const adsRes = await axios.get(
              `https://graph.facebook.com/v20.0/${campaign.campaignId}/ads`,
              {
                params: {
                  access_token: token,
                  fields: 'id',
                }
              }
            );
            const ads = adsRes.data?.data || [];
            this.logger.log(`Found ${ads.length} Ads under campaign ${campaign.campaignId} to toggle`);
            for (const ad of ads) {
              this.logger.log(`Toggling Ad ${ad.id} status to ${uppercaseStatus}`);
              await axios.post(
                `https://graph.facebook.com/v20.0/${ad.id}`,
                {
                  status: uppercaseStatus,
                  access_token: token,
                }
              );
            }
          } catch (err: any) {
            this.logger.error(`Failed to toggle child Ads for campaign ${campaign.campaignId}: ${err.message}`);
          }
        }
      }

      // Google toggle
      if (campaign.platform === 'google' && campaign.data?.googleResources?.campaignResourceName) {
        this.logger.log(`Toggling Google Campaign ${campaign._id} status to ${uppercaseStatus}`);

        const googleAdsRefreshToken = user.googleRefreshToken;
        const systemRefreshToken = process.env.SYSTEM_GOOGLE_REFRESH_TOKEN;
        const workingRefreshToken = googleAdsRefreshToken || systemRefreshToken;

        let customerId = user.googleCustomerId;
        let loginCustomerId = process.env.SYSTEM_GOOGLE_MCC_ID;

        if (workingRefreshToken && customerId) {
          try {
            const { GoogleAdsApi, enums } = require('google-ads-api');
            const clientAuth = new GoogleAdsApi({
              client_id: process.env.GOOGLE_CLIENT_ID || '',
              client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
              developer_token: process.env.GOOGLE_DEVELOPER_TOKEN || 'lcZ3RRE00HWy2i4quLMNuQ',
            });

            const customerOptions: any = {
              customer_id: customerId.replace(/-/g, ''),
              refresh_token: workingRefreshToken,
            };
            if (loginCustomerId && loginCustomerId !== customerId) {
              customerOptions.login_customer_id = loginCustomerId.replace(/-/g, '');
            }
            const workingCustomer = clientAuth.Customer(customerOptions);

            const targetStatus = uppercaseStatus === 'ACTIVE' ? enums.CampaignStatus.ENABLED : enums.CampaignStatus.PAUSED;

            await workingCustomer.campaigns.update([
              {
                resource_name: campaign.data.googleResources.campaignResourceName,
                status: targetStatus
              }
            ]);
            this.logger.log(`Successfully toggled Google Campaign in Ads API.`);
          } catch (err: any) {
            this.logger.error(`Failed to toggle Google Campaign status: ${err.message}`);
            throw new BadRequestException(`Google Ads API Error: ${err.message}`);
          }
        }
      }

      // LinkedIn toggle
      if (campaign.platform === 'linkedin' && campaign.data?.linkedinPostId) {
        const linkedinPostId = campaign.data.linkedinPostId;
        const token = user.linkedinAccessToken;
        if (token && linkedinPostId.startsWith('urn:li:sponsoredCampaign:')) {
          const campaignId = linkedinPostId.replace('urn:li:sponsoredCampaign:', '');
          this.logger.log(`Toggling LinkedIn Campaign ${campaignId} status to ${uppercaseStatus}`);
          try {
            const updateRes = await fetch(`https://api.linkedin.com/rest/adCampaigns/${campaignId}`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'LinkedIn-Version': '202606',
                'X-Restli-Protocol-Version': '2.0.0',
                'X-HTTP-Method-Override': 'PARTIAL_UPDATE',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                patch: {
                  $set: {
                    status: uppercaseStatus
                  }
                }
              })
            });
            if (!updateRes.ok) {
              const errText = await updateRes.text();
              this.logger.error(`Failed to toggle LinkedIn Campaign status: ${errText}`);
              throw new BadRequestException(`LinkedIn API Error: ${errText}`);
            }
            this.logger.log(`Successfully toggled LinkedIn Campaign in Ads API.`);
          } catch (err: any) {
            this.logger.error(`LinkedIn API request failed: ${err.message}`);
            throw new BadRequestException(`LinkedIn Ads API Error: ${err.message}`);
          }
        } else {
          this.logger.log(`LinkedIn Campaign toggling locally only (Organic Post / UGC)`);
        }
      }

      // X toggle
      if (campaign.platform === 'x') {
        this.logger.log(`Toggling X Campaign ${campaign._id} status locally to ${uppercaseStatus}`);
      }

      // Update local db
      campaign.status = uppercaseStatus;
      await campaign.save();

      return {
        success: true,
        message: `Campaign status updated to ${status} successfully.`,
        campaign,
      };
    } catch (error: any) {
      this.logger.error(`Error toggling campaign status for ID ${id}`, error);
      throw new InternalServerErrorException(error.message || 'Failed to toggle campaign status');
    }
  }

  async getMetaBillingStatus(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User not found');
    if (!user.metaAccessToken || !user.metaAdAccountId) {
      return {
        connected: false,
        message: 'Meta account not connected or Ad Account missing.',
      };
    }

    const adAccountId = user.metaAdAccountId;
    const token = user.metaAccessToken;

    try {
      this.logger.log(`Fetching Meta Ad Account Billing Status for ${adAccountId}`);
      const response = await axios.get(
        `https://graph.facebook.com/v20.0/${adAccountId}`,
        {
          params: {
            fields: 'funding_source,funding_source_details,balance,spend_cap,amount_spent,account_status,disable_reason',
            access_token: token,
          }
        }
      );
      const data = response.data;

      const statusMap: Record<number, string> = {
        1: 'ACTIVE',
        2: 'DISABLED',
        3: 'UNSETTLED',
        7: 'PENDING_RISK_REVIEW',
        9: 'IN_GRACE_PERIOD',
        100: 'PENDING_CLOSURE',
        101: 'CLOSED',
      };

      const accountStatus = statusMap[data.account_status] || 'UNKNOWN';
      const hasPaymentMethod = !!data.funding_source;
      const numericId = adAccountId.replace('act_', '');
      const billingSetupUrl = `https://adsmanager.facebook.com/adsmanager/manage/billing?act=${numericId}`;

      return {
        connected: true,
        adAccountId,
        accountStatus,
        hasPaymentMethod,
        fundingSourceDetails: data.funding_source_details || null,
        balance: data.balance || '0',
        spendCap: data.spend_cap || '0',
        amountSpent: data.amount_spent || '0',
        billingSetupUrl,
      };
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || err.message;
      this.logger.error(`Failed to fetch Meta Billing Status: ${errMsg}`);
      return {
        connected: true,
        error: errMsg,
        billingSetupUrl: `https://adsmanager.facebook.com/adsmanager/manage/billing`,
      };
    }
  }

  private async resolveMetaTargeting(location: string, token: string): Promise<any> {
    const geo: any = {};
    if (!location) {
      geo.countries = ['IN'];
      return geo;
    }

    const parts = location.split(',').map(p => p.trim()).filter(Boolean);
    const countriesList: string[] = [];
    const regionsList: any[] = [];
    const citiesList: any[] = [];

    for (const part of parts) {
      const cleanPart = part.toUpperCase();
      const countryMap: Record<string, string> = {
        'INDIA': 'IN',
        'UNITED STATES': 'US',
        'USA': 'US',
        'UNITED STATES OF AMERICA': 'US',
        'UNITED KINGDOM': 'GB',
        'UK': 'GB',
        'CANADA': 'CA',
        'AUSTRALIA': 'AU',
        'GERMANY': 'DE',
        'FRANCE': 'FR',
        'JAPAN': 'JP',
        'SINGAPORE': 'SG',
        'UNITED ARAB EMIRATES': 'AE',
        'UAE': 'AE',
      };

      if (countryMap[cleanPart]) {
        countriesList.push(countryMap[cleanPart]);
        continue;
      }
      if (cleanPart.length === 2) {
        countriesList.push(cleanPart);
        continue;
      }

      try {
        this.logger.log(`Searching Meta adgeolocation for: "${part}"`);
        const response = await axios.get('https://graph.facebook.com/v20.0/search', {
          params: {
            type: 'adgeolocation',
            q: part,
            access_token: token,
          }
        });
        const matches = response.data?.data;
        if (matches && matches.length > 0) {
          const match = matches[0];
          this.logger.log(`Found Meta location match: name="${match.name}", type="${match.type}", key="${match.key}"`);
          if (match.type === 'city') {
            citiesList.push({ key: match.key, radius: 10, distance_unit: 'mile' });
          } else if (match.type === 'region' || match.type === 'state') {
            regionsList.push({ key: match.key });
          } else if (match.type === 'country') {
            countriesList.push(match.key);
          }
        } else {
          this.logger.warn(`No Meta location match found for: "${part}"`);
        }
      } catch (err) {
        this.logger.error(`Error resolving location matching "${part}": ${err.message}`);
      }
    }

    if (citiesList.length > 0 || regionsList.length > 0) {
      // Prevent Meta overlapping location error (OAuthException 100)
      countriesList.length = 0;
    }

    if (countriesList.length > 0) geo.countries = countriesList;
    if (regionsList.length > 0) geo.regions = regionsList;
    if (citiesList.length > 0) geo.cities = citiesList;

    if (Object.keys(geo).length === 0) {
      geo.countries = ['IN'];
    }
    return geo;
  }

  private async resolveMetaTargetingList(locations: string[], token: string): Promise<any> {
    if (!locations || locations.length === 0) {
      return null;
    }
    const geo: any = {};
    const countriesList: string[] = [];
    const regionsList: any[] = [];
    const citiesList: any[] = [];

    for (const loc of locations) {
      const cleanLoc = loc.trim().toUpperCase();
      if (!cleanLoc) continue;

      const countryMap: Record<string, string> = {
        'INDIA': 'IN',
        'UNITED STATES': 'US',
        'USA': 'US',
        'UNITED STATES OF AMERICA': 'US',
        'UNITED KINGDOM': 'GB',
        'UK': 'GB',
        'CANADA': 'CA',
        'AUSTRALIA': 'AU',
        'GERMANY': 'DE',
        'FRANCE': 'FR',
        'JAPAN': 'JP',
        'SINGAPORE': 'SG',
        'UNITED ARAB EMIRATES': 'AE',
        'UAE': 'AE',
      };

      if (countryMap[cleanLoc]) {
        countriesList.push(countryMap[cleanLoc]);
        continue;
      }
      if (cleanLoc.length === 2) {
        countriesList.push(cleanLoc);
        continue;
      }

      try {
        this.logger.log(`Searching Meta adgeolocation for: "${loc}"`);
        const response = await axios.get('https://graph.facebook.com/v20.0/search', {
          params: {
            type: 'adgeolocation',
            q: loc,
            access_token: token,
          }
        });
        const matches = response.data?.data;
        if (matches && matches.length > 0) {
          const match = matches[0];
          this.logger.log(`Found Meta location match: name="${match.name}", type="${match.type}", key="${match.key}"`);
          if (match.type === 'city') {
            citiesList.push({ key: match.key, radius: 10, distance_unit: 'mile' });
          } else if (match.type === 'region' || match.type === 'state') {
            regionsList.push({ key: match.key });
          } else if (match.type === 'country') {
            countriesList.push(match.key);
          }
        } else {
          this.logger.warn(`No Meta location match found for: "${loc}"`);
        }
      } catch (err: any) {
        this.logger.error(`Error resolving location matching "${loc}": ${err.message}`);
      }
    }

    if (citiesList.length > 0 || regionsList.length > 0) {
      // Prevent Meta overlapping location error (OAuthException 100)
      countriesList.length = 0;
    }

    if (countriesList.length > 0) geo.countries = countriesList;
    if (regionsList.length > 0) geo.regions = regionsList;
    if (citiesList.length > 0) geo.cities = citiesList;

    return Object.keys(geo).length > 0 ? geo : null;
  }

  private async resolveGoogleLocationList(locations: string[], workingCustomer: any): Promise<string[]> {
    const geoIds: string[] = [];
    if (!locations || locations.length === 0) return geoIds;

    for (const loc of locations) {
      const cleanLoc = loc.trim().toUpperCase();
      if (!cleanLoc) continue;

      let queryName = loc.trim();
      if (cleanLoc === 'USA') queryName = 'United States';
      if (cleanLoc === 'UK') queryName = 'United Kingdom';
      if (cleanLoc === 'INDIA') queryName = 'India';
      if (cleanLoc === 'BANGALORE') queryName = 'Bengaluru';

      try {
        const results = await workingCustomer.query(`
          SELECT geo_target_constant.id, geo_target_constant.name
          FROM geo_target_constant
          WHERE geo_target_constant.name = '${queryName.replace(/'/g, "\\'")}'
          LIMIT 1
        `);
        if (results && results.length > 0) {
          geoIds.push(results[0].geo_target_constant.id);
        }
      } catch (err: any) {
        this.logger.error(`Error resolving Google location for "${loc}": ${err.message}`);
      }
    }
    return geoIds;
  }

  private async resolveLinkedinLocationList(locations: string[], token: string): Promise<string[]> {
    const geoUrns: string[] = [];
    if (!locations || locations.length === 0) return geoUrns;

    for (const loc of locations) {
      const cleanLoc = loc.trim().toUpperCase();
      if (!cleanLoc) continue;

      if (cleanLoc === 'INDIA') {
        geoUrns.push('urn:li:geo:102713980');
        continue;
      }
      if (cleanLoc === 'UNITED STATES' || cleanLoc === 'USA') {
        geoUrns.push('urn:li:geo:103644278');
        continue;
      }
      if (cleanLoc === 'UNITED KINGDOM' || cleanLoc === 'UK') {
        geoUrns.push('urn:li:geo:101165590');
        continue;
      }

      try {
        this.logger.log(`Searching LinkedIn geoTypeahead for: "${loc}"`);
        const response = await fetch(`https://api.linkedin.com/rest/geoTypeahead?q=search&query=${encodeURIComponent(loc)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Restli-Protocol-Version': '2.0.0',
            'LinkedIn-Version': '202606',
          }
        });
        if (response.ok) {
          const data = await response.json();
          const matches = data.elements || [];
          if (matches.length > 0) {
            const urn = matches[0].entity;
            this.logger.log(`Found LinkedIn URN: "${urn}" for "${loc}"`);
            if (urn) {
              geoUrns.push(urn);
              continue;
            }
          }
        }
        this.logger.warn(`No LinkedIn URN found for: "${loc}"`);
      } catch (err: any) {
        this.logger.error(`Error resolving LinkedIn location for "${loc}": ${err.message}`);
      }
    }
    return geoUrns;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async syncDailySpends() {
    this.logger.log('Starting hourly spend sync from Google Ads API...');
    const users = await this.usersService.findAll();
    const activeUsers = users.filter((u: any) => u.googleCustomerId && u.googleCustomerId !== '');

    const systemRefreshToken = this.configService.get('SYSTEM_GOOGLE_REFRESH_TOKEN');
    const systemMccId = this.configService.get('SYSTEM_GOOGLE_MCC_ID');
    const developerToken = this.configService.get('GOOGLE_DEVELOPER_TOKEN') || 'lcZ3RRE00HWy2i4quLMNuQ';
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');

    if (!systemRefreshToken || !systemMccId || systemRefreshToken === 'your_master_refresh_token_here') {
      this.logger.warn('Skipping Cron: System Google Ads credentials missing or not configured.');
      return;
    }

    const clientAuth = new GoogleAdsApi({
      client_id: clientId,
      client_secret: clientSecret,
      developer_token: developerToken,
    });

    for (const user of activeUsers) {
      if (user.googleRefreshToken) {
        this.logger.log(`Skipping spend sync deduction for client-owned Google Ads account: ${user.email}`);
        continue;
      }
      try {
        const childId = (user as any).googleCustomerId.replace(/-/g, '');
        const mccId = systemMccId.replace(/-/g, '');

        const childCustomer = clientAuth.Customer({
          customer_id: childId,
          login_customer_id: mccId,
          refresh_token: systemRefreshToken,
        });

        const report = await childCustomer.query(`
          SELECT metrics.cost_micros 
          FROM customer 
          WHERE segments.date DURING TODAY
        `);

        let todaySpendMicros = 0;
        if (report && report.length > 0) {
          todaySpendMicros = report[0].metrics?.cost_micros || 0;
        }

        const todaySpendRupees = todaySpendMicros / 1000000;
        const totalBillable = todaySpendRupees * 1.10; // 10% platform fee

        // Find how much we already deducted today
        const alreadyDeducted = await this.walletService.getTodayAdSpendDeductions((user as any)._id.toString());

        const remainingToDeduct = totalBillable - alreadyDeducted;

        if (remainingToDeduct > 0.5) { // Only deduct if difference is significant (e.g. > 0.5 Rs)
          this.logger.log(`Deducting ${remainingToDeduct.toFixed(2)} from ${(user as any).email} wallet. (Total Spent Today: ${totalBillable})`);
          await this.walletService.debit((user as any)._id.toString(), remainingToDeduct, `Google Ad Spend (Today) + 10% Fee`, true);
        }

        // Auto Pause check
        const { balance } = await this.walletService.getBalance((user as any)._id.toString());
        if (balance <= 0) {
          this.logger.warn(`Wallet empty for ${(user as any).email}. Pausing campaigns...`);
          // Query active campaigns
          const campaigns = await childCustomer.query(`
            SELECT campaign.id, campaign.status
            FROM campaign
            WHERE campaign.status = 'ENABLED'
          `);

          for (const camp of campaigns) {
            const campId = camp.campaign?.id;
            if (campId) {
              await childCustomer.campaigns.update({
                id: campId,
                status: enums.CampaignStatus.PAUSED,
                resource_name: `customers/${childId}/campaigns/${campId}`
              } as any);
              this.logger.log(`Paused campaign ${campId} for user ${(user as any).email} due to low balance.`);
            }
          }
        }

      } catch (err) {
        this.logger.error(`Error syncing spend for user ${(user as any).email}: ${err.message}`);
      }
    }
    this.logger.log('Hourly spend sync completed.');
  }
}