import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BookOpen, CheckCircle, Code } from 'lucide-react';

const ApiDocumentation = () => {
  return (
    <div className="min-h-screen bg-[#040816] text-white selection:bg-blue-500/30">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-32 pb-16 px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          SaaS Auto-Provisioning Engine
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
          Complete guide to how Wheedle automatically provisions and publishes campaigns across Google, LinkedIn, and Meta using a seamless 1-click SaaS workflow.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 pb-24 space-y-12">
        
        {/* Architecture Overview */}
        <section className="bg-white/5 rounded-2xl border border-white/10 p-8">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-blue-400 w-6 h-6" />
            <h2 className="text-2xl font-bold text-white">How to Use the SaaS Flow</h2>
          </div>
          <p className="text-slate-300 leading-relaxed mb-6">
            Unlike traditional platforms where users have to manually copy-paste Account IDs or create Ad Accounts themselves, Wheedle acts as a true SaaS application. The user simply connects their social profiles via OAuth, and Wheedle's backend engine takes care of the rest.
          </p>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <CheckCircle className="text-green-400 w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-slate-300"><strong>Step 1:</strong> User authenticates with Google/LinkedIn/Meta on the Social Dashboard.</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle className="text-green-400 w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-slate-300"><strong>Step 2:</strong> User configures their Campaign (Prompt, Budget, Schedule) and clicks "Publish".</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle className="text-green-400 w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-slate-300"><strong>Step 3:</strong> The Backend Auto-Provisioning Engine executes the platform-specific API chains.</p>
            </div>
          </div>
        </section>

        {/* LinkedIn Integration */}
        <section className="bg-white/5 rounded-2xl border border-white/10 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Code className="text-cyan-400 w-6 h-6" />
            <h2 className="text-2xl font-bold text-white">LinkedIn Ads API (v202605)</h2>
          </div>
          <p className="text-slate-300 leading-relaxed mb-4">
            The LinkedIn API integration has been fully migrated to the latest version (<code className="bg-black/50 px-1 py-0.5 rounded text-sm text-cyan-300">202605</code>). It automatically builds the campaign hierarchy.
          </p>
          
          <div className="bg-black/40 rounded-xl p-6 border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-3">API Chain Execution:</h3>
            <ol className="list-decimal list-inside space-y-3 text-slate-300">
              <li><strong>Ad Account Check:</strong> Fetches <code className="text-xs text-slate-400">/rest/adAccountsV2</code>. If none exists, automatically creates a new Business Ad Account linked to the user's Organization URN.</li>
              <li><strong>Campaign Group:</strong> Hits <code className="text-xs text-slate-400">/rest/adAccounts/&#123;id&#125;/adCampaignGroups</code>. Creates a group with a mandatory <code className="text-xs text-slate-400">runSchedule</code>.</li>
              <li><strong>Ad Campaign:</strong> Posts to <code className="text-xs text-slate-400">/rest/adAccounts/&#123;id&#125;/adCampaigns</code> ensuring strict compliance fields like <code className="text-xs text-slate-400">politicalIntent: 'NOT_POLITICAL'</code>, <code className="text-xs text-slate-400">locale</code>, and <code className="text-xs text-slate-400">unitCost</code> are included.</li>
              <li><strong>Creative:</strong> Bundles the generated text and final URL into an <code className="text-xs text-slate-400">adCreatives</code> payload.</li>
            </ol>
          </div>
        </section>

        {/* Google Integration */}
        <section className="bg-white/5 rounded-2xl border border-white/10 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Code className="text-blue-500 w-6 h-6" />
            <h2 className="text-2xl font-bold text-white">Google Ads API</h2>
          </div>
          <p className="text-slate-300 leading-relaxed mb-4">
            The Google Ads integration abstracts the complexity of Google's Manager Accounts (MCC).
          </p>
          <div className="bg-black/40 rounded-xl p-6 border border-white/5">
            <ul className="list-disc list-inside space-y-3 text-slate-300">
              <li>Automatically provisions a sub-account under the primary MCC when the user authorizes their Google Profile.</li>
              <li>Saves the provisioned <code className="text-xs text-slate-400">googleCustomerId</code> directly to the User's database document.</li>
              <li>Creates Campaign, Budget, and AdGroup seamlessly without asking the user to manually select an Ad Account in the UI.</li>
            </ul>
          </div>
        </section>

        {/* Meta Integration */}
        <section className="bg-white/5 rounded-2xl border border-white/10 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Code className="text-indigo-400 w-6 h-6" />
            <h2 className="text-2xl font-bold text-white">Meta (Facebook & Instagram) API</h2>
          </div>
          <p className="text-slate-300 leading-relaxed mb-4">
            (Upcoming Integration) The Meta pipeline will follow the same true-SaaS pattern:
          </p>
          <div className="bg-black/40 rounded-xl p-6 border border-white/5">
            <ul className="list-disc list-inside space-y-3 text-slate-300">
              <li>Bundles Facebook Pages with linked Instagram Business Accounts.</li>
              <li>Uses the Meta Business Manager API to provision Ad Accounts automatically.</li>
              <li>Pushes Campaigns, AdSets, and Ads simultaneously using the bundled account IDs.</li>
            </ul>
          </div>
        </section>
        
      </div>
      <Footer />
    </div>
  );
};

export default ApiDocumentation;
