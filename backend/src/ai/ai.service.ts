import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI | null = null;
  private gemini: GoogleGenerativeAI | null = null;

  constructor(private configService: ConfigService) {
    console.log('AI Service Constructor', this.configService.get<string>('OPENAI_API_KEY'));
    const openAiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (openAiKey) {
      this.openai = new OpenAI({ apiKey: openAiKey });
    }

    const geminiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (geminiKey) {
      this.gemini = new GoogleGenerativeAI(geminiKey);
    }
  }

  async generateContent(prompt: string, context?: string): Promise<string> {
    try {
      if (this.openai) {
        this.logger.log('Executing AI Request with OpenAI GPT-4 (Primary)...');
        return await this.useOpenAI(prompt, context);
      }
      throw new Error('OpenAI client not configured.');
    } catch (error: any) {
      this.logger.warn(`OpenAI high-priority request failed: ${error.message}. Routing to Gemini (Secondary)...`);
      try {
        if (this.gemini) {
          return await this.useGemini(prompt, context);
        }
        throw new Error('Gemini fallback unavailable.');
      } catch (fallbackError: any) {
        this.logger.error(`Critical: Both OpenAI and Gemini providers failed: ${fallbackError.message}`);
        // Return a stable mock/fallback response instead of crashing the entire request
        return '{"productSummary": "AI Core busy. Standard response activated.", "audience": "General Market", "ads": [{"headline": "Boost Your Marketing", "text": "Our agents are currently optimizing your results."}], "recommendedBudget": 50, "visualStyle": "Professional"}';
      }
    }
  }

  async getMarketingStrategy(url: string): Promise<any> {
    const prompt = `Perform deep research on this URL: ${url}. 
    1. Analyze the product/service.
    2. Identify target audience segments.
    3. Suggest 3 high-converting ad headlines.
    4. Suggest a primary visual style.
    5. Recommend a daily budget for Meta ads.
    Return ONLY raw valid JSON with these keys: productSummary, audience, ads (array of {headline, text}), visualStyle, recommendedBudget.`;

    const response = await this.generateContent(prompt, 'You are an elite marketing strategist at AdsGo.ai.');
    try {
      return JSON.parse(response.replace(/```json|```/g, '').trim());
    } catch (e) {
      this.logger.error('Failed to parse marketing strategy JSON', e);
      return { productSummary: 'Error analyzing page', ads: [], recommendedBudget: 50 };
    }
  }

  private async useOpenAI(prompt: string, context?: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o', // Using GPT-4o for High Quality Real-time Creative Hub Logic
      messages: [
        { role: 'system', content: context || 'You are an elite AI Marketing strategist and copywriter.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    return response.choices[0].message.content || '';
  }

  private async useGemini(prompt: string, context?: string): Promise<string> {
    if (!this.gemini) {
      throw new Error('Gemini client not initialized');
    }
    // Updated to use gemini-pro for stable API compatibility
    const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
    const fullPrompt = context ? `${context}\n\nUser Request: ${prompt}` : prompt;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  }

  // Placeholder for Stability AI (Images)
  async generateImage(prompt: string) {
    this.logger.log('Stability AI image generation mock...');
    return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800';
  }
}
