import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import ColorThief from 'color-thief-node';
import { chromium } from 'playwright';
@Injectable()
export class CampaignService {
constructor(
  @InjectModel('Session')
  private sessionModel: Model<any>,

  @InjectModel('Campaign')
  private campaignModel: Model<any>,
) {}
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
        model: 'gpt-4.1-mini',
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
  publish(campaignId: string) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    campaign.status = 'PROCESSING';
    campaign.createdAt = Date.now();

    // simulate activation
    setTimeout(() => {
      campaign.status = 'ACTIVE';
      campaign.activatedAt = new Date().toISOString();
    }, 15000);

    return {
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
  getLiveDashboard(campaignId: string) {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) throw new Error('Campaign not found');

    const isActive = campaign.status === 'ACTIVE';

    const platforms = ['google', 'meta'].map((p) => {
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
  private async buildPrompt(data: {
    brandName: string;
    website: string;
  }): Promise<string> {

    const industry = await this.detectIndustry(data.website);

    return `
You are a senior digital marketing strategist, SEO auditor, competitive intelligence analyst, and web research expert.

Your task is to perform a COMPLETE brand intelligence analysis using REAL VERIFIED DATA.

IMPORTANT RULES:

1. ALWAYS research deeply before generating output.
2. Extract data from:
   - Official website
   - Meta tags
   - Footer/company pages
   - About page
   - Contact page
   - Google search results
   - Google Business Profile
   - LinkedIn
   - MCA records (India companies)
   - Public directories
   - News mentions
   - Social profiles
3. NEVER hallucinate or invent data.
4. If data is missing, return:
   - "Not Available"
   - []
   - 0
5. NEVER leave fields undefined.
6. Return ONLY VALID JSON.
7. DO NOT include markdown.
8. DO NOT explain anything.
9. Try multiple pages of the website before concluding data is unavailable.
10. Infer industry ONLY if strongly supported by evidence.
11. For old or poorly optimized websites, analyze visible text content manually.
12. Extract business intelligence from:
   - navigation menus
   - hero sections
   - footer
   - product/service pages
   - legal pages
13. Estimate SEO/performance metrics realistically using SEO-tool-like logic.
14. Use business context and market positioning analysis.
15. Competitors must be REAL companies in same niche.

INPUT:
Brand Name: ${data.brandName}
Website: ${data.website}
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
      const { data } = await axios.get(website);

      const $ = cheerio.load(data);

      // -------------------------------------------------
      // WEBSITE IMAGES
      // -------------------------------------------------

      const websiteImages: string[] = [];

      $('img').each((_, el) => {
        const src = $(el).attr('src');

        if (!src) return;

        const imageUrl = this.resolveUrl(
          website,
          src,
        );

        websiteImages.push(imageUrl);
      });

      // -------------------------------------------------
      // FAVICON
      // -------------------------------------------------

      const favicon =
        $('link[rel="icon"]').attr('href') ||
        $('link[rel="shortcut icon"]').attr(
          'href',
        ) ||
        '/favicon.ico';

      const faviconUrl = this.resolveUrl(
        website,
        favicon,
      );

      // -------------------------------------------------
      // LOGO DETECTION
      // -------------------------------------------------

      let logoUrl = '';

      const possibleLogo = $('img')
        .filter((_, el) => {
          const alt = (
            $(el).attr('alt') || ''
          ).toLowerCase();

          const cls = (
            $(el).attr('class') || ''
          ).toLowerCase();

          const src = (
            $(el).attr('src') || ''
          ).toLowerCase();

          return (
            alt.includes('logo') ||
            cls.includes('logo') ||
            src.includes('logo')
          );
        })
        .first();

      if (possibleLogo.length) {
        logoUrl = this.resolveUrl(
          website,
          possibleLogo.attr('src') || '',
        );
      }

      // -------------------------------------------------
      // WEBSITE SCREENSHOT
      // -------------------------------------------------

      const websiteScreenshot =
        await this.captureScreenshot(website);

      // -------------------------------------------------
      // BRAND COLORS
      // -------------------------------------------------

      const brandColors =
        await this.extractColors(
          logoUrl || faviconUrl,
        );

      return {
        success: true,

        assets: {
          logoUrl,

          favicon: faviconUrl,

          websiteScreenshot,

          websiteImages: [
            ...new Set(websiteImages),
          ].slice(0, 20),

          brandColors,
        },
      };
    } catch (error) {
      console.error(error);

      throw new InternalServerErrorException(
        'Failed to extract assets',
      );
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
    const browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage({
      viewport: {
        width: 1440,
        height: 2000,
      },
    });

    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 60000,
    });

    const fileName = `screenshot-${Date.now()}.png`;

    const filePath = `uploads/${fileName}`;

    await page.screenshot({
      path: filePath,
      fullPage: true,
    });

    await browser.close();

    return filePath;
  }

  // =====================================================
  // COLOR EXTRACTION
  // =====================================================

private async extractColors(
  imageUrl: string,
) {
  try {
    const palette =
      await ColorThief.getPalette(
        imageUrl,
        5,
      );

    return palette.map((rgb: number[]) => {
      return (
        '#' +
        rgb
          .map((x: number) =>
            x
              .toString(16)
              .padStart(2, '0'),
          )
          .join('')
      );
    });
  } catch {
    return [
      '#111827',
      '#2563EB',
      '#F59E0B',
    ];
  }
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
    const draft = await this.campaignModel.create({
      userId: body.userId,

      campaignId:
        body.campaignId ||
        `CMP_${Date.now()}`,

      name: body.name,

      platform: body.platform,

      data: {
        audienceId:
          body.audienceId ?? null,

        caption: body.data?.caption || '',
        cta: body.data?.cta || '',
        image: body.data?.image || '',

        budget: body.data?.budget || 0,
        event: body.data?.event || '',
        schedule: body.data?.schedule || '',
        finalUrl: body.data?.finalUrl || '',
        location: body.data?.location || '',
        advantagePlus:
          body.data?.advantagePlus || false,
      },

      status: 'DRAFT',
    });

    return {
      success: true,
      message: 'Draft saved successfully',
      data: draft,
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
}