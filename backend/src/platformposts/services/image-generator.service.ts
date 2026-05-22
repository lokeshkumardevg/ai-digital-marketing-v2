import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

import { PLATFORM_SIZES } from '../utils/platform-sizes';
import { PlatformPromptService } from './platform-prompt.service';

type PlatformType =
  | 'instagram'
  | 'facebook'
  | 'linkedin'
  | 'twitter';

@Injectable()
export class ImageGeneratorService {
  private openai: OpenAI;

  constructor(
    private readonly promptService: PlatformPromptService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateImages(data: any) {
    const platforms: PlatformType[] = [
      'instagram',
      'facebook',
      'linkedin',
      'twitter',
    ];

    const results = [];

    for (const platform of platforms) {
      const prompt =
        this.promptService.generatePrompt(
          platform,
          data,
        );

      const response =
        await this.openai.images.generate({
          model: 'gpt-image-1',
          prompt,
          size: PLATFORM_SIZES[platform],
        });

      const base64Image =
        response.data?.[0]?.b64_json;

      results.push({
        platform,
        image: base64Image
          ? `data:image/png;base64,${base64Image}`
          : '',
        prompt,
      });
    }

    return results;
  }
}