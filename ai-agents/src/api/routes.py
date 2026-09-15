from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from src.models.campaign import CampaignGoal, CampaignPlan
from src.core.state import OrchestratorState
from src.core.workflow import creation_workflow, optimization_workflow
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
import os

router = APIRouter()

# Input Models
class ReviewGenRequest(BaseModel):
    customer_name: str
    product: str

class ReviewResponseRequest(BaseModel):
    star_rating: str
    review_text: str

class SocialPubRequest(BaseModel):
    topic: str

class SocialEngageRequest(BaseModel):
    brand_tone: str
    user_comment: str

class ReportingRequest(BaseModel):
    metrics: str

class ListingsOptRequest(BaseModel):
    business_name: str
    keywords: str

class LeadGenRequest(BaseModel):
    industry: str
    region: str

class SegmentationRequest(BaseModel):
    customer_data: str

class TemplateDesignRequest(BaseModel):
    topic: str

class CustomRequest(BaseModel):
    instruction: str
    input: str

class WebsiteBuilderRequest(BaseModel):
    topic: str
    pages: Optional[str] = None
    primaryColor: Optional[str] = None
    secondaryColor: Optional[str] = None
    theme: Optional[str] = None
    technology: Optional[str] = None
    logoBase64: Optional[str] = None
    previousHtml: Optional[str] = None
    editInstruction: Optional[str] = None

# Helper function to get OpenAI LLM
def get_llm(model: str = "gpt-4o-mini", max_tokens: int = 1500, temperature: float = 0.7):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured in the environment.")
    return ChatOpenAI(model=model, temperature=temperature, max_tokens=max_tokens, openai_api_key=api_key)


@router.post("/create-campaign", response_model=OrchestratorState)
async def create_campaign(goal: CampaignGoal):
    """
    Endpoint for creating and publishing a brand new campaign.
    Triggered when the user submits their budget, URL, and objective on the frontend.
    """
    initial_state = OrchestratorState(
        client_goal=goal,
        plan=CampaignPlan(),
        brand_context="",
        competitor_data="",
        compliance_status="pending",
        ad_status="pending",
        actions_taken=[],
        client_report="",
        current_step="init",
        errors=[],
        messages=["Starting Campaign Creation Workflow..."],
        execution_results={},
        insights=[],
        anomalies=[],
        budget_shifts=[],
        reviews_generated=0,
        review_responses=[],
        social_posts_scheduled=0,
        social_engagements=[],
        listings_updated=0,
        leads_generated=0,
        crm_segments_updated=0,
        templates_created=0,
        custom_tasks_run=0
    )
    
    try:
        # Run the creation workflow (Research -> Execution)
        final_state = creation_workflow.invoke(initial_state)
        return final_state
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Creation Workflow failed: {str(e)}")


class OptimizeCampaignRequest(BaseModel):
    plan: CampaignPlan
    goal: Optional[CampaignGoal] = None

@router.post("/optimize-campaign", response_model=OrchestratorState)
async def optimize_campaign(body: OptimizeCampaignRequest):
    """
    Endpoint for optimizing an already live campaign.
    Triggered by a cron job in the NestJS backend (e.g. daily/hourly).
    Accepts real goal data from live campaign context.
    """
    # Use provided goal or construct from plan data if not provided
    existing_goal = body.goal or CampaignGoal(
        objective="Optimize existing live campaign performance",
        budget=getattr(body.plan, "allocations", [{}])[0].budget_allocation if getattr(body.plan, "allocations", []) else 1000,
        industry=getattr(body.plan, "industry", "Digital Marketing"),
        target_audience=getattr(body.plan, "target_audience", "Existing customers"),
        target_country="IN"
    )

    initial_state = OrchestratorState(
        client_goal=existing_goal,
        plan=body.plan,
        brand_context=getattr(body.plan, "brand_context", ""),
        competitor_data="",
        compliance_status="approved",  # Already live — skip compliance re-check
        ad_status="pending",
        actions_taken=[],
        client_report="",
        current_step="init",
        errors=[],
        messages=["Starting Campaign Optimization Workflow..."],
        execution_results={},
        insights=[],
        anomalies=[],
        budget_shifts=[],
        reviews_generated=0,
        review_responses=[],
        social_posts_scheduled=0,
        social_engagements=[],
        listings_updated=0,
        leads_generated=0,
        crm_segments_updated=0,
        templates_created=0,
        custom_tasks_run=0
    )

    try:
        final_state = optimization_workflow.invoke(initial_state)
        return final_state
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization Workflow failed: {str(e)}")


