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
    pages: string;
    primaryColor: string;
    logoBase64?: string;
  }) {
    this.logger.log('[website-builder] Request received → using gpt-4o (16384 tokens)');

    const pages = body.pages
      ? body.pages.split(',').map((p) => p.trim()).filter(Boolean)
      : ['Home', 'About', 'Services', 'Contact'];
    const pagesStr = pages.join(', ');
    const primaryColor = body.primaryColor || '#036cd8';
    const hasLogo = !!body.logoBase64;

    const realLogoTag = hasLogo
      ? `<img src="${body.logoBase64}" alt="Logo" style="height:48px; object-fit:contain;" />`
      : `<span class="brand-name" style="font-size:1.5rem;font-weight:800;color:${primaryColor};">${body.topic || 'Brand'}</span>`;

    const systemPrompt = `You are the World's #1 Senior Frontend Architect and Premium UI/UX Designer. You write complete, production-grade Single Page Applications (SPAs) in one HTML file.

YOUR ABSOLUTE RULES:
1. OUTPUT: Only raw HTML. Start with <!DOCTYPE html> and end with </html>. ZERO markdown, ZERO code fences.
2. NEVER TRUNCATE. Write 100% of every page. If the output is long, continue until complete.
3. ALL PAGES: Build every single page from the required list. No placeholders, no "coming soon".
4. REAL CONTENT: Write expert, industry-specific long-form copy. Never use Lorem Ipsum.
5. DESIGN: Use Tailwind CSS CDN + FontAwesome CDN + Google Fonts (Plus Jakarta Sans). Configure primary color via tailwind.config.
6. SPA LOGIC: showPage(slug) function. Each <section> has id="section-{slug}" and class="page-section". Nav links call showPage('{slug}'). First page visible by default.
7. FOOTER: Always include a 4-column footer: (1) Logo+socials, (2) Quick links for all pages, (3) Contact info, (4) Newsletter signup.`;

    const userPrompt = `Build a complete multi-page premium website SPA.

Business: "${body.topic}"
Brand Primary Color: "${primaryColor}"
Pages (ALL must be fully built): ${pagesStr}

For EACH page, create <section id="section-SLUG" class="page-section"> with 3-5 rich sub-sections:
- HOME: Hero (headline + 2 CTAs) → Stats row (4 numbers) → Why Choose Us (3 cards) → Our Process (3 steps) → FAQ (4 Qs) → CTA banner
- ABOUT: Story section → Mission & Vision → Team grid (6 people with names/titles) → Milestones timeline
- SERVICES: Page title → 8 service cards (icon + title + 3-line description + button) → Comparison table → CTA
- CONTACT: Split layout (form left, contact info+map right) → FAQ → Social links
- ANY OTHER PAGE: 4 unique, content-rich sections relevant to the page title

Design requirements:
- tailwind.config primary: "${primaryColor}"
- Glassmorphism cards (bg-white/80 backdrop-blur-md)
- Hover animations (hover:-translate-y-2 transition-all duration-300)
- Sticky navbar with blur on scroll
- Hamburger menu for mobile
- Scroll-to-top button
- Logo in NAV and FOOTER: [COMPANY_LOGO_IMAGE_TAG]
- Footer: 4 columns, dark background, brand accent color

Generate the COMPLETE HTML now. Do not stop until </html>.`;

    const raw = await this.aiService.generateContent(userPrompt, systemPrompt, undefined, 'gpt-4o', 16384);

    let html = raw
      .replace(/^```html\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    html = html.replace(/\[COMPANY_LOGO_IMAGE_TAG\]/g, realLogoTag);

    return { aiOutput: html };
  }
}
