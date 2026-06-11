import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { SemrushService } from './semrush.service';
import * as cheerio from 'cheerio';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly aiService: AiService,
    private readonly semrushService: SemrushService,
  ) {}

  private async scrapeUrl(url: string): Promise<string> {
    try {
      if (!url) return '';
      const targetUrl = url.startsWith('http') ? url : `https://${url}`;
      const fetchResponse = await fetch(targetUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120' }
      });
      if (fetchResponse.ok) {
        const htmlText = await fetchResponse.text();
        const $ = cheerio.load(htmlText);
        return $('body').text().replace(/\s+/g, ' ').slice(0, 3000);
      }
    } catch (e) {
      this.logger.error(`Failed to scrape ${url}`);
    }
    return '';
  }

  // ── REVIEW GENERATION ─────────────────────────────────────
  @Post('review-gen')
  async reviewGen(@Body() body: { customer_name: string; product: string }) {
    this.logger.log('[review-gen] Request received');
    const prompt = `Act as an Elite Customer Success Manager. Draft a psychology-backed, highly-persuasive review request email for customer ${body.customer_name} who recently purchased ${body.product}. The email must be brief, reduce friction, and use the 'foot-in-the-door' psychological technique to maximize conversion.`;
    const result = await this.aiService.generateContent(prompt, 'You are an Elite Customer Success Manager. Prioritize customer psychology, conversion rate optimization, and absolute brevity. Do not include placeholder text.', undefined, 'gpt-3.5-turbo', 1500);
    return { aiOutput: result };
  }

  // ── REVIEW RESPONSE ───────────────────────────────────────
  @Post('review-response')
  async reviewResponse(@Body() body: { star_rating: string; review_text: string }) {
    this.logger.log('[review-response] Request received');
    const prompt = `Act as a Senior Crisis Management & CX Specialist. Draft a professional response to this ${body.star_rating}-star customer review: "${body.review_text}". If 1-3 stars, use the 'HEART' framework (Hear, Empathize, Apologize, Resolve, Diagnose) to de-escalate without admitting legal fault. If 4-5 stars, amplify the positive sentiment and softly encourage repeat business.`;
    const result = await this.aiService.generateContent(prompt, 'You are a Senior Crisis Management & CX Specialist. Adhere strictly to the HEART framework for negative reviews and brand amplification for positive ones.', undefined, 'gpt-3.5-turbo', 1500);
    return { aiOutput: result };
  }

  // ── SOCIAL PUBLISHING ─────────────────────────────────────
  @Post('social-pub')
  async socialPub(@Body() body: { topic: string }) {
    this.logger.log('[social-pub] Request received');
    const prompt = `Act as a Viral Social Media Strategist. Create a high-converting post for the following topic: '${body.topic}'. Provide two distinct variations:\n1. LinkedIn (focus on professional storytelling, thought leadership, and formatting with line breaks).\n2. Twitter/X (focus on punchy hooks, thread-style formatting, and brevity).\nInclude optimal emojis and highly-researched hashtags.`;
    const result = await this.aiService.generateContent(prompt, 'You are a Viral Social Media Strategist. Strictly differentiate between platform algorithms (LinkedIn vs Twitter). Optimize for dwell time and CTR.', undefined, 'gpt-3.5-turbo', 1500);
    return { aiOutput: result };
  }

  // ── SOCIAL ENGAGEMENT ─────────────────────────────────────
  @Post('social-engage')
  async socialEngage(@Body() body: { brand_tone: string; user_comment: string }) {
    this.logger.log('[social-engage] Request received');
    const prompt = `Act as a Brand Reputation Manager. Draft a reply to the following social media user comment. You MUST strictly adhere to a '${body.brand_tone}' brand tone. Comment: "${body.user_comment}". De-escalate if negative, build community if positive.`;
    const result = await this.aiService.generateContent(prompt, 'You are an elite Brand Reputation Manager. Maintain absolute strictness to the specified brand tone. Do not sound robotic.', undefined, 'gpt-3.5-turbo', 1500);
    return { aiOutput: result };
  }

  // ── REPORTING ─────────────────────────────────────────────
  @Post('reporting')
  async reporting(@Body() body: { metrics: string }) {
    this.logger.log('[reporting] Request received');
    const prompt = `Act as a Fractional Chief Marketing Officer (CMO). Analyze the following raw metrics data: ${body.metrics}. Do not just repeat the numbers. Synthesize this data into exactly 3 bullet points focusing purely on: 1. Return on Investment (ROI), 2. Customer Acquisition Cost (CAC) implications, and 3. Immediate actionable business pivots required.`;
    const result = await this.aiService.generateContent(prompt, 'You are an elite Fractional CMO and Data Scientist. Provide strictly high-level, strategic business insights. No fluff.', undefined, 'gpt-3.5-turbo', 1500);
    return { aiOutput: result };
  }

  // ── LISTINGS OPTIMIZATION ─────────────────────────────────
  @Post('listings-opt')
  async listingsOpt(@Body() body: { business_name: string; keywords: string }) {
    this.logger.log('[listings-opt] Request received');
    const prompt = `Act as a Local SEO Architect. Write an optimized Google Business Profile (GBP) description for the business '${body.business_name}'. Strategically implement these keywords via Latent Semantic Indexing (LSI) without keyword stuffing: ${body.keywords}. Optimize for local map pack rankings and high CTR.`;
    const result = await this.aiService.generateContent(prompt, 'You are an elite Local SEO Architect. Follow strict Google Business Profile guidelines. Maximize local keyword density naturally.', undefined, 'gpt-3.5-turbo', 1500);
    return { aiOutput: result };
  }

  // ── LEAD GENERATION ───────────────────────────────────────
  @Post('lead-gen')
  async leadGen(@Body() body: { industry: string; region: string }) {
    this.logger.log('[lead-gen] Request received');
    const prompt = `Act as a B2B/B2C Growth Hacker. Formulate a highly accurate, real-world lead generation strategy for the industry '${body.industry}' in the region '${body.region}'. Mandate real-world tactics (e.g., Boolean search strings, specific local databases, scraping methodologies) instead of generic advice. DO NOT hallucinate fake names.`;
    const result = await this.aiService.generateContent(prompt, 'You are a strict, data-driven Growth Hacker. Provide only real, actionable methodologies, precise Boolean search queries, and verifiable platforms. Zero hallucination.', undefined, 'gpt-4o', 2000);
    return { aiOutput: result };
  }

  // ── CONTACT SEGMENTATION ──────────────────────────────────
  @Post('segmentation')
  async segmentation(@Body() body: { customer_data: string }) {
    this.logger.log('[segmentation] Request received');
    const prompt = `Act as a Senior Data Scientist. Analyze this customer interaction footprint: ${body.customer_data}. Perform an RFM (Recency, Frequency, Monetary) analysis categorization. Predict potential churn behavior and recommend exactly 2 LTV (Life-Time Value) optimization strategies specifically tailored to this segment's psychology.`;
    const result = await this.aiService.generateContent(prompt, 'You are a Senior Data Scientist specializing in RFM analysis and predictive customer behavior. Be highly analytical and concise.', undefined, 'gpt-3.5-turbo', 1500);
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
    const prompt = `Follow this custom instruction with 100% strict adherence and zero deviation: '${body.instruction}'\n\nInput Data to process: ${body.input}`;
    const result = await this.aiService.generateContent(prompt, 'You are an ultra-precise AI execution engine. Strictly follow the user custom instruction without hallucination, preamble, or deviation.', undefined, 'gpt-3.5-turbo', 1500);
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

    // Extract a clean, short brand name (taking the part before any separator like -, :, |, or comma)
    const brandName = body.topic.split(/[-:|,\n]/)[0]?.trim() || body.topic || 'Brand';

    const realLogoTag = hasLogo
      ? `<img src="${body.logoBase64}" alt="Logo" style="height:48px; object-fit:contain;" />`
      : `<span class="brand-name" style="font-size:1.5rem;font-weight:800;color:var(--primary);font-family:'Space Grotesk',sans-serif;letter-spacing:-0.5px;">${brandName}</span>`;

    const systemPrompt = `You are a World-Class Lead Designer at a top-tier digital agency.
Your mission: Generate an "Elite" Multi-Page SPA for the brand "${brandName}" (Full Topic/Niche: "${body.topic}").

THEME-SPECIFIC RULES (STRICT):
- If THEME is 'Restaurant': Use elegant food menus, reservation forms, and gallery grids.
- If THEME is 'SaaS' or 'Startup': Use modern dashboard previews, complex feature grids, and comparison tables.
- If THEME is 'Healthcare' or 'Education': Use clean, trust-building layouts, appointment/enrollment forms, and resource grids.
- If THEME is 'E-commerce' or 'Real Estate': Use product/property cards with large images, filter UI, and high-impact CTAs.

DESIGN SYSTEM & BRAND STYLING:
1. TYPOGRAPHY: Elite hierarchy using 'Plus Jakarta Sans' or 'Inter' from Google Fonts.
2. BRAND NAME: Use exactly "${brandName}" as the brand/company name throughout the text, navbar logo, and footer.
3. COLORS & PALETTE: You must define CSS custom properties at the :root level:
   :root {
     --primary: ${primaryColor};
     --secondary: ${secondaryColor};
   }
   You MUST strictly style the entire website using var(--primary) and var(--secondary) for all branding, backgrounds, gradients, borders, highlights, active states, and hover effects. Do NOT use default tailwind or bootstrap/generic colors.
4. ANIMATIONS: Include AOS library (data-aos="fade-up") or smooth CSS transitions.
5. COMPONENTS: Use rounded-3xl, shadow-2xl, and beautiful glassmorphism.
6. CLIENT-SIDE ROUTING (SPA) & LAYOUT: You must build a fully functional Single Page Application. All '.page-section' containers must be wrapped inside a single \`<main>\` element. The Header/Navbar and the Footer MUST sit outside the \`<main>\` wrapper (at the layout level) so they remain visible at all times across all pages. Wrap each page's content in its own container (\`<div id="page-name" class="page-section hidden">\`), except the Home page which must be visible by default.
7. PAGE TRANSITIONS: Include a CSS animation to fade and slide up pages when they are displayed, making the experience buttery smooth. Add this rule to the stylesheet:
   @keyframes fadeInUp {
     from { opacity: 0; transform: translateY(15px); }
     to { opacity: 1; transform: translateY(0); }
   }
   .page-section:not(.hidden) {
     animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
   }
8. ABSOLUTE COMPLETENESS & RICH COPY: Every single page in the navigation must be fully fleshed out with extensive, detailed marketing sections, detailed benefit statements, comprehensive user reviews, fully designed lists, and complete descriptive copy specific to the brand. No shorthand stubs, no placeholder comments, and no truncated text.
9. PREMIUM FOOTER: The footer must be a fully-designed, modern multi-column component containing:
   - Brand information with logo and a compelling mission statement.
   - Quick Links (Home, About Us, Services, Portfolio, Contact Us) mapped to the SPA router.
   - Contact Info (phone, email, hours, physical address).
   - Fully-styled Newsletter Subscription Form (with email input and submit CTA).
   - Social media links with premium micro-interactions.
10. STICKY FLEXBOX LAYOUT (NO OVERLAPS): To prevent any overlaps or footer float issues, use a flex layout on the body:
    body {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      margin: 0;
    }
    main {
      flex: 1;
    }
    The Header/Navbar sits at the top, the \`<main>\` container wraps all '.page-section' bodies in the middle, and the Footer sits at the bottom in the normal document flow. Do NOT make the Footer position: fixed or position: absolute; it must sit naturally at the bottom.

TECHNICAL RULES:
- LOGO: Use exactly [COMPANY_LOGO_IMAGE_TAG] for the logo image or fallback text placement.
- NO TRUNCATION. NO MARKDOWN. ONLY RAW HTML.
- Start with <!DOCTYPE html> and end with </html>.`;

    const userPrompt = `Build an Elite Multi-Page ${theme} Website for the brand "${brandName}" based on topic "${body.topic}".

REQUIRED PAGES: ${pagesStr}
PRIMARY COLOR: ${primaryColor}
SECONDARY COLOR: ${secondaryColor}

INSTRUCTIONS FOR EACH PAGE (MUST BE FULLY DESIGNED & COMPLETED WITH RICH CONTENT):
1. HOME:
   - Stunning Hero section with a powerful value proposition, supporting subtext, and dual call-to-action buttons.
   - Logos of Trusted Clients / Social Proof ticker.
   - Core Features Grid showing 4 distinct value propositions with modern icons and hover scale/glassmorphism effects.
   - Theme-Specific Interactive Showcase (e.g., interactive dashboard mock, tabbed comparison table, food menu slider, or properties search interface).
   - How It Works / Process Roadmap showing step 1, 2, 3, 4 with line connectors.
   - Testimonial Carousel or Grid with high-fidelity avatars, star ratings, and long-form reviews.
   - Interactive FAQ accordion with CSS-only or JS toggle transitions.
2. ABOUT US:
   - Rich brand narrative & origin story explaining the company's mission and vision.
   - Core Values Grid with 4 custom cards using icons, hover gradients, and custom shadows.
   - Interactive Milestone Timeline showing the brand's achievements over the years.
   - Founders & Team Grid with individual cards containing high-quality avatars, detailed bios, roles, and animated social links.
3. SERVICES / PRODUCTS:
   - Detailed listing of 4-6 distinct offerings, each with its own icon, detailed paragraph, target audience, and value highlight.
   - High-impact pricing comparison matrix with "Most Popular" badges, listed features checklist, and CTA buttons.
   - Detailed "Why Choose Us" text block comparing your brand's quality metrics vs. industry average.
   - Direct scheduling or Consultation CTA section.
4. PORTFOLIO / GALLERY:
   - Modern project grid showcasing 6-8 distinct projects.
   - Interactive Category Filter tabs (e.g., All, Category A, Category B, Category C) that dynamically show/hide project cards using JavaScript.
   - Rich project card layouts displaying client name, project year, scope, and hover-triggered overlay details.
5. CONTACT US:
   - Double-column layout.
   - Left column: Contact Info card containing beautiful details for address, phone, email, support desk, and operating hours. Integrated map placeholder or vector graphic.
   - Right column: Fully operational Contact Form (Name, Email, Phone, Message) with custom styling, focus states, floating labels, validation states, and a submit CTA.

SPA NAVIGATION SETUP:
- Define CSS style:
  .page-section { display: block; opacity: 1; transition: opacity 0.5s ease; }
  .page-section.hidden { display: none !important; opacity: 0; }
- Navbar links and Footer quick links for the SPA pages must use hash anchors matching the page IDs (e.g., href="#home", href="#about-us", href="#services", etc.).
- Include a robust JavaScript router that intercepts clicks ONLY on links whose 'href' starts with '#' (e.g., using link.getAttribute('href')?.startsWith('#')). External links (like social media profiles, newsletter submit actions, or tel/mailto links) must NOT be intercepted or blocked by the router.
- When an internal hash link is clicked, the router should:
  1. Prevent the default link behavior.
  2. Extract the target page ID from the hash (e.g. 'about-us' from '#about-us').
  3. Find the matching '.page-section' element. If found, hide all other page-sections and show the matching one.
  4. Update the active CSS class on both header and footer active links.
  5. Scroll to the top of the window smoothly.
- Ensure the header/navbar, logo, and footer are placed outside the '.page-section' elements (and outside the '<main>' tag) so they are layout-level and permanently functional.

IMPORTANT: Every page must look professional, fully-designed, and filled with extensive, custom content. No placeholders or stubs.`;

    // Validate image format compatibility for OpenAI Vision API (OpenAI only supports png, jpeg, webp, and gif)
    let visionImage: string | undefined = undefined;
    if (body.logoBase64) {
      const lower = body.logoBase64.toLowerCase();
      const isSupported = lower.startsWith('data:image/png') ||
                          lower.startsWith('data:image/jpeg') ||
                          lower.startsWith('data:image/jpg') ||
                          lower.startsWith('data:image/webp') ||
                          lower.startsWith('data:image/gif');
      if (isSupported) {
        visionImage = body.logoBase64;
      } else {
        this.logger.warn(`Logo image format is not supported by OpenAI Vision API (e.g. SVG). Skipping image input for LLM prompt.`);
      }
    }

    const raw = await this.aiService.generateContent(
      userPrompt,
      systemPrompt,
      undefined,
      'gpt-4o',
      16384 as any,
      visionImage as any,
    );

    let html = raw
      .replace(/^```html\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    
    // Safety check for malformed logo tags or AI using placeholder directly inside img tags
    html = html.replace(/<img[^>]*?\[COMPANY_LOGO_IMAGE_TAG\][^>]*?>/gi, realLogoTag);
    html = html.replace(/<img[^>]*?src=["'](?:logo|Logo)["'][^>]*?>/gi, realLogoTag);

    const escapedTopic = body.topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedBrand = brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const brandImgRegex = new RegExp(`<img[^>]*?src=["'](?:${escapedTopic}|${escapedBrand})["'][^>]*?>`, 'gi');
    html = html.replace(brandImgRegex, realLogoTag);
    
    html = html.replace(/\[COMPANY_LOGO_IMAGE_TAG\]/g, realLogoTag);

    return { aiOutput: html };
  }

  // ── AD COPYWRITER ────────────────────────────────────────
  @Post('ad-copy')
  async adCopy(@Body() body: { product: string; platform: string; product_url?: string }) {
    this.logger.log('[ad-copy] Request received');
    let realContext = '';
    if (body.product_url) {
      const scrapedText = await this.scrapeUrl(body.product_url);
      if (scrapedText) realContext = `\n\nREAL WEBSITE CONTEXT (Scraped from ${body.product_url}):\n${scrapedText}`;
    }
    const prompt = `Act as an elite Direct-Response Copywriter. Write 3 high-converting ad copy variations for ${body.platform} promoting: "${body.product}".${realContext}\n\nStrictly use the PAS (Problem-Agitate-Solve) or AIDA (Attention-Interest-Desire-Action) marketing frameworks. Base all claims on the scraped context. Output must include Headline, Primary Text, and CTA for each variation.`;
    const result = await this.aiService.generateContent(prompt, 'You are an elite direct-response copywriter. Strictly mandate PAS or AIDA frameworks. Base claims ONLY on real context.', undefined, 'gpt-4o', 2000);
    return { aiOutput: result };
  }

  // ── EMAIL SEQUENCE ───────────────────────────────────────
  @Post('email-sequence')
  async emailSequence(@Body() body: { product_name: string; audience: string }) {
    this.logger.log('[email-sequence] Request received');
    const prompt = `Act as a Lifecycle Marketing Master. Write a 3-part email drip sequence for "${body.product_name}" targeting "${body.audience}".\nEmail 1: The 'Soap Opera Sequence' Hook (High drama/curiosity).\nEmail 2: Value/Nurture (Overcoming objections).\nEmail 3: The Hard Sale (Scarcity and direct CTA).\nInclude high-open-rate subject lines and strictly avoid spam-trigger words.`;
    const result = await this.aiService.generateContent(prompt, 'You are a master Lifecycle Email Marketer. Mandate Soap Opera sequence structures. Optimize for deliverability and open-rates.', undefined, 'gpt-4o', 3000);
    return { aiOutput: result };
  }

  // ── BLOG WRITER ──────────────────────────────────────────
  @Post('blog-writer')
  async blogWriter(@Body() body: { title: string; keywords: string }) {
    this.logger.log('[blog-writer] Request received');
    
    // Fetch REAL keyword data from Semrush for the first keyword
    let realSeoData = '';
    try {
      const firstKeyword = body.keywords.split(',')[0]?.trim();
      if (firstKeyword) {
         const kwData = await this.semrushService.getOrganicKeywords(firstKeyword.replace(/\s+/g, ''));
         if (kwData && kwData.length > 0) {
            realSeoData = `\n\nREAL SEMRUSH DATA FOR KEYWORDS:\n${JSON.stringify(kwData.slice(0, 3))}\nUse this real volume and competition data to inform your content strategy.`;
         }
      }
    } catch (e) {
      this.logger.error('Failed to fetch Semrush data for blog writer', e);
    }

    const prompt = `Act as an EEAT (Experience, Expertise, Authoritativeness, Trustworthiness) SEO Content Strategist. Write a highly engaging blog post titled "${body.title}". Incorporate these keywords: ${body.keywords}.${realSeoData}\n\nStrictly follow Google's EEAT guidelines. Use optimal H2/H3 hierarchy, bullet points for scannability, and LSI keyword integration. Ensure absolute factual accuracy.`;
    const result = await this.aiService.generateContent(prompt, 'You are an elite SEO Content Strategist. Strictly enforce Google EEAT guidelines, LSI keyword usage, and perfect semantic structure.', undefined, 'gpt-4o', 4000);
    return { aiOutput: result };
  }

  // ── VIDEO SCRIPT ─────────────────────────────────────────
  @Post('video-script')
  async videoScript(@Body() body: { platform: string; topic: string }) {
    this.logger.log('[video-script] Request received');
    const prompt = `Act as a TikTok/Reels Viral Producer. Write a highly engaging short-form video script about "${body.topic}" optimized for ${body.platform}. Include: 1. A pattern-interrupting 3-second visual hook. 2. AVD (Average View Duration) optimization pacing notes. 3. A dual-column format (Visual Actions vs. Audio/Spoken text). 4. A seamless loop or strong CTA.`;
    const result = await this.aiService.generateContent(prompt, 'You are a viral short-form video producer. Optimize strictly for algorithmic retention graphs, AVD, and pattern interruption.', undefined, 'gpt-3.5-turbo', 2000);
    return { aiOutput: result };
  }

  // ── PRESS RELEASE ────────────────────────────────────────
  @Post('press-release')
  async pressRelease(@Body() body: { company: string; announcement: string; company_url?: string }) {
    this.logger.log('[press-release] Request received');
    let realContext = '';
    if (body.company_url) {
      const scrapedText = await this.scrapeUrl(body.company_url);
      if (scrapedText) realContext = `\n\nREAL COMPANY BACKGROUND (Scraped from ${body.company_url}):\n${scrapedText}`;
    }
    const prompt = `Act as a Tier-1 Public Relations Director. Write a formal, media-ready press release for ${body.company} announcing: "${body.announcement}".${realContext}\n\nStrictly adhere to AP Style guidelines. Include a journalistic inverted pyramid structure, a compelling dateline, an executive quote placeholder, and a professional corporate boilerplate based strictly on the scraped context.`;
    const result = await this.aiService.generateContent(prompt, 'You are a Tier-1 PR Director. Strictly enforce AP Style, inverted pyramid structure, and media-ready formatting. Base the boilerplate ONLY on scraped context.', undefined, 'gpt-4o', 2000);
    return { aiOutput: result };
  }

  // ── BRAND IDENTITY ───────────────────────────────────────
  @Post('brand-identity')
  async brandIdentity(@Body() body: { business_description: string; website_url?: string }) {
    this.logger.log('[brand-identity] Request received');
    let realContext = '';
    if (body.website_url) {
      const scrapedText = await this.scrapeUrl(body.website_url);
      if (scrapedText) realContext = `\n\nREAL WEBSITE CONTENT (Scraped from ${body.website_url}):\n${scrapedText}`;
    }
    const prompt = `Act as a Chief Brand Officer. Based on this business description: "${body.business_description}".${realContext}\n\nGenerate an elite brand identity framework. Include: 1. Primary Jungian Brand Archetype. 2. Tone-of-Voice Matrix (Do's and Don'ts). 3. A 10-word Mission Statement. 4. A 10-word Vision Statement. 5. Deep Psychographic profiling of the ideal customer. Base all factual essence on the scraped data.`;
    const result = await this.aiService.generateContent(prompt, 'You are an elite Chief Brand Officer. Use advanced branding psychology (Jungian archetypes, psychographics). Rely on real scraped data.', undefined, 'gpt-4o', 3000);
    return { aiOutput: result };
  }
}
