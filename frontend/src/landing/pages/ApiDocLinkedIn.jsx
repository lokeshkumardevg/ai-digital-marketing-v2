import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BookOpen, CheckCircle, Code, AlertTriangle } from 'lucide-react';

const ApiDocLinkedIn = () => {
  return (
    <div className="min-h-screen bg-[#040816] text-white selection:bg-blue-500/30">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-32 pb-16 px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          LinkedIn Ads Integration
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
          Complete step-by-step guide to the LinkedIn Ads SaaS Auto-Provisioning flow using version <code className="bg-white/10 px-2 py-0.5 rounded">202605</code>.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 pb-24 space-y-12">
        
        {/* Warning about Versioning */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5 flex gap-4 items-start">
          <AlertTriangle className="text-yellow-500 w-6 h-6 shrink-0" />
          <div>
            <h3 className="text-yellow-500 font-bold mb-1">Critical API Changes in v202605</h3>
            <p className="text-yellow-500/80 text-sm">
              LinkedIn introduced breaking changes requiring Ad Account IDs in the URL path, mandatory `runSchedule` for Campaign Groups, and compliance fields (`politicalIntent`, `locale`, `unitCost`) for Campaigns. Our integration handles all of these automatically.
            </p>
          </div>
        </div>

        {/* Architecture Overview */}
        <section className="bg-white/5 rounded-2xl border border-white/10 p-8 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-cyan-400 w-6 h-6" />
            <h2 className="text-2xl font-bold text-white">How it Works</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-3 items-start">
              <CheckCircle className="text-green-400 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Step 1: Ad Account Provisioning</strong>
                <p className="text-slate-400 text-sm mt-1">We fetch `/rest/adAccountsV2`. If the user has no business accounts, we create one automatically targeting their LinkedIn Page Organization URN. We then save the `adAccountId` in our database.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle className="text-green-400 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Step 2: Campaign Group Allocation</strong>
                <p className="text-slate-400 text-sm mt-1">We search `/rest/adAccounts/&#123;id&#125;/adCampaignGroups` for existing groups. If none exist, we automatically post to create one. A Campaign Group is mandatory in LinkedIn's hierarchy before creating Campaigns.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle className="text-green-400 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Step 3: Ad Campaign Verification</strong>
                <p className="text-slate-400 text-sm mt-1">We hit `/rest/adAccounts/&#123;id&#125;/adCampaigns` to create the campaign. Crucially, we append:</p>
                <ul className="list-disc list-inside text-sm text-cyan-300/80 mt-2 space-y-1">
                  <li>`politicalIntent: 'NOT_POLITICAL'`</li>
                  <li>{`locale: { country: "US", language: "en" }`}</li>
                  <li>{`unitCost: { amount: "2.00", currencyCode: 'USD' }`}</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle className="text-green-400 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Step 4: Ad Creative Publishing</strong>
                <p className="text-slate-400 text-sm mt-1">The AI-generated text and destination URL are packaged into a final `/rest/adAccounts/&#123;id&#125;/adCreatives` request, successfully putting the Ad live.</p>
              </div>
            </div>
          </div>
        </section>
        
      </div>
      <Footer />
    </div>
  );
};

export default ApiDocLinkedIn;
