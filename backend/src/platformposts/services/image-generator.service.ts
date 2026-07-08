import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

import { PLATFORM_SIZES } from '../utils/platform-sizes';
import { GeneratePostDto } from '../dto/generate-post.dto';

type PlatformType = 'instagram' | 'facebook' | 'linkedin' | 'twitter';

export interface PlatformContent {
  title: string;
  caption: string;
  cta: string;
}

export interface PlatformResult {
  platform: PlatformType;
  image: string;
  sourceImage: string;
  content: PlatformContent;
}

const PLATFORM_EDIT_GUIDE: Record<PlatformType, string> = {
  instagram:
    'Transform into a vibrant square Instagram post. Bold composition, lifestyle feel, strong brand color accents, clean empty space at top or bottom for text overlay.',
  facebook:
    'Transform into a Facebook marketing post. Friendly warm tones, clear focal point, space for headline overlay at top.',
  linkedin:
    'Transform into a professional LinkedIn post. Clean corporate layout, muted premium tones, subtle brand color accents, space for professional headline.',
  twitter:
    'Transform into a punchy Twitter/X post. High contrast, bold single focal element, eye-catching at thumbnail size.',
};

const PLATFORM_CONTENT_GUIDE: Record<PlatformType, string> = {
  instagram:
    'Casual, energetic tone. Emojis welcome. 150–300 word caption. End with 4–6 relevant hashtags.',
  facebook:
    'Friendly, conversational tone. 100–200 words. Encourage engagement. 1–2 hashtags max.',
  linkedin:
    'Professional, insight-driven. No slang. 150–250 words. Focus on business value or ROI. 3–5 hashtags.',
  twitter:
    'Punchy and direct. Caption under 240 characters. 1–2 hashtags only. Very short CTA.',
};

// Rate limit: 5 input-images per minute → max 1 image edit every 13s to stay safe
const IMAGE_EDIT_DELAY_MS = 13_000;
const MAX_RETRIES          = 3;

@Injectable()
export class ImageGeneratorService {
  private readonly logger = new Logger(ImageGeneratorService.name);
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  // ─── Helpers ──────────────────────────────────────────────────────

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private selectBrandImages(data: GeneratePostDto): string[] {
    this.logger.log(
      `Raw websiteImages: ${JSON.stringify(data.assets?.websiteImages ?? 'UNDEFINED')}`,
    );

    const raw: string[] = data.assets?.websiteImages ?? [];
    if (!Array.isArray(raw) || raw.length === 0) return [];

    const SKIP = ['savorkalogo', 'footerlogo', 'favicon'];

    const filtered = raw.filter((url) => {
      if (typeof url !== 'string') return false;
      if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
      const filename = url.split('/').pop()?.toLowerCase() ?? '';
      const skip = SKIP.some((p) => filename.includes(p));
      if (skip) this.logger.log(`Skipping: ${filename}`);
      return !skip;
    });

    this.logger.log(`Selected ${filtered.length} brand images`);
    return filtered.slice(0, 4);
  }

  // ─── Step 1: Vision analysis (once, shared) ───────────────────────

