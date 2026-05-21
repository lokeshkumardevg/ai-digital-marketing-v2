function Newsletter() {
  return (
    <section className="section-shell py-20">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-[#0665ff]/10 to-[#22d3ee]/5 p-[1px] shadow-2xl">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-[#0665ff] opacity-20 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-[#22d3ee] opacity-20 blur-[100px]" />
        
        <div className="relative rounded-3xl bg-darkBlue/80 backdrop-blur-xl p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-[#0665ff] via-[#0665ff] to-[#22d3ee] shadow-lg">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Join the{' '}
            <span className="bg-gradient-to-r from-[#0665ff] to-[#22d3ee] bg-clip-text text-transparent">
              Newsletter
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/60">
            Get the latest updates and exclusive content delivered straight to your inbox.
          </p>

          <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="h-12 flex-1 rounded-xl border border-white/10 bg-white/5 px-5 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#0665ff]/50 focus:ring-1 focus:ring-[#0665ff]"
            />
            <button className="group relative h-12 overflow-hidden rounded-xl bg-gradient-to-r from-[#0665ff] via-[#0665ff] to-[#22d3ee] px-6 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg">
              Subscribe
            </button>
          </form>
          
          <p className="mt-4 text-xs text-white/40">No spam, unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}
export default Newsletter;