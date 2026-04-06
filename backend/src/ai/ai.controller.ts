import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import * as cheerio from 'cheerio';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  async generateText(@Body() body: { prompt: string; context?: string }) {
    const result = await this.aiService.generateContent(body.prompt, body.context);
    return {
      success: true,
      data: result,
      orchestrator_route: 'resolved'
    };
  }

  @Post('seo-audit')
  @HttpCode(HttpStatus.OK)
  async runSeoAudit(@Body() body: { url: string }) {
    try {
      const startTime = Date.now();
      const response = await fetch(body.url, { 
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
        } 
      });
      
      if (!response.ok) throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      
      const htmlText = await response.text();
      const loadTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';

      // 1. Parse HTML with Cheerio for high-fidelity extraction
      const $ = cheerio.load(htmlText);
      
      const meta = {
        title: $('title').text() || 'No title found',
        description: $('meta[name="description"]').attr('content') || 'No meta description found',
        canonical: $('link[rel="canonical"]').attr('href') || 'Not set',
        ogTitle: $('meta[property="og:title"]').attr('content') || 'Not set',
        ogImage: $('meta[property="og:image"]').attr('content') || 'Not set',
        h1: $('h1').map((i, el) => $(el).text()).get().slice(0, 3).join(', '),
        h2Count: $('h2').length,
        images: $('img').length,
        imagesWithAlt: $('img[alt]').length,
        links: $('a').length,
        externalLinks: $('a[href^="http"]').length
      };

      // 2. Prepare context-rich prompt for the AI Orchestrator
      const prompt = `Act as an elite Technical SEO Auditor at Semrush. Analyze the extracted data for ${body.url}:
      
      Title: ${meta.title}
      Description: ${meta.description}
      Canonical: ${meta.canonical}
      H1 Tags: ${meta.h1}
      H2 Count: ${meta.h2Count}
      Total Images: ${meta.images} (Alt text present: ${meta.imagesWithAlt})
      Total Links: ${meta.links} (External: ${meta.externalLinks})
      Load Time: ${loadTime}

      Based on these metrics, return a SEMRUSH-STYLE SEO Audit.
      
      Return ONLY raw JSON in this exact structure:
      {
        "score": <number 1-100 indicating Site Health>,
        "stats": {
          "totalErrors": <count>,
          "totalWarnings": <count>,
          "totalNotices": <count>
        },
        "details": {
          "titleLength": <number of characters>,
          "titleStatus": "optimal" | "too_long" | "too_short" | "missing",
          "descLength": <number of characters>,
          "descStatus": "optimal" | "too_long" | "too_short" | "missing",
          "hasSsl": <boolean>,
          "mobileFriendly": <boolean>,
          "altOptimization": <number 1-100>
        },
        "issues": [
           {"type": "error" | "warning" | "notice", "category": "Crawlability" | "HTTPS" | "On-Page" | "Performance", "text": "Specific recommendation"}
        ]
      }`;

      const aiResponse = await this.aiService.generateContent(prompt, 'You are a veteran technical SEO crawler and analyst at Semrush.');
      
      // Clean and parse
      const cleanedResponse = aiResponse.replace(/```json|```/g, '').trim();
      const parsedAudit = JSON.parse(cleanedResponse);

      return {
        success: true,
        data: {
          score: parsedAudit.score,
          loadTime,
          meta,
          details: parsedAudit.details,
          issues: parsedAudit.issues
        }
      };

    } catch (error: any) {
       console.error("SEO Audit backend error", error);
       
       return {
         success: false,
         error: error.message || 'Unknown network or AI generation failure',
         data: {
           score: 0,
           loadTime: '0.0s',
           issues: [
             { type: 'error', category: 'Network', text: `Dynamic Audit Error: ${error.message}` },
             { type: 'warning', category: 'Access', text: 'Target site might be blocking AI crawlers. Check robots.txt.' }
           ]
         }
       }
    }
  }
}
