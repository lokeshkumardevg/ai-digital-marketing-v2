// brand.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from './brand.schema';
import { AiService } from '../ai/ai.service';
import { chromium } from 'playwright';
import axios from 'axios';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel(Brand.name)
    private readonly brandModel: Model<BrandDocument>,
    private readonly aiService: AiService,
  ) {}

  // ============================================================
  // EXTRACT — handles every shape Campaigns.tsx sends
  // ============================================================
  private extractBrandDetails(body: any): Record<string, any> {
    // Campaigns.tsx sends a CampaignSession snapshot:
    // { messages, brandDetails: {...}, promoData, assets, savedAt, ... }
    // So brandDetails lives at body.brandDetails
    return (
      body?.session?.brandDetails ??  // legacy wrap
      body?.brandDetails ??           // ← Campaigns.tsx sends this
      body?.brand ??                  // workspaceSlice direct
      body                            // fallback: body IS the brand
    );
  }

  private resolveBrandName(incoming: any, body: any): string | null {
    // Try every possible location the name could live
    return (
      incoming?.brand?.name ||  // { brand: { name } } ← discover API shape
      incoming?.brandName ||    // flat brandName field
      incoming?.name ||         // direct name
      body?.brandDetails?.brand?.name ||  // double-nested fallback
      body?.name ||
      null
    );
  }

  private mergeAssets(incoming: any, body: any): Record<string, any> {
    // Campaigns.tsx mirrors assets at top level AND inside brandDetails.assets
    // Merge both — prefer non-empty values
    const fromTopLevel = body?.assets ?? {};
    const fromBrandDetails = incoming?.assets ?? {};
    const logoPreview = incoming?.logoPreview ?? incoming?.logo ?? null;

    return {
      ...fromBrandDetails,
      ...fromTopLevel,
      // if logoPreview is set at brandDetails root level, fold it in
      ...(logoPreview && !fromTopLevel.logoPreview && !fromBrandDetails.logoPreview
        ? { logoPreview, logoUrl: fromTopLevel.logoUrl || fromBrandDetails.logoUrl || logoPreview }
        : {}),
    };
  }

  private normaliseBrandRecord(doc: BrandDocument) {
    return {
      id: (doc._id as any).toString(),
      name: doc.name,
      url: doc.url,
      status: doc.status,
      industry: doc.industry,
      tagline: doc.tagline,
      overallScore: doc.overallScore,
      campaignId: doc.campaignId,
      assets: doc.assets,
      savedAt: doc.savedAt,
      brandProfile: doc.brandProfile,
    };
  }

  // ============================================================
  // GET /campaign/brands/:userId
  // ============================================================
  async getBrandsByUser(userId: string) {
    const brand = await this.brandModel.findOne({ userId });

    if (!brand) {
      return { ok: true, brands: [] };
    }

    return {
      ok: true,
      brands: [this.normaliseBrandRecord(brand)],
    };
  }

  // ============================================================
  // POST /campaign/brand-save/:userId
  // Called by Campaigns.tsx handleBrandFormSubmit with full
  // CampaignSession snapshot as body.
  // ============================================================
  async saveBrand(userId: string, body: any, forceReplace = false) {
    // ── Step 1: Extract brandDetails from snapshot ────────────
    const incoming = this.extractBrandDetails(body);

    // ── Step 2: Resolve brand name from every possible location ──
    const brandName = this.resolveBrandName(incoming, body);

    if (!brandName) {
      console.error('[brand-save] Could not resolve brand name from body:', JSON.stringify(body, null, 2));
      return {
        ok: false,
        message: 'Brand name could not be resolved from the request payload.',
      };
    }

    // ── Step 3: Merge assets from both locations ──────────────
    const assets = this.mergeAssets(incoming, body);

    // ── Step 4: Conflict check ────────────────────────────────
    const existing = await this.brandModel.findOne({ userId });

    if (existing && !forceReplace && (existing.name || '').trim().toLowerCase() !== brandName.trim().toLowerCase()) {
      throw new ConflictException({
        ok: false,
        replaceRequired: true,
        message: 'Brand already exists',

        existingBrand: {
          id: existing._id,
          name:
            existing.name ||
            existing.brandDetails?.brand?.name ||
            '',
        },

        newBrand: {
          name: brandName,
        },
      });
    }

    // ── Step 5: Upsert into brands collection ─────────────────
    const payload = {
      userId,
      name: brandName,
      url: incoming?.website || incoming?.url || incoming?.brandUrl || '',
      status: 'active' as const,
      industry: incoming?.brand?.industry || incoming?.industry,
      tagline: incoming?.brand?.tagline || incoming?.tagline,
      overallScore: incoming?.brand?.overallScore || incoming?.overallScore,
      campaignId: incoming?.campaignId || body?.campaignId,
      assets,
      brandDetails: incoming,   // full snapshot for recovery
      isActiveBrand: true,
      savedAt: new Date().toISOString(),
    };

    const updated = await this.brandModel.findOneAndUpdate(
      { userId },
      payload,
      { upsert: true, new: true },
    );

    console.log(`[brand-save] ✅ Saved brand "${brandName}" for user ${userId}`);

    // Trigger background brand profile generation
    this.generateAndSaveProfileInBackground(userId, brandName, updated.url);

    return {
      ok: true,
      replaced: !!existing,
      message: existing ? 'Brand replaced successfully' : 'Brand saved successfully',
      brand: this.normaliseBrandRecord(updated),
    };
  }

  async updateBrandProfile(userId: string, brandProfile: any) {
    const updated = await this.brandModel.findOneAndUpdate(
      { userId },
      { $set: { brandProfile } },
      { new: true, upsert: true },
    );
    return this.normaliseBrandRecord(updated);
  }

  async generateAndSaveProfileInBackground(userId: string, brandName: string, url: string) {
    if (!url) return;
    setImmediate(async () => {
      try {
        console.log(`[brand-save] Background brand profile generation starting for ${brandName} (${url})...`);
        let scrapedContext = '';

        let browser: any = null;
        let title = '';
        let metaDesc = '';
        let bodyText = '';
        let scrapedSuccessfully = false;

        // 1. Try Playwright
        try {
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
          console.warn(`[brand-save] Playwright background scrape failed: ${err.message}. Trying Axios fallback.`);
        } finally {
          if (browser) {
            try {
              await browser.close();
            } catch {
              // ignore close errors
            }
          }
        }

        // 2. Try Axios + Cheerio
        if (!scrapedSuccessfully) {
          try {
            const response = await axios.get(url, {
              timeout: 10000,
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              },
            });
            const cheerio = require('cheerio');
            const $ = cheerio.load(response.data);
            title = $('title').text() || '';
            metaDesc = $('meta[name="description"]').attr('content') || '';
            $('script, style, noscript, iframe, nav, footer').remove();
            bodyText = $('body').text() || '';
            scrapedSuccessfully = true;
          } catch (err: any) {
            console.warn(`[brand-save] Axios background scrape fallback failed: ${err.message}`);
          }
        }

        if (scrapedSuccessfully) {
          scrapedContext = `TITLE: ${title}\nDESCRIPTION: ${metaDesc}\n\nCONTENT:\n${bodyText
            .replace(/\s+/g, ' ')
            .slice(0, 3500)}`;
        } else {
          scrapedContext = `${brandName} ${url}`;
        }

        const profileRes = await this.aiService.generateBrandProfile(url, brandName, scrapedContext);
        const profile = profileRes.data?.brand || profileRes;

        await this.brandModel.findOneAndUpdate({ userId }, { $set: { brandProfile: profile } });
        console.log(`[brand-save] ✅ Background brand profile generation completed and saved for ${brandName}`);
      } catch (err: any) {
        console.error(`[brand-save] Background brand profile generation failed: ${err.message}`);
      }
    });
  }

  // ============================================================
  // POST /campaign/brand-active/:userId
  // ============================================================
  async setActiveBrand(userId: string, brandId: string) {
    await this.brandModel.updateMany({ userId }, { $set: { isActiveBrand: false } });

    const brand = await this.brandModel.findOneAndUpdate(
      {
        userId,
        $or: [{ _id: brandId }, { campaignId: brandId }],
      },
      { $set: { isActiveBrand: true } },
      { new: true },
    );

    // If brandId didn't match any doc, just flip the existing one back on
    if (!brand) {
      await this.brandModel.updateOne({ userId }, { $set: { isActiveBrand: true } });
    }

    return { ok: true, message: 'Active brand updated' };
  }

  // ============================================================
  // DELETE /campaign/brand/:userId
  // ============================================================
  async deleteBrand(userId: string) {
    const deleted = await this.brandModel.findOneAndDelete({ userId });
    if (!deleted) throw new NotFoundException('No brand found');
    return { ok: true, message: 'Brand deleted' };
  }
}