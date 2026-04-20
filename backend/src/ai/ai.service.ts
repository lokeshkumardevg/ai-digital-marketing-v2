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
import { AiAnalysis, AiAnalysisDocument } from './schemas/ai-analysis.schema';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

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

  // ── OPENAI (UPGRADED) ─────────────────────────────────────

  async generateContent(
    userPrompt: string,
    systemPrompt: string,
    schema?: any,
  ): Promise<any> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 4000,
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

  // ── BRAND PROFILE (FULL VERSION KEPT) ─────────────────────

 async generateBrandProfile(url: string, brandName: string, scrapedContext?: string) {
  const prompt = `You are an expert brand strategist.

Analyze "${brandName}" at ${url}.

Return ONLY valid JSON in this format:

{
  "name": "${brandName}",
  "website": "${url}",
  "industry": "",
  "value_proposition": "",
  "target_audience": [],
  "brand_personality": [],
  "key_messages": [],
  "strengths": [],
  "weaknesses": [],
  "opportunities": [],
  "threats": []
}`;

  const response = await this.generateContent(
    prompt,
    'Return ONLY raw JSON. No markdown. No explanation.'
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
      brand: parsed
    }
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

  async generateImage(prompt: string): Promise<string> {
    try {
      const image = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt,
        size: '1024x1024',
      });

      return image?.data?.[0]?.url || '';
    } catch {
      return 'https://via.placeholder.com/1024x1024';
    }
  }

async generateImageFromReferences(payload: {
    prompt: string;
    referenceImages?: string[];
    size?: string;
    quality?: string;
  }) {
    this.logger.log(`Generating reference image: prompt="${payload.prompt}", size="${payload.size}", quality="${payload.quality}", refs=${payload.referenceImages?.length || 0}`);
    // TODO: Integrate Stability AI or OpenAI Vision API here
    // For now mock with first reference or placeholder
    return payload.referenceImages?.[0] || `https://via.placeholder.com/${payload.size || '1024x1024'}?text=AI+Creative`;
  }
}