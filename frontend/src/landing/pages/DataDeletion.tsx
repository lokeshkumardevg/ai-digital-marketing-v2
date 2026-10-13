import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
// @ts-ignore
import Navbar from '../components/Navbar';
// @ts-ignore
import Footer from '../components/Footer';
import { Trash2, ShieldCheck, CheckCircle2, ExternalLink, RefreshCw, KeyRound } from 'lucide-react';
import { api } from '../../api/axios';
import toast from 'react-hot-toast';

export const DataDeletion: React.FC = () => {
  const [searchParams] = useSearchParams();
  const codeParam = searchParams.get('code') || '';

  const [confirmationCode, setConfirmationCode] = useState(codeParam);
  const [statusResult, setStatusResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  // Direct request state
  const [requestEmail, setRequestEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestSuccessCode, setRequestSuccessCode] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (codeParam) {
      handleCheckStatus(codeParam);
    }
  }, [codeParam]);

  const handleCheckStatus = async (codeToCheck?: string) => {
    const code = codeToCheck || confirmationCode;
    if (!code.trim()) {
      toast.error('Please enter a valid Confirmation Code');
      return;
    }

    try {
      setChecking(true);
      const res = await api.get(`/auth/data-deletion/status/${encodeURIComponent(code.trim())}`);
      setStatusResult(res.data);
      toast.success('Status retrieved successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not find deletion record with this code');
      setStatusResult(null);
    } finally {
      setChecking(false);
    }
  };

  const handleRequestDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestEmail.trim()) {
      toast.error('Please enter your account email');
      return;
    }

    try {
      setSubmitting(true);
      // Calls backend Meta data deletion callback or self-service
      const res = await api.post('/auth/meta/data-deletion', { email: requestEmail.trim() });
      if (res.data?.confirmation_code) {
        setRequestSuccessCode(res.data.confirmation_code);
        setConfirmationCode(res.data.confirmation_code);
        toast.success('Data deletion initiated! Your confirmation code is ready.');
      } else {
        toast.success('Request received. Deletion process initiated.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit deletion request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#030514] text-white min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Hero Header */}
      <div className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-[#FF5E62]/10 blur-[160px]" />
        <div className="pointer-events-none absolute right-0 top-20 h-[300px] w-[300px] rounded-full bg-[#5B6EF5]/10 blur-[120px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF5E62]/30 bg-[#FF5E62]/10 px-4 py-1.5 text-xs font-semibold text-[#FF5E62] mb-4">
            <Trash2 size={14} />
            META &amp; GOOGLE USER DATA DELETION
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent mb-6">
            Data Deletion Instructions &amp; Request
          </h1>
          <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
            In compliance with Meta Platform Terms (Clause 4.a) and Google API Services User Data Policy, you retain complete authority to delete your advertising credentials and personal data.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow pb-24 px-6">
        <div className="max-w-4xl mx-auto space-y-10">

          {/* Section 1: How to remove app from Meta & Google */}
          <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-[#0B0F19]/90 to-[#04060C]/90 p-8 sm:p-10 backdrop-blur-xl shadow-2xl space-y-8">
            <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 flex items-center gap-2">
              <KeyRound className="text-[#5B6EF5]" size={22} />
              Step-by-Step Revocation Instructions
            </h2>

            {/* Meta / Facebook Steps */}
            <div className="p-6 rounded-2xl border border-[#1877F2]/30 bg-[#1877F2]/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1877F2] flex items-center justify-center font-bold text-lg">
                    f
                  </div>
                  <h3 className="text-lg font-bold text-white">How to Delete Data via Meta / Facebook</h3>
                </div>
                <a
                  href="https://www.facebook.com/settings?tab=business_tools"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#1877F2] font-semibold hover:underline"
                >
                  Facebook Settings <ExternalLink size={13} />
                </a>
              </div>

              <ol className="space-y-2 text-sm text-white/70 list-decimal pl-5 leading-relaxed">
                <li>Log in to your Facebook profile and navigate to <strong>Settings &amp; Privacy &gt; Settings</strong>.</li>
                <li>In the left-hand menu, select <strong>Apps and Websites</strong>.</li>
                <li>Find <strong>Wheedle AI (or Wheedle Technologies)</strong> in your active apps list.</li>
                <li>Click <strong>Remove</strong>. Check the box to allow Facebook to delete all historical permissions.</li>
                <li>Meta will automatically dispatch an asynchronous deletion webhook to our server, wiping all stored ad account tokens.</li>
              </ol>
            </div>

            {/* Google Steps */}
            <div className="p-6 rounded-2xl border border-[#4285F4]/30 bg-[#4285F4]/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#4285F4] flex items-center justify-center font-bold text-lg">
                    G
                  </div>
                  <h3 className="text-lg font-bold text-white">How to Revoke Google Ads Access</h3>
                </div>
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#4285F4] font-semibold hover:underline"
                >
                  Google Security <ExternalLink size={13} />
                </a>
              </div>

              <ol className="space-y-2 text-sm text-white/70 list-decimal pl-5 leading-relaxed">
                <li>Visit your Google Account Security Dashboard at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer" className="text-[#8A98FB] underline">myaccount.google.com/permissions</a>.</li>
                <li>Locate <strong>Wheedle AI</strong> under "Third-party apps with account access".</li>
                <li>Click on the app and select <strong>Remove Access</strong>.</li>
                <li>All Google Ads API tokens and refresh tokens in our database will immediately be rendered permanently invalid.</li>
              </ol>
            </div>
          </div>

          {/* Section 2: Online Deletion Request Form */}
          <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-[#0B0F19]/90 to-[#04060C]/90 p-8 sm:p-10 backdrop-blur-xl shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trash2 className="text-[#FF5E62]" size={20} />
              Submit Direct Data Erasure Request
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              If you wish to have all stored user accounts, tenant records, campaign drafts, and cached analytics permanently purged from Wheedle AI's production databases:
            </p>

            {requestSuccessCode ? (
              <div className="p-6 rounded-2xl border border-[#2ED573]/30 bg-[#2ED573]/10 space-y-3">
                <div className="flex items-center gap-2 text-[#2ED573] font-bold text-base">
                  <CheckCircle2 size={20} /> Data Deletion Initiated Successfully
                </div>
                <p className="text-sm text-white/80">
                  Your deletion request has been recorded. Your confirmation code is:
                </p>
                <div className="p-3 bg-black/40 rounded-xl border border-white/10 font-mono text-base text-white font-bold tracking-wider">
                  {requestSuccessCode}
                </div>
                <p className="text-xs text-white/50">
                  Save this code to check verification status anytime below. All tokens and credentials have been decoupled.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestDeletion} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                    Your Registered Business Email
                  </label>
                  <input
                    type="email"
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                    placeholder="e.g. founder@company.com"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm outline-none focus:border-[#FF5E62] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF5E62] to-[#FF2A6D] text-white font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  {submitting ? 'Processing Erasure...' : 'Request Immediate Data Erasure'}
                </button>
              </form>
            )}
          </div>

          {/* Section 3: Status Check Tool */}
          <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-[#0B0F19]/90 to-[#04060C]/90 p-8 sm:p-10 backdrop-blur-xl shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-[#2ED573]" size={20} />
              Check Status of Existing Deletion Request
            </h2>
            <p className="text-sm text-white/60">
              Enter the Confirmation Code provided by Facebook or our deletion endpoint to verify erasure status:
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder="e.g. DEL-XXXXXX-XXXXX"
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-white text-sm font-mono outline-none focus:border-[#5B6EF5] transition-colors"
              />
              <button
                type="button"
                onClick={() => handleCheckStatus()}
                disabled={checking}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#5B6EF5] to-[#8A98FB] text-white font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
                {checking ? 'Checking...' : 'Check Status'}
              </button>
            </div>

            {statusResult && (
              <div className="mt-4 p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2 text-sm">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50">Confirmation Code:</span>
                  <span className="font-mono text-white font-bold">{statusResult.confirmation_code}</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-white/50">Status:</span>
                  <span className="text-[#2ED573] font-bold uppercase">{statusResult.status} ✓</span>
                </div>
                <p className="text-xs text-white/70 pt-2 leading-relaxed">
                  {statusResult.message}
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DataDeletion;