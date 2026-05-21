import aiBotImage from '../assets/images/ai-bot.png';

function ContactForm() {
  return (
    <section className="section-shell py-24">
      <div className="relative overflow-hidden rounded-[32px] border border-[#0665ff]/30 bg-gradient-to-br from-[#030514] via-[#07122A] to-[#000000] px-6 py-12 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(6,101,255,0.15)_inset] sm:px-10 lg:px-16">

        {/* Deep Blue & Cyan Glow Orbs */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#0665ff]/10 blur-[140px]" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-[#22d3ee]/5 blur-[130px]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0665ff]/10 blur-[100px]" />

        {/* Subtle Grid Overlay */}
        <div className={`pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"%3E%3Cpath d="M 60 0 L 0 0 0 60" fill="none" stroke="%230665ff" stroke-width="0.5" stroke-opacity="0.08"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23grid)"/%3E%3C/svg%3E')] opacity-30`} />

        <div className="relative grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">

          {/* LEFT IMAGE */}
          <div className="relative flex justify-center lg:justify-start">
            {/* AI Bot Glow Ring - Cyan/Blue gradient */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0665ff]/20 to-[#22d3ee]/20 blur-3xl" />
            <div className="relative group">
              <img
                src={aiBotImage}
                alt="AI Bot"
                className="relative max-h-[460px] w-auto object-contain drop-shadow-[0_0_35px_rgba(6,101,255,0.4)] transition duration-700 group-hover:scale-105 group-hover:drop-shadow-[0_0_55px_rgba(34,211,238,0.5)]"
              />
              {/* Scanning line effect with gradient */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-[#22d3ee]/20 to-transparent transform -skew-x-12 animate-pulse" />
              </div>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="max-w-[720px]">
            <div className="relative">
              <span className="inline-block text-sm font-mono tracking-wider bg-gradient-to-r from-[#0665ff] to-[#22d3ee] bg-clip-text text-transparent border-l-3 border-[#0665ff] pl-3 mb-3">
                AI INTEGRATION
              </span>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white via-[#22d3ee] to-[#0665ff] bg-clip-text text-transparent sm:text-3xl">
                See How Our AI Can Grow Your Business
              </h2>
            </div>

            <p className="mt-5 text-white/60 text-lg leading-relaxed border-l-2 border-[#0665ff]/40 pl-5">
              Book a free live demo  
              <span className="bg-gradient-to-r from-[#0665ff] to-[#22d3ee] bg-clip-text text-transparent font-semibold ml-1.5 tracking-wide"> — no commitment, no pressure.</span>
            </p>

            <form className="mt-10 space-y-6">

              {/* INPUT FIELDS - Enhanced with gradient focus */}
              {[
                "Company / Business Name",
                "Contact Person Name",
              ].map((placeholder, index) => (
                <div key={index} className="relative group">
                  <input
                    type="text"
                    placeholder=" "
                    className="peer h-14 w-full rounded-xl bg-black/40 border border-[#0665ff]/40 px-4 text-white/90 backdrop-blur-sm outline-none transition-all duration-300 focus:border-[#22d3ee] focus:ring-2 focus:ring-[#22d3ee]/30 focus:bg-black/60 hover:border-[#0665ff]/60"
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/40 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#22d3ee] group-hover:text-white/60">
                    {placeholder}
                  </label>
                </div>
              ))}

              <div className="grid gap-6 sm:grid-cols-2">
                {["WhatsApp Number", "Email ID"].map((placeholder, index) => (
                  <div key={index} className="relative group">
                    <input
                      type={index === 0 ? "tel" : "email"}
                      placeholder=" "
                      className="peer h-14 w-full rounded-xl bg-black/40 border border-[#0665ff]/40 px-4 text-white/90 backdrop-blur-sm outline-none transition-all duration-300 focus:border-[#22d3ee] focus:ring-2 focus:ring-[#22d3ee]/30 focus:bg-black/60 hover:border-[#0665ff]/60"
                    />
                    <label className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/40 transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#22d3ee] group-hover:text-white/60">
                      {placeholder}
                    </label>
                  </div>
                ))}
              </div>

              {/* BUTTON - GRADIENT from #0665ff to #22d3ee */}
              <button className="group relative mx-auto mt-8 block w-full max-w-[280px] overflow-hidden rounded-xl bg-gradient-to-r from-[#0665ff] via-[#0665ff] to-[#22d3ee] px-6 py-3.5 text-sm font-bold tracking-wide text-white shadow-[0_8px_32px_rgba(6,101,255,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_15px_40px_rgba(6,101,255,0.5)]">
                
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Get Free Demo
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>

                {/* Animated Shine */}
                <span className="absolute left-[-100%] top-0 h-full w-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-all duration-700 group-hover:left-[100%]" />
                
                {/* Gradient Hover Overlay */}
                <span className="absolute inset-0 bg-gradient-to-r from-[#0665ff]/0 via-white/10 to-[#22d3ee]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>

              {/* Micro copy with gradient accent */}
              <p className="text-center text-white/30 text-xs mt-4 font-mono">
                <span className="bg-gradient-to-r from-[#0665ff] to-[#22d3ee] bg-clip-text text-transparent">⚡</span> No credit card required • 15-min demo • Enterprise-grade AI
              </p>
            </form>
          </div>
        </div>

        {/* Bottom accent line with gradient */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#0665ff] to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/4 h-[2px] bg-gradient-to-r from-[#0665ff] via-[#22d3ee] to-[#0665ff] rounded-full" />
      </div>
    </section>
  );
}

export default ContactForm;