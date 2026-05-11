import {
  BadRequestException,
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { chromium } from 'playwright';
import axios from 'axios';
import { Content, ContentDocument } from './schemas/content.schema';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(
    @InjectModel(Content.name) private readonly contentModel: Model<ContentDocument>,
    private readonly aiService: AiService,
  ) {}

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

    page.on('response', async (response) => {
      try {
        const headers = response.headers();
        const contentType = String(headers['content-type'] || '').toLowerCase();
        const responseUrl = response.url();

        if (
          contentType.startsWith('image/') ||
          /\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i.test(responseUrl)
        ) {
          networkImageSet.add(responseUrl);
        }
      } catch {
        // ignore response parsing issues
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

    await page.evaluate(async () => {
      const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      const step = 700;
      const maxScroll = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
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
      const found = new Set<string>();

      const toAbsolute = (src?: string | null) => {
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

      const add = (src?: string | null) => {
        const absolute = toAbsolute(src);
        if (absolute) found.add(absolute);
      };

      document
        .querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]')
        .forEach((el) => add(el.getAttribute('content')));

      document.querySelectorAll('link[rel="image_src"]').forEach((el) => {
        add(el.getAttribute('href'));
      });

      document.querySelectorAll('img').forEach((img) => {
        add(img.getAttribute('src'));
        add(img.getAttribute('data-src'));
        add(img.getAttribute('data-lazy-src'));
        add(img.getAttribute('data-original'));
        add(img.getAttribute('data-fallback-src'));

        const srcset =
          img.getAttribute('srcset') ||
          img.getAttribute('data-srcset') ||
          img.getAttribute('data-lazy-srcset');

        if (srcset) {
          srcset.split(',').forEach((entry) => {
            const urlPart = entry.trim().split(' ')[0];
            add(urlPart);
          });
        }
      });

      document.querySelectorAll<HTMLElement>('*').forEach((el) => {
        const style = window.getComputedStyle(el);

        const bgImage = style.backgroundImage;
        if (bgImage && bgImage !== 'none') {
          const matches = [...bgImage.matchAll(/url\((['"]?)(.*?)\1\)/g)];
          matches.forEach((match) => add(match[2]));
        }
      });

      document.querySelectorAll('script[type="application/ld+json"]').forEach((script) => {
        const raw = script.textContent;
        if (!raw) return;

        try {
          const parsed = JSON.parse(raw);
          const blocks = Array.isArray(parsed) ? parsed : [parsed];

          blocks.forEach((block: any) => {
            if (!block) return;

            if (block.image) {
              const imgs = Array.isArray(block.image) ? block.image : [block.image];
              imgs.forEach((img: string) => add(img));
            }

            if (block.primaryImageOfPage?.contentUrl) {
              add(block.primaryImageOfPage.contentUrl);
            }
          });
        } catch {
          // ignore invalid json
        }
      });

      return Array.from(found);
    });

    const shouldKeep = (src: string) => {
      const lower = src.toLowerCase();

      if (
        lower.includes('favicon') ||
        lower.includes('sprite') ||
        lower.includes('/icons/') ||
        lower.includes('icon-') ||
        lower.includes('logo-small')
      ) {
        return false;
      }

      return true;
    };

    const finalImages = Array.from(
      new Set([...domImages, ...Array.from(networkImageSet)])
    )
      .filter(shouldKeep)
      .slice(0, 30);

    this.logger.log(`Scraped ${finalImages.length} images from ${normalizedUrl}`);

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

  async getAllContent(): Promise<Content[]> {
    try {
      const results = await this.contentModel.find().sort({ createdAt: -1 }).lean().exec();

      if (!results || results.length === 0) {
        return [
          {
            _id: 'mc-1',
            title: 'The Future of AI',
            contentType: 'Blog Post',
            body: 'Artificial intelligence is fundamentally reshaping...',
            status: 'published',
            platforms: ['Medium'],
            createdAt: new Date(),
          } as any,
          {
            _id: 'mc-2',
            title: 'Growth Tactics 2026',
            contentType: 'Twitter Thread',
            body: 'Here are 5 ways to accelerate SaaS growth...',
            status: 'draft',
            platforms: [],
            createdAt: new Date(),
          } as any,
        ];
      }

      return results as any;
    } catch (e) {
      this.logger.error('getAllContent failed', e);
      return [] as any;
    }
  }

  async generateContent(data: {
    topic: string;
    contentType: string;
    tone: string;
    targetKeywords?: string[];
  }): Promise<Content> {
    this.logger.log(`Generating AI Content: ${data.topic} (${data.contentType})`);

    let prompt = '';
    let systemContext = '';

    if (data.contentType === 'blog') {
      systemContext =
        'You are a veteran SEO expert and Content Writer. Your goal is to rank #1 on Google.';
      prompt = `Write a comprehensive, highly engaging, and SEO-optimized blog post about "${data.topic}". Use a ${data.tone} tone. Return ONLY raw JSON in this format: {"title": "Catchy SEO Title", "body": "Markdown formatted blog content..."}`;
      if (data.targetKeywords?.length) {
        prompt += ` Ensure the following keywords are organically integrated: ${data.targetKeywords.join(', ')}`;
      }
    } else {
      systemContext = 'You are a viral social media strategist.';
      prompt = `Write a highly engaging, viral social media post about "${data.topic}". Tone: ${data.tone}. Include relevant trending hashtags and emojis. Return ONLY raw JSON in this format: {"title": "Internal Name", "body": "The actual post text..."}`;
    }

    let parsedContent = {
      title: 'AI Placeholder Title',
      body: 'AI generated content body will appear here.',
    };

    try {
      const aiResponse = await this.aiService.generateContent(prompt, systemContext);
      parsedContent = JSON.parse(aiResponse.replace(/```json|```/g, '').trim());
    } catch (e) {
      this.logger.error('Failed to parse AI generated content. Falling back to raw response.', e);
    }

    const imageUrl = await this.aiService.generateImage(
      `Cinematic visualization supporting: ${data.topic}`,
    );

    const seoMetrics = {
      keywordDensity: Math.floor(Math.random() * 5) + 1,
      readabilityScore: Math.floor(Math.random() * 30) + 60,
      estimatedRank: Math.floor(Math.random() * 10) + 1,
    };

    const newContent = new this.contentModel({
      title: parsedContent.title || data.topic,
      contentType: data.contentType,
      body: parsedContent.body,
      imageUrl,
      status: 'draft',
      seoMetrics,
    });

    return await newContent.save();
  }

  async publishContent(contentId: string, platforms: string[]): Promise<Content> {
    const content = await this.contentModel.findById(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    this.logger.log(`Publishing content ${contentId} to platforms: ${platforms.join(', ')}...`);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    content.platforms = platforms;
    content.status = 'published';
    return await content.save();
  }


  async createManualCreative(data: {
  title: string;
  contentType: string;
  imageUrl: string;
  thumbnailUrl?: string;
  lifetimeStart?: string;
  lifetimeEnd?: string;
  platforms?: string[];
}): Promise<Content> {
  const lifetimeStartDate = data.lifetimeStart ? new Date(data.lifetimeStart) : null;
  const lifetimeEndDate = data.lifetimeEnd ? new Date(data.lifetimeEnd) : null;

  const newContent = new this.contentModel({
    title: data.title,
    contentType: data.contentType,
    body: '',
    imageUrl: data.imageUrl,
    thumbnailUrl: data.thumbnailUrl || data.imageUrl,
    lifetimeStart: lifetimeStartDate,
    lifetimeEnd: lifetimeEndDate,
    scheduledFor: lifetimeEndDate,
    platforms: data.platforms || ['Meta'],
    status: 'draft',
    isManualCreative: true,
    seoMetrics: {
      keywordDensity: 0,
      readabilityScore: 0,
      estimatedRank: 0,
    },
  });

  return await newContent.save();
}

  // async createManualCreative(data: {
  //   title: string;
  //   contentType: string;
  //   imageUrl: string;
  //   thumbnailUrl?: string;
  //   lifetimeStart?: string;
  //   lifetimeEnd?: string;
  //   platforms?: string[];
  // }): Promise<Content> {
  //   const newContent = new this.contentModel({
  //     title: data.title,
  //     contentType: data.contentType,
  //     body: '',
  //     imageUrl: data.imageUrl,
  //     thumbnailUrl: data.thumbnailUrl || data.imageUrl,
  //     lifetimeStart: data.lifetimeStart ? new Date(data.lifetimeStart) : null,
  //     lifetimeEnd: data.lifetimeEnd ? new Date(data.lifetimeEnd) : null,
  //     platforms: data.platforms || [],
  //     status: 'draft',
  //     isManualCreative: true,
  //     seoMetrics: {
  //       keywordDensity: 0,
  //       readabilityScore: 0,
  //       estimatedRank: 0,
  //     },
  //   });

  //   return await newContent.save();
  // }

  async deleteContent(id: string) {
    const deleted = await this.contentModel.findByIdAndDelete(id);

    if (!deleted) {
      throw new Error('Content not found');
    }

    return {
      success: true,
      message: 'Creative deleted successfully',
    };
  }

  async updateContent(
  id: string,
  data: {
    title?: string;
    thumbnailUrl?: string;
    lifetimeStart?: string;
    lifetimeEnd?: string;
    status?: string;
  },
) {
  const content = await this.contentModel.findById(id);

  if (!content) {
    throw new BadRequestException('Creative not found');
  }

  if (typeof data.title === 'string' && data.title.trim()) {
    content.title = data.title.trim();
  }

  if (typeof data.thumbnailUrl === 'string' && data.thumbnailUrl.trim()) {
    content.thumbnailUrl = data.thumbnailUrl.trim();
  }

  if (data.lifetimeStart) {
    content.lifetimeStart = new Date(data.lifetimeStart);
  } else {
    content.lifetimeStart = null as any;
  }

  if (data.lifetimeEnd) {
    const endDate = new Date(data.lifetimeEnd);
    content.lifetimeEnd = endDate;
    content.scheduledFor = endDate;
  } else {
    content.lifetimeEnd = null as any;
    content.scheduledFor = null as any;
  }

  if (typeof data.status === 'string' && data.status.trim()) {
    content.status = data.status.trim();
  }

  await content.save();

  return {
    success: true,
    message: 'Creative updated successfully',
    data: content,
  };
}

async generateReferenceCreative(data: {
  prompt: string;
  referenceImages: string[];
   uploadedFiles?: Express.Multer.File[];
  productUrl?: string;
  size?: string;
  quality?: 'low' | 'medium' | 'high' | 'auto';
  aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
  imageCount?: '1' | '2' | '3' | '4';
}) {
  if (!data.prompt?.trim()) {
    throw new BadRequestException('Prompt is required');
  }

  // if (!data.referenceImages?.length) {
  //   throw new BadRequestException('At least one reference image is required');
  // }
  // const hasReferences =
  // Array.isArray(data.referenceImages) &&
  // data.referenceImages.length > 0;
  const hasUrlRefs =
  Array.isArray(data.referenceImages) &&
  data.referenceImages.length > 0;

const hasUploads =
  Array.isArray(data.uploadedFiles) &&
  data.uploadedFiles.length > 0;

const hasReferences = hasUrlRefs || hasUploads;

  const ratioToSizeMap: Record<string, string> = {
    '1:1': '1024x1024',
    '4:3': '1536x1024',
    '3:4': '1024x1536',
    '16:9': '1536x1024',
    '9:16': '1024x1536',
  };

  const count = Number(data.imageCount || '1');
  const finalSize = data.size || ratioToSizeMap[data.aspectRatio || '1:1'] || '1024x1024';

  // const generatedImages = await Promise.all(
  //   Array.from({ length: count }).map(async (_, index) => {
  //     const generatedImageUrl = await this.aiService.generateImageFromReferences({
  //       prompt: `${data.prompt}\nVariation ${index + 1} of ${count}`,
  //       referenceImages: data.referenceImages,
  //       size: finalSize,
  //       quality: data.quality || 'auto',
  //     });

  //     return {
  //       id: `${Date.now()}-${index + 1}`,
  //       imageUrl: generatedImageUrl,
  //       size: finalSize,
  //       variation: index + 1,
  //       createdAt: new Date().toISOString(),
  //     };
  //   }),
  // );

  const generatedImages = await Promise.all(
  Array.from({ length: count }).map(async (_, index) => {
    const finalPrompt = `${data.prompt}\nVariation ${index + 1} of ${count}`;

    let generatedImageUrl = '';

    if (hasReferences) {
      generatedImageUrl = await this.aiService.generateImageFromReferences({
        prompt: finalPrompt,
        // referenceImages: data.referenceImages,
        referenceImages: hasUploads
? data.uploadedFiles
  : data.referenceImages,
        size: finalSize,
        quality: data.quality || 'auto',
      });
    } else {
      generatedImageUrl = await this.aiService.generateImage(finalPrompt);
    }

    return {
      id: `${Date.now()}-${index + 1}`,
      imageUrl: generatedImageUrl,
      size: finalSize,
      variation: index + 1,
      createdAt: new Date().toISOString(),
    };
  }),
);
  return {
    success: true,
    images: generatedImages,
    usedReferences: hasReferences ? data.referenceImages : [],
mode: hasReferences ? 'reference' : 'prompt-only',
    productUrl: data.productUrl || null,
    meta: {
      prompt: data.prompt,
      aspectRatio: data.aspectRatio || '1:1',
      imageCount: count,
      size: finalSize,
      quality: data.quality || 'auto',
    },
  };
}
}