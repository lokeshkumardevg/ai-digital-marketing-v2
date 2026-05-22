import { Injectable } from '@nestjs/common';

@Injectable()
export class PlatformPromptService {
  generatePrompt(platform: string, data: any): string {
    const brandName = data.brand?.name || '';
    const tagline = data.brand?.tagline || '';
    const industry = data.brand?.industry || '';

    const colors =
      data.assets?.brandColors?.join(', ') || '';

    const keywords = [
      ...(data.keywords?.primary || []),
      ...(data.keywords?.secondary || []),
    ].join(', ');

    const images =
      data.assets?.websiteImages || [];

    return `
Create a premium ${platform} social media post for ${brandName}.

Industry:
${industry}

Tagline:
${tagline}

Brand Colors:
${colors}

Focus Keywords:
${keywords}

Reference Images:
${images.join('\n')}

Requirements:
- Professional industrial design
- High quality modern layout
- Add strong CTA
- Power plant visuals
- Clean typography
- Premium AI marketing creative
- Platform optimized design
`;
  }
}