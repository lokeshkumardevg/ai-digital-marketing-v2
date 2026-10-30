"""
Comprehensive Test Runner for all 28 AI Agents in Wheedle.ai
Executes each agent sequentially, measures latency, inspects outputs,
and generates both JSON and Markdown reports.
"""
import asyncio
import time
import json
import os
import sys
from datetime import datetime

# Ensure root path is accessible
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

# Max agents
from src.agents.max.ads_campaign_agent import run_ads_campaign_agent
from src.agents.max.deep_research_agent import run_deep_research_agent
from src.agents.max.lead_generation_agent import run_lead_generation_agent
from src.agents.max.contact_segmentation_agent import run_contact_segmentation_agent
from src.agents.max.ai_visibility_agent import run_ai_visibility_agent
from src.agents.max.template_design_agent import run_template_design_agent
from src.agents.max.marketing_automation_agent import run_marketing_automation_agent

# Stella agents
from src.agents.stella.review_generation_agent import run_review_generation_agent
from src.agents.stella.review_response_agent import run_review_response_agent
from src.agents.stella.listings_optimization_agent import run_listings_optimization_agent
from src.agents.stella.local_pages_agent import run_local_pages_agent
from src.agents.stella.social_publishing_agent import run_social_publishing_agent
from src.agents.stella.social_engagement_agent import run_social_engagement_agent
from src.agents.stella.chatbot_agent import run_chatbot_agent

# Atlas agents
from src.agents.atlas.front_desk_agent import run_front_desk_agent
from src.agents.atlas.appointments_agent import run_appointments_agent
from src.agents.atlas.reminders_agent import run_reminders_agent
from src.agents.atlas.waitlist_recall_agent import run_waitlist_recall_agent
from src.agents.atlas.lead_followup_agent import run_lead_followup_agent
from src.agents.atlas.multimodal_voice_agent import run_multimodal_voice_agent
from src.agents.atlas.insurance_verification_agent import run_insurance_verification_agent

# Echo agents
from src.agents.echo.survey_agent import run_survey_agent
from src.agents.echo.sentiment_insights_agent import run_sentiment_insights_agent
from src.agents.echo.ticketing_agent import run_ticketing_agent
from src.agents.echo.followup_agent import run_followup_agent
from src.agents.echo.competitor_analysis_agent import run_competitor_analysis_agent
from src.agents.echo.reporting_agent import run_reporting_agent
from src.agents.echo.platform_policy_watchdog_agent import run_platform_policy_watchdog_agent


