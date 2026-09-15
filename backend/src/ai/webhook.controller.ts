import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { SemrushService } from './semrush.service';
import * as cheerio from 'cheerio';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  private get agentServerUrl(): string {
    return process.env.AGENT_SERVER_URL || 'http://localhost:8003';
  }

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
    try {
      const response = await fetch(this.agentServerUrl + '/api/v1/review-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`FastAPI responded with status ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.warn(`Fallback to local AI: review-gen failed on python agent server: ${e.message}`);
      const prompt = `Act as an Elite Customer Success Manager. Draft a psychology-backed, highly-persuasive review request email for customer ${body.customer_name} who recently purchased ${body.product}. The email must be brief, reduce friction, and use the 'foot-in-the-door' psychological technique to maximize conversion.`;
      const result = await this.aiService.generateContent(prompt, 'You are an Elite Customer Success Manager. Prioritize customer psychology, conversion rate optimization, and absolute brevity. Do not include placeholder text.', undefined, 'gpt-3.5-turbo', 1500);
      return { aiOutput: result };
    }
  }

  // ── REVIEW RESPONSE ───────────────────────────────────────
  @Post('review-response')
  async reviewResponse(@Body() body: { star_rating: string; review_text: string }) {
    this.logger.log('[review-response] Request received');
    try {
      const response = await fetch(this.agentServerUrl + '/api/v1/review-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`FastAPI responded with status ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.warn(`Fallback to local AI: review-response failed on python agent server: ${e.message}`);
      const prompt = `Act as a Senior Crisis Management & CX Specialist. Draft a professional response to this ${body.star_rating}-star customer review: "${body.review_text}". If 1-3 stars, use the 'HEART' framework (Hear, Empathize, Apologize, Resolve, Diagnose) to de-escalate without admitting legal fault. If 4-5 stars, amplify the positive sentiment and softly encourage repeat business.`;
      const result = await this.aiService.generateContent(prompt, 'You are a Senior Crisis Management & CX Specialist. Adhere strictly to the HEART framework for negative reviews and brand amplification for positive ones.', undefined, 'gpt-3.5-turbo', 1500);
      return { aiOutput: result };
    }
  }

  // ── SOCIAL PUBLISHING ─────────────────────────────────────
  @Post('social-pub')
  async socialPub(@Body() body: { topic: string }) {
    this.logger.log('[social-pub] Request received');
    try {
      const response = await fetch(this.agentServerUrl + '/api/v1/social-pub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`FastAPI responded with status ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.warn(`Fallback to local AI: social-pub failed on python agent server: ${e.message}`);
      const prompt = `Act as a Viral Social Media Strategist. Create a high-converting post for the following topic: '${body.topic}'. Provide two distinct variations:\n1. LinkedIn (focus on professional storytelling, thought leadership, and formatting with line breaks).\n2. Twitter/X (focus on punchy hooks, thread-style formatting, and brevity).\nInclude optimal emojis and highly-researched hashtags.`;
      const result = await this.aiService.generateContent(prompt, 'You are a Viral Social Media Strategist. Strictly differentiate between platform algorithms (LinkedIn vs Twitter). Optimize for dwell time and CTR.', undefined, 'gpt-3.5-turbo', 1500);
      return { aiOutput: result };
    }
  }

  // ── SOCIAL ENGAGEMENT ─────────────────────────────────────
  @Post('social-engage')
  async socialEngage(@Body() body: { brand_tone: string; user_comment: string }) {
    this.logger.log('[social-engage] Request received');
    try {
      const response = await fetch(this.agentServerUrl + '/api/v1/social-engage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`FastAPI responded with status ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.warn(`Fallback to local AI: social-engage failed on python agent server: ${e.message}`);
      const prompt = `Act as a Brand Reputation Manager. Draft a reply to the following social media user comment. You MUST strictly adhere to a '${body.brand_tone}' brand tone. Comment: "${body.user_comment}". De-escalate if negative, build community if positive.`;
      const result = await this.aiService.generateContent(prompt, 'You are an elite Brand Reputation Manager. Maintain absolute strictness to the specified brand tone. Do not sound robotic.', undefined, 'gpt-3.5-turbo', 1500);
      return { aiOutput: result };
    }
  }

  // ── REPORTING ─────────────────────────────────────────────
  @Post('reporting')
  async reporting(@Body() body: { metrics: string }) {
    this.logger.log('[reporting] Request received');
    try {
      const response = await fetch(this.agentServerUrl + '/api/v1/reporting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`FastAPI responded with status ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.warn(`Fallback to local AI: reporting failed on python agent server: ${e.message}`);
      const prompt = `Act as our Fractional Chief Marketing Officer (CMO). Analyze the following rich marketing performance datasets, which include overall paid ads metrics, detailed platform breakdowns (Meta, Google, LinkedIn, Twitter/X), brand profile context, and organic search SEO metrics:

${body.metrics}

Generate a comprehensive executive-level Digital Marketing Report in Markdown. Address the following areas explicitly:
1. Executive Strategy & Brand Alignment: Review the brand positioning, description, tone, target audience, and key value proposition. Assess how the overall digital presence aligns with this identity.
2. Paid Media Performance (Ads Platforms Breakdown): Differentiate and compare performance across active platforms (Facebook/Meta, Google Ads, LinkedIn, Twitter/X). Analyze CTR, CPC, Spend, and Conversions.
3. Organic Visibility & Technical SEO Analysis: Evaluate site load speed, domain authority, organic traffic volume, and search console indexing. Provide feedback on meta tags and keywords.
4. Strategic Pivots & Blended CAC Optimization: Provide tactical recommendations, budget adjustments, keyword targets, and pivots to lower CAC and maximize ROI.

Deliver a detailed, structured marketing report.`;
      const result = await this.aiService.generateContent(prompt, 'You are a World-Class Fractional CMO & Senior Growth Marketing Consultant. Generate comprehensive, data-driven, and highly actionable Marketing Performance Reports.', undefined, 'gpt-4o', 3000);
      return { aiOutput: result };
    }
  }

  // ── LISTINGS OPTIMIZATION ─────────────────────────────────
  @Post('listings-opt')
  async listingsOpt(@Body() body: { business_name: string; keywords: string }) {
    this.logger.log('[listings-opt] Request received');
    try {
      const response = await fetch(this.agentServerUrl + '/api/v1/listings-opt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`FastAPI responded with status ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.warn(`Fallback to local AI: listings-opt failed on python agent server: ${e.message}`);
      const prompt = `Act as a Local SEO Architect. Write an optimized Google Business Profile (GBP) description for the business '${body.business_name}'. Strategically implement these keywords via Latent Semantic Indexing (LSI) without keyword stuffing: ${body.keywords}. Optimize for local map pack rankings and high CTR.`;
      const result = await this.aiService.generateContent(prompt, 'You are an elite Local SEO Architect. Follow strict Google Business Profile guidelines. Maximize local keyword density naturally.', undefined, 'gpt-3.5-turbo', 1500);
      return { aiOutput: result };
    }
  }

  // ── LEAD GENERATION ───────────────────────────────────────
  @Post('lead-gen')
  async leadGen(@Body() body: { industry: string; region: string }) {
    this.logger.log('[lead-gen] Request received');
    try {
      const response = await fetch(this.agentServerUrl + '/api/v1/lead-gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`FastAPI responded with status ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.warn(`Fallback to local AI: lead-gen failed on python agent server: ${e.message}`);
      const prompt = `Act as a B2B/B2C Growth Hacker. Formulate a highly accurate, real-world lead generation strategy for the industry '${body.industry}' in the region '${body.region}'. Mandate real-world tactics (e.g., Boolean search strings, specific local databases, scraping methodologies) instead of generic advice. DO NOT hallucinate fake names.`;
      const result = await this.aiService.generateContent(prompt, 'You are a strict, data-driven Growth Hacker. Provide only real, actionable methodologies, precise Boolean search queries, and verifiable platforms. Zero hallucination.', undefined, 'gpt-4o', 2000);
      return { aiOutput: result };
    }
  }

  // ── CONTACT SEGMENTATION ──────────────────────────────────
  @Post('segmentation')
  async segmentation(@Body() body: { customer_data: string }) {
    this.logger.log('[segmentation] Request received');
    try {
      const response = await fetch(this.agentServerUrl + '/api/v1/segmentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`FastAPI responded with status ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.warn(`Fallback to local AI: segmentation failed on python agent server: ${e.message}`);
      const prompt = `Act as a Senior Data Scientist. Analyze this customer interaction footprint: ${body.customer_data}. Perform an RFM (Recency, Frequency, Monetary) analysis categorization. Predict potential churn behavior and recommend exactly 2 LTV (Life-Time Value) optimization strategies specifically tailored to this segment's psychology.`;
      const result = await this.aiService.generateContent(prompt, 'You are a Senior Data Scientist specializing in RFM analysis and predictive customer behavior. Be highly analytical and concise.', undefined, 'gpt-3.5-turbo', 1500);
      return { aiOutput: result };
    }
  }

  // ── TEMPLATE DESIGN (gpt-4o, 4096 tokens) ────────────────
  @Post('template-design')
  async templateDesign(@Body() body: { topic: string }) {
    this.logger.log('[template-design] Request received');
    try {
      const response = await fetch(this.agentServerUrl + '/api/v1/template-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`FastAPI responded with status ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.warn(`Fallback to local AI: template-design failed on python agent server: ${e.message}`);
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
  }

  // ── CUSTOM AGENT ─────────────────────────────────────────
  @Post('custom')
  async custom(@Body() body: { instruction: string; input: string }) {
    this.logger.log('[custom] Request received');
    try {
      const response = await fetch(this.agentServerUrl + '/api/v1/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`FastAPI responded with status ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.warn(`Fallback to local AI: custom failed on python agent server: ${e.message}`);
      const prompt = `Follow this custom instruction with 100% strict adherence and zero deviation: '${body.instruction}'\n\nInput Data to process: ${body.input}`;
      const result = await this.aiService.generateContent(prompt, 'You are an ultra-precise AI execution engine. Strictly follow the user custom instruction without hallucination, preamble, or deviation.', undefined, 'gpt-3.5-turbo', 1500);
      return { aiOutput: result };
    }
  }

  // ── WEBSITE BUILDER (gpt-4o, 16384 tokens) ────────────────
  @Post('website-builder')
  async websiteBuilder(@Body() body: {
    topic: string;
    pages?: string;
    primaryColor?: string;
    secondaryColor?: string;
    theme?: string;
    technology?: string;
    logoBase64?: string;
    previousHtml?: string;
    editInstruction?: string;
  }) {
    this.logger.log(`[website-builder] Request received`);
    try {
      const response = await fetch(this.agentServerUrl + '/api/v1/website-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`FastAPI responded with status ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.warn(`Fallback to local AI: website-builder failed on python agent server: ${e.message}`);
      let pageList: string[] = [];
      if (body.pages) {
        if (!isNaN(Number(body.pages.trim()))) {
          const count = Math.min(Math.max(parseInt(body.pages), 1), 10);
          pageList = ['Home', 'About Us', 'Services', 'Portfolio', 'Contact Us'];
          for (let i = 6; i <= count; i++) pageList.push(`Page ${i}`);
        } else {
          pageList = body.pages.split(',').map((p) => p.trim()).filter(Boolean);
        }
      }
      if (pageList.length === 0) pageList = ['Home', 'About Us', 'Services', 'Portfolio', 'Contact Us'];
      const pagesStr = pageList.join(', ');
      const primaryColor = body.primaryColor || '#036cd8';
      const secondaryColor = body.secondaryColor || '#6366f1';
      const theme = body.theme || 'Corporate';
      const hasLogo = !!body.logoBase64;
      let systemPrompt = '';
      let userPrompt = '';
      const technology = body.technology || 'HTML/Tailwind';

      if (body.previousHtml && body.editInstruction) {
        systemPrompt = `You are a World-Class Principal UI/UX Architect at an elite design agency (comparable to Framer, Bolt.new, or V0).
Your mission: Modify, enhance, and refine the provided HTML website based on the user's edit instruction: "${body.editInstruction}".

CRITICAL EDITING & CODING RULES (100% MANDATORY):
1. Preserve the general SPA navigation layout, the custom Event Delegation router JavaScript logic at the bottom, page section structures, colors, fonts, Tailwind configuration, CDN scripts, and the logo placeholder tag.
2. Implement the requested modification (e.g., adding sections, modifying copy, updating layout structures, or redesigning components) to look extremely premium, gorgeous, and fully complete.
3. Every single page in the navigation MUST continue to have at least 3-4 rich, well-designed content sections/divs. Never collapse pages or remove sections unless explicitly asked.
4. Output the complete updated HTML page code from <!DOCTYPE html> to </html>. Do NOT return markdown, do NOT truncate, do NOT include explanations.`;

        userPrompt = `Here is the current HTML code of the website:
${body.previousHtml}

Please modify and update it according to this instruction:
"${body.editInstruction}"

Output the complete, updated HTML page.`;
      } else {
        // Fallback brand name if empty or generic
        let resolvedBrandName = 'ApexLaunch';
        if (body.topic && body.topic.trim().length >= 3 && !["none", "null", "website", "my website"].includes(body.topic.trim().toLowerCase())) {
          resolvedBrandName = body.topic.split(/[-:|,\n]/)[0]?.trim() || 'ApexLaunch';
        }

        const resolvedLogoTag = hasLogo ? `<img src="${body.logoBase64}" alt="Logo" style="height:48px; object-fit:contain;" />` : `<span class="brand-name" style="font-size:1.5rem;font-weight:800;color:var(--primary);font-family:'Space Grotesk',sans-serif;letter-spacing:-0.5px;">${resolvedBrandName}</span>`;

        systemPrompt = `You are a World-Class Principal UI/UX Architect at an elite design agency (comparable to Framer, Bolt.new, or V0).
Your mission: Generate a spectacular, award-winning, responsive Multi-Page Single Page Application (SPA) for the brand "${resolvedBrandName}" (Full Topic/Niche: "${body.topic}") specifically built and themed around the technology stack "${technology}".

CRITICAL DESIGN SYSTEM & CODING RULES (100% MANDATORY):
1. CDN LIBRARIES (MUST BE INCLUDED IN HEAD):
   - Tailwind CSS: <script src="https://cdn.tailwindcss.com"></script>
   - Font Awesome: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
   - Google Fonts: <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
   - AOS Animations: <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet"> and <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>

2. TAILWIND CUSTOM COLOR CONFIG:
   You MUST configure Tailwind custom colors dynamically inside a script in the <head> using the user-provided colors:
   <script>
     tailwind.config = {
       theme: {
         extend: {
           fontFamily: {
             sans: ['Plus Jakarta Sans', 'sans-serif'],
             display: ['Space Grotesk', 'sans-serif'],
           },
           colors: {
             primary: {
               DEFAULT: '${primaryColor}',
               light: '${primaryColor}1a',
               dark: '${primaryColor}cc',
             },
             secondary: {
               DEFAULT: '${secondaryColor}',
               light: '${secondaryColor}1a',
               dark: '${secondaryColor}cc',
             }
           }
         }
       }
     }
   </script>

3. ELITE DESIGN SYSTEM (DARK/NEON GLOW):
   - BACKGROUND & BODY: Modern, futuristic dark mode backdrop (#030712) with neon glow spots:
     body {
       background: radial-gradient(circle at 50% -20%, ${primaryColor}1a 0%, transparent 60%), 
                   radial-gradient(circle at 10% 80%, ${secondaryColor}1a 0%, transparent 50%), 
                   #030712;
       color: #f3f4f6;
       font-family: 'Plus Jakarta Sans', sans-serif;
       min-height: 100vh;
       display: flex;
       flex-direction: column;
       margin: 0;
     }
   - GLASSMORPHISM: Define a custom utility class '.glass-card' for grids and lists:
     .glass-card {
       background: rgba(255, 255, 255, 0.02);
       backdrop-filter: blur(16px);
       -webkit-backdrop-filter: blur(16px);
       border: 1px solid rgba(255, 255, 255, 0.05);
     }
   - HERO: Glowing badge at the top, a gigantic bold display heading (text-5xl md:text-8xl font-display font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-500 leading-none), supportive paragraphs, and dual glowing interactive CTA buttons (with glowing drop-shadows).
   - FEATURES & GRIDS: Every feature card must be a glass-card with subtle hover translates, colorful circular badge icon containers, and smooth shadow hover glows.
   - SPA CLIENT ROUTING & LAYOUT:
     * Header/Navbar and Footer must remain permanently visible outside the <main> tag.
     * Navigation links must use hash anchors (href="#home", href="#services", etc.).
     * Define page transition animation in stylesheet:
       @keyframes fadeInUp {
         from { opacity: 0; transform: translateY(15px); }
         to { opacity: 1; transform: translateY(0); }
       }
       .page-section:not(.hidden) {
         animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
       }

4. BULLETPROOF EVENT-DELEGATION ROUTER SCRIPT:
   You MUST include this exact router script at the bottom of the body. It handles navigation and prevents crashes:
   <script>
     AOS.init({ duration: 800, once: true });
     function navigateToSection(hash) {
       if (!hash || hash === '#' || hash === '#/') hash = '#home';
       const targetId = hash.replace('#', '');
       const targetSection = document.getElementById(targetId);
       if (targetSection) {
         document.querySelectorAll('.page-section').forEach(sec => sec.classList.add('hidden'));
         targetSection.classList.remove('hidden');
         window.scrollTo({ top: 0, behavior: 'smooth' });
         document.querySelectorAll('nav a, footer a').forEach(link => {
           if (link.getAttribute('href') === hash) {
             link.classList.add('text-primary');
             link.classList.remove('text-gray-400');
           } else if (link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
             link.classList.remove('text-primary');
             link.classList.add('text-gray-400');
           }
         });
       }
     }
     document.addEventListener('click', function(e) {
       const link = e.target.closest('a');
       if (link) {
         const href = link.getAttribute('href');
         if (href && href.startsWith('#')) {
           e.preventDefault();
           navigateToSection(href);
           window.location.hash = href;
         }
       }
     });
     window.addEventListener('hashchange', () => navigateToSection(window.location.hash));
     navigateToSection(window.location.hash || '#home');
   </script>

5. EXTENSIVE PAGE-SPECIFIC SECTIONS (100% COMPLETED WITH 3-4 DISTINCT CONTENT DIVS EACH):
   - Every single page (Home, About Us, Services, Portfolio, Contact, etc.) MUST have at least 3-4 distinct content divs/sections. Never collapse pages or leave them brief/empty.
   - Home Page:
     1. Sticky Glassmorphic Navbar (Logo, Pages, and Glowing "Get Started" Action Button).
     2. Hero Section: Pill badge, Giant display heading, supportive text, glowing CTA buttons, and an HTML-mocked interactive dashboard panel (e.g. styled entirely with Tailwind CSS using glass stats, sidebar links, grid views, and glowing progress indicators).
     3. Trusted Clients ticker logo grid.
     4. Core Value Proposition Grid (4 columns, with custom circular colorful icon containers and hover shadow glow).
     5. Step-by-Step roadmap process flow.
     6. Testimonials Carousel / Card Grid with avatars, user review text, and star badges.
     7. Interactive FAQ Accordion List.
   - About Us Page: Brand origin story, 4 core values grid cards, interactive milestone timeline, team grid with custom card layout.
   - Services Page: Detailed list of 4-6 offerings with price list columns, checklist items, and consultation scheduling forms.
   - Portfolio Page: Project showcase grid with interactive category tabs filtering cards dynamically using JavaScript.
   - Contact Page: Double-column layout with physical details, support hours, and fully operational contact form.
   - Footer: Premium multi-column layout with descriptions, navigation quick links, newsletter sign-up, and social links.

6. LOGO: Use exactly [COMPANY_LOGO_IMAGE_TAG] for the logo image or fallback brand text.
7. CRITICAL STABILITY: You MUST write clean, highly optimized, non-repetitive HTML/Tailwind code to prevent token overflow. You MUST output a complete, fully valid HTML document from <!DOCTYPE html> to </html>. Do NOT truncate or leave anything unfinished.`;

        userPrompt = `Build an Elite, World-Class Multi-Page ${theme} Website for the brand "${resolvedBrandName}" based on topic "${body.topic}".
      
REQUIRED PAGES: ${pagesStr}
PRIMARY COLOR: ${primaryColor}
SECONDARY COLOR: ${secondaryColor}

Write real, customized premium copy. Avoid placeholders. Ensure every page contains at least 3-4 well-designed sections/divs, and ensure the code completes fully.`;
      }

      let visionImage: string | undefined = undefined;
      if (body.logoBase64) {
        const lower = body.logoBase64.toLowerCase();
        const isSupported = lower.startsWith('data:image/png') ||
                            lower.startsWith('data:image/jpeg') ||
                            lower.startsWith('data:image/jpg') ||
                            lower.startsWith('data:image/webp') ||
                            lower.startsWith('data:image/gif');
        if (isSupported) visionImage = body.logoBase64;
      }

      const raw = await this.aiService.generateContent(userPrompt, systemPrompt, undefined, 'gpt-4o', 16384 as any, visionImage as any);
      let html = raw.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      const finalBrandName = body.topic ? (body.topic.split(/[-:|,\n]/)[0]?.trim() || 'Brand') : 'Brand';
      const resolvedLogo = hasLogo ? `<img src="${body.logoBase64}" alt="Logo" style="height:48px; object-fit:contain;" />` : `<span class="brand-name" style="font-size:1.5rem;font-weight:800;color:var(--primary);font-family:'Space Grotesk',sans-serif;letter-spacing:-0.5px;">${finalBrandName}</span>`;
      html = html.replace(/<img[^>]*?\[COMPANY_LOGO_IMAGE_TAG\][^>]*?>/gi, resolvedLogo);
      html = html.replace(/<img[^>]*?src=["'](?:logo|Logo)["'][^>]*?>/gi, resolvedLogo);
      const escapedTopic = body.topic ? body.topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : 'brand';
      const escapedBrand = finalBrandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const brandImgRegex = new RegExp(`<img[^>]*?src=["'](?:${escapedTopic}|${escapedBrand})["'][^>]*?>`, 'gi');
      html = html.replace(brandImgRegex, resolvedLogo);
      html = html.replace(/\[COMPANY_LOGO_IMAGE_TAG\]/g, resolvedLogo);

      return { aiOutput: html };
    }
  }

  // ── AD COPYWRITER ────────────────────────────────────────
  @Post('ad-copy')
  async adCopy(@Body() body: { product: string; platform: string; product_url?: string }) {
    this.logger.log('[ad-copy] Request received');
    let scrapedText = '';
    if (body.product_url) {
      scrapedText = await this.scrapeUrl(body.product_url);
    }
    try {
      const response = await fetch(this.agentServerUrl + '/api/v1/ad-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, scraped_context: scrapedText }),
      });
      if (!response.ok) throw new Error(`FastAPI responded with status ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.warn(`Fallback to local AI: ad-copy failed on python agent server: ${e.message}`);
      let realContext = '';
      if (scrapedText) realContext = `\n\nREAL WEBSITE CONTEXT (Scraped from ${body.product_url}):\n${scrapedText}`;
      const prompt = `Act as an elite Direct-Response Copywriter. Write 3 high-converting ad copy variations for ${body.platform} promoting: "${body.product}".${realContext}\n\nStrictly use the PAS (Problem-Agitate-Solve) or AIDA (Attention-Interest-Desire-Action) marketing frameworks. Base all claims on the scraped context. Output must include Headline, Primary Text, and CTA for each variation.`;
      const result = await this.aiService.generateContent(prompt, 'You are an elite direct-response copywriter. Strictly mandate PAS or AIDA frameworks. Base claims ONLY on real context.', undefined, 'gpt-4o', 2000);
      return { aiOutput: result };
    }
  }

  // ── EMAIL SEQUENCE ───────────────────────────────────────
  @Post('email-sequence')
  async emailSequence(@Body() body: { product_name: string; audience: string }) {
    this.logger.log('[email-sequence] Request received');
    try {
      const response = await fetch(this.agentServerUrl + '/api/v1/email-sequence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`FastAPI responded with status ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.warn(`Fallback to local AI: email-sequence failed on python agent server: ${e.message}`);
      const prompt = `Act as a Lifecycle Marketing Master. Write a 3-part email drip sequence for "${body.product_name}" targeting "${body.audience}".\nEmail 1: The 'Soap Opera Sequence' Hook (High drama/curiosity).\nEmail 2: Value/Nurture (Overcoming objections).\nEmail 3: The Hard Sale (Scarcity and direct CTA).\nInclude high-open-rate subject lines and strictly avoid spam-trigger words.`;
      const result = await this.aiService.generateContent(prompt, 'You are a master Lifecycle Email Marketer. Mandate Soap Opera sequence structures. Optimize for deliverability and open-rates.', undefined, 'gpt-4o', 3000);
      return { aiOutput: result };
    }
  }

  // ── BLOG WRITER ──────────────────────────────────────────
  @Post('blog-writer')
  async blogWriter(@Body() body: { title: string; keywords: string }) {
    this.logger.log('[blog-writer] Request received');
    let realSeoData = '';
    try {
      const firstKeyword = body.keywords.split(',')[0]?.trim();
      if (firstKeyword) {
         const kwData = await this.semrushService.getOrganicKeywords(firstKeyword.replace(/\s+/g, ''));
         if (kwData && kwData.length > 0) {
            realSeoData = JSON.stringify(kwData.slice(0, 3));
         }
      }
    } catch (e) {
      this.logger.error('Failed to fetch Semrush data for blog writer', e);
    }
    try {
      const response = await fetch(this.agentServerUrl + '/api/v1/blog-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, seo_data: realSeoData }),
      });
      if (!response.ok) throw new Error(`FastAPI responded with status ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.warn(`Fallback to local AI: blog-writer failed on python agent server: ${e.message}`);
      let realSeoContext = '';
      if (realSeoData) realSeoContext = `\n\nREAL SEMRUSH DATA FOR KEYWORDS:\n${realSeoData}\nUse this real volume and competition data to inform your content strategy.`;
      const prompt = `Act as an EEAT (Experience, Expertise, Authoritativeness, Trustworthiness) SEO Content Strategist. Write a highly engaging blog post titled "${body.title}". Incorporate these keywords: ${body.keywords}.${realSeoContext}\n\nStrictly follow Google's EEAT guidelines. Use optimal H2/H3 hierarchy, bullet points for scannability, and LSI keyword integration. Ensure absolute factual accuracy.`;
      const result = await this.aiService.generateContent(prompt, 'You are an elite SEO Content Strategist. Strictly enforce Google EEAT guidelines, LSI keyword usage, and perfect semantic structure.', undefined, 'gpt-4o', 4000);
      return { aiOutput: result };
    }
  }

  // ── VIDEO SCRIPT ─────────────────────────────────────────
  @Post('video-script')
  async videoScript(@Body() body: { platform: string; topic: string }) {
    this.logger.log('[video-script] Request received');
    try {
      const response = await fetch(this.agentServerUrl + '/api/v1/video-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`FastAPI responded with status ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.warn(`Fallback to local AI: video-script failed on python agent server: ${e.message}`);
      const prompt = `Act as a TikTok/Reels Viral Producer. Write a highly engaging short-form video script about "${body.topic}" optimized for ${body.platform}. Include: 1. A pattern-interrupting 3-second visual hook. 2. AVD (Average View Duration) optimization pacing notes. 3. A dual-column format (Visual Actions vs. Audio/Spoken text). 4. A seamless loop or strong CTA.`;
      const result = await this.aiService.generateContent(prompt, 'You are a viral short-form video producer. Optimize strictly for algorithmic retention graphs, AVD, and pattern interruption.', undefined, 'gpt-3.5-turbo', 2000);
      return { aiOutput: result };
    }
  }

  // ── PRESS RELEASE ────────────────────────────────────────
  @Post('press-release')
  async pressRelease(@Body() body: { company: string; announcement: string; company_url?: string }) {
    this.logger.log('[press-release] Request received');
    let scrapedText = '';
    if (body.company_url) {
      scrapedText = await this.scrapeUrl(body.company_url);
    }
    try {
      const response = await fetch(this.agentServerUrl + '/api/v1/press-release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, scraped_context: scrapedText }),
      });
      if (!response.ok) throw new Error(`FastAPI responded with status ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.warn(`Fallback to local AI: press-release failed on python agent server: ${e.message}`);
      let realContext = '';
      if (scrapedText) realContext = `\n\nREAL COMPANY BACKGROUND (Scraped from ${body.company_url}):\n${scrapedText}`;
      const prompt = `Act as a Tier-1 Public Relations Director. Write a formal, media-ready press release for ${body.company} announcing: "${body.announcement}".${realContext}\n\nStrictly adhere to AP Style guidelines. Include a journalistic inverted pyramid structure, a compelling dateline, an executive quote placeholder, and a professional corporate boilerplate based strictly on the scraped context.`;
      const result = await this.aiService.generateContent(prompt, 'You are a Tier-1 PR Director. Strictly enforce AP Style, inverted pyramid structure, and media-ready formatting. Base the boilerplate ONLY on scraped context.', undefined, 'gpt-4o', 2000);
      return { aiOutput: result };
    }
  }

  // ── BRAND IDENTITY ───────────────────────────────────────
  @Post('brand-identity')
  async brandIdentity(@Body() body: { business_description: string; website_url?: string }) {
    this.logger.log('[brand-identity] Request received');
    let scrapedText = '';
    if (body.website_url) {
      scrapedText = await this.scrapeUrl(body.website_url);
    }
    try {
      const response = await fetch(this.agentServerUrl + '/api/v1/brand-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, scraped_context: scrapedText }),
      });
      if (!response.ok) throw new Error(`FastAPI responded with status ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.warn(`Fallback to local AI: brand-identity failed on python agent server: ${e.message}`);
      let realContext = '';
      if (scrapedText) realContext = `\n\nREAL WEBSITE CONTENT (Scraped from ${body.website_url}):\n${scrapedText}`;
      const prompt = `Act as a Chief Brand Officer. Based on this business description: "${body.business_description}".${realContext}\n\nGenerate an elite brand identity framework. Include: 1. Primary Jungian Brand Archetype. 2. Tone-of-Voice Matrix (Do's and Don'ts). 3. A 10-word Mission Statement. 4. A 10-word Vision Statement. 5. Deep Psychographic profiling of the ideal customer. Base all factual essence on the scraped data.`;
      const result = await this.aiService.generateContent(prompt, 'You are an elite Chief Brand Officer. Use advanced branding psychology (Jungian archetypes, psychographics). Rely on real scraped data.', undefined, 'gpt-4o', 3000);
      return { aiOutput: result };
    }
  }

  // ── SEO OPTIMIZATION AGENT ────────────────────────────────
  @Post('seo-opt')
  async seoOpt(@Body() body: { website_url: string; keywords?: string; framework: string; focus_area: string }) {
    this.logger.log('[seo-opt] Request received');
    try {
      const response = await fetch(this.agentServerUrl + '/api/v1/seo-opt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`FastAPI responded with status ${response.status}`);
      return await response.json();
    } catch (e: any) {
      this.logger.warn(`Fallback to local AI: seo-opt failed on python agent server: ${e.message}`);
      let contentContext = '';
      if (body.website_url) {
        contentContext = await this.scrapeUrl(body.website_url);
      }
      
      const prompt = `Act as an Elite Technical SEO Specialist.
We need to optimize a website built using the "${body.framework}" framework.
Website URL: ${body.website_url}
Optimization Focus: ${body.focus_area}
Target Keywords: ${body.keywords || 'None specified'}

Scraped Website Content Context:
"""
${contentContext}
"""

Please generate a detailed, structured SEO optimization report and concrete code snippets or layout plans that the client can apply. 
Provide step-by-step action items tailored to the "${body.framework}" technology stack.
For example:
- If Next.js, show metadata exports or layout adjustments.
- If React, show Helmet tags and dynamic head updates.
- If Node.js, show dynamic route variable settings and caching/SSR recommendations.
- If Technical/Speed focus, give asset optimization code and caching guidelines.
Keep the output extremely professional, using clean markdown with clear action points.`;

      const result = await this.aiService.generateContent(prompt, 'You are an Elite Technical SEO Specialist. Deliver actionable, technically accurate code blocks and instructions. Avoid high-level generic advice.', undefined, 'gpt-4o-mini', 2500);
      return { aiOutput: result };
    }
  }

  // ── AUTO-SUGGEST KEYWORDS AGENT ───────────────────────────
  @Post('suggest-keywords')
  async suggestKeywords(@Body() body: { website_url: string }) {
    this.logger.log('[suggest-keywords] Request received');
    try {
      let contentContext = '';
      if (body.website_url) {
        contentContext = await this.scrapeUrl(body.website_url);
      }
      
      const prompt = `Act as an Elite SEO Keyword Researcher.
We have a website at: ${body.website_url}

Scraped Website Content Context:
"""
${contentContext}
"""

Please identify and suggest exactly 10 highly relevant, commercial, and high-intent SEO keywords that perfectly represent this website's core business or product.
Return ONLY a comma-separated list of the 10 keywords. Do NOT include numbering, bullet points, introductory text, markdown styling, or trailing text. 
Example output structure:
digital marketing software, automated advertising platform, seo crawler tool, ad optimizer, PPC automation`;

      const result = await this.aiService.generateContent(prompt, 'You are an Elite SEO Keyword Researcher. Output ONLY a comma-separated list of the 10 best keywords.', undefined, 'gpt-4o-mini', 200);
      return { keywords: result.trim().replace(/^`+|`+$/g, '').trim() };
    } catch (e: any) {
      this.logger.error('Failed to suggest keywords', e);
      return { keywords: 'marketing, advertising, seo optimization' };
    }
  }
}
