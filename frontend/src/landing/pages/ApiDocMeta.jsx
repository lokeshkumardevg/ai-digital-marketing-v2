import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BookOpen, CheckCircle, Smartphone } from 'lucide-react';

const ApiDocMeta = () => {
  return (
    <div className="min-h-screen bg-[#040816] text-white selection:bg-blue-500/30">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-32 pb-16 px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
          Meta Ads Integration
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
          Complete step-by-step guide to the Meta (Facebook & Instagram) SaaS Auto-Provisioning architecture.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 pb-24 space-y-12">
        
        {/* Architecture Overview */}
        <section className="bg-white/5 rounded-2xl border border-white/10 p-8 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-indigo-400 w-6 h-6" />
            <h2 className="text-2xl font-bold text-white">How it Works</h2>
          </div>
          <p className="text-slate-300 leading-relaxed mb-6">
            The Meta Business Manager integration combines Facebook Pages and Instagram Accounts into a seamless publishing engine.
          </p>
          <div className="space-y-6">
            <div className="flex gap-3 items-start">
              <CheckCircle className="text-green-400 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Step 1: System User Provisioning</strong>
                <p className="text-slate-400 text-sm mt-1">When a user connects via Facebook Login, we generate a long-lived Page Token and a Business Manager System User token to perform actions on their behalf without timeouts.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle className="text-green-400 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Step 2: Cross-Platform Asset Bundling</strong>
                <p className="text-slate-400 text-sm mt-1">We query the Graph API to fetch the user's Facebook Page, and then traverse its connected nodes to find the associated `instagram_business_account`. Both IDs are saved.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle className="text-green-400 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Step 3: Campaign & AdSet Pipeline</strong>
                <p className="text-slate-400 text-sm mt-1">Upon clicking Publish, the engine creates a Meta Campaign, then constructs an AdSet targeting automatic placements (or specific FB/IG placements based on the user's choice).</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle className="text-green-400 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Step 4: Unified Creative Upload</strong>
                <p className="text-slate-400 text-sm mt-1">The system uploads the AI-generated media to the Meta Ad Library and creates the ad linking the Facebook Page ID and Instagram Actor ID, putting the ad live across both networks simultaneously.</p>
              </div>
            </div>
          </div>
        </section>
        
      </div>
      <Footer />
    </div>
  );
};

export default ApiDocMeta;