AGENT_TEST_CASES = [
    # ── MAX (Growth) ──
    {
        "agent_id": "max_ads_campaign",
        "name": "Ads Campaign Strategy Agent",
        "coworker": "max",
        "fn": run_ads_campaign_agent,
        "kwargs": {
            "brand_name": "SmileCare Dental Clinic",
            "industry": "Healthcare",
            "budget": 2500.0,
            "objective": "conversions",
            "platforms": ["google", "meta"],
        }
    },
    {
        "agent_id": "max_deep_research",
        "name": "Deep Market & Competitor Research Agent",
        "coworker": "max",
        "fn": run_deep_research_agent,
        "kwargs": {
            "brand_name": "SmileCare Dental",
            "website_url": "https://smilecare.example.com",
            "competitors": ["DentPro Mumbai", "SmileCo Bandra"],
            "industry": "Healthcare",
        }
    },
    {
        "agent_id": "max_lead_generation",
        "name": "Lead Enrichment & ICP Scoring Agent",
        "coworker": "max",
        "fn": run_lead_generation_agent,
        "kwargs": {
            "lead_data": {
                "name": "Dr. Priya Sharma",
                "email": "priya.sharma@example.com",
                "phone": "+919876543210",
                "source": "meta_ads",
                "message": "Inquiring about full-mouth dental implants package and pricing options."
            }
        }
    },
    {
        "agent_id": "max_contact_segmentation",
        "name": "Contact RFM Segmentation Agent",
        "coworker": "max",
        "fn": run_contact_segmentation_agent,
        "kwargs": {
            "contacts_list": [
                {"name": "Amit Kumar", "email": "amit@example.com", "purchase_count": 6, "total_spend": 1400, "last_purchase_date": "2026-10-10", "status": "active"},
                {"name": "Sunita Rao", "email": "sunita@example.com", "purchase_count": 1, "total_spend": 120, "last_purchase_date": "2025-11-04", "status": "lapsed"},
                {"name": "Karan Mehra", "email": "karan@example.com", "purchase_count": 3, "total_spend": 850, "last_purchase_date": "2026-08-20", "status": "active"}
            ]
        }
    },
    {
        "agent_id": "max_ai_visibility",
        "name": "AI Search Visibility & AEO Agent",
        "coworker": "max",
        "fn": run_ai_visibility_agent,
        "kwargs": {
            "brand_name": "SmileCare Dental Clinic",
            "target_prompts": ["best dentist in Bandra West", "painless root canal Mumbai", "top rated dental implants"],
            "location": "Mumbai, India",
            "industry": "Healthcare"
        }
    },
    {
        "agent_id": "max_template_design",
        "name": "Template Copy & Layout Design Agent",
        "coworker": "max",
        "fn": run_template_design_agent,
        "kwargs": {
            "brand_profile": {
                "name": "SmileCare Dental",
                "industry": "Healthcare",
                "tone": "warm, professional and reassuring",
                "colors": "#0665ff primary, #10b981 secondary"
            },
            "template_type": "email",
            "brief": "Seasonal Diwali smile makeover discount with free consultation offer"
        }
    },
    {
        "agent_id": "max_marketing_automation",
        "name": "Marketing Automation Step Executor",
        "coworker": "max",
        "fn": run_marketing_automation_agent,
        "kwargs": {
            "workflow_definition": {
                "name": "New High-Value Lead Nurture",
                "trigger_event": "lead.created",
                "steps": [
                    {"type": "action", "action": "send_whatsapp", "condition": "lead_score >= 70", "delay_minutes": 0},
                    {"type": "action", "action": "notify_sales_rep", "delay_minutes": 2}
                ]
            },
            "trigger_payload": {
                "lead_name": "Rohan Khanna",
                "phone": "+919822334455",
                "lead_score": 85,
                "service_interest": "Invisalign"
            }
        }
    },

    # ── STELLA (Presence) ──
    {
        "agent_id": "stella_review_generation",
        "name": "Compliant Review Request Agent",
        "coworker": "stella",
        "fn": run_review_generation_agent,
        "kwargs": {
            "customer_name": "Rahul Mehta",
            "customer_phone": "+919876543210",
            "service_completed": "Root Canal & Crown",
            "google_review_link": "https://g.page/r/smilecare/review",
            "channel": "whatsapp"
        }
    },
    {
        "agent_id": "stella_review_response",
        "name": "HEART Review Response & Escalation Agent",
        "coworker": "stella",
        "fn": run_review_response_agent,
        "kwargs": {
            "review_text": "Dr. Kapoor and the team were fantastic! Clean clinic and completely painless procedure.",
            "star_rating": 5,
            "reviewer_name": "Anita Deshmukh",
            "brand_voice": "warm, welcoming and grateful",
            "platform": "google"
        }
    },
    {
        "agent_id": "stella_listings_optimization",
        "name": "GBP Listings & NAP Consistency Agent",
        "coworker": "stella",
        "fn": run_listings_optimization_agent,
        "kwargs": {
            "location_data": {
                "name": "SmileCare Dental Clinic Bandra",
                "address": "12 Linking Road, Bandra West, Mumbai, MH 400050",
                "phone": "+912226401122",
                "hours": {"mon_fri": "09:00 - 20:00", "sat": "09:00 - 18:00", "sun": "closed"},
                "categories": ["Dentist", "Cosmetic Dentist", "Dental Clinic"],
                "website": "https://smilecare.example.com"
            }
        }
    },
    {
        "agent_id": "stella_local_pages",
        "name": "Local SEO Landing Page Copy Agent",
        "coworker": "stella",
        "fn": run_local_pages_agent,
        "kwargs": {
            "location": "Bandra West, Mumbai",
            "service": "Dental Implants & Cosmetic Veneers",
            "local_keywords": ["best dental implants Bandra", "cosmetic dentist Linking Road", "tooth replacement Mumbai"],
            "brand_voice": "authoritative, compassionate and patient-centric",
            "brand_name": "SmileCare Dental"
        }
    },
    {
        "agent_id": "stella_social_publishing",
        "name": "Channel-Adapted Social Publishing Agent",
        "coworker": "stella",
        "fn": run_social_publishing_agent,
        "kwargs": {
            "topic": "5 Crucial Habits for Healthy Enamel and Natural White Teeth",
            "brand_tone": "friendly, informative and approachable",
            "platforms": ["instagram", "linkedin", "facebook"],
            "target_audience": "Working professionals and families",
            "brand_name": "SmileCare Dental"
        }
    },
    {
        "agent_id": "stella_social_engagement",
        "name": "Comment Intent & DM Reply Agent",
        "coworker": "stella",
        "fn": run_social_engagement_agent,
        "kwargs": {
            "comment_text": "How much does a routine cleaning cost and do you accept insurance?",
            "post_context": "Infographic on preventing plaque buildup",
            "brand_tone": "helpful and prompt",
            "commenter_name": "Karan Mehra",
            "platform": "instagram"
        }
    },
    {
        "agent_id": "stella_chatbot",
        "name": "Grounded Knowledge Chatbot Agent",
        "coworker": "stella",
        "fn": run_chatbot_agent,
        "kwargs": {
            "user_message": "Do you provide same-day emergency appointments for severe tooth pain?",
            "conversation_history": [{"role": "user", "content": "Hello"}],
            "knowledge_base": [
                {"question": "Do you handle dental emergencies?", "answer": "Yes, we reserve daily slots for acute emergencies like severe toothaches and chipped teeth."}
            ],
            "brand_name": "SmileCare Dental"
        }
    },

    # ── ATLAS (Operations) ──
    {
        "agent_id": "atlas_front_desk",
        "name": "Front Desk Caller & Intent Dispatcher",
        "coworker": "atlas",
        "fn": run_front_desk_agent,
        "kwargs": {
            "transcript_or_message": "Hi, I need to book a consultation for braces next Wednesday morning",
            "business_hours": {"mon_fri": "9am-7pm", "sat": "9am-5pm"},
            "service_catalog": [
                {"service": "Orthodontic Consultation", "duration_minutes": 30, "price": "$50", "description": "Braces & aligners evaluation"}
            ],
            "business_name": "SmileCare Dental"
        }
    },
    {
        "agent_id": "atlas_appointments",
        "name": "Smart Appointment Scheduler & Slot Matcher",
        "coworker": "atlas",
        "fn": run_appointments_agent,
        "kwargs": {
            "request_text": "I'd like to book a routine cleaning on Tuesday morning at 10 AM",
            "service_catalog": [
                {"service": "Teeth Cleaning", "duration_minutes": 45, "price": "$80", "description": "Prophylaxis and polish"}
            ],
            "available_slots": [
                {"date": "2026-11-03", "time": "10:00", "duration_minutes": 45, "service": "Teeth Cleaning"}
            ],
            "customer_name": "Sanjay Verma"
        }
    },
    {
        "agent_id": "atlas_reminders",
        "name": "24h/2h Appointment Reminder & Reply Parser",
        "coworker": "atlas",
        "fn": run_reminders_agent,
        "kwargs": {
            "appointment_record": {
                "service": "Crown Fitting",
                "date": "2026-11-01",
                "time": "11:00 AM",
                "doctor_name": "Dr. Kapoor",
                "address": "12 Linking Road, Bandra West"
            },
            "customer_contact": {
                "name": "Pooja Patel",
                "phone": "+919871122334",
                "preferred_channel": "whatsapp"
            },
            "reminder_type": "24h"
        }
    },
    {
        "agent_id": "atlas_waitlist_recall",
        "name": "Cancellation Backfill & Recall Agent",
        "coworker": "atlas",
        "fn": run_waitlist_recall_agent,
        "kwargs": {
            "mode": "fill_cancellation",
            "cancelled_slot": {
                "service": "Veneers Consult",
                "date": "2026-11-02",
                "time": "14:00",
                "duration_minutes": 60
            },
            "waitlist": [
                {"name": "Dev Sharma", "phone": "+919822001122", "requested_service": "Veneers Consult", "wait_since": "2026-10-20", "priority_score": 9},
                {"name": "Tina Vohra", "phone": "+919833441122", "requested_service": "Veneers Consult", "wait_since": "2026-10-25", "priority_score": 7}
            ]
        }
    },
    {
        "agent_id": "atlas_lead_followup",
        "name": "2-Minute Speed-to-Lead Followup Agent",
        "coworker": "atlas",
        "fn": run_lead_followup_agent,
        "kwargs": {
            "lead_record": {
                "name": "Vikram Malhotra",
                "email": "vikram@example.com",
                "phone": "+919811223344",
                "source": "facebook_ad",
                "message": "Interested in invisible aligners consultation",
                "inquiry_type": "consultation",
                "created_at": "2026-10-30T10:00:00Z"
            },
            "business_context": {
                "business_name": "SmileCare Dental",
                "industry": "Healthcare",
                "team_contact_name": "Aarav",
                "business_hours": "9am-7pm",
                "services": ["Invisalign", "Implants", "Cosmetic Dentistry"]
            }
        }
    },
    {
        "agent_id": "atlas_multimodal_voice",
        "name": "Multilingual Voice & Hinglish Transcript Agent",
        "coworker": "atlas",
        "fn": run_multimodal_voice_agent,
        "kwargs": {
            "transcript": "Haan ji, mujhe kal shaam ko Dr. Kapoor se milna hai, daant me kaafi dard ho raha hai.",
            "detected_language": "auto",
            "intent": "emergency_appointment",
            "call_type": "inbound"
        }
    },
    {
        "agent_id": "atlas_insurance_verification",
        "name": "Insurance Benefit & Pre-Auth Agent",
        "coworker": "atlas",
        "fn": run_insurance_verification_agent,
        "kwargs": {
            "patient_details": {
                "name": "Aakash Gupta",
                "dob": "1990-05-14",
                "patient_id": "PT-8812"
            },
            "insurance_info": {
                "provider": "Delta Dental PPO",
                "policy_number": "POL-98765",
                "group_number": "GRP-123",
                "member_id": "MEM-45678"
            },
            "requested_service": "Porcelain Crown D2740"
        }
    },

    # ── ECHO (Experience & Governance) ──
    {
        "agent_id": "echo_survey",
        "name": "CSAT/NPS 3-Question WhatsApp Survey Agent",
        "coworker": "echo",
        "fn": run_survey_agent,
        "kwargs": {
            "customer": {
                "name": "Neha Joshi",
                "phone": "+919833445566",
                "email": "neha@example.com"
            },
            "service_type": "Teeth Whitening",
            "mode": "compose"
        }
    },
    {
        "agent_id": "echo_sentiment_insights",
        "name": "Multi-Source Sentiment & Anomaly Insights",
        "coworker": "echo",
        "fn": run_sentiment_insights_agent,
        "kwargs": {
            "feedback_items": [
                {"source": "google_review", "text": "Dr. Kapoor was brilliant, but waiting 25 mins was annoying.", "rating": 4.0, "date": "2026-10-25"},
                {"source": "survey", "text": "Loved the friendly staff and pain-free cleaning!", "rating": 5.0, "date": "2026-10-27"},
                {"source": "chat", "text": "Receptionist took too long to confirm my time.", "rating": 3.0, "date": "2026-10-28"}
            ],
            "analysis_period_days": 30
        }
    },
    {
        "agent_id": "echo_ticketing",
        "name": "Support Ticket & 24h SLA Dispatcher",
        "coworker": "echo",
        "fn": run_ticketing_agent,
        "kwargs": {
            "feedback_item": {
                "source": "google_review",
                "text": "Terrible service! Overcharged me for routine cleaning and receptionist was extremely rude.",
                "rating": 1.0,
                "customer_name": "Manish Shah",
                "customer_phone": "+919844556677",
                "date": "2026-10-30"
            },
            "location_manager": {
                "name": "Dr. Aarav Patel",
                "email": "manager@smilecare.com",
                "phone": "+919822114455",
                "role": "Clinic Lead"
            },
            "sla_hours": 24
        }
    },
    {
        "agent_id": "echo_followup",
        "name": "Post-Resolution Satisfaction Followup Agent",
        "coworker": "echo",
        "fn": run_followup_agent,
        "kwargs": {
            "ticket": {
                "id": "TCK-1092",
                "title": "Billing overcharge & reception dispute",
                "original_complaint": "Overcharged for routine cleaning",
                "resolved_by": "Dr. Aarav Patel"
            },
            "customer_contact": {
                "name": "Manish Shah",
                "phone": "+919844556677",
                "preferred_channel": "whatsapp"
            },
            "resolution_summary": "Issued $40 direct refund and scheduled complimentary dental polishing for his next visit"
        }
    },
    {
        "agent_id": "echo_competitor_analysis",
        "name": "Weekly Competitor Benchmark & Gap Tracker",
        "coworker": "echo",
        "fn": run_competitor_analysis_agent,
        "kwargs": {
            "competitor_names": ["DentPro Mumbai", "SmileCo Bandra"],
            "own_location_data": {
                "name": "SmileCare Dental",
                "avg_rating": 4.85,
                "review_count": 425,
                "top_services": ["Dental Implants", "Invisalign", "Teeth Whitening"]
            },
            "industry": "Healthcare & Dental"
        }
    },
    {
        "agent_id": "echo_reporting",
        "name": "Executive Multi-Coworker KPI Narrative Agent",
        "coworker": "echo",
        "fn": run_reporting_agent,
        "kwargs": {
            "all_kpis": {
                "max": {"campaigns_launched": 4, "total_spend": 2400, "leads_generated": 68, "leads_qualified": 42},
                "stella": {"reviews_collected": 34, "avg_rating": 4.88, "posts_published": 16, "social_reach": "48K"},
                "atlas": {"calls_handled": 142, "appointments_booked": 94, "no_show_rate": 2.8},
                "echo": {"surveys_sent": 86, "avg_nps": 9.4, "tickets_created": 2, "tickets_resolved_within_sla": 2}
            },
            "date_range": {"start": "2026-10-23", "end": "2026-10-30"},
            "brand_name": "SmileCare Dental Clinic",
            "report_type": "weekly"
        }
    },
    {
        "agent_id": "platform_policy_watchdog",
        "name": "Platform Policy & Regulatory Sentinel Agent",
        "coworker": "echo",
        "fn": run_platform_policy_watchdog_agent,
        "kwargs": {
            "platforms": ["google", "meta", "whatsapp", "twilio", "linkedin"],
            "industry": "Healthcare & Dental",
            "active_assets_sample": {
                "headlines": ["Transform your smile", "Experienced dental specialists"],
                "review_request_format": "Direct Google Business link with no sentiment gating"
            }
        }
    }
]


