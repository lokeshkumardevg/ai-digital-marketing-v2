import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Agent, AgentDocument } from '../schemas/agent.schema';
import { AgentSettings, AgentSettingsDocument } from '../schemas/agent-settings.schema';

export interface CoworkerMeta {
  id: 'max' | 'stella' | 'atlas' | 'echo';
  name: string;
  domain: string;
  tagline: string;
  avatar: string;
  accent: string;
  outcomeMetrics: { label: string; key: string; format: string }[];
}

export const COWORKERS_META: Record<string, CoworkerMeta> = {
  max: {
    id: 'max',
    name: 'Max',
    domain: 'Growth',
    tagline: 'Orchestrates campaigns, deep research, lead generation and budget scaling.',
    avatar: '/assets/mascots/aarav_HD.png',
    accent: '#0665ff',
    outcomeMetrics: [
      { label: 'Target ROAS', key: 'roas', format: '3.8x' },
      { label: 'Avg Cost per Lead', key: 'cpl', format: '$18.40' },
      { label: 'Active Ad Sets', key: 'activeAds', format: '12' },
      { label: 'AI Visibility Score', key: 'visibilityScore', format: '84/100' },
    ],
  },
  stella: {
    id: 'stella',
    name: 'Stella',
    domain: 'Presence',
    tagline: 'Earns reviews, crafts responses, keeps listings synced, and publishes social content.',
    avatar: '/assets/mascots/meera_HD.png',
    accent: '#10b981',
    outcomeMetrics: [
      { label: 'Average Rating', key: 'avgRating', format: '4.8 ★' },
      { label: 'Total Reviews', key: 'totalReviews', format: '1,248' },
      { label: 'Listing Accuracy', key: 'listingAccuracy', format: '99.4%' },
      { label: 'Social Reach', key: 'socialReach', format: '45.2K' },
    ],
  },
  atlas: {
    id: 'atlas',
    name: 'Atlas',
    domain: 'Operations',
    tagline: 'Handles front desk calls, answers WhatsApp inquiries, books appointments, and prevents no-shows.',
    avatar: '/assets/mascots/rohan_HD.png',
    accent: '#f59e0b',
    outcomeMetrics: [
      { label: 'Missed Call Rate', key: 'missedCalls', format: '0.4%' },
      { label: 'Bookings Generated', key: 'bookings', format: '184' },
      { label: 'No-Show Rate', key: 'noShowRate', format: '3.1%' },
      { label: 'Avg Voice Latency', key: 'voiceLatency', format: '1.2s' },
    ],
  },
  echo: {
    id: 'echo',
    name: 'Echo',
    domain: 'Experience',
    tagline: 'Monitors customer sentiment, resolves complaints via tickets, and runs competitor intelligence.',
    avatar: '/assets/mascots/kavi_HD.png',
    accent: '#8b5cf6',
    outcomeMetrics: [
      { label: 'Avg Resolution Time', key: 'resTime', format: '< 4m' },
      { label: 'CSAT Score', key: 'csat', format: '96.2%' },
      { label: 'Net Sentiment', key: 'netSentiment', format: '+88' },
      { label: 'Competitor Rank', key: 'competitorRank', format: '#1 Local' },
    ],
  },
};

