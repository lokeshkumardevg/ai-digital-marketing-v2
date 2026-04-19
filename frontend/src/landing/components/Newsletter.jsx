function Newsletter() {
  return (
    <section className="section-shell py-20">
      <div className="rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(49,88,255,0.18),rgba(6,10,28,0.98)_58%)] px-6 py-14 shadow-innerGlow sm:px-8 lg:px-12">
        <h2 className="text-center text-[30px] font-semibold leading-tight text-white sm:text-[42px]">
          Stay connected with our newsletter
        </h2>

        <form className="mx-auto mt-10 flex max-w-[520px] flex-col gap-3 rounded-full border border-white/10 bg-white/[0.03] p-2 sm:flex-row">
          <input
            type="email"
            placeholder="Your email"
            className="h-12 flex-1 rounded-full bg-transparent px-5 text-sm text-white placeholder:text-white/40 outline-none"
          />
          <button className="h-12 rounded-full bg-white px-6 text-sm font-medium text-slate-900 transition hover:scale-[1.02]">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}

export default Newsletter;
