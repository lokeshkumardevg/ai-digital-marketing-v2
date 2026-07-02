import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MessageSquareText, Send, HeartHandshake,
  BarChart3, MapPin, Users, Filter, Paintbrush, Settings, CheckCircle2, Bot
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// @ts-ignore
import Navbar from '../components/Navbar';
// @ts-ignore
import Footer from '../components/Footer';

const AGENTS = [
  {
    id: 'review-gen',
    name: 'Review Generation Agent',
    icon: Star,
    color: 'from-yellow-400 to-orange-500',
    role: 'Automatically tracks recent customers and sends them polite, personalized follow-ups (via WhatsApp, Email, or SMS) at the optimal time to request a review. Satisfied customers are directed to Google/Facebook, while dissatisfied customers are routed to the internal team for feedback resolution.',
    benefits: [
      'Experience up to 3x growth in positive online reviews.',
      'Protect your reputation by resolving negative feedback before it goes public.',
      'Massively boost local SEO and build trust through higher business ratings.'
    ]
  },
  {
    id: 'review-resp',
    name: 'Review Response Agent',
    icon: MessageSquareText,
    color: 'from-blue-400 to-indigo-500',
    role: 'Monitors platforms like Google and Facebook for new reviews, instantly analyzes the sentiment (positive, neutral, negative), and generates a human-like, professional, brand-aligned response.',
    benefits: [
      '0% Response Delay: Every customer feels heard and valued instantly.',
      'Improves brand image, customer loyalty, and boosts SEO through active engagement.'
    ]
  },
  {
    id: 'social-pub',
    name: 'Social Publishing Agent',
    icon: Send,
    color: 'from-pink-400 to-rose-500',
    role: 'Automatically creates and schedules social media posts (images, text, hashtags). Analyzes trends to determine the optimal platform (Instagram, LinkedIn, Facebook, X) and the best time to post for maximum viral reach.',
    benefits: [
      'Acts as your 24/7 Digital Marketer, eliminating the need for a dedicated marketing team.',
      'Maintains active brand presence and high online visibility with zero manual effort.'
    ]
  },
  {
    id: 'social-eng',
    name: 'Social Engagement Agent',
    icon: HeartHandshake,
    color: 'from-rose-400 to-red-500',
    role: 'Automatically replies to social media comments, DMs, and brand mentions. Answers prospect questions interactively to nurture and convert them into warm leads.',
    benefits: [
      'Boosts audience engagement by over 200%.',
      'Never miss a potential inquiry or message, directly increasing sales opportunities.'
    ]
  },
  {
    id: 'reporting',
    name: 'Reporting Agent',
    icon: BarChart3,
    color: 'from-emerald-400 to-green-500',
    role: 'Aggregates data across all platforms (Social Media, Ads, SEO, Reviews) into a centralized, easy-to-understand dashboard or PDF report. Provides deep analysis of ROI, reach, and conversion metrics.',
    benefits: [
      'Gain transparent, real-time insights into your business performance.',
      'Make confident, data-driven decisions on where to allocate campaign budgets.'
    ]
  },
  {
    id: 'listings',
    name: 'Listings Optimization Agent',
    icon: MapPin,
    color: 'from-cyan-400 to-blue-500',
    role: 'Ensures business details (Name, Address, Phone number) are accurate and updated across Google Business Profile, Yelp, and 50+ local directories. Automatically updates keywords and images.',
    benefits: [
      'Achieve top rankings in local searches (e.g., "Best restaurant near me").',
      'Customers always find the right information, driving higher foot traffic.'
    ]
  },
  {
    id: 'lead-gen',
    name: 'Lead Generation Agent',
    icon: Users,
    color: 'from-purple-400 to-fuchsia-500',
    role: 'Handles inbound traffic (website visitors, social media interactions) and outbound outreach (cold emails, LinkedIn). Identifies intent, qualifies prospects, and books warm leads for the sales team.',
    benefits: [
      'Fills your sales pipeline on complete auto-pilot.',
      'Drastically reduces Customer Acquisition Cost (CAC).'
    ]
  },
  {
    id: 'contact-seg',
    name: 'Contact Segmentation Agent',
    icon: Filter,
    color: 'from-orange-400 to-amber-500',
    role: 'Smartly divides thousands of CRM contacts based on behavior, purchase history, and demographics (e.g., "Hot Leads", "Past Customers", "Defected Customers").',
    benefits: [
      'Run highly targeted and personalized marketing campaigns.',
      'Increases conversion rates by 200% by sending the right message to the right person.'
    ]
  },
  {
    id: 'template',
    name: 'Template Design Agent',
    icon: Paintbrush,
    color: 'from-teal-400 to-emerald-500',
    role: 'Uses Generative AI to instantly create aesthetically pleasing, conversion-optimized designs and copy for emails, ads, landing pages, and social posts.',
    benefits: [
      'Saves the massive costs of hiring graphic designers and copywriters.',
      'Generates multiple variations in seconds for rapid A/B testing.'
    ]
  },
  {
    id: 'custom',
    name: 'Custom Agent',
    icon: Settings,
    color: 'from-gray-400 to-slate-500',
    role: 'A bespoke agent tailored to your business specific needs. Whether you require industry-specific data scraping or custom inventory integration, this agent is trained for your unique workflow.',
    benefits: [
      'Stand out from competitors by having your own proprietary AI system.',
      'Enjoy 100% flexibility and unparalleled scalability.'
    ]
  }
];