@router.post("/review-gen")
async def review_gen(body: ReviewGenRequest):
    try:
        llm = get_llm(model="gpt-4o-mini", max_tokens=1500, temperature=0.7)
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an Elite Customer Success Manager. Prioritize customer psychology, conversion rate optimization, and absolute brevity. Do not include placeholder text."),
            ("human", "Act as an Elite Customer Success Manager. Draft a psychology-backed, highly-persuasive review request email for customer {customer_name} who recently purchased {product}. The email must be brief, reduce friction, and use the 'foot-in-the-door' psychological technique to maximize conversion.")
        ])
        chain = prompt | llm
        res = await chain.ainvoke({"customer_name": body.customer_name, "product": body.product})
        return {"aiOutput": res.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/review-response")
async def review_response(body: ReviewResponseRequest):
    try:
        llm = get_llm(model="gpt-4o-mini", max_tokens=1500, temperature=0.7)
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a Senior Crisis Management & CX Specialist. Adhere strictly to the HEART framework for negative reviews and brand amplification for positive ones."),
            ("human", "Act as a Senior Crisis Management & CX Specialist. Draft a professional response to this {star_rating}-star customer review: \"{review_text}\". If 1-3 stars, use the 'HEART' framework (Hear, Empathize, Apologize, Resolve, Diagnose) to de-escalate without admitting legal fault. If 4-5 stars, amplify the positive sentiment and softly encourage repeat business.")
        ])
        chain = prompt | llm
        res = await chain.ainvoke({"star_rating": body.star_rating, "review_text": body.review_text})
        return {"aiOutput": res.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/social-pub")
async def social_pub(body: SocialPubRequest):
    try:
        llm = get_llm(model="gpt-4o-mini", max_tokens=2000, temperature=0.7)
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a Viral Social Media Strategist. Strictly differentiate between platform algorithms (LinkedIn vs Twitter). Optimize for dwell time and CTR."),
            ("human", "Act as a Viral Social Media Strategist. Create a high-converting post for the following topic: '{topic}'. Provide two distinct variations:\n1. LinkedIn (focus on professional storytelling, thought leadership, and formatting with line breaks).\n2. Twitter/X (focus on punchy hooks, thread-style formatting, and brevity).\nInclude optimal emojis and highly-researched hashtags.")
        ])
        chain = prompt | llm
        res = await chain.ainvoke({"topic": body.topic})
        return {"aiOutput": res.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/social-engage")
async def social_engage(body: SocialEngageRequest):
    try:
        llm = get_llm(model="gpt-4o-mini", max_tokens=1500, temperature=0.6)
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an elite Brand Reputation Manager. Maintain absolute strictness to the specified brand tone. Do not sound robotic."),
            ("human", "Act as a Brand Reputation Manager. Draft a reply to the following social media user comment. You MUST strictly adhere to a '{brand_tone}' brand tone. Comment: \"{user_comment}\". De-escalate if negative, build community if positive.")
        ])
        chain = prompt | llm
        res = await chain.ainvoke({"brand_tone": body.brand_tone, "user_comment": body.user_comment})
        return {"aiOutput": res.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reporting")
async def reporting(body: ReportingRequest):
    try:
        llm = get_llm(model="gpt-4o-mini", max_tokens=3000, temperature=0.6)
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a World-Class Fractional CMO & Senior Growth Marketing Consultant. Generate comprehensive, data-driven, and highly actionable Marketing Performance Reports. Use bold headings, bullet points, and markdown tables for maximum impact."),
            ("human", """Act as our Fractional Chief Marketing Officer (CMO). Analyze the following rich marketing performance datasets, which include overall paid ads metrics, detailed platform breakdowns (Meta, Google, LinkedIn, Twitter/X), brand profile context, and organic search SEO metrics:

{metrics}

Generate a comprehensive executive-level Digital Marketing Report in Markdown. Address the following areas explicitly:

1. **Executive Strategy & Brand Alignment**: Review the brand positioning, description, tone, target audience, and key value proposition. Assess how the overall digital presence aligns with this identity and audience behavior.
2. **Paid Media Performance (Ads Platforms Breakdown)**: Differentiate and compare the performance across active platforms (Facebook/Meta, Google Ads, LinkedIn, Twitter/X). Analyze CTR, CPC, Spend, and Conversions. Detail which platform yields the best return and which needs budget re-allocation.
3. **Organic Visibility & Technical SEO Analysis**: Evaluate site load speed, domain authority, organic traffic volume, and search console indexing. Provide feedback on meta titles/descriptions, and outline strategy to target the ranking keywords.
4. **Strategic Pivots & Blended CAC Optimization**: Detail concrete recommendations to decrease blended CAC (Customer Acquisition Cost), improve conversions, and optimize next month's ad budget split.

Deliver the output with deep insights, specific recommendations, and executive-level clarity. Do not omit any datasets.""")
        ])
        chain = prompt | llm
        res = await chain.ainvoke({"metrics": body.metrics})
        return {"aiOutput": res.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/listings-opt")
async def listings_opt(body: ListingsOptRequest):
    try:
        llm = get_llm(model="gpt-4o-mini", max_tokens=1500, temperature=0.6)
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an elite Local SEO Architect. Follow strict Google Business Profile guidelines. Maximize local keyword density naturally."),
            ("human", "Act as a Local SEO Architect. Write an optimized Google Business Profile (GBP) description for the business '{business_name}'. Strategically implement these keywords via Latent Semantic Indexing (LSI) without keyword stuffing: {keywords}. Optimize for local map pack rankings and high CTR.")
        ])
        chain = prompt | llm
        res = await chain.ainvoke({"business_name": body.business_name, "keywords": body.keywords})
        return {"aiOutput": res.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/lead-gen")
async def lead_gen(body: LeadGenRequest):
    try:
        llm = get_llm(model="gpt-4o", max_tokens=2000, temperature=0.7)
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a strict, data-driven Growth Hacker. Provide only real, actionable methodologies, precise Boolean search queries, and verifiable platforms. Zero hallucination."),
            ("human", "Act as a B2B/B2C Growth Hacker. Formulate a highly accurate, real-world lead generation strategy for the industry '{industry}' in the region '{region}'. Mandate real-world tactics (e.g., Boolean search strings, specific local databases, scraping methodologies) instead of generic advice. DO NOT hallucinate fake names.")
        ])
        chain = prompt | llm
        res = await chain.ainvoke({"industry": body.industry, "region": body.region})
        return {"aiOutput": res.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/segmentation")
async def segmentation(body: SegmentationRequest):
    try:
        llm = get_llm(model="gpt-4o-mini", max_tokens=1500, temperature=0.5)
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a Senior Data Scientist specializing in RFM analysis and predictive customer behavior. Be highly analytical and concise."),
            ("human", "Act as a Senior Data Scientist. Analyze this customer interaction footprint: {customer_data}. Perform an RFM (Recency, Frequency, Monetary) analysis categorization. Predict potential churn behavior and recommend exactly 2 LTV (Life-Time Value) optimization strategies specifically tailored to this segment's psychology.")
        ])
        chain = prompt | llm
        res = await chain.ainvoke({"customer_data": body.customer_data})
        return {"aiOutput": res.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/template-design")
async def template_design(body: TemplateDesignRequest):
    try:
        llm = get_llm(model="gpt-4o", max_tokens=4096, temperature=0.7)
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an elite UI/UX Designer. Output ONLY raw HTML. Zero markdown, zero backticks."),
            ("human", "You are an elite Senior UI/UX Designer and Web Developer.\nCreate a COMPLETE, FULLY-DESIGNED, and production-ready single-page website/template for the topic/title: \"{topic}\".\n\nCRITICAL REQUIREMENTS:\n1. OUTPUT FORMAT: Output ONLY raw HTML code starting with <!DOCTYPE html>. ZERO markdown, ZERO backticks.\n2. CSS: Include comprehensive <style> tags with advanced modern CSS (animations, flexbox/grid, CSS gradients, hover effects, beautiful typography).\n3. JAVASCRIPT: Include <script> tags for basic interactions if relevant.\n4. STRUCTURE: Include Header/Navbar, Hero Section with CTA, Main Content/Features, and Footer.\n5. The design MUST be stunning, premium, and fully responsive across mobile and desktop.")
        ])
        chain = prompt | llm
        res = await chain.ainvoke({"topic": body.topic})
        result_text = res.content
        clean_html = result_text.replace("```html", "").replace("```", "").strip()
        return {"aiOutput": clean_html}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/custom")
