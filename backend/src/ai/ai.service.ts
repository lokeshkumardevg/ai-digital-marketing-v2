import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import { AiAnalysis, AiAnalysisDocument } from './schemas/ai-analysis.schema';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;
  private googleGenAi: GoogleGenAI;

  constructor(
    private configService: ConfigService,
    @InjectModel(AiAnalysis.name)
    private aiAnalysisModel: Model<AiAnalysisDocument>,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      this.logger.warn('OPENAI_API_KEY not configured');
    }
    this.openai = new OpenAI({ apiKey });

    const googleApiKey =
      this.configService.get<string>('GOOGLE_API_KEY') ||
      this.configService.get<string>('GEMINI_API_KEY');

    if (!googleApiKey) {
      this.logger.warn('GOOGLE_API_KEY / GEMINI_API_KEY not configured');
    }

    this.logger.log(
      `Gemini key present: ${!!googleApiKey}, prefix: ${googleApiKey?.slice(0, 8)}, length: ${googleApiKey?.length}`,
    );

    this.googleGenAi = new GoogleGenAI({
      apiKey: googleApiKey,
    });
  }

  // ── MARKET RESEARCH ───────────────────────────────────────

  async runMarketResearch(url: string, brandName: string, userId?: string) {
    const prompt = `You are an expert market research analyst. Analyze the brand "${brandName}" at URL: ${url}.
Return ONLY raw valid JSON with these exact keys:
{
  "overview": "2-3 sentence market overview",
  "marketSize": "estimated market size with currency",
  "growthRate": "annual growth rate %",
  "keyTrends": ["trend1", "trend2", "trend3"],
  "regionalAnalysis": { "topRegions": ["region1", "region2"], "growthMarkets": ["market1", "market2"] },
  "segments": [{ "name": "segment name", "share": "% share", "description": "brief desc" }],
  "opportunities": ["opportunity1", "opportunity2", "opportunity3"],
  "risks": ["risk1", "risk2"]
}`;

    return this.analyzeWithAI(prompt, 'market-research', url, brandName, userId);
  }

  // ── COMPETITOR ────────────────────────────────────────────

  async runCompetitorAnalysis(url: string, brandName: string, userId?: string) {
    const prompt = `You are a competitive intelligence expert. Analyze competitors of "${brandName}" (URL: ${url}).
Return ONLY raw valid JSON with these exact keys:
{
  "summary": "brief competitive landscape summary",
  "directCompetitors": [{ "name": "competitor", "strength": "main strength", "weakness": "main weakness", "marketShare": "estimated %" }],
  "competitiveAdvantages": ["advantage1", "advantage2"],
  "differentiators": ["differentiator1", "differentiator2"],
  "threatLevel": "Low | Medium | High",
  "recommendations": ["rec1", "rec2", "rec3"]
}`;

    return this.analyzeWithAI(prompt, 'competitor-analysis', url, brandName, userId);
  }

  // ── AUDIENCE ──────────────────────────────────────────────

  async runAudienceInsights(url: string, brandName: string, userId?: string) {
    const prompt = `You are a digital marketing audience strategist. Analyze the target audience for "${brandName}" at ${url}.
Return ONLY raw valid JSON with these exact keys:
{
  "primaryPersona": { "name": "persona name", "age": "age range", "interests": ["int1", "int2"], "painPoints": ["pain1", "pain2"] },
  "demographics": { "ageRange": "main age range", "gender": "breakdown", "income": "income level", "education": "education level" },
  "fbTargeting": { "interests": ["fb interest1", "fb interest2", "fb interest3"], "behaviors": ["behavior1", "behavior2"] },
  "googleKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "platforms": [{ "name": "platform", "priority": "High/Med/Low", "reason": "brief reason" }],
  "messagingTone": "tone description"
}`;

    return this.analyzeWithAI(prompt, 'audience-insights', url, brandName, userId);
  }

  // ── CAMPAIGN ──────────────────────────────────────────────

  async runCampaignStrategy(url: string, brandName: string, userId?: string) {
    const prompt = `You are a digital advertising campaign strategist. Create a campaign strategy for "${brandName}" at ${url}.
Return ONLY raw valid JSON with these exact keys:
{
  "objective": "primary campaign objective",
  "budgetRecommendation": { "daily": "$amount", "monthly": "$amount", "split": { "google": "%", "meta": "%" } },
  "timeline": [{ "phase": "phase name", "duration": "X weeks", "focus": "phase focus" }],
  "kpis": [{ "metric": "metric name", "target": "target value" }],
  "platformStrategy": { "google": "strategy description", "meta": "strategy description" },
  "bidStrategy": "recommended bidding approach"
}`;

    return this.analyzeWithAI(prompt, 'campaign-strategy', url, brandName, userId);
  }

  // ── COPY ─────────────────────────────────────────────────

  async runCopyGeneration(url: string, brandName: string, userId?: string) {
    const prompt = `You are an elite advertising copywriter. Generate high-converting ad copy for "${brandName}" at ${url}.
Return ONLY raw valid JSON with these exact keys:
{
  "headlines": [{ "text": "headline text", "type": "Awareness|Consideration|Conversion", "platform": "Google|Meta|Both" }],
  "bodyCopy": [{ "text": "body copy text", "platform": "Google|Meta", "tone": "tone description" }],
  "ctas": ["CTA1", "CTA2", "CTA3"],
  "valuePropositions": ["prop1", "prop2", "prop3"],
  "hooks": ["hook1", "hook2", "hook3"],
  "toneSummary": "overall brand voice description"
}`;

    return this.analyzeWithAI(prompt, 'copy-generation', url, brandName, userId);
  }

  // ── CREATIVE TESTING ─────────────────────────────────────

  async runCreativeTesting(url: string, brandName: string, userId?: string) {
    const prompt = `You are a performance marketing creative strategist. Suggest A/B testing strategy for "${brandName}" at ${url}.
Return ONLY raw valid JSON with these exact keys:
{
  "testingFramework": "recommended testing approach",
  "abTests": [{ "variable": "what to test", "variantA": "option A", "variantB": "option B", "hypothesis": "expected outcome" }],
  "creativeFormats": [{ "format": "format name", "platform": "platform", "priority": "High/Med/Low", "reason": "why" }],
  "performanceMetrics": [{ "metric": "metric name", "benchmark": "industry benchmark", "target": "your target" }],
  "iterationCycle": "recommended testing cycle duration",
  "budget": "recommended testing budget allocation"
}`;

    return this.analyzeWithAI(prompt, 'creative-testing', url, brandName, userId);
  }

  async getMarketingStrategy(url: string): Promise<any> {
    const prompt = `You are an expert marketing strategist. Analyze the website at ${url} and generate a comprehensive digital marketing strategy.
    
Return ONLY raw valid JSON with these keys:
{
  "overview": "1-2 sentence strategy summary",
  "targetAudience": "primary audience description",
  "channels": ["channel1", "channel2", "channel3"],
  "contentStrategy": "content pillar recommendations",
  "budgetAllocation": { "channel1": "%", "channel2": "%" },
  "timeline": { "phase1": "weeks 1-4", "phase2": "weeks 5-8" },
  "kpis": ["kpi1 target", "kpi2 target"],
  "recommendations": ["action1", "action2"]
}`;

    try {
      const systemPrompt = 'Expert digital marketing strategist. Return ONLY valid JSON, no explanations.';
      const response = await this.generateContent(prompt, systemPrompt);
      return typeof response === 'string' ? JSON.parse(response.replace(/```json|```/g, '').trim()) : response;
    } catch (error) {
      this.logger.error('Marketing strategy generation failed', error);
      return { error: 'Strategy generation failed' };
    }
  }

  // ── CORE ENGINE ───────────────────────────────────────────

  private async analyzeWithAI(
    prompt: string,
    type: string,
    url: string,
    brand: string,
    userId?: string,
  ) {
    try {
      const systemPrompt = `You are an expert AI marketing analyst at AdsGo.ai. Always return ONLY raw valid JSON, no markdown, no explanation.`;

      const response = await this.generateContent(prompt, systemPrompt);

      const parsed =
        typeof response === 'string'
          ? JSON.parse(response.replace(/```json|```/g, '').trim())
          : response;

      const result = {
        success: true,
        data: parsed,
        type,
        timestamp: new Date().toISOString(),
      };

      if (userId) {
        await this.aiAnalysisModel.create({
          userId,
          type,
          brandName: brand,
          brandUrl: url,
          result: parsed,
        });
      }

      return result;
    } catch (error: any) {
      this.logger.error(`Failed ${type}`, error);
      throw new BadRequestException(
        `Failed ${type}: ${error.message || 'Unknown error'}`,
      );
    }
  }

  // ── OPENAI ────────────────────────────────────────────────

  async generateContent(
    userPrompt: string,
    systemPrompt: string,
    schema?: any,
    model = 'gpt-4o-mini',
    maxTokens = 4000,
    imageBase64?: string,
  ): Promise<any> {
    try {
      const messages: any[] = [{ role: 'system', content: systemPrompt }];

      if (imageBase64) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            {
              type: 'image_url',
              image_url: { url: imageBase64 },
            },
          ],
        });
      } else {
        messages.push({ role: 'user', content: userPrompt });
      }

      const completion = await this.openai.chat.completions.create({
        model,
        messages,
        temperature: 0.3,
        max_tokens: maxTokens,
        response_format: schema
          ? { type: 'json_schema', json_schema: schema }
          : undefined,
      });

      const content = completion.choices[0].message.content || '';

      return schema ? JSON.parse(content) : content;
    } catch (error: any) {
      this.logger.error('OpenAI Error', error);
      throw new BadRequestException(
        'Failed to generate content: ' + (error.message || 'Unknown error'),
      );
    }
  }

  // ── MESSAGE TEMPLATES ────────────────────────────────────

  async generateMessageTemplates(
    channel: 'whatsapp' | 'email' | 'both',
    businessName: string,
    productOrService: string,
    tone?: string,
    context?: string,
  ): Promise<string[]> {
    let prompt = `You are an expert marketing copywriter specializing in ${channel === 'whatsapp' ? 'WhatsApp' : channel === 'email' ? 'email' : 'omnichannel'} campaigns.

Generate 3 professional, engaging message templates for "${businessName}" promoting "${productOrService}".`;

    if (tone) {
      prompt += `\nUse a ${tone} tone.`;
    }

    if (context) {
      prompt += `\nContext: ${context}`;
    }

    if (channel === 'whatsapp' || channel === 'both') {
      prompt += `\n\nWhatsApp guidelines:
- Keep messages concise (max 160 chars ideal, up to 280 acceptable)
- Include a clear call-to-action
- Use professional but friendly language
- Include optional personalization placeholder {{name}}
- NO excessive emojis`;
    }

    if (channel === 'email' || channel === 'both') {
      prompt += `\n\nEmail guidelines:
- Include a compelling subject line
- Format as "Subject: [line]\n\nBody: [content]"
- Include optional personalization placeholder {{name}}
- Professional formatting`;
    }

    prompt += `\n\nReturn ONLY a JSON array like:
["template1 text", "template2 text", "template3 text"]`;

    try {
      const systemPrompt = 'Expert marketing copywriter. Return ONLY valid JSON array of strings, no markdown, no explanation.';
      const response = await this.generateContent(prompt, systemPrompt);

      const templates =
        typeof response === 'string'
          ? JSON.parse(response.replace(/```json|```/g, '').trim())
          : response;

      if (Array.isArray(templates)) {
        return templates.slice(0, 3);
      }
      throw new Error('Invalid response format');
    } catch (error: any) {
      this.logger.error('Message template generation failed', error);
      throw new BadRequestException(
        'Failed to generate message templates: ' + (error.message || 'Unknown error'),
      );
    }
  }

  // ── BRAND PROFILE ─────────────────────────────────────────

  async generateBrandProfile(url: string, brandName: string, scrapedContext?: string) {
    const prompt = `
You are an expert brand strategist and market analyst.

Analyze the company "${brandName}" at ${url}.

Use the following website content as context:
"""
${scrapedContext || ""}
"""

IMPORTANT RULES:
- NEVER leave fields empty
- If exact data is not available, infer intelligently based on industry and context
- Use realistic and professional business assumptions
- Fill ALL fields with meaningful data
- Return ONLY valid JSON (no markdown, no explanation)

Return data in this exact structure:

{
  "name": "${brandName}",
  "website": "${url}",
  "description": "Write a clear 2-3 line business description",
  "industry": "Specific industry category",
  "lifecycle": "Startup / Growth / Enterprise",
  "company_size": "Small / Medium / Large",
  "business_model": "B2B / B2C / SaaS / Marketplace",
  "target_market": "Who they serve",

  "brand_tone": ["tone1", "tone2"],
  "market_keywords": ["keyword1", "keyword2"],

  "value_proposition": "Clear unique value proposition",
  "differentiators": ["point1", "point2"],

  "features": [
    {
      "title": "Feature name",
      "description": "Detailed explanation"
    }
  ],

  "target_audience": [
    {
      "segment": "Audience type",
      "description": "Detailed explanation",
      "tags": ["tag1", "tag2"]
    }
  ],

  "competitors": [
    {
      "name": "Competitor name",
      "type": "core / indirect",
      "description": "Why competitor"
    }
  ],

  "marketing_channels": ["channel1", "channel2"],
  "customer_hangouts": ["platform1", "platform2"],

  "impact_analysis": {
    "revenue": ["factor1"],
    "cost": ["factor1"],
    "technology": ["factor1"],
    "policy": ["factor1"]
  }
}
`;

    const response = await this.generateContent(
      prompt,
     'Return ONLY valid JSON. Do NOT include markdown, comments, or extra text. Ensure keys match exactly.',
    );

    let parsed;

    try {
      parsed =
        typeof response === 'string'
          ? JSON.parse(response.replace(/```json|```/g, '').trim())
          : response;
    } catch (e) {
      this.logger.error('JSON parse failed, returning fallback', e);
      throw new BadRequestException('Invalid AI JSON response');
    }

    return {
      success: true,
      data: {
        brand: parsed,
      },
    };
  }

  // ── HISTORY ───────────────────────────────────────────────

  async getAnalysisHistory(userId: string, limit = 50) {
    return this.aiAnalysisModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  async deleteAnalysis(id: string, userId: string) {
    const res = await this.aiAnalysisModel.findByIdAndDelete(id);

    if (!res || res.userId.toString() !== userId) {
      throw new BadRequestException('Not found or unauthorized');
    }
  }

  // ── IMAGE ────────────────────────────────────────────────

async generateImage(data: {
  prompt: string;
  size?: string;
  quality?: 'low' | 'medium' | 'high' | 'auto';
}): Promise<string> {
  try {
    const response = await this.openai.images.generate({
      model: 'gpt-image-1',
      prompt: data.prompt,
      size: (data.size || '1024x1024') as any,
      quality: data.quality || 'auto',
    });

    const imageData = response?.data?.[0];

    // ✅ CASE 1: base64 image (most common)
    if (imageData?.b64_json) {
      return `data:image/png;base64,${imageData.b64_json}`;
    }

    // ✅ CASE 2: URL (if provider returns hosted image)
    if (imageData?.url) {
      return imageData.url;
    }

    throw new Error('No image returned from model');
  } catch (error: any) {
    console.error(
      'Image generation failed:',
      error?.response?.data || error,
    );

    throw new Error(
      error?.message || 'Failed to generate image',
    );
  }
}

  // ── PRIVATE HELPERS ───────────────────────────────────────

  private async urlToInlinePart(imageUrl: string): Promise<{
    inlineData: { mimeType: string; data: string };
  }> {
    const response = await axios.get<ArrayBuffer>(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    const contentTypeHeader = String(response.headers['content-type'] || '').toLowerCase();
    const mimeType = contentTypeHeader.startsWith('image/')
      ? contentTypeHeader
      : 'image/png';

    const base64 = Buffer.from(response.data).toString('base64');

    return {
      inlineData: {
        mimeType,
        data: base64,
      },
    };
  }

  private async urlToOpenAiFile(imageUrl: string, index: number): Promise<File | null> {
    const response = await axios.get<ArrayBuffer>(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    const contentType = String(response.headers['content-type'] || '').toLowerCase();

    // OpenAI edits supports only jpeg/png/webp
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!supportedTypes.includes(contentType)) {
      this.logger.warn(
        `Skipping unsupported reference image: ${imageUrl} (${contentType || 'unknown'})`,
      );
      return null;
    }

    const ext =
      contentType === 'image/png'
        ? 'png'
        : contentType === 'image/webp'
        ? 'webp'
        : 'jpg';

    return new File(
      [Buffer.from(response.data)],
      `reference-${index + 1}.${ext}`,
      { type: contentType },
    );
  }

  private mapAspectRatioFromSize(size?: string): '1:1' | '16:9' | '9:16' {
    if (size === '1536x1024') return '16:9';
    if (size === '1024x1536') return '9:16';
    return '1:1';
  }

  // ── GENERATE IMAGE FROM REFERENCES ────────────────────────

  async generateImageFromReferences(payload: {
    prompt: string;
    referenceImages?: any[];
    size?: string;
    quality?: string;
  }): Promise<string> {
    const { prompt, referenceImages = [], size, quality } = payload;

    try {
      this.logger.log('Generating image from references with OpenAI image edit...');

      if (!prompt?.trim()) {
        throw new BadRequestException('Prompt is required');
      }

      // If no reference images, generate directly from prompt
      if (!referenceImages.length) {
        this.logger.log('No reference images found. Using prompt-only generation.');

        const generated = await this.openai.images.generate({
          model: 'gpt-image-1',
          prompt,
          size: size as '1024x1024' | '1536x1024' | '1024x1536',
          quality: quality as 'low' | 'medium' | 'high' | 'auto',
          n: 1,
        });

        const base64 = generated?.data?.[0]?.b64_json;
        const url = generated?.data?.[0]?.url;

        if (base64) {
          return `data:image/png;base64,${base64}`;
        }

        if (url) {
          return url;
        }

        throw new InternalServerErrorException(
          'No generated image returned from OpenAI',
        );
      }

      // Download selected reference images as buffers/files
      // const inputImagesRaw = await Promise.all(
      //   referenceImages.slice(0, 4).map((imageUrl, index) =>
      //     this.urlToOpenAiFile(imageUrl, index),
      //   ),
      // );

      // const inputImages = inputImagesRaw.filter(Boolean) as File[];
      const inputImagesRaw = await Promise.all(
  referenceImages.slice(0, 4).map(async (item, index) => {
    // uploaded file
    if (item?.buffer) {
      return new File(
        [item.buffer],
        item.originalname || `upload-${index + 1}.png`,
        {
          type: item.mimetype || 'image/png',
        },
      );
    }

    // old URL logic (unchanged)
    return this.urlToOpenAiFile(item, index);
  }),
);

const inputImages = inputImagesRaw.filter(Boolean) as File[];

      if (!inputImages.length) {
        throw new BadRequestException(
          'Selected reference images are not supported. Please select JPG, PNG, or WEBP images.',
        );
      }

      const editPrompt = `
Create a new marketing creative based on the provided reference image(s).

User prompt:
${prompt}

Requirements:
- Preserve the main product identity, style, and visual direction from the reference image(s).
- Generate a fresh ad creative, not an exact copy.
- Keep composition commercially usable.
- Make it look premium and polished.
- Follow the prompt closely while staying visually consistent with the selected reference image(s).
      `.trim();

      const image = await this.openai.images.edit({
        model: 'gpt-image-1.5',
        image: inputImages,
        prompt: editPrompt,
        size: size as '1024x1024' | '1536x1024' | '1024x1536',
        quality: quality as 'low' | 'medium' | 'high' | 'auto',
        input_fidelity: 'high',
        n: 1,
      });

      const base64 = image?.data?.[0]?.b64_json;
      const url = image?.data?.[0]?.url;

      if (base64) {
        return `data:image/png;base64,${base64}`;
      }

      if (url) {
        return url;
      }

      throw new InternalServerErrorException(
        'No generated image returned from OpenAI',
      );
    } catch (error: any) {
      this.logger.error('Error generating image from references', error);

      const rawMessage =
        error?.message ||
        error?.response?.data?.error?.message ||
        'Failed to generate image from references';

      if (
        rawMessage.includes('unsupported mimetype') ||
        rawMessage.includes('unsupported_file_mimetype') ||
        rawMessage.includes('image/svg+xml')
      ) {
        throw new BadRequestException(
          'Selected reference image format is not supported. Please use JPG, PNG, or WEBP images.',
        );
      }

      throw new InternalServerErrorException(rawMessage);
    }
  }
}