export default function AgentEcosystem() {
  const [activeTab, setActiveTab] = useState(AGENTS[0].id);
  const navigate = useNavigate();

  const activeAgent = AGENTS.find(a => a.id === activeTab) || AGENTS[0];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 font-sans">

      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-16 lg:py-32">

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6"
          >
            <Star size={14} className="fill-current" /> 200% Accuracy Guaranteed
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent"
          >
            The Ultimate Agent Ecosystem
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 leading-relaxed"
          >
            This is a highly advanced, interconnected AI Agent Ecosystem designed to automate and optimize your business's digital presence and marketing with <strong className="text-white">200% accuracy</strong>. Every agent has a specific role, and when they work together, your customer sales, engagement, and brand value grow exponentially.
          </motion.p>
        </div>

        {/* Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-6 mb-20"
        >
          <div className="bg-[#0f0f0f] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
            <div className="text-blue-400 mb-4"><BarChart3 size={32} /></div>
            <h3 className="text-xl font-bold mb-2">Revenue Growth</h3>
            <p className="text-sm text-gray-400 leading-relaxed">More leads, better SEO, and a strong reputation directly result in an exponential growth of sales and revenue.</p>
          </div>
          <div className="bg-[#0f0f0f] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
            <div className="text-purple-400 mb-4"><CheckCircle2 size={32} /></div>
            <h3 className="text-xl font-bold mb-2">200% Accuracy & Speed</h3>
            <p className="text-sm text-gray-400 leading-relaxed">Humans make mistakes, but this ecosystem works 24/7 without fatigue and without a single error.</p>
          </div>
          <div className="bg-[#0f0f0f] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150" />
            <div className="text-green-400 mb-4"><Users size={32} /></div>
            <h3 className="text-xl font-bold mb-2">Time & Money Saved</h3>
            <p className="text-sm text-gray-400 leading-relaxed">No need to hire large teams. You instantly gain a Fully Autonomous AI Marketing Department.</p>
          </div>
        </motion.div>

        {/* Tabbed Agent Interface */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Sidebar Tabs */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">Meet Your AI Agents</h2>
            <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 gap-2 hide-scrollbar">
              {AGENTS.map((agent) => {
                const isActive = activeTab === agent.id;
                const Icon = agent.icon;
                return (
                  <button
                    key={agent.id}
                    onClick={() => setActiveTab(agent.id)}
                    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all whitespace-nowrap lg:whitespace-normal flex-shrink-0 lg:flex-shrink ${isActive
                      ? 'bg-white/10 text-white shadow-lg border border-white/10'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                      }`}
                  >
                    <div className={`p-1.5 rounded-md ${isActive ? `bg-gradient-to-br ${agent.color}` : 'bg-white/5'}`}>
                      <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400'} />
                    </div>
                    <span className="font-medium text-sm">{agent.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Active Content */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeAgent.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden"
              >
                {/* Background glow based on active agent color */}
                <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${activeAgent.color} opacity-[0.03] rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none`} />

                <div className="relative z-10">
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${activeAgent.color} mb-6 shadow-2xl`}>
                    <activeAgent.icon size={32} className="text-white" />
                  </div>

                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">{activeAgent.name}</h2>

                  <div className="mb-10">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Role</h4>
                    <p className="text-lg text-gray-300 leading-relaxed">
                      {activeAgent.role}
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-5">Customer Benefits</h4>
                    <ul className="space-y-4">
                      {activeAgent.benefits.map((benefit, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * idx }}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle2 size={20} className={`text-transparent bg-clip-text bg-gradient-to-br ${activeAgent.color} flex-shrink-0 mt-0.5`} style={{ color: 'transparent', fill: 'currentColor' }} />
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-gradient-to-br ${activeAgent.color}`}>
                            <CheckCircle2 size={12} className="text-white" />
                          </div>
                          <span className="text-gray-300 leading-relaxed">{benefit}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </main>

      <Footer />

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