export const INITIAL_AGENTS: Partial<Agent>[] = [
  // ── MAX (GROWTH) ──
  {
    agentId: 'ads_campaign',
    coworker: 'max',
    name: 'Ads Campaign Agent',
    domain: 'Growth',
    description: 'Drafts, deploys, and scales paid ad campaigns across Google Ads and Meta with ROAS tracking.',
    version: '1.0.0',
    buildStatus: 'built',
    trigger: { event: 'campaign.schedule', description: 'Scheduled review or new campaign brief' },
    inputs: ['brand_profile', 'audience_spec', 'budget_cap', 'creative_assets'],
    tools: ['google_ads.create_campaign', 'meta_ads.create_campaign', 'google_ads.set_budget'],
    policy: { default_mode: 'approval', escalate_if: ['budget_increase_over_20%', 'new_creative'], block_if: ['daily_spend_limit_exceeded'] },
    output: { action: 'launch_or_adjust_ad_campaign', log: true },
    evaluation: { dataset: 'ads_campaign_benchmarks_v1', min_score: 0.85 },
    icon: 'Megaphone',
  },
  {
    agentId: 'deep_research',
    coworker: 'max',
    name: 'Deep Research Agent',
    domain: 'Growth',
    description: 'Crawls target websites and competitor pages to uncover winning angles, keywords, and market gaps.',
    version: '1.0.0',
    buildStatus: 'partial',
    trigger: { event: 'brand.created', description: 'When a new brand profile is added or refreshed' },
    inputs: ['website_url', 'competitor_urls', 'industry'],
    tools: ['web_scraper.scrape', 'search_engine.query', 'brand_memory.save'],
    policy: { default_mode: 'auto', escalate_if: [], block_if: [] },
    output: { action: 'generate_intelligence_brief', log: true },
    evaluation: { dataset: 'deep_research_v1', min_score: 0.8 },
    icon: 'Search',
  },
  {
    agentId: 'lead_generation',
    coworker: 'max',
    name: 'Lead Generation Agent',
    domain: 'Growth',
    description: 'Enriches inbound leads, scores intent, and syncs high-value B2B prospects from scraping pipelines.',
    version: '1.0.0',
    buildStatus: 'built',
    trigger: { event: 'lead.created', description: 'When a new lead arrives via form, ad, or scraper' },
    inputs: ['lead_record', 'brand_context'],
    tools: ['crm.create_contact', 'crm.score_lead', 'notification.alert'],
    policy: { default_mode: 'auto', escalate_if: ['enterprise_deal'], block_if: [] },
    output: { action: 'enrich_and_route_lead', log: true },
    evaluation: { dataset: 'lead_gen_scoring_v1', min_score: 0.85 },
    icon: 'Users',
  },
  {
    agentId: 'contact_segmentation',
    coworker: 'max',
    name: 'Contact Segmentation Agent',
    domain: 'Growth',
    description: 'Computes RFM scores, clusters leads by behavior, and creates custom audiences for Google and Meta.',
    version: '1.0.0',
    buildStatus: 'pending',
    trigger: { event: 'crm.sync_daily', description: 'Daily customer footprint analysis' },
    inputs: ['contacts_list', 'purchase_history', 'interaction_logs'],
    tools: ['crm.update_segments', 'meta_ads.sync_custom_audience', 'google_ads.sync_user_list'],
    policy: { default_mode: 'auto', escalate_if: [], block_if: [] },
    output: { action: 'refresh_audience_segments', log: true },
    evaluation: { dataset: 'rfm_segmentation_v1', min_score: 0.8 },
    icon: 'Layers',
  },
  {
    agentId: 'ai_visibility',
    coworker: 'max',
    name: 'AI Visibility Agent',
    domain: 'Growth',
    description: 'Probes ChatGPT, Gemini, and search engines for brand mentions and recommends actionable SEO fixes.',
    version: '1.0.0',
    buildStatus: 'pending',
    trigger: { event: 'visibility.audit_weekly', description: 'Weekly AI knowledge scan' },
    inputs: ['brand_name', 'target_prompts', 'location'],
    tools: ['llm_probe.query_multiple', 'seo.check_schema', 'brand_memory.update_visibility'],
    policy: { default_mode: 'approval', escalate_if: ['negative_brand_mention'], block_if: [] },
    output: { action: 'propose_visibility_optimizations', log: true },
    evaluation: { dataset: 'ai_visibility_v1', min_score: 0.85 },
    icon: 'Sparkles',
  },
  {
    agentId: 'template_design',
    coworker: 'max',
    name: 'Template Design Agent',
    domain: 'Growth',
    description: 'Generates on-brand single-page landing sites, social templates, and ad banners.',
    version: '1.0.0',
    buildStatus: 'built',
    trigger: { event: 'creative.requested', description: 'When an agent or user requests new creative assets' },
    inputs: ['brand_colors', 'typography', 'creative_brief'],
    tools: ['creative_engine.generate_html', 'image_gen.create_banner'],
    policy: { default_mode: 'approval', escalate_if: ['public_page_publish'], block_if: [] },
    output: { action: 'save_to_asset_library', log: true },
    evaluation: { dataset: 'template_design_v1', min_score: 0.9 },
    icon: 'Palette',
  },
  {
    agentId: 'marketing_automation',
    coworker: 'max',
    name: 'Marketing Automation Agent',
    domain: 'Growth',
    description: 'Executes reactive automation chains (e.g. Lead arrived → Send welcome WhatsApp → Alert sales).',
    version: '1.0.0',
    buildStatus: 'partial',
    trigger: { event: 'workflow.triggered', description: 'Custom event trigger from platform bus' },
    inputs: ['workflow_graph', 'trigger_payload'],
    tools: ['messaging.send_whatsapp', 'crm.update_stage', 'email.send'],
    policy: { default_mode: 'auto', escalate_if: ['unrecognized_step'], block_if: [] },
    output: { action: 'execute_workflow_step', log: true },
    evaluation: { dataset: 'workflow_execution_v1', min_score: 0.9 },
    icon: 'Zap',
  },

  // ── STELLA (PRESENCE) ──
  {
    agentId: 'review_generation',
    coworker: 'stella',
    name: 'Review Generation Agent',
    domain: 'Presence',
    description: 'Dispatches automated, non-gated review invitations via WhatsApp and SMS to all recent customers.',
    version: '1.0.0',
    buildStatus: 'pending',
    trigger: { event: 'order.completed', description: 'When a customer transaction or appointment completes' },
    inputs: ['customer_contact', 'location_info', 'google_review_link'],
    tools: ['messaging.send_whatsapp', 'messaging.send_sms'],
    policy: { default_mode: 'auto', escalate_if: ['opt_out_received'], block_if: ['sentiment_gating_attempt'] },
    output: { action: 'dispatch_review_invitation', log: true },
    evaluation: { dataset: 'review_generation_v1', min_score: 0.9 },
    icon: 'Star',
  },
  {
    agentId: 'review_response',
    coworker: 'stella',
    name: 'Review Response Agent',
    domain: 'Presence',
    description: 'Reads newly posted reviews, applies HEART de-escalation for negatives and amplifies positives.',
    version: '1.0.0',
    buildStatus: 'built',
    trigger: { event: 'review.created', description: 'When a new review arrives from Google Business or Meta' },
    inputs: ['review_text', 'star_rating', 'reviewer_name', 'brand_voice'],
    tools: ['google_business.post_reply', 'meta_reviews.post_reply'],
    policy: { default_mode: 'approval', escalate_if: ['rating<=2', 'legal_threat', 'refund_request'], block_if: ['contains_personal_data'] },
    output: { action: 'publish_review_reply', log: true },
    evaluation: { dataset: 'review_response_v1', min_score: 0.88 },
    icon: 'MessageSquare',
  },
  {
    agentId: 'listings_optimization',
    coworker: 'stella',
    name: 'Listings Optimization Agent',
    domain: 'Presence',
    description: 'Audits business hours, address, phone number, and NAP consistency across major local directories.',
    version: '1.0.0',
    buildStatus: 'pending',
    trigger: { event: 'listings.audit_weekly', description: 'Weekly directory scan' },
    inputs: ['location_data', 'registered_phone', 'hours_of_operation'],
    tools: ['google_business.update_info', 'directory_sync.check_all'],
    policy: { default_mode: 'approval', escalate_if: ['critical_discrepancy'], block_if: [] },
    output: { action: 'sync_directory_listing', log: true },
    evaluation: { dataset: 'listings_opt_v1', min_score: 0.85 },
    icon: 'MapPin',
  },
  {
    agentId: 'local_pages',
    coworker: 'stella',
    name: 'Local Pages Agent',
    domain: 'Presence',
    description: 'Generates geo-targeted SEO landing pages for each service and branch location.',
    version: '1.0.0',
    buildStatus: 'pending',
    trigger: { event: 'location.created', description: 'When a new branch or service area is added' },
    inputs: ['location_address', 'services_list', 'local_keywords'],
    tools: ['cms.publish_page', 'sitemap.update'],
    policy: { default_mode: 'approval', escalate_if: [], block_if: [] },
    output: { action: 'publish_local_seo_page', log: true },
    evaluation: { dataset: 'local_pages_v1', min_score: 0.85 },
    icon: 'Globe',
  },
  {
    agentId: 'social_publishing',
    coworker: 'stella',
    name: 'Social Publishing Agent',
    domain: 'Presence',
    description: 'Drafts and schedules platform-tailored social posts to LinkedIn, Facebook, Instagram, and Twitter.',
    version: '1.0.0',
    buildStatus: 'built',
    trigger: { event: 'social.content_calendar', description: 'According to scheduled marketing calendar' },
    inputs: ['topic_prompt', 'brand_identity', 'attached_media'],
    tools: ['social.publish_post', 'social.schedule_post'],
    policy: { default_mode: 'approval', escalate_if: ['sensitive_topic'], block_if: [] },
    output: { action: 'schedule_social_post', log: true },
    evaluation: { dataset: 'social_publishing_v1', min_score: 0.9 },
    icon: 'Share2',
  },
  {
    agentId: 'social_engagement',
    coworker: 'stella',
    name: 'Social Engagement Agent',
    domain: 'Presence',
    description: 'Monitors comments on organic and paid posts, answers simple questions, and escalates sales inquiries.',
    version: '1.0.0',
    buildStatus: 'pending',
    trigger: { event: 'social.comment_received', description: 'Incoming comment on Meta or LinkedIn post' },
    inputs: ['comment_text', 'parent_post', 'brand_tone'],
    tools: ['social.post_comment_reply', 'inbox.create_thread'],
    policy: { default_mode: 'approval', escalate_if: ['customer_complaint', 'sales_intent'], block_if: [] },
    output: { action: 'reply_to_social_comment', log: true },
    evaluation: { dataset: 'social_engagement_v1', min_score: 0.85 },
    icon: 'MessageCircle',
  },
  {
    agentId: 'chatbot',
    coworker: 'stella',
    name: 'Interactive Web Chatbot Agent',
    domain: 'Presence',
    description: 'Embeddable web chat widget that converses with visitors, explains products, and converts them to leads.',
    version: '1.0.0',
    buildStatus: 'built',
    trigger: { event: 'chat.message_received', description: 'Visitor message in website chat iframe' },
    inputs: ['visitor_message', 'conversation_history', 'brand_knowledge_base'],
    tools: ['crm.capture_lead', 'llm.generate_response'],
    policy: { default_mode: 'auto', escalate_if: ['human_agent_requested'], block_if: [] },
    output: { action: 'send_chat_response', log: true },
    evaluation: { dataset: 'chatbot_grounding_v1', min_score: 0.9 },
    icon: 'Bot',
  },

  // ── ATLAS (OPERATIONS) ──
  {
    agentId: 'front_desk',
    coworker: 'atlas',
    name: 'Front Desk AI Agent',
    domain: 'Operations',
    description: 'Answers inbound customer calls and WhatsApp messages, clarifies basic business queries, and routes callers.',
    version: '1.0.0',
    buildStatus: 'partial',
    trigger: { event: 'call.received', description: 'Inbound Twilio voice call or WhatsApp chat' },
    inputs: ['voice_transcript', 'business_hours', 'service_catalog'],
    tools: ['voice.speak', 'messaging.send_whatsapp', 'crm.sync_caller'],
    policy: { default_mode: 'auto', escalate_if: ['caller_frustrated', 'emergency'], block_if: [] },
    output: { action: 'voice_or_chat_interaction', log: true },
    evaluation: { dataset: 'front_desk_v1', min_score: 0.88 },
    icon: 'Headphones',
  },
  {
    agentId: 'appointments',
    coworker: 'atlas',
    name: 'Appointment Booking Agent',
    domain: 'Operations',
    description: 'Checks real-time calendar availability, locks slots, handles timezone conversions, and confirms bookings.',
    version: '1.0.0',
    buildStatus: 'pending',
    trigger: { event: 'booking.requested', description: 'Booking intent detected in chat or call' },
    inputs: ['requested_time', 'service_type', 'customer_details', 'calendar_state'],
    tools: ['calendar.book_slot', 'messaging.send_confirmation', 'crm.create_deal'],
    policy: { default_mode: 'auto', escalate_if: ['double_booking_conflict'], block_if: [] },
    output: { action: 'confirm_appointment', log: true },
    evaluation: { dataset: 'appointments_v1', min_score: 0.95 },
    icon: 'Calendar',
  },
  {
    agentId: 'reminders',
    coworker: 'atlas',
    name: 'Automated Reminders Agent',
    domain: 'Operations',
    description: 'Dispatches 24h and 2h appointment reminders via WhatsApp with 1-click confirmation or reschedule.',
    version: '1.0.0',
    buildStatus: 'pending',
    trigger: { event: 'appointment.upcoming', description: 'Scheduled cron for upcoming appointments' },
    inputs: ['appointment_record', 'customer_phone', 'location_address'],
    tools: ['messaging.send_whatsapp', 'messaging.send_sms'],
    policy: { default_mode: 'auto', escalate_if: ['cancellation_reply'], block_if: ['outside_quiet_hours'] },
    output: { action: 'dispatch_reminder', log: true },
    evaluation: { dataset: 'reminders_v1', min_score: 0.92 },
    icon: 'Clock',
  },
  {
    agentId: 'waitlist_recall',
    coworker: 'atlas',
    name: 'Waitlist & Recall Agent',
    domain: 'Operations',
    description: 'Instantly offers cancelled appointment slots to waitlisted customers and re-engages inactive clients.',
    version: '1.0.0',
    buildStatus: 'pending',
    trigger: { event: 'appointment.cancelled', description: 'When a booking is cancelled or customer lapsed' },
    inputs: ['cancelled_slot', 'waitlist_queue', 'inactive_customers'],
    tools: ['calendar.offer_slot', 'messaging.send_whatsapp'],
    policy: { default_mode: 'approval', escalate_if: [], block_if: [] },
    output: { action: 'offer_slot_to_waitlist', log: true },
    evaluation: { dataset: 'waitlist_v1', min_score: 0.85 },
    icon: 'Repeat',
  },
  {
    agentId: 'lead_followup',
    coworker: 'atlas',
    name: 'Speed-to-Lead Follow-up Agent',
    domain: 'Operations',
    description: 'Initiates immediate conversational outreach (WhatsApp or voice call) within 2 minutes of lead creation.',
    version: '1.0.0',
    buildStatus: 'partial',
    trigger: { event: 'lead.created', description: 'When a new lead form is submitted' },
    inputs: ['lead_name', 'lead_phone', 'lead_source', 'interest_area'],
    tools: ['voice.outbound_call', 'messaging.send_whatsapp', 'crm.update_stage'],
    policy: { default_mode: 'approval', escalate_if: ['high_ticket_inquiry'], block_if: ['outside_calling_hours'] },
    output: { action: 'initiate_speed_to_lead_contact', log: true },
    evaluation: { dataset: 'speed_to_lead_v1', min_score: 0.88 },
    icon: 'TrendingUp',
  },
  {
    agentId: 'insurance_verification',
    coworker: 'atlas',
    name: 'Insurance & Eligibility Agent',
    domain: 'Operations',
    description: 'Verifies clinic patient insurance coverage and TPA eligibility prior to their consultation.',
    version: '1.0.0',
    buildStatus: 'pending',
    trigger: { event: 'healthcare.appointment_booked', description: 'Optional healthcare vertical trigger' },
    inputs: ['patient_id', 'insurance_policy_number', 'provider_name'],
    tools: ['tpa_portal.verify_eligibility'],
    policy: { default_mode: 'approval', escalate_if: ['ineligible_status'], block_if: [] },
    output: { action: 'update_patient_insurance_status', log: true },
    evaluation: { dataset: 'insurance_verification_v1', min_score: 0.95 },
    icon: 'ShieldCheck',
  },
  {
    agentId: 'multimodal_voice',
    coworker: 'atlas',
    name: 'Multi-Modal Voice & Chat Agent',
    domain: 'Operations',
    description: 'Unified cross-channel voice and text intelligence supporting English, Hindi, and Hinglish dialogue.',
    version: '1.0.0',
    buildStatus: 'partial',
    trigger: { event: 'multimodal.inbound', description: 'Incoming multi-channel touchpoint' },
    inputs: ['audio_stream_or_text', 'preferred_language', 'session_id'],
    tools: ['speech_to_text.transcribe', 'text_to_speech.synthesize', 'crm.log_interaction'],
    policy: { default_mode: 'auto', escalate_if: ['unsupported_dialect'], block_if: [] },
    output: { action: 'respond_in_native_language', log: true },
    evaluation: { dataset: 'multimodal_voice_v1', min_score: 0.88 },
    icon: 'Mic',
  },

  // ── ECHO (EXPERIENCE) ──
  {
    agentId: 'survey',
    coworker: 'echo',
    name: 'Customer Survey Agent',
    domain: 'Experience',
    description: 'Conducts post-purchase micro-surveys (CSAT / NPS) on WhatsApp without gating public review links.',
    version: '1.0.0',
    buildStatus: 'pending',
    trigger: { event: 'service.completed', description: 'After delivery or appointment visit' },
    inputs: ['customer_id', 'survey_template', 'purchase_details'],
    tools: ['messaging.send_whatsapp', 'survey.record_response'],
    policy: { default_mode: 'auto', escalate_if: ['nps<=4'], block_if: ['gating_violation'] },
    output: { action: 'dispatch_survey_and_log', log: true },
    evaluation: { dataset: 'survey_v1', min_score: 0.9 },
    icon: 'CheckSquare',
  },
  {
    agentId: 'sentiment_insights',
    coworker: 'echo',
    name: 'Sentiment & Intelligence Agent',
    domain: 'Experience',
    description: 'Continuously clusters customer sentiment from reviews, chat transcripts, and call recordings.',
    version: '1.0.0',
    buildStatus: 'partial',
    trigger: { event: 'feedback.analyzed', description: 'Any incoming textual customer feedback' },
    inputs: ['feedback_text', 'source_platform', 'location_id'],
    tools: ['ai.extract_sentiment', 'ai.cluster_themes', 'analytics.store_kpi'],
    policy: { default_mode: 'auto', escalate_if: ['sentiment_drop_anomaly'], block_if: [] },
    output: { action: 'update_sentiment_trend_graph', log: true },
    evaluation: { dataset: 'sentiment_insights_v1', min_score: 0.86 },
    icon: 'TrendingUp',
  },
  {
    agentId: 'ticketing',
    coworker: 'echo',
    name: 'Autonomous Ticketing Agent',
    domain: 'Experience',
    description: 'Automatically creates priority resolution tasks for negative feedback or review ratings <= 2 stars.',
    version: '1.0.0',
    buildStatus: 'pending',
    trigger: { event: 'negative_feedback.detected', description: 'Rating 1-2 stars or negative sentiment' },
    inputs: ['review_content', 'reviewer_contact', 'assigned_location_manager'],
    tools: ['tickets.create_ticket', 'notifications.alert_manager'],
    policy: { default_mode: 'auto', escalate_if: ['vip_customer'], block_if: [] },
    output: { action: 'open_resolution_ticket', log: true },
    evaluation: { dataset: 'ticketing_v1', min_score: 0.92 },
    icon: 'Ticket',
  },
  {
    agentId: 'follow_up',
    coworker: 'echo',
    name: 'Issue Follow-up Agent',
    domain: 'Experience',
    description: 'Checks in with customers after ticket resolution to verify satisfaction and politely offer review updates.',
    version: '1.0.0',
    buildStatus: 'pending',
    trigger: { event: 'ticket.resolved', description: 'When support marks a customer complaint resolved' },
    inputs: ['ticket_id', 'customer_phone', 'resolution_summary'],
    tools: ['messaging.send_whatsapp', 'crm.log_status'],
    policy: { default_mode: 'approval', escalate_if: ['customer_still_unhappy'], block_if: [] },
    output: { action: 'send_satisfaction_followup', log: true },
    evaluation: { dataset: 'followup_v1', min_score: 0.88 },
    icon: 'HeartHandshake',
  },
  {
    agentId: 'competitor_analysis',
    coworker: 'echo',
    name: 'Competitor Intelligence Agent',
    domain: 'Experience',
    description: 'Tracks competitor ratings, review volumes, ad copy changes, and pricing updates weekly.',
    version: '1.0.0',
    buildStatus: 'partial',
    trigger: { event: 'competitor.audit_weekly', description: 'Weekly competitor crawler' },
    inputs: ['competitor_names', 'local_market_radius', 'industry'],
    tools: ['web_scraper.scrape', 'search_engine.audit', 'brand_memory.update_competitor'],
    policy: { default_mode: 'auto', escalate_if: [], block_if: [] },
    output: { action: 'generate_competitor_benchmark', log: true },
    evaluation: { dataset: 'competitor_benchmark_v1', min_score: 0.82 },
    icon: 'Target',
  },
  {
    agentId: 'reporting',
    coworker: 'echo',
    name: 'Executive Reporting Agent',
    domain: 'Experience',
    description: 'Compiles multi-coworker outcome metrics into executive weekly summaries and client-ready slide decks.',
    version: '1.0.0',
    buildStatus: 'built',
    trigger: { event: 'report.scheduled', description: 'Weekly or monthly reporting schedule' },
    inputs: ['all_coworker_kpis', 'date_range', 'brand_profile'],
    tools: ['analytics.compile_report', 'pdf_generator.create', 'pptx_generator.create'],
    policy: { default_mode: 'auto', escalate_if: [], block_if: [] },
    output: { action: 'deliver_executive_briefing', log: true },
    evaluation: { dataset: 'reporting_v1', min_score: 0.9 },
    icon: 'FileText',
  },
  {
    agentId: 'platform_policy_watchdog',
    coworker: 'echo',
    name: 'Platform Policy & Compliance Watchdog',
    domain: 'Experience & Governance',
    description: 'Monitors Meta, Google, WhatsApp, Twilio & LinkedIn policies, alerts on regulatory changes, and issues upgrade directives to other AI agents.',
    version: '1.0.0',
    buildStatus: 'built',
    trigger: { event: 'policy.audit_scheduled', description: 'Periodic compliance audit or platform regulatory alert' },
    inputs: ['platforms', 'industry', 'active_assets_sample', 'recent_policy_updates'],
    tools: ['policy_sentinel.audit_platforms', 'guardrails.update_directives', 'alert.notify_superadmin'],
    policy: { default_mode: 'auto', escalate_if: ['critical_risk_detected'], block_if: [] },
    output: { action: 'broadcast_policy_upgrade', log: true },
    evaluation: { dataset: 'compliance_audit_v1', min_score: 0.95 },
    icon: 'ShieldCheck',
  },
];

