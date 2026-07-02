import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
    }, 1500);
  };

  const inputClasses = "peer min-h-[56px] w-full rounded-xl bg-black/40 border border-[#0665ff]/40 px-4 pt-4 pb-2 text-white/90 backdrop-blur-sm outline-none transition-all duration-300 focus:border-[#22d3ee] focus:ring-2 focus:ring-[#22d3ee]/30 focus:bg-black/60 hover:border-[#0665ff]/60";
  const labelClasses = "absolute left-4 top-2 text-xs text-white/40 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#22d3ee]";

  return (
    <div className="bg-[#030514] text-white min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow pt-32 pb-24 px-6 sm:px-10">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-mono tracking-wider bg-gradient-to-r from-[#0665ff] to-[#22d3ee] bg-clip-text text-transparent border-l-2 border-[#0665ff] pl-3 mb-4">
              CONTACT US
            </span>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent sm:text-6xl mb-6">
              Let's grow your business
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Ready to scale? Fill out the form below to request a personalized marketing plan and platform demo.
            </p>
          </div>

          {/* Form Section */}
          <div className="relative overflow-hidden rounded-[32px] border border-[#0665ff]/30 bg-gradient-to-br from-[#07122A] to-[#000000] p-8 sm:p-12 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(6,101,255,0.15)_inset]">
            
            {/* Background Glows */}
            <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#0665ff]/10 blur-[140px]" />
            <div className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-[#22d3ee]/5 blur-[130px]" />
            
            {success ? (
              <div className="text-center py-20 relative z-10">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-[#0665ff]/20 to-[#22d3ee]/20 mb-6 border border-[#22d3ee]/30">
                  <svg className="w-10 h-10 text-[#22d3ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Request Submitted Successfully</h3>
                <p className="text-white/60 mb-8">Our team will review your details and reach out shortly.</p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="text-[#22d3ee] hover:text-white transition-colors underline"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                
                {/* 1. Name & Email */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="relative group">
                    <input type="text" id="name" placeholder=" " required className={inputClasses} />
                    <label htmlFor="name" className={labelClasses}>Your Name *</label>
                  </div>
                  <div className="relative group">
                    <input type="email" id="email" placeholder=" " required className={inputClasses} />
                    <label htmlFor="email" className={labelClasses}>Work Email *</label>
                  </div>
                </div>

                {/* 2. Company Name */}
                <div className="relative group">
                  <input type="text" id="company" placeholder=" " required className={inputClasses} />
                  <label htmlFor="company" className={labelClasses}>Company Name *</label>
                </div>

                {/* 3. URLs */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="relative group">
                    <input type="url" id="businessUrl" placeholder=" " className={inputClasses} />
                    <label htmlFor="businessUrl" className={labelClasses}>Business URL (optional)</label>
                  </div>
                  <div className="relative group">
                    <input type="url" id="competitorUrl" placeholder=" " className={inputClasses} />
                    <label htmlFor="competitorUrl" className={labelClasses}>Competitor URL (optional)</label>
                  </div>
                </div>

                {/* 4. Industry Select */}
                <div className="relative group">
                  <select id="industry" required className={`${inputClasses} appearance-none text-white/90`}>
                    <option value="" disabled selected hidden></option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="saas">SaaS / Software</option>
                    <option value="agency">Agency / Marketing</option>
                    <option value="realestate">Real Estate</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                  </select>
                  <label htmlFor="industry" className={`${labelClasses} peer-placeholder-shown:text-white/90 peer-focus:text-[#22d3ee]`}>
                    Industry / Business Type *
                  </label>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>

                {/* 5. Products/Services Textarea */}
                <div className="relative group">
                  <textarea id="productsServices" required placeholder=" " rows="3" className={`${inputClasses} resize-none`}></textarea>
                  <label htmlFor="productsServices" className={labelClasses}>What products or services do you offer? *</label>
                </div>

                {/* 6. Objectives Textarea */}
                <div className="relative group">
                  <textarea id="marketingObjective" required placeholder=" " rows="3" className={`${inputClasses} resize-none`}></textarea>
                  <label htmlFor="marketingObjective" className={labelClasses}>What are your primary marketing objectives? *</label>
                </div>

                {/* 7. Budget & Timeline */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="relative group">
                    <input type="text" id="budgetRange" placeholder=" " required className={inputClasses} />
                    <label htmlFor="budgetRange" className={labelClasses}>Monthly marketing budget (approx.) *</label>
                  </div>
                  <div className="relative group">
                    <select id="timeline" required className={`${inputClasses} appearance-none`}>
                      <option value="" disabled selected hidden></option>
                      <option value="immediately">Immediately</option>
                      <option value="1-3_months">In 1-3 months</option>
                      <option value="3-6_months">In 3-6 months</option>
                      <option value="just_exploring">Just exploring</option>
                    </select>
                    <label htmlFor="timeline" className={labelClasses}>Ideal start date / timeline *</label>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                {/* 8. Anything else Textarea */}
                <div className="relative group">
                  <textarea id="additionalInfo" placeholder=" " rows="3" className={`${inputClasses} resize-none`}></textarea>
                  <label htmlFor="additionalInfo" className={labelClasses}>Anything else we should know? (Optional)</label>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="group relative mt-8 block w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#0665ff] via-[#0665ff] to-[#22d3ee] px-6 py-4 text-sm font-bold tracking-wide text-white shadow-[0_8px_32px_rgba(6,101,255,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_15px_40px_rgba(6,101,255,0.5)] disabled:opacity-70 disabled:hover:scale-100"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                    {isSubmitting ? (
                      <span className="animate-pulse">Submitting...</span>
                    ) : (
                      <>
                        Submit & Request Marketing Plan
                        <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </span>
                  {!isSubmitting && (
                    <>
                      <span className="absolute left-[-100%] top-0 h-full w-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-all duration-700 group-hover:left-[100%]" />
                      <span className="absolute inset-0 bg-gradient-to-r from-[#0665ff]/0 via-white/10 to-[#22d3ee]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
