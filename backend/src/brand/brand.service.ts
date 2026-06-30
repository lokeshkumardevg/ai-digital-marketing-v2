// brand.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from './brand.schema';

@Injectable()
export class BrandService {
  constructor(
    @InjectModel(Brand.name)
    private readonly brandModel: Model<BrandDocument>,
  ) { }

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
      incoming?.brandName ||  // flat brandName field
      incoming?.name ||  // direct name
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
    // ── Step 4: Conflict check ────────────────────────────────
    const existing = await this.brandModel.findOne({ userId });

    if (existing && !forceReplace && (existing.name || '').trim().toLowerCase() !== brandName.trim().toLowerCase()) {
      throw new (await import('@nestjs/common')).ConflictException({
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

    return {
      ok: true,
      replaced: !!existing,
      message: existing ? 'Brand replaced successfully' : 'Brand saved successfully',
      brand: this.normaliseBrandRecord(updated),
    };
  }

  // ============================================================
  // POST /campaign/brand-active/:userId
  // ============================================================
  async setActiveBrand(userId: string, brandId: string) {
    await this.brandModel.updateMany({ userId }, { $set: { isActiveBrand: false } });

    const brand = await this.brandModel.findOneAndUpdate(
      {
        userId,
        $or: [
          { _id: brandId },
          { campaignId: brandId },
        ],
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