@Injectable()
export class AgentRegistryService implements OnModuleInit {
  private readonly logger = new Logger(AgentRegistryService.name);

  constructor(
    @InjectModel(Agent.name) private readonly agentModel: Model<AgentDocument>,
    @InjectModel(AgentSettings.name) private readonly settingsModel: Model<AgentSettingsDocument>,
  ) {}

  async onModuleInit() {
    await this.seedAgents();
  }

  /**
   * Seeds all 27 standard agents into MongoDB if they don't already exist.
   * Additive and idempotent.
   */
  async seedAgents() {
    try {
      for (const agentDef of INITIAL_AGENTS) {
        await this.agentModel.findOneAndUpdate(
          { agentId: agentDef.agentId },
          { $set: agentDef },
          { upsert: true, new: true },
        );
      }
      this.logger.log(`Seeded/verified ${INITIAL_AGENTS.length} agents across 4 AI Coworkers`);
    } catch (err: any) {
      this.logger.error(`Failed to seed agents: ${err.message}`);
    }
  }

  async getAllAgents(coworker?: string): Promise<Agent[]> {
    const filter: any = {};
    if (coworker) filter.coworker = coworker;
    return this.agentModel.find(filter).sort({ coworker: 1, name: 1 }).lean().exec();
  }

  async getAgentById(agentId: string): Promise<Agent | null> {
    return this.agentModel.findOne({ agentId }).lean().exec();
  }

  async getAgentSettings(orgId: string, agentId: string): Promise<AgentSettings> {
    let settings = await this.settingsModel.findOne({ orgId, agentId }).lean().exec();
    if (!settings) {
      // Find agent default mode
      const agent = await this.getAgentById(agentId);
      const defaultMode = agent?.policy?.default_mode || 'approval';
      settings = await this.settingsModel.create({
        orgId,
        agentId,
        mode: defaultMode,
        dailyBudgetCap: 5000,
        dryRunOnly: false,
      });
    }
    return settings as AgentSettings;
  }

  async updateAgentSettings(
    orgId: string,
    agentId: string,
    update: Partial<AgentSettings>,
  ): Promise<AgentSettings> {
    return this.settingsModel
      .findOneAndUpdate({ orgId, agentId }, { $set: update }, { new: true, upsert: true })
      .lean()
      .exec() as any;
  }

  getCoworkerMeta(coworkerId: string): CoworkerMeta | null {
    return COWORKERS_META[coworkerId.toLowerCase()] || null;
  }
}

