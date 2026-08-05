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
    logoBase64: Optional[str] = None

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
        has_logo = bool(body.logoBase64)
        
        brand_name = body.topic.split("-")[0].split(":")[0].split("|")[0].split(",")[0].strip() or body.topic or "Brand"
        
        logo_tag = f'<img src="{body.logoBase64}" alt="Logo" style="height:48px; object-fit:contain;" />' if has_logo else f'<span class="brand-name" style="font-size:1.5rem;font-weight:800;color:var(--primary);font-family:\'Space Grotesk\',sans-serif;letter-spacing:-0.5px;">{brand_name}</span>'
        
        system_prompt = f"""You are a World-Class Lead Designer at a top-tier digital agency.
Your mission: Generate an "Elite" Multi-Page SPA for the brand "{brand_name}" (Full Topic/Niche: "{body.topic}").

THEME-SPECIFIC RULES (STRICT):
- If THEME is 'Restaurant': Use elegant food menus, reservation forms, and gallery grids.
- If THEME is 'SaaS' or 'Startup': Use modern dashboard previews, complex feature grids, and comparison tables.
- If THEME is 'Healthcare' or 'Education': Use clean, trust-building layouts, appointment/enrollment forms, and resource grids.
- If THEME is 'E-commerce' or 'Real Estate': Use product/property cards with large images, filter UI, and high-impact CTAs.

DESIGN SYSTEM & BRAND STYLING:
1. TYPOGRAPHY: Elite hierarchy using 'Plus Jakarta Sans' or 'Inter' from Google Fonts.
2. BRAND NAME: Use exactly "{brand_name}" as the brand/company name throughout the text, navbar logo, and footer.
3. COLORS & PALETTE: You must define CSS custom properties at the :root level:
   :root {{
     --primary: {primary_color};
     --secondary: {secondary_color};
   }}
   You MUST strictly style the entire website using var(--primary) and var(--secondary) for all branding, backgrounds, gradients, borders, highlights, active states, and hover effects. Do NOT use default tailwind or bootstrap/generic colors.
4. ANIMATIONS: Include AOS library (data-aos="fade-up") or smooth CSS transitions.
5. COMPONENTS: Use rounded-3xl, shadow-2xl, and beautiful glassmorphism.
6. CLIENT-SIDE ROUTING (SPA) & LAYOUT: You must build a fully functional Single Page Application. All '.page-section' containers must be wrapped inside a single `<main>` element. The Header/Navbar and the Footer MUST sit outside the `<main>` wrapper (at the layout level) so they remain visible at all times across all pages. Wrap each page's content in its own container (`<div id="page-name" class="page-section hidden">`), except the Home page which must be visible by default.
7. PAGE TRANSITIONS: Include a CSS animation to fade and slide up pages when they are displayed, making the experience buttery smooth. Add this rule to the stylesheet:
   @keyframes fadeInUp {{
     from {{ opacity: 0; transform: translateY(15px); }}
     to {{ opacity: 1; transform: translateY(0); }}
   }}
   .page-section:not(.hidden) {{
     animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
   }}
8. ABSOLUTE COMPLETENESS & RICH COPY: Every single page in the navigation must be fully fleshed out with extensive, detailed marketing sections, detailed benefit statements, comprehensive user reviews, fully designed lists, and complete descriptive copy specific to the brand. No shorthand stubs, no placeholder comments, and no truncated text.
9. PREMIUM FOOTER: The footer must be a fully-designed, modern multi-column component containing:
   - Brand information with logo and a compelling mission statement.
   - Quick Links (Home, About Us, Services, Portfolio, Contact Us) mapped to the SPA router.
   - Contact Info (phone, email, hours, physical address).
   - Fully-styled Newsletter Subscription Form (with email input and submit CTA).
   - Social media links with premium micro-interactions.
10. STICKY FLEXBOX LAYOUT (NO OVERLAPS): To prevent any overlaps or footer float issues, use a flex layout on the body:
    body {{
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      margin: 0;
    }}
    main {{
      flex: 1;
    }}
    The Header/Navbar sits at the top, the `<main>` container wraps all '.page-section' bodies in the middle, and the Footer sits at the bottom in the normal document flow. Do NOT make the Footer position: fixed or position: absolute; it must sit naturally at the bottom.

TECHNICAL RULES:
- LOGO: Use exactly {logo_tag} for the logo image or fallback text placement.
- NO TRUNCATION. NO MARKDOWN. ONLY RAW HTML.
- Start with <!DOCTYPE html> and end with </html>."""

        user_prompt = f"""Build an Elite Multi-Page {theme} Website for the brand "{brand_name}" based on topic "{body.topic}".

REQUIRED PAGES: {pages_str}
PRIMARY COLOR: {primary_color}
SECONDARY COLOR: {secondary_color}

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
   - High-impact pricing comparison matrix with "Most Popular" badges, listed features checklist, and CTA buttons."""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", user_prompt)
        ])
        chain = prompt | llm
        res = await chain.ainvoke({})
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
            f"You are a conversion rate optimization (CRO) and ad copywriting specialist.\n"
            f"Optimize the ad headline, primary text, and target keywords/demographics for a campaign to achieve maximum click-through rate (CTR) and conversions.\n\n"
            f"Rules:\n"
            f"1. For Google Search: The headline must be punchy and under 30 characters. The primary text must act as a clear description under 90 characters. Provide 5-8 highly relevant keywords.\n"
            f"2. For Meta/LinkedIn/Other: The headline should be catchy, and primaryText should use the PAS (Problem-Agitate-Solve) or AIDA copy framework. Offer targeted categories.\n\n"
            f"Context:\n{context}\n\n"
            f"Return ONLY a raw valid JSON object (no markdown, no ```json formatting, no other text) structured like this:\n"
            f"{{\n"
            f'  "headline": "highly optimized headline text",\n'
            f'  "primaryText": "highly optimized primary text/description copy",\n'
            f'  "googleKeywords": ["keyword1", "keyword2", ...] (only if platform is google),\n'
            f'  "liJobTitles": ["job title 1", "job title 2", ...] (only if platform is linkedin),\n'
            f'  "liSeniority": ["Senior", "Director", ...] (only if platform is linkedin),\n'
            f'  "liCompanySize": ["11-50", "51-200", ...] (only if platform is linkedin),\n'
            f'  "explanation": "Brief 1-sentence description of the optimization applied."\n'
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
    "primary": ["keyword 1", "keyword 2"],
    "secondary": ["keyword 3", "keyword 4"],
    "longTail": ["keyword 5", "keyword 6"],
    "gaps": ["gap 1"],
    "recommendations": ["rec 1"]
  }},
  "competition": {{
    "intensity": "High or Medium or Low",
    "competitors": [
      {{
        "name": "Competitor Name",
        "strengths": ["strength 1"],
        "weaknesses": ["weakness 1"],
        "comparison": "Comparison summary"
      }}
    ],
    "differentiators": ["differentiator 1"],
    "marketPosition": "Market positioning summary"
  }},
  "adCopy": {{
    "headlines": ["Headline 1 under 30 chars", "Headline 2 under 30 chars", "Headline 3 under 30 chars", "Headline 4 under 30 chars"],
    "primaryTexts": ["Primary text 1 under 90 chars", "Primary text 2 under 90 chars", "Primary text 3 under 90 chars"],
    "callToAction": "LEARN_MORE"
  }},
  "analyticsDashboard": {{
    "estimatedMonthlyVisits": "10k-50k",
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