async def custom(body: CustomRequest):
    try:
        llm = get_llm(model="gpt-3.5-turbo", max_tokens=1500, temperature=0.7)
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an ultra-precise AI execution engine. Strictly follow the user custom instruction without hallucination, preamble, or deviation."),
            ("human", "Follow this custom instruction with 100% strict adherence and zero deviation: '{instruction}'\n\nInput Data to process: {input}")
        ])
        chain = prompt | llm
        res = await chain.ainvoke({"instruction": body.instruction, "input": body.input})
        return {"aiOutput": res.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/website-builder")
async def website_builder(body: WebsiteBuilderRequest):
    try:
        llm = get_llm(model="gpt-4o", max_tokens=16384, temperature=0.7)
        
        # Parse pages
        page_list = []
        if body.pages:
            pages_trimmed = body.pages.strip()
            if pages_trimmed.isdigit():
                count = min(max(int(pages_trimmed), 1), 10)
                page_list = ['Home', 'About Us', 'Services', 'Portfolio', 'Contact Us']
                for i in range(6, count + 1):
                    page_list.append(f"Page {i}")
            else:
                page_list = [p.strip() for p in pages_trimmed.split(",") if p.strip()]
        
        if not page_list:
            page_list = ['Home', 'About Us', 'Services', 'Portfolio', 'Contact Us']
            
        pages_str = ", ".join(page_list)
        primary_color = body.primaryColor or '#036cd8'
        secondary_color = body.secondaryColor or '#6366f1'
        theme = body.theme or 'Corporate'
        technology = body.technology or 'HTML/Tailwind'
        has_logo = bool(body.logoBase64)

        primary_light = f"{primary_color}20"
        primary_dark = f"{primary_color}dd"
        secondary_light = f"{secondary_color}20"
        secondary_dark = f"{secondary_color}dd"

        if body.previousHtml and body.editInstruction:
            system_prompt = f"""You are a World-Class Principal UI/UX Architect at an elite design agency (comparable to Framer, Bolt.new, or V0).
Your mission: Modify, enhance, and refine the provided HTML website based on the user's edit instruction: "{body.editInstruction}".

CRITICAL EDITING & CODING RULES (100% MANDATORY):
1. Preserve the general SPA navigation layout, the custom Event Delegation router JavaScript logic at the bottom, page section structures, colors, fonts, Tailwind configuration, CDN scripts, and the logo placeholder tag.
2. Implement the requested modification (e.g., adding sections, modifying copy, updating layout structures, or redesigning components) to look extremely premium, gorgeous, and fully complete.
3. Every single page in the navigation MUST continue to have at least 3-4 rich, well-designed content sections/divs. Never collapse pages or remove sections unless explicitly asked.
4. Output the complete updated HTML page code from <!DOCTYPE html> to </html>. Do NOT return markdown, do NOT truncate, do NOT include explanations. Write clean, optimized Tailwind markup without verbose repetition so the file fits within the token output budget."""

            user_prompt = f"""Here is the current HTML code of the website:
{body.previousHtml}

Please modify and update it according to this instruction:
"{body.editInstruction}"

Output the complete, updated HTML page."""

        else:
            # Fallback brand name if empty or generic
            if not body.topic or len(body.topic.strip()) < 3 or body.topic.strip().lower() in ["none", "null", "website", "my website"]:
                brand_name = "ApexLaunch"
            else:
                brand_name = body.topic.split("-")[0].split(":")[0].split("|")[0].split(",")[0].strip() or "ApexLaunch"

            # Re-generate logo tag if brand_name changes
            logo_tag = f'<img src="{body.logoBase64}" alt="Logo" style="height:48px; object-fit:contain;" />' if has_logo else f'<span class="brand-name" style="font-size:1.5rem;font-weight:800;color:var(--primary);font-family:\'Space Grotesk\',sans-serif;letter-spacing:-0.5px;">{brand_name}</span>'

            system_prompt = f"""You are a World-Class Principal UI/UX Architect at an elite design agency (comparable to Framer, Bolt.new, or V0).
Your mission: Generate a spectacular, award-winning, responsive Multi-Page Single Page Application (SPA) for the brand "{brand_name}" (Full Topic/Niche: "{body.topic}") specifically built and themed around the technology stack "{technology}".

CRITICAL DESIGN SYSTEM & CODING RULES (100% MANDATORY):
1. CDN LIBRARIES (MUST BE INCLUDED IN HEAD):
   - Tailwind CSS: <script src="https://cdn.tailwindcss.com"></script>
   - Font Awesome: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
   - Google Fonts: <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
   - AOS Animations: <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet"> and <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>

2. TAILWIND CUSTOM COLOR CONFIG:
   You MUST configure Tailwind custom colors dynamically inside a script in the <head> using the user-provided colors:
   <script>
     tailwind.config = {{
       theme: {{
         extend: {{
           fontFamily: {{
             sans: ['Plus Jakarta Sans', 'sans-serif'],
             display: ['Space Grotesk', 'sans-serif'],
           }},
           colors: {{
             primary: {{
               DEFAULT: '{primary_color}',
               light: '{primary_color}1a',
               dark: '{primary_color}cc',
             }},
             secondary: {{
               DEFAULT: '{secondary_color}',
               light: '{secondary_color}1a',
               dark: '{secondary_color}cc',
             }}
           }}
         }}
       }}
     }}
   </script>

3. ELITE DESIGN SYSTEM (DARK/NEON GLOW):
   - BACKGROUND & BODY: Modern, futuristic dark mode backdrop (#030712) with neon glow spots:
     body {{
       background: radial-gradient(circle at 50% -20%, {primary_color}1a 0%, transparent 60%), 
                   radial-gradient(circle at 10% 80%, {secondary_color}1a 0%, transparent 50%), 
                   #030712;
       color: #f3f4f6;
       font-family: 'Plus Jakarta Sans', sans-serif;
       min-height: 100vh;
       display: flex;
       flex-direction: column;
       margin: 0;
     }}
   - GLASSMORPHISM: Define a custom utility class '.glass-card' for grids and lists:
     .glass-card {{
       background: rgba(255, 255, 255, 0.02);
       backdrop-filter: blur(16px);
       -webkit-backdrop-filter: blur(16px);
       border: 1px solid rgba(255, 255, 255, 0.05);
     }}
   - HERO: Glowing badge at the top, a gigantic bold display heading (text-5xl md:text-8xl font-display font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-500 leading-none), supportive paragraphs, and dual glowing interactive CTA buttons (with glowing drop-shadows).
   - FEATURES & GRIDS: Every feature card must be a glass-card with subtle hover translates, colorful circular badge icon containers, and smooth shadow hover glows.
   - SPA CLIENT ROUTING & LAYOUT:
     * Header/Navbar and Footer must remain permanently visible outside the <main> tag.
     * Navigation links must use hash anchors (href="#home", href="#services", etc.).
     * Define page transition animation in stylesheet:
       @keyframes fadeInUp {{
         from {{ opacity: 0; transform: translateY(15px); }}
         to {{ opacity: 1; transform: translateY(0); }}
       }}
       .page-section:not(.hidden) {{
         animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
       }}

4. BULLETPROOF EVENT-DELEGATION ROUTER SCRIPT:
   You MUST include this exact router script at the bottom of the body. It handles navigation and prevents crashes:
   <script>
     AOS.init({{ duration: 800, once: true }});
     function navigateToSection(hash) {{
       if (!hash || hash === '#' || hash === '#/') hash = '#home';
       const targetId = hash.replace('#', '');
       const targetSection = document.getElementById(targetId);
       if (targetSection) {{
         document.querySelectorAll('.page-section').forEach(sec => sec.classList.add('hidden'));
         targetSection.classList.remove('hidden');
         window.scrollTo({{ top: 0, behavior: 'smooth' }});
         document.querySelectorAll('nav a, footer a').forEach(link => {{
           if (link.getAttribute('href') === hash) {{
             link.classList.add('text-primary');
             link.classList.remove('text-gray-400');
           }} else if (link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {{
             link.classList.remove('text-primary');
             link.classList.add('text-gray-400');
           }}
         }});
       }}
     }}
     document.addEventListener('click', function(e) {{
       const link = e.target.closest('a');
       if (link) {{
         const href = link.getAttribute('href');
         if (href && href.startsWith('#')) {{
           e.preventDefault();
           navigateToSection(href);
           window.location.hash = href;
         }}
       }}
     }});
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

6. LOGO: Use exactly {logo_tag} for the logo image or fallback brand text.
7. CRITICAL STABILITY: You MUST write clean, highly optimized, non-repetitive HTML/Tailwind code to prevent token overflow. You MUST output a complete, fully valid HTML document from <!DOCTYPE html> to </html>. Do NOT truncate or leave anything unfinished."""

            user_prompt = f"""Build an Elite, World-Class Multi-Page {theme} Website for the brand "{brand_name}" based on topic "{body.topic}".
      
REQUIRED PAGES: {pages_str}
PRIMARY COLOR: {primary_color}
SECONDARY COLOR: {secondary_color}

Write real, customized premium copy. Avoid placeholders. Ensure every page contains at least 3-4 well-designed sections/divs, and ensure the code completes fully."""

        res = await llm.ainvoke([
            ("system", system_prompt),
            ("human", user_prompt)
        ])
        result_text = res.content
        clean_html = result_text.replace("```html", "").replace("```", "").strip()
        return {"aiOutput": clean_html}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Models for other content generators
class AdCopyRequest(BaseModel):
    product: str
    platform: str
    product_url: Optional[str] = None
    scraped_context: Optional[str] = None

class EmailSequenceRequest(BaseModel):
    product_name: str
    audience: str

class BlogWriterRequest(BaseModel):
    title: str
    keywords: str
    seo_data: Optional[str] = None

class VideoScriptRequest(BaseModel):
    platform: str
    topic: str

class PressReleaseRequest(BaseModel):
    company: str
    announcement: str
    company_url: Optional[str] = None
    scraped_context: Optional[str] = None

class BrandIdentityRequest(BaseModel):
    business_description: str
    website_url: Optional[str] = None
    scraped_context: Optional[str] = None


@router.post("/ad-copy")
async def ad_copy(body: AdCopyRequest):
    try:
        real_context = ""
        if body.scraped_context:
            real_context = f"\n\nREAL WEBSITE CONTENT (Scraped from {body.product_url or 'site'}):\n{body.scraped_context}"
        
        prompt = f"Act as an elite Direct-Response Copywriter. Write 3 high-converting ad copy variations for {body.platform} promoting: \"{body.product}\".{real_context}\n\nStrictly use the PAS (Problem-Agitate-Solve) or AIDA (Attention-Interest-Desire-Action) marketing frameworks. Base all claims on the scraped context. Output must include Headline, Primary Text, and CTA for each variation."
        
        llm = get_llm(model="gpt-4o", max_tokens=2000, temperature=0.7)
        res = await llm.ainvoke(prompt)
        return {"aiOutput": res.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/email-sequence")
async def email_sequence(body: EmailSequenceRequest):
    try:
        prompt = f"Act as a Lifecycle Marketing Master. Write a 3-part email drip sequence for \"{body.product_name}\" targeting \"{body.audience}\".\nEmail 1: The 'Soap Opera Sequence' Hook (High drama/curiosity).\nEmail 2: Value/Nurture (Overcoming objections).\nEmail 3: The Hard Sale (Scarcity and direct CTA).\nInclude high-open-rate subject lines and strictly avoid spam-trigger words."
        
        llm = get_llm(model="gpt-4o", max_tokens=3000, temperature=0.7)
        res = await llm.ainvoke(prompt)
        return {"aiOutput": res.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/blog-writer")
async def blog_writer(body: BlogWriterRequest):
    try:
        real_seo_data = ""
        if body.seo_data:
            real_seo_data = f"\n\nREAL SEMRUSH DATA FOR KEYWORDS:\n{body.seo_data}\nUse this real volume and competition data to inform your content strategy."
            
        prompt = f"Act as an EEAT (Experience, Expertise, Authoritativeness, Trustworthiness) SEO Content Strategist. Write a highly engaging blog post titled \"{body.title}\". Incorporate these keywords: {body.keywords}.{real_seo_data}\n\nStrictly follow Google's EEAT guidelines. Use optimal H2/H3 hierarchy, bullet points for scannability, and LSI keyword integration. Ensure absolute factual accuracy."
        
        llm = get_llm(model="gpt-4o", max_tokens=4000, temperature=0.7)
        res = await llm.ainvoke(prompt)
        return {"aiOutput": res.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/video-script")
async def video_script(body: VideoScriptRequest):
    try:
        prompt = f"Act as a TikTok/Reels Viral Producer. Write a highly engaging short-form video script about \"{body.topic}\" optimized for {body.platform}. Include: 1. A pattern-interrupting 3-second visual hook. 2. AVD (Average View Duration) optimization pacing notes. 3. A dual-column format (Visual Actions vs. Audio/Spoken text). 4. A seamless loop or strong CTA."
        
        llm = get_llm(model="gpt-3.5-turbo", max_tokens=2000, temperature=0.7)
        res = await llm.ainvoke(prompt)
        return {"aiOutput": res.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/press-release")
async def press_release(body: PressReleaseRequest):
    try:
        real_context = ""
        if body.scraped_context:
            real_context = f"\n\nREAL COMPANY BACKGROUND (Scraped from {body.company_url or 'site'}):\n{body.scraped_context}"
            
        prompt = f"Act as a Tier-1 Public Relations Director. Write a formal, media-ready press release for {body.company} announcing: \"{body.announcement}\".{real_context}\n\nStrictly adhere to AP Style guidelines. Include a journalistic inverted pyramid structure, a compelling dateline, an executive quote placeholder, and a professional corporate boilerplate based strictly on the scraped context."
        
        llm = get_llm(model="gpt-4o", max_tokens=2000, temperature=0.7)
        res = await llm.ainvoke(prompt)
        return {"aiOutput": res.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/brand-identity")
async def brand_identity(body: BrandIdentityRequest):
    try:
        real_context = ""
        if body.scraped_context:
            real_context = f"\n\nREAL WEBSITE CONTENT (Scraped from {body.website_url or 'site'}):\n{body.scraped_context}"
            
        prompt = f"Act as a Chief Brand Officer. Based on this business description: \"{body.business_description}\".{real_context}\n\nGenerate an elite brand identity framework. Include: 1. Primary Jungian Brand Archetype. 2. Tone-of-Voice Matrix (Do's and Don'ts). 3. A 10-word Mission Statement. 4. A 10-word Vision Statement. 5. Deep Psychographic profiling of the ideal customer. Base all factual essence on the scraped data."
        
        llm = get_llm(model="gpt-4o", max_tokens=3000, temperature=0.7)
        res = await llm.ainvoke(prompt)
        return {"aiOutput": res.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class SeoOptRequest(BaseModel):
    website_url: str
    keywords: Optional[str] = ""
    framework: str
    focus_area: str


@router.post("/seo-opt")
async def seo_opt(body: SeoOptRequest):
    try:
        prompt = f"""Act as an Elite Technical SEO Specialist.
We need to optimize a website built using the "{body.framework}" framework.
Website URL: {body.website_url}
Optimization Focus: {body.focus_area}
Target Keywords: {body.keywords or 'None specified'}

Please generate a detailed, structured SEO optimization report and concrete code snippets or layout plans that the client can apply. 
Provide step-by-step action items tailored to the "{body.framework}" technology stack.
For example:
- If Next.js, show metadata exports or layout adjustments.
- If React, show Helmet & dynamic head component configurations.
- If Node.js, show routing variables mapping or templating templates.
- If Technical/Speed focus, give asset compression, caching, and server-side optimizations.
Keep the output extremely professional, using clean markdown with clear action points.
"""
        llm = get_llm(model="gpt-4o", max_tokens=2500, temperature=0.7)
        res = await llm.ainvoke(prompt)
        return {"aiOutput": res.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class OptimizeDraftRequest(BaseModel):
    platform: str
    headline: str
    primaryText: str
    googleKeywords: Optional[List[str]] = None
    liJobTitles: Optional[List[str]] = None
    liSeniority: Optional[List[str]] = None
    liCompanySize: Optional[List[str]] = None
    brandName: Optional[str] = None
    brandDescription: Optional[str] = None


@router.post("/optimize-draft")
async def optimize_draft(body: OptimizeDraftRequest):
    try:
        context = (
            f"Platform: {body.platform}\n"
            f"Brand Name: {body.brandName or 'General'}\n"
            f"Brand Description: {body.brandDescription or 'No description'}\n"
            f"Current Headline: {body.headline}\n"
            f"Current Primary Text: {body.primaryText}\n"
        )
        if body.googleKeywords:
            context += f"Current Keywords: {', '.join(body.googleKeywords)}\n"
        if body.liJobTitles:
            context += f"Current Target Job Titles: {', '.join(body.liJobTitles)}\n"

        prompt = (
            f"You are a conversion rate optimization (CRO) and direct-response ad copywriting specialist.\n"
            f"Your task is to analyze the brand benefits, features, and target audience, and generate an extremely high-converting optimization draft.\n\n"
            f"Optimization Guidelines:\n"
            f"1. Benefit-Driven Hooks: Identify the core value propositions and specific user benefits from the brand description. Structure the ad copy (headline & primaryText) to lead with a benefit-driven hook (e.g., save money, reduce time, increase revenue).\n"
            f"2. Copywriting Frameworks:\n"
            f"   - For Google Search: The headline must be extremely punchy, benefits-focused, and strictly under 30 characters. The description/primaryText must act as a clear value proposition call-to-action under 90 characters.\n"
            f"   - For Meta/LinkedIn/Other: Use AIDA (Attention, Interest, Desire, Action) or PAS (Problem, Agitate, Solve) frameworks. The headline should capture immediate attention, and the primaryText should agitate the pain point and resolve it with the brand's key benefits.\n"
            f"3. High-Intent Targeting:\n"
            f"   - For Google Search: Generate 5-8 high-intent commercial keywords matching these benefits.\n"
            f"   - For LinkedIn: Select job titles, seniorities, and company sizes of the exact decision-makers who care about these specific benefits.\n\n"
            f"Context:\n{context}\n\n"
            f"Return ONLY a raw valid JSON object (no markdown, no ```json formatting, no other text) structured like this:\n"
            f"{{\n"
            f'  "headline": "punchy benefit-driven headline",\n'
            f'  "primaryText": "compelling, conversion-focused primary text copy",\n'
            f'  "adCopy": {{\n'
            f'    "headlines": ["Headline Option 1 (Benefit-focused)", "Headline Option 2 (Social Proof/Urgency)", "Headline Option 3 (Question/Agitate)", "Headline Option 4", "Headline Option 5"],\n'
            f'    "primaryTexts": ["Primary Text Variant 1 (AIDA)", "Primary Text Variant 2 (PAS)", "Primary Text Variant 3 (Bulleted Value Prop)"]\n'
            f'  }},\n'
            f'  "googleKeywords": ["keyword1", "keyword2", ...] (only if platform is google),\n'
            f'  "liJobTitles": ["job title 1", "job title 2", ...] (only if platform is linkedin),\n'
            f'  "liSeniority": ["Senior", "Director", ...] (only if platform is linkedin),\n'
            f'  "liCompanySize": ["11-50", "51-200", ...] (only if platform is linkedin),\n'
            f'  "explanation": "Detailed explanation of which brand benefit was targeted for this optimization and why."\n'
            f"}}"
        )

        llm = get_llm(model="gpt-4o", max_tokens=1500, temperature=0.6)
        res = await llm.ainvoke(prompt)
        
        import json
        raw_content = res.content.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(raw_content)
        return {"success": True, "optimized": parsed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class DiscoverBrandRequest(BaseModel):
    brandName: str
    website: str
    industryHint: Optional[str] = "General Business"
    scrapedTitle: Optional[str] = ""
    scrapedMetaDesc: Optional[str] = ""
    scrapedContent: Optional[str] = ""


@router.post("/discover-brand")
async def discover_brand(body: DiscoverBrandRequest):
    try:
        prompt = f"""
You are a senior digital marketing strategist, SEO auditor, competitive intelligence analyst, and web research expert.

Your task is to perform a COMPLETE brand intelligence analysis using REAL VERIFIED DATA from the scraped webpage content below.

IMPORTANT RULES:
1. ALWAYS base your analysis on the actual scraped text content of the website.
2. DO NOT generate generic, placeholder, or static keywords.
3. Keywords MUST be STRONG, highly converting, commercial intent keywords with high search volume. They must be unique, highly specific to the business's actual offerings, and contain NO duplicates.
4. Ensure primary, secondary, and long-tail keywords are distinct, highly optimized for Google/Meta Ads, and represent real search queries matching the services/products described.
5. If the website text is poor or thin, deduce logical, powerful keywords matching their stated business model and location.
6. Extract data from the provided scraped title, description, and page text.
7. Return ONLY VALID JSON.
8. DO NOT include markdown.
9. DO NOT explain anything.
10. You MUST generate at least 20 highly relevant keywords, distributed across 'primary' (minimum 8), 'secondary' (minimum 8), and 'longTail' (minimum 8) lists.
11. You MUST find and list at least 10 real direct or indirect business competitors in the 'competitors' list. For each, list at least 3 detailed strengths, at least 3 weaknesses, and a comparative positioning summary against our brand.
12. For 'estimatedMonthlyVisits', do not return a range (e.g. '10k-50k'). Return a raw numeric string value (e.g., '25000') so the system can parse and format it accurately.

SCRAPED WEBSITE DATA:
URL: {body.website}
Title: {body.scrapedTitle}
Meta Description: {body.scrapedMetaDesc}
Scraped Text Content:
{body.scrapedContent or "(No webpage text content could be scraped)"}

INPUT:
Brand Name: {body.brandName}
Industry Hint: {body.industryHint}

ANALYSIS REQUIREMENTS & OUTPUT FORMAT:
Return ONLY a valid raw JSON object matching this structure exactly (no markdown formatting, no extra text):
{{
  "campaignName": "A catchy campaign name",
  "coreObjective": "Lead Generation or Sales or Brand Awareness",
  "brand": {{
    "name": "{body.brandName}",
    "tagline": "Brand tagline",
    "industry": "{body.industryHint}",
    "founded": "Estimated founding year",
    "businessModel": "B2B or B2C or SaaS etc.",
    "toneOfVoice": "Brand tone description",
    "registeredAddress": "N/A",
    "CIN": "N/A",
    "overallScore": 85
  }},
  "websiteAudit": {{
    "overallScore": 80,
    "seoScore": 82,
    "performanceScore": 78,
    "uxScore": 80,
    "contentScore": 85,
    "technicalScore": 80,
    "mobileScore": 85,
    "accessibilityScore": 80,
    "securityScore": 90,
    "criticalIssue": "Any critical issue found or None",
    "findings": ["finding 1", "finding 2"],
    "technicalIssues": ["issue 1"],
    "quickWins": ["win 1", "win 2"]
  }},
  "keywords": {{
    "primary": ["primary keyword 1", "primary keyword 2", "primary keyword 3", "primary keyword 4", "primary keyword 5", "primary keyword 6", "primary keyword 7", "primary keyword 8"],
    "secondary": ["secondary keyword 1", "secondary keyword 2", "secondary keyword 3", "secondary keyword 4", "secondary keyword 5", "secondary keyword 6", "secondary keyword 7", "secondary keyword 8"],
    "longTail": ["long-tail keyword 1", "long-tail keyword 2", "long-tail keyword 3", "long-tail keyword 4", "long-tail keyword 5", "long-tail keyword 6", "long-tail keyword 7", "long-tail keyword 8"],
    "gaps": ["gap 1", "gap 2", "gap 3", "gap 4", "gap 5"],
    "recommendations": ["rec 1", "rec 2", "rec 3", "rec 4", "rec 5"]
  }},
  "competition": {{
    "intensity": "High or Medium or Low",
    "competitors": [
      {{
        "name": "Competitor 1",
        "strengths": ["strength 1", "strength 2", "strength 3"],
        "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
        "comparison": "Side-by-side comparison with details"
      }},
      {{
        "name": "Competitor 2",
        "strengths": ["strength 1", "strength 2", "strength 3"],
        "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
        "comparison": "Side-by-side comparison with details"
      }},
      {{
        "name": "Competitor 3",
        "strengths": ["strength 1", "strength 2", "strength 3"],
        "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
        "comparison": "Side-by-side comparison with details"
      }},
      {{
        "name": "Competitor 4",
        "strengths": ["strength 1", "strength 2", "strength 3"],
        "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
        "comparison": "Side-by-side comparison with details"
      }},
      {{
        "name": "Competitor 5",
        "strengths": ["strength 1", "strength 2", "strength 3"],
        "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
        "comparison": "Side-by-side comparison with details"
      }},
      {{
        "name": "Competitor 6",
        "strengths": ["strength 1", "strength 2", "strength 3"],
        "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
        "comparison": "Side-by-side comparison with details"
      }},
      {{
        "name": "Competitor 7",
        "strengths": ["strength 1", "strength 2", "strength 3"],
        "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
        "comparison": "Side-by-side comparison with details"
      }},
      {{
        "name": "Competitor 8",
        "strengths": ["strength 1", "strength 2", "strength 3"],
        "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
        "comparison": "Side-by-side comparison with details"
      }},
      {{
        "name": "Competitor 9",
        "strengths": ["strength 1", "strength 2", "strength 3"],
        "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
        "comparison": "Side-by-side comparison with details"
      }},
      {{
        "name": "Competitor 10",
        "strengths": ["strength 1", "strength 2", "strength 3"],
        "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
        "comparison": "Side-by-side comparison with details"
      }}
    ],
    "differentiators": ["differentiator 1", "differentiator 2", "differentiator 3"],
    "marketPosition": "Market positioning summary"
  }},
  "adCopy": {{
    "headlines": ["Headline 1 under 30 chars", "Headline 2 under 30 chars", "Headline 3 under 30 chars", "Headline 4 under 30 chars"],
    "primaryTexts": ["Primary text 1 under 90 chars", "Primary text 2 under 90 chars", "Primary text 3 under 90 chars"],
    "callToAction": "LEARN_MORE"
  }},
  "analyticsDashboard": {{
    "estimatedMonthlyVisits": "25000",
    "estimatedDomainAuthority": 25,
    "estimatedBacklinks": "500+",
    "topTrafficSources": ["Organic Search", "Direct"],
    "avgSessionDuration": "2m 15s",
    "bounceRate": "45%",
    "conversionFocusAreas": ["Landing page CTA", "Form fields"]
  }},
  "budget": {{
    "estimatedAdSpend": "$1000 - $3000",
    "recommendedChannels": ["Google Search", "Meta Ads"],
    "estimatedCPCRange": "$1.50 - $3.00",
    "roiPotential": "3x - 5x"
  }}
}}
"""
        llm = get_llm(model="gpt-4o-mini", max_tokens=3000, temperature=0.3)
        res = await llm.ainvoke(prompt)
        
        import json
        raw_content = res.content.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(raw_content)
        return parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ChatbotResponseRequest(BaseModel):
    userPrompt: str
    systemPrompt: str


@router.post("/chatbot-response")
async def chatbot_response(body: ChatbotResponseRequest):
    try:
        llm = get_llm(model="gpt-4o", max_tokens=1500, temperature=0.7)
        from langchain_core.messages import SystemMessage, HumanMessage
        messages = [
            SystemMessage(content=body.systemPrompt),
            HumanMessage(content=body.userPrompt)
        ]
        res = await llm.ainvoke(messages)
        return {"reply": res.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class DashboardAgentRequest(BaseModel):
    userPrompt: str
    history: Optional[list] = []
    userContext: Optional[str] = ""
    walletContext: Optional[str] = ""
    txnsContext: Optional[str] = ""
    brandContext: Optional[str] = ""
    campaignsContext: Optional[str] = ""
    reviewsContext: Optional[str] = ""
    contactsContext: Optional[str] = ""
    workflowsContext: Optional[str] = ""
    linkedinContext: Optional[str] = ""
    socialPostsContext: Optional[str] = ""


@router.post("/dashboard-agent")
async def dashboard_agent(body: DashboardAgentRequest):
    try:
        system_prompt = f"""You are W-AI, the elite, omniscient AI strategic platform assistant for AdsGo.ai.
Your mission is to act as the core knowledge brain of the entire platform. Since the header Search/Ask AI is accessed from any page, the user can ask questions about ANY part of their workspace (including their profile, billing plan, wallet balance, recent transactions, CRM contacts, social schedulers, campaigns, active automation workflows, and customer reviews).

Use the real-time project workspace context provided below to answer the user's questions with absolute accuracy:

[USER PROFILE & SUBSCRIPTION]
{body.userContext or 'Not set'}

[WALLET BALANCE]
{body.walletContext or 'Not set'}

[RECENT TRANSACTIONS]
{body.txnsContext or 'Not set'}

[ACTIVE BRAND PROFILE]
{body.brandContext or 'Not set'}

[CAMPAIGNS (ADS MANAGER)]
{body.campaignsContext or 'Not set'}

[RECENT CUSTOMER REVIEWS (REPUTATION)]
{body.reviewsContext or 'Not set'}

[CRM CONTACTS (LEADS / CUSTOMERS)]
{body.contactsContext or 'Not set'}

[AUTOMATION WORKFLOWS]
{body.workflowsContext or 'Not set'}

[LINKEDIN SCRAPER & CRM LEADS]
{body.linkedinContext or 'Not set'}

[SOCIAL MEDIA SCHEDULER POSTS]
{body.socialPostsContext or 'Not set'}

Capabilities and Directives:
1. Speak as an elite strategist. Always reply in a professional, concise, and helpful tone.
2. You have FULL ACCESS to the user's workspace database. If the user asks about contacts, wallet, subscription, posts, or campaigns, reference the actual data lists in the context above.
3. If they don't have records in a specific category (e.g. no workflows or low wallet balance), kindly state that they have none active and offer to guide them on how to create one or top up.
4. Be precise with numbers, transaction types, status strings, and names.
5. Answer in the same language style as the user (e.g., if the query is in Hinglish or Hindi, reply in fluent Hinglish or Hindi with high contextual quality).
"""
        from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
        messages = [SystemMessage(content=system_prompt)]
        
        for h in (body.history or []):
            role = h.get("role")
            content = h.get("content") or h.get("text")
            if role == "user":
                messages.append(HumanMessage(content=content))
            else:
                messages.append(AIMessage(content=content))
                
        messages.append(HumanMessage(content=body.userPrompt))
        
        llm = get_llm(model="gpt-4o", max_tokens=1500, temperature=0.7)
        res = await llm.ainvoke(messages)
        return {"reply": res.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class SeoAuditRequest(BaseModel):
    domain: str
    scrapedTitle: Optional[str] = ""
    scrapedMetaDesc: Optional[str] = ""
    scrapedH1: Optional[str] = ""
    scrapedContent: Optional[str] = ""
    authorityScore: Optional[str] = "N/A"
    organicTraffic: Optional[str] = "N/A"
    organicKeywords: Optional[str] = "N/A"
    backlinks: Optional[str] = "N/A"
    refDomains: Optional[str] = "N/A"
    topKeywords: Optional[list] = []
    competitors: Optional[list] = []


@router.post("/seo-audit")
async def seo_audit(body: SeoAuditRequest):
    try:
        # Construct analysis prompt for ChatOpenAI agent
        prompt = f"""
You are a senior digital marketing strategist, SEO auditor, and competitive intelligence analyst.
Analyze the following SEO telemetry data for the domain "{body.domain}" and generate a structured audit report.

ON-PAGE TELEMETRY:
Title: {body.scrapedTitle or 'None Detected'}
Description: {body.scrapedMetaDesc or 'None Detected'}
H1: {body.scrapedH1 or 'None Detected'}
Scraped Homepage Content: {body.scrapedContent or 'No content found'}

SEO MARKET DATA:
Authority Score: {body.authorityScore}
Organic Traffic: {body.organicTraffic}
Organic Keywords: {body.organicKeywords}
Backlinks: {body.backlinks}
Ref. Domains: {body.refDomains}

TOP KEYWORDS RANKING CURRENTLY:
{body.topKeywords}

COMPETITOR LANDSCAPE:
{body.competitors}

Perform a deep intelligence analysis and return ONLY a valid raw JSON object matching this structure exactly (no markdown formatting, no extra text):
{{
  "executiveStrategy": "High-level situational analysis of their market position vs competitors and general organic growth strategy.",
  "metaGenerator": {{
    "suggestedTitle": "SEO-optimized Title under 60 chars",
    "suggestedDescription": "SEO-optimized Meta Description under 160 chars",
    "seoReasoning": "Explanation of why these meta tags are optimized and which target keywords they focus on."
  }},
  "contentGap": [
    {{
      "topic": "Topic or keyword theme currently covered by competitors but missing or thin on our website",
      "competitorSource": "Competitor name",
      "importance": "High or Medium or Low",
      "description": "Brief description of the gap and content angle to write."
    }}
  ],
  "articleRecommendations": [
    {{
      "title": "SEO-optimized blog article title",
      "keywords": ["keyword1", "keyword2"],
      "targetAudience": "Target buyer persona",
      "outline": "Main headings or brief structure of the article"
    }}
  ]
}}

Ensure contentGap contains 3-5 key gaps, and articleRecommendations contains 3-4 recommended blog titles.
Return ONLY the JSON string. Do NOT include markdown styling or any surrounding text.
"""
        llm = get_llm(model="gpt-4o-mini", max_tokens=3000, temperature=0.3)
        res = await llm.ainvoke(prompt)
        
        import json
        raw_content = res.content.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(raw_content)
        return parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))