async def run_all_tests():
    print("=" * 80)
    print("🚀 Wheedle.ai Autonomous AI Coworkers — 28 Agent Test Suite")
    print(f"Timestamp: {datetime.utcnow().isoformat()} UTC")
    print(f"Total Agents to Test: {len(AGENT_TEST_CASES)}")
    print("=" * 80)

    results = []
    passed_count = 0
    failed_count = 0
    escalated_count = 0

    for idx, tc in enumerate(AGENT_TEST_CASES, start=1):
        agent_id = tc["agent_id"]
        coworker = tc["coworker"]
        name = tc["name"]
        print(f"\n[{idx:02d}/{len(AGENT_TEST_CASES)}] Testing {coworker.upper()} -> {agent_id} ({name})...")

        start_time = time.perf_counter()
        try:
            agent_result = await tc["fn"](**tc["kwargs"])
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

            res_dict = agent_result.model_dump() if hasattr(agent_result, "model_dump") else agent_result.dict()
            status = res_dict.get("status", "unknown")
            summary = res_dict.get("summary", "")
            action_type = res_dict.get("proposed_action", {}).get("actionType", "none")
            confidence = res_dict.get("confidence_score", 0.0)
            insights = res_dict.get("insights", [])

            if status in ["success", "escalated"]:
                if status == "success":
                    passed_count += 1
                else:
                    escalated_count += 1
                print(f"    ✅ Status: {status.upper()} in {elapsed_ms}ms")
                print(f"       Action: {action_type} | Confidence: {confidence}")
                print(f"       Summary: {summary[:100]}...")
            else:
                failed_count += 1
                print(f"    ❌ Status: {status.upper()} in {elapsed_ms}ms")
                print(f"       Summary: {summary}")

            results.append({
                "agent_id": agent_id,
                "name": name,
                "coworker": coworker,
                "status": status,
                "latency_ms": elapsed_ms,
                "action_type": action_type,
                "summary": summary,
                "insights_count": len(insights),
                "confidence_score": confidence,
                "error": None
            })

        except Exception as e:
            elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
            failed_count += 1
            print(f"    ❌ EXCEPTION: {e}")
            results.append({
                "agent_id": agent_id,
                "name": name,
                "coworker": coworker,
                "status": "failed",
                "latency_ms": elapsed_ms,
                "action_type": "none",
                "summary": str(e),
                "insights_count": 0,
                "confidence_score": 0.0,
                "error": str(e)
            })

    print("\n" + "=" * 80)
    print("📊 AGENT TEST EXECUTION SUMMARY")
    print(f"Total Agents: {len(results)}")
    print(f"✅ Success / Ready: {passed_count}")
    print(f"⚠️  Escalated / Policy Gated: {escalated_count}")
    print(f"❌ Failed: {failed_count}")
    print("=" * 80)

    # Save structured test output
    report_path = os.path.join(CURRENT_DIR, "agent_test_report.json")
    with open(report_path, "w") as f:
        json.dump({
            "generated_at": datetime.utcnow().isoformat(),
            "summary": {
                "total": len(results),
                "success": passed_count,
                "escalated": escalated_count,
                "failed": failed_count,
                "all_passing": failed_count == 0
            },
            "results": results
        }, f, indent=2)

    print(f"Report saved to: {report_path}")
    return results


if __name__ == "__main__":
    asyncio.run(run_all_tests())