  private async analyzeBrandImages(
    imageUrls: string[],
    data: GeneratePostDto,
  ): Promise<string> {
    this.logger.log(`Vision analysis of ${imageUrls.length} images`);

    const imageBlocks: OpenAI.Chat.ChatCompletionContentPart[] = imageUrls.map(
      (url) => ({
        type: 'image_url' as const,
        image_url: { url, detail: 'low' as const },
      }),
    );

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 600,
      messages: [
        {
          role: 'system',
          content: `You are a visual brand analyst. Describe these brand images covering:
1. Exact products/services shown
2. Colors, lighting, mood
3. Environment/setting
4. Visual style and aesthetic
Be specific — this guides an AI image editor to produce premium marketing versions.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text' as const,
              text: `Brand: "${data.brand?.name || data.brandName}" | Industry: "${data.brand?.industry || 'General'}"`,
            },
            ...imageBlocks,
          ],
        },
      ],
    });

    return response.choices[0]?.message?.content ?? '';
  }

  // ─── Step 2: Generate one image using DALL-E 3 with retry + back-off ─────────────────

  private async editImageForPlatform(
    imageUrl: string,
    platform: PlatformType,
    data: GeneratePostDto,
    visualAnalysis: string,
  ): Promise<string> {
    const brandName   = data.brand?.name         || data.brandName || 'Brand';
    const industry    = data.brand?.industry      || 'General';
    const objective   = data.coreObjective        || '';
    const brandColors = (data.assets?.brandColors || []).join(', ') || '';
    const keywords    = (data.keywords?.primary   || []).slice(0, 4).join(', ');

    const prompt = `Create a premium ${platform.toUpperCase()} social media marketing post for "${brandName}" (Industry: "${industry}").
Objective: ${objective}
Brand Colors: ${brandColors}
Keywords: ${keywords}

Visual Theme / References:
${visualAnalysis || 'A premium, modern design matching the industry theme.'}

Instructions:
- ${PLATFORM_EDIT_GUIDE[platform]}
- Keep the design premium and modern, with strong visual composition.
- Apply brand colors (${brandColors}) in a clean, modern aesthetic.
- Leave clean empty space (~20%) for text overlay — do NOT add any text, typography, or words on the image itself.
- High quality photography, clean background. No overlay text, no logos.`;

    this.logger.log(`Generating image for ${platform} using DALL-E 3`);

    // Retry loop with exponential back-off for 429s
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        this.logger.log(`[${platform}] Image generation attempt ${attempt}/${MAX_RETRIES}`);

        const response = await this.openai.images.generate({
          model: 'dall-e-2',
          prompt,
          size: PLATFORM_SIZES[platform],
        });

        const imageUrl = response.data?.[0]?.url;
        if (imageUrl) {
          const imageRes = await fetch(imageUrl);
          const arrayBuffer = await imageRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const b64 = buffer.toString('base64');
          return `data:image/png;base64,${b64}`;
        }
        return '';

      } catch (err: any) {
        const is429 = err?.status === 429 || err?.code === 'rate_limit_exceeded';

        if (is429 && attempt < MAX_RETRIES) {
          const waitMs = attempt * 15_000;
          this.logger.warn(
            `[${platform}] Rate limited (attempt ${attempt}). Retrying in ${waitMs / 1000}s…`,
          );
          await this.sleep(waitMs);
          continue;
        }

        this.logger.error(`[${platform}] Image generation failed: ${err?.message}`);
        throw err;
      }
    }

    return '';
  }

  // ─── Step 3: Text content generation ─────────────────────────────

  private async generateContent(
    platform: PlatformType,
    data: GeneratePostDto,
  ): Promise<PlatformContent> {
    const brandName         = data.brand?.name         || data.brandName || 'Brand';
    const industry          = data.brand?.industry      || 'General';
    const objective         = data.coreObjective        || '';
    const businessModel     = data.brand?.businessModel || '';
    const toneOfVoice       = data.brand?.toneOfVoice   || 'Professional, customer-centric';
    const website           = data.website              || '';
    const primaryKeywords   = (data.keywords?.primary   || []).join(', ');
    const secondaryKeywords = (data.keywords?.secondary || []).join(', ');
    const longTailKeywords  = (data.keywords?.longTail  || []).slice(0, 3).join(', ');

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert social media marketing copywriter.
Write content 100% specific to the brand's industry — never generic.
Respond with valid JSON only — no markdown, no code fences.
Shape: { "title": string, "caption": string, "cta": string }
- title: punchy headline, max 10 words
- caption: full post body mentioning brand name, matching platform guidelines
- cta: short action phrase specific to this brand's product/service`,
        },
        {
          role: 'user',
          content: `Platform: ${platform}
Brand: ${brandName} | Industry: ${industry}
Objective: ${objective} | Business Model: ${businessModel}
Tone: ${toneOfVoice} | Website: ${website || 'N/A'}
Primary Keywords: ${primaryKeywords}
Secondary Keywords: ${secondaryKeywords}
Long-tail: ${longTailKeywords}
Platform Guidelines: ${PLATFORM_CONTENT_GUIDE[platform]}
Rules: mention "${brandName}", stay in "${industry}" industry, CTA specific to their product, zero filler.`,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    try {
      const parsed = JSON.parse(raw) as PlatformContent;
      return {
        title:   parsed.title   ?? '',
        caption: parsed.caption ?? '',
        cta:     parsed.cta     ?? '',
      };
    } catch {
      return { title: '', caption: '', cta: '' };
    }
  }

  // ─── MAIN ─────────────────────────────────────────────────────────

  async generateImages(data: GeneratePostDto): Promise<PlatformResult[]> {
    const platforms: PlatformType[] = ['instagram', 'facebook', 'linkedin', 'twitter'];

    // 1. Select brand images
    const brandImageUrls = this.selectBrandImages(data);
    let visualAnalysis = '';
    
    if (brandImageUrls.length > 0) {
      try {
        // 2. Vision analysis — once, shared
        visualAnalysis = await this.analyzeBrandImages(brandImageUrls, data);
        this.logger.log('Vision analysis done — starting sequential image edits');
      } catch (err) {
        this.logger.warn(`Vision analysis failed (continuing without it): ${err.message}`);
      }
    } else {
      this.logger.log('No brand images found — generating without visual references');
    }

    // 3. Assign one source image per platform (round-robin)
    const platformImageMap: Record<PlatformType, string> = {
      instagram: brandImageUrls.length > 0 ? brandImageUrls[0 % brandImageUrls.length] : '',
      facebook:  brandImageUrls.length > 0 ? brandImageUrls[1 % brandImageUrls.length] : '',
      linkedin:  brandImageUrls.length > 0 ? brandImageUrls[2 % brandImageUrls.length] : '',
      twitter:   brandImageUrls.length > 0 ? brandImageUrls[3 % brandImageUrls.length] : '',
    };

    // 4. All 4 content generations in parallel (no rate limit concern for gpt-4o)
    this.logger.log('Generating all platform content in parallel');
    const [igContent, fbContent, liContent, twContent] = await Promise.all(
      platforms.map((p) => this.generateContent(p, data)),
    );
    const contentMap: Record<PlatformType, PlatformContent> = {
      instagram: igContent,
      facebook:  fbContent,
      linkedin:  liContent,
      twitter:   twContent,
    };

    // 5. Image edits SEQUENTIALLY with delay — respects 5 input-images/min limit
    //    13s apart → 4 images = ~39s total, well within 60s window
    const results: PlatformResult[] = [];

    for (let i = 0; i < platforms.length; i++) {
      const platform    = platforms[i];
      const sourceImage = platformImageMap[platform];

      // Wait before each edit (skip delay on first one)
      if (i > 0) {
        this.logger.log(
          `Waiting ${IMAGE_EDIT_DELAY_MS / 1000}s before next image edit to respect rate limit…`,
        );
        await this.sleep(IMAGE_EDIT_DELAY_MS);
      }

      const editedImage = await this.editImageForPlatform(
        sourceImage,
        platform,
        data,
        visualAnalysis,
      );

      results.push({
        platform,
        image: editedImage,
        sourceImage,
        content: contentMap[platform],
      });

      this.logger.log(`[${platform}] ✓ done (${i + 1}/4)`);
    }

    return results;
  }
}