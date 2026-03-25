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
      this.logger.log('Attempting request with Primary Provider (OpenAI GPT-4 Turbo)...');
      return await this.useOpenAI(prompt, context);
    } catch (error: any) {
      this.logger.warn(`Primary Provider failed: ${error.message}. Attempting Fallback (Google Gemini Pro)...`);
      try {
        return await this.useGemini(prompt, context);
      } catch (fallbackError: any) {
        this.logger.error(`Fallback Provider failed: ${fallbackError.message}`);
        throw new InternalServerErrorException('AI Orchestrator: All providers failed to generate content.');
      }
    }
  }

  private async useOpenAI(prompt: string, context?: string): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized (Missing API Key)');
    }
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: context || 'You are an expert AI Marketing Assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });
    return response.choices[0].message.content || '';
  }

  private async useGemini(prompt: string, context?: string): Promise<string> {
    if (!this.gemini) {
      throw new Error('Gemini client not initialized (Missing API Key)');
    }
    const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
    const fullPrompt = context ? `${context}\n\nUser Request: ${prompt}` : prompt;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  }

  // Placeholder for Meta AI / Llama 3
  async useMetaAI(prompt: string) {
    this.logger.log('Meta AI execution mock...');
    return 'Llama 3 output mock';
  }

  // Placeholder for Stability AI (Images)
  async generateImage(prompt: string) {
    this.logger.log('Stability AI image generation mock...');
    return 'https://stability.ai/mock-image.png';
  }
}
