import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI | null = null;

  constructor(private readonly configService: ConfigService) {
    const openAiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (openAiKey) {
      this.openai = new OpenAI({ apiKey: openAiKey });
    }
  }

  async generateContent(prompt: string, systemContext: string): Promise<string> {
    if (!this.openai) {
      throw new InternalServerErrorException('OpenAI is not configured');
    }

    const response = await this.openai.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: systemContext }],
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: prompt }],
        },
      ],
    });

    return response.output_text || '';
  }

  async generateImage(prompt: string): Promise<string> {
    if (!this.openai) {
      throw new InternalServerErrorException('OpenAI is not configured');
    }

    const result = await this.openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
    });

    const base64 = result.data?.[0]?.b64_json;
    if (!base64) {
      throw new InternalServerErrorException('Image generation failed');
    }

    return `data:image/png;base64,${base64}`;
  }

  async generateImageFromReferences(data: {
    prompt: string;
    referenceImages: string[];
    size?: string;
    quality?: 'low' | 'medium' | 'high' | 'auto';
  }): Promise<string> {
    if (!this.openai) {
      throw new InternalServerErrorException('OpenAI is not configured');
    }

    const input: any[] = [
      {
        role: 'user',
        content: [
          ...data.referenceImages.map((url) => ({
            type: 'input_image',
            image_url: url,
          })),
          {
            type: 'input_text',
            text: `Create a high-quality ad creative using these reference images. ${data.prompt}`,
          },
        ],
      },
    ];

    const response = await this.openai.responses.create({
      model: 'gpt-4.1',
      input,
      tools: [
        {
          type: 'image_generation',
          size: data.size || '1024x1024',
          quality: data.quality || 'auto',
          background: 'auto',
        } as any,
      ],
      tool_choice: { type: 'image_generation' } as any,
    });

    const imageData = (response.output || [])
      .filter((item: any) => item.type === 'image_generation_call')
      .map((item: any) => item.result);

    if (!imageData.length) {
      throw new InternalServerErrorException('Reference image generation failed');
    }

    return `data:image/png;base64,${imageData[0]}`;
  }

  async getMarketingStrategy(url: string): Promise<any> {
    const prompt = `Analyze this business website URL and provide a marketing strategy: ${url}

Return ONLY raw JSON in this format:
{
  "brandSummary": "",
  "targetAudience": [],
  "marketingAngles": [],
  "adSuggestions": [],
  "landingPageSuggestions": []
}`;

    const response = await this.generateContent(
      prompt,
      'You are a senior digital marketing strategist.',
    );

    try {
      return JSON.parse(response.replace(/```json|```/g, '').trim());
    } catch {
      return {
        brandSummary: response,
        targetAudience: [],
        marketingAngles: [],
        adSuggestions: [],
        landingPageSuggestions: [],
      };
    }
  }
}