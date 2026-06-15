import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BookOpen, CheckCircle, Code, Server } from 'lucide-react';

const ApiDocGoogle = () => {
  return (
    <div className="min-h-screen bg-[#040816] text-white selection:bg-blue-500/30">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-32 pb-16 px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Google Ads Integration
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
          Complete step-by-step guide to the Google Ads SaaS Auto-Provisioning flow.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 pb-24 space-y-12">
        
        {/* Architecture Overview */}
        <section className="bg-white/5 rounded-2xl border border-white/10 p-8 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-blue-400 w-6 h-6" />
            <h2 className="text-2xl font-bold text-white">How it Works</h2>
          </div>
          <p className="text-slate-300 leading-relaxed mb-6">
            The Google Ads integration abstracts the complexity of Google's Manager Accounts (MCC). Instead of asking users to manually create an Ad Account and link it, Wheedle automatically provisions a sub-account under our primary MCC as soon as the user authenticates.
          </p>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <CheckCircle className="text-green-400 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Step 1: OAuth Authentication</strong>
                <p className="text-slate-400 text-sm mt-1">The user authenticates with Google via OAuth. We receive their Google Access Token and Refresh Token.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle className="text-green-400 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Step 2: Sub-Account Provisioning</strong>
                <p className="text-slate-400 text-sm mt-1">Using the Google Ads API, we call the `CustomerService` to create a new client account under our MCC. The generated `googleCustomerId` is saved to the user's document in our MongoDB database.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle className="text-green-400 w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Step 3: Campaign Execution</strong>
                <p className="text-slate-400 text-sm mt-1">When the user publishes an AI-generated ad, the backend automatically targets their specific `googleCustomerId`. It provisions the Campaign, sets the Budget, and builds the AdGroup without any manual intervention.</p>
              </div>
            </div>
          </div>
        </section>

        {/* API Details */}
        <section className="bg-white/5 rounded-2xl border border-white/10 p-8 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <Server className="text-blue-500 w-6 h-6" />
            <h2 className="text-2xl font-bold text-white">Behind the Scenes</h2>
          </div>
          
          <div className="bg-black/40 rounded-xl p-6 border border-white/5 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Endpoint Example: Sub-account Creation</h3>
              <div className="bg-[#0a0f1e] p-4 rounded-lg overflow-x-auto text-sm text-cyan-300 font-mono">
                POST https://googleads.googleapis.com/v16/customers/&#123;MCC_ID&#125;/customerClients:create
              </div>
              <p className="text-slate-400 text-sm mt-2">
                This requires a Developer Token, MCC ID, and OAuth credentials.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">Database Cleanups</h3>
              <p className="text-slate-300 text-sm mb-2">
                If a user disconnects their account, we run a cleanup utility (`clear-google-id.js`) to remove the `googleCustomerId` from the database. This ensures the user can reconnect a fresh account later.
              </p>
            </div>
          </div>
        </section>
        
      </div>
      <Footer />
    </div>
  );
};

export default ApiDocGoogle;
