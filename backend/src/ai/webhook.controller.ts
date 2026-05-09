import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly aiService: AiService) {}

  // ── REVIEW GENERATION ─────────────────────────────────────
  @Post('review-gen')
  async reviewGen(@Body() body: { customer_name: string; product: string }) {
    this.logger.log('[review-gen] Request received');
    const prompt = `Draft a professional review request email for customer ${body.customer_name} who recently purchased ${body.product}. Keep it brief!`;
    const result = await this.aiService.generateContent(prompt, 'You are a professional marketing copywriter.', undefined, 'gpt-3.5-turbo', 1500);
    return { aiOutput: result };
  }

  // ── REVIEW RESPONSE ───────────────────────────────────────
  @Post('review-response')
  async reviewResponse(@Body() body: { star_rating: string; review_text: string }) {
    this.logger.log('[review-response] Request received');
    const prompt = `Draft a professional response to this ${body.star_rating}-star customer review. The review says: "${body.review_text}". Make it empathetic and professional.`;
    const result = await this.aiService.generateContent(prompt, 'You are a professional customer service manager.', undefined, 'gpt-3.5-turbo', 1500);
    return { aiOutput: result };
  }

  // ── SOCIAL PUBLISHING ─────────────────────────────────────
  @Post('social-pub')
  async socialPub(@Body() body: { topic: string }) {
    this.logger.log('[social-pub] Request received');
    const prompt = `Act as a Social Media expert. Create an engaging LinkedIn & Twitter post for the following topic: '${body.topic}'. Include emojis and hashtags.`;
    const result = await this.aiService.generateContent(prompt, 'You are a social media marketing expert.', undefined, 'gpt-3.5-turbo', 1500);
    return { aiOutput: result };
  }

  // ── SOCIAL ENGAGEMENT ─────────────────────────────────────
  @Post('social-engage')
  async socialEngage(@Body() body: { brand_tone: string; user_comment: string }) {
    this.logger.log('[social-engage] Request received');
    const prompt = `Draft a reply to the following social media user comment. Follow a '${body.brand_tone}' brand tone. Comment: "${body.user_comment}".`;
    const result = await this.aiService.generateContent(prompt, 'You are a social media engagement specialist.', undefined, 'gpt-3.5-turbo', 1500);
    return { aiOutput: result };
  }

  // ── REPORTING ─────────────────────────────────────────────
  @Post('reporting')
  async reporting(@Body() body: { metrics: string }) {
    this.logger.log('[reporting] Request received');
    const prompt = `You are a Reporting AI. Analyze the following raw metrics data and summarize it into 3 clear bullet points of actionable insights: ${body.metrics}`;
    const result = await this.aiService.generateContent(prompt, 'You are a data analytics expert.', undefined, 'gpt-3.5-turbo', 1500);
    return { aiOutput: result };
  }

  // ── LISTINGS OPTIMIZATION ─────────────────────────────────
  @Post('listings-opt')
  async listingsOpt(@Body() body: { business_name: string; keywords: string }) {
    this.logger.log('[listings-opt] Request received');
    const prompt = `Act as an SEO Listings Expert for a business named '${body.business_name}'. Write an optimized Google Business Profile description utilizing these keywords: ${body.keywords}.`;
    const result = await this.aiService.generateContent(prompt, 'You are an SEO and local listings expert.', undefined, 'gpt-3.5-turbo', 1500);
    return { aiOutput: result };
  }

  // ── LEAD GENERATION ───────────────────────────────────────
  @Post('lead-gen')
  async leadGen(@Body() body: { industry: string; region: string }) {
    this.logger.log('[lead-gen] Request received');
    const prompt = `Analyze the target industry '${body.industry}' in the region '${body.region}'. Formulate a quick lead generation strategy and provide 2 example mock leads in JSON format.`;
    const result = await this.aiService.generateContent(prompt, 'You are a lead generation strategist.', undefined, 'gpt-3.5-turbo', 1500);
    return { aiOutput: result };
  }

  // ── CONTACT SEGMENTATION ──────────────────────────────────
  @Post('segmentation')
  async segmentation(@Body() body: { customer_data: string }) {
    this.logger.log('[segmentation] Request received');
    const prompt = `You are a Data Segmentation AI. Given this customer interaction footprint, categorize them into a specific marketing segment (e.g. VIP, At-Risk) and explain why: ${body.customer_data}`;
    const result = await this.aiService.generateContent(prompt, 'You are a customer data analyst.', undefined, 'gpt-3.5-turbo', 1500);
    return { aiOutput: result };
  }

  // ── TEMPLATE DESIGN (gpt-4o, 4096 tokens) ────────────────
  @Post('template-design')
  async templateDesign(@Body() body: { topic: string }) {
    this.logger.log('[template-design] Request received → using gpt-4o');
    const prompt = `You are an elite Senior UI/UX Designer and Web Developer.
Create a COMPLETE, FULLY-DESIGNED, and production-ready single-page website/template for the topic/title: "${body.topic}".

CRITICAL REQUIREMENTS:
1. OUTPUT FORMAT: Output ONLY raw HTML code starting with <!DOCTYPE html>. ZERO markdown, ZERO backticks.
2. CSS: Include comprehensive <style> tags with advanced modern CSS (animations, flexbox/grid, CSS gradients, hover effects, beautiful typography).
3. JAVASCRIPT: Include <script> tags for basic interactions if relevant.
4. STRUCTURE: Include Header/Navbar, Hero Section with CTA, Main Content/Features, and Footer.
5. The design MUST be stunning, premium, and fully responsive across mobile and desktop.`;

    const result = await this.aiService.generateContent(prompt, 'You are an elite UI/UX Designer. Output ONLY raw HTML. Zero markdown, zero backticks.', undefined, 'gpt-4o', 4096);
    const cleanHtml = result.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    return { aiOutput: cleanHtml };
  }

  // ── CUSTOM AGENT ─────────────────────────────────────────
  @Post('custom')
  async custom(@Body() body: { instruction: string; input: string }) {
    this.logger.log('[custom] Request received');
    const prompt = `${body.instruction}\n\nHere is the data: ${body.input}`;
    const result = await this.aiService.generateContent(prompt, 'You are a helpful AI assistant.', undefined, 'gpt-3.5-turbo', 1500);
    return { aiOutput: result };
  }

  // ── WEBSITE BUILDER (gpt-4o, 16384 tokens) ────────────────
  @Post('website-builder')
  async websiteBuilder(@Body() body: {
    topic: string;
    pages?: string;
    primaryColor?: string;
    secondaryColor?: string;
    theme?: string;
    logoBase64?: string;
  }) {
    this.logger.log(`[website-builder] Request received for topic: ${body.topic} → using gpt-4o (16384 tokens)`);

    // Determine pages
    let pageList: string[] = [];
    if (body.pages) {
      // If it looks like a number
      if (!isNaN(Number(body.pages.trim()))) {
        const count = Math.min(Math.max(parseInt(body.pages), 1), 10);
        pageList = ['Home', 'About Us', 'Services', 'Portfolio', 'Contact Us'];
        for (let i = 6; i <= count; i++) pageList.push(`Page ${i}`);
      } else {
        pageList = body.pages.split(',').map((p) => p.trim()).filter(Boolean);
      }
    }
    
    if (pageList.length === 0) {
      pageList = ['Home', 'About Us', 'Services', 'Portfolio', 'Contact Us'];
    }

    const pagesStr = pageList.join(', ');
    const primaryColor = body.primaryColor || '#036cd8';
    const secondaryColor = body.secondaryColor || '#6366f1';
    const theme = body.theme || 'Corporate';
    const hasLogo = !!body.logoBase64;

    const realLogoTag = hasLogo
      ? `<img src="${body.logoBase64}" alt="Logo" style="height:48px; object-fit:contain;" />`
      : `<span class="brand-name" style="font-size:1.5rem;font-weight:800;color:${primaryColor};">${body.topic || 'Brand'}</span>`;

    const systemPrompt = `You are a World-Class Lead Designer at a top-tier digital agency.
Your mission: Generate an "Elite" Multi-Page SPA for: "${body.topic}".

THEME-SPECIFIC RULES (STRICT):
- If THEME is 'Restaurant': Use elegant food menus, reservation forms, and gallery grids.
- If THEME is 'SaaS' or 'Startup': Use modern dashboard previews, complex feature grids, and comparison tables.
- If THEME is 'Healthcare' or 'Education': Use clean, trust-building layouts, appointment/enrollment forms, and resource grids.
- If THEME is 'E-commerce' or 'Real Estate': Use product/property cards with large images, filter UI, and high-impact CTAs.

DESIGN SYSTEM:
1. TYPOGRAPHY: Elite hierarchy using 'Plus Jakarta Sans'.
2. COLORS: Primary (${primaryColor}) and Secondary (${secondaryColor}). Use deep semantic shading.
3. ANIMATIONS: Include AOS library (data-aos="fade-up").
4. COMPONENTS: Use rounded-3xl, shadow-2xl, and glassmorphism.

TECHNICAL RULES:
- LOGO: Use exactly [COMPANY_LOGO_IMAGE_TAG].
- NO TRUNCATION. NO MARKDOWN. ONLY RAW HTML.
- Start with <!DOCTYPE html> and end with </html>.`;

    const userPrompt = `Build an Elite Multi-Page ${theme} Website for "${body.topic}".

REQUIRED PAGES: ${pagesStr}
PRIMARY COLOR: ${primaryColor}
SECONDARY COLOR: ${secondaryColor}

INSTRUCTIONS:
- Look at the logo (if provided) and adapt the ENTIRE theme to its vibe.
- Every page must have at least 4 unique, content-rich sections.
- HOME: Hero → Theme-Specific Features → Theme-Specific Grid → Testimonials → FAQ → Footer.
- ALL OTHER PAGES: Pages must follow the '${theme}' design language strictly.
- Logo Placeholder: [COMPANY_LOGO_IMAGE_TAG]

IMPORTANT: This site must be professional enough to sell for $10,000.`;

    const raw = await this.aiService.generateContent(
      userPrompt,
      systemPrompt,
      undefined,
      'gpt-4o',
      16384,
      body.logoBase64 || undefined,
    );

    let html = raw
      .replace(/^```html\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    
    // Safety check for malformed logo tags
    const escapedTopic = body.topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const brokenImgRegex = new RegExp(`<img[^>]*src=["']${escapedTopic}["'][^>]*>`, 'gi');
    html = html.replace(brokenImgRegex, '[COMPANY_LOGO_IMAGE_TAG]');
    
    html = html.replace(/\[COMPANY_LOGO_IMAGE_TAG\]/g, realLogoTag);

    return { aiOutput: html };
  }
}
