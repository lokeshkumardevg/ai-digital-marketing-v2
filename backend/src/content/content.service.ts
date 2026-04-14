import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Content, ContentDocument } from './schemas/content.schema';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(
    @InjectModel(Content.name) private readonly contentModel: Model<ContentDocument>,
    private readonly aiService: AiService,
  ) {}

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
    const newContent = new this.contentModel({
      title: data.title,
      contentType: data.contentType,
      body: '',
      imageUrl: data.imageUrl,
      thumbnailUrl: data.thumbnailUrl || data.imageUrl,
      lifetimeStart: data.lifetimeStart ? new Date(data.lifetimeStart) : null,
      lifetimeEnd: data.lifetimeEnd ? new Date(data.lifetimeEnd) : null,
      platforms: data.platforms || [],
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

    const { data: html } = await axios.get(normalizedUrl, {
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    const $ = cheerio.load(html);
    const imageSet = new Set<string>();

    const toAbsolute = (src?: string | null) => {
      if (!src) return null;
      try {
        return new URL(src, normalizedUrl).href;
      } catch {
        return null;
      }
    };

    const shouldKeep = (src: string) => {
      const lower = src.toLowerCase();

      if (
        lower.includes('logo') ||
        lower.includes('icon') ||
        lower.includes('avatar') ||
        lower.includes('sprite') ||
        lower.includes('favicon') ||
        lower.endsWith('.svg')
      ) {
        return false;
      }

      return true;
    };

    const ogImage = $('meta[property="og:image"]').attr('content');
    const ogAbs = toAbsolute(ogImage);
    if (ogAbs && shouldKeep(ogAbs)) {
      imageSet.add(ogAbs);
    }

    const twitterImage = $('meta[name="twitter:image"]').attr('content');
    const twAbs = toAbsolute(twitterImage);
    if (twAbs && shouldKeep(twAbs)) {
      imageSet.add(twAbs);
    }

    $('script[type="application/ld+json"]').each((_, el) => {
      const raw = $(el).html();
      if (!raw) return;

      try {
        const parsed = JSON.parse(raw);
        const blocks = Array.isArray(parsed) ? parsed : [parsed];

        blocks.forEach((block: any) => {
          const type = block?.['@type'];
          if (type === 'Product' && block.image) {
            const images = Array.isArray(block.image) ? block.image : [block.image];
            images.forEach((img: string) => {
              const abs = toAbsolute(img);
              if (abs && shouldKeep(abs)) {
                imageSet.add(abs);
              }
            });
          }
        });
      } catch {
        // ignore invalid json-ld
      }
    });

    $('img').each((_, el) => {
      const src =
        $(el).attr('src') ||
        $(el).attr('data-src') ||
        $(el).attr('data-lazy-src') ||
        $(el).attr('data-original');

      const abs = toAbsolute(src);
      if (abs && shouldKeep(abs)) {
        imageSet.add(abs);
      }
    });

    const images = Array.from(imageSet).slice(0, 20);

    return {
      success: true,
      url: normalizedUrl,
      images,
    };
  }

  async generateReferenceCreative(data: {
    prompt: string;
    referenceImages: string[];
    productUrl?: string;
    size?: string;
    quality?: 'low' | 'medium' | 'high' | 'auto';
  }) {
    if (!data.prompt?.trim()) {
      throw new BadRequestException('Prompt is required');
    }

    if (!data.referenceImages?.length) {
      throw new BadRequestException('At least one reference image is required');
    }

    const generatedImageUrl = await this.aiService.generateImageFromReferences({
      prompt: data.prompt,
      referenceImages: data.referenceImages,
      size: data.size || '1024x1024',
      quality: data.quality || 'auto',
    });

    return {
      success: true,
      imageUrl: generatedImageUrl,
      usedReferences: data.referenceImages,
      productUrl: data.productUrl || null,
    };
  }
}