import Button from './Button';

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-[150px] lg:pt-[155px]">
      {/* Main blue glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-[#173CCF]/25 blur-[140px]" />

      {/* Soft radial center glow */}
      <div className="pointer-events-none absolute left-1/2 top-[120px] h-[520px] w-[760px] -translate-x-1/2 rounded-full border border-[#2D5BFF]/10" />
      <div className="pointer-events-none absolute left-1/2 top-[155px] h-[430px] w-[640px] -translate-x-1/2 rounded-full border border-[#2D5BFF]/10" />
      <div className="pointer-events-none absolute left-1/2 top-[190px] h-[340px] w-[520px] -translate-x-1/2 rounded-full border border-[#2D5BFF]/10" />

      <div className="relative mx-auto flex max-w-[820px] flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex h-[34px] items-center gap-2 rounded-full border border-[#4C68E8] bg-[#1B3FC6] px-4 text-[11px] font-medium text-white shadow-[0_10px_30px_rgba(25,55,200,0.18)]">
          <span className="rounded-full bg-white px-2 py-[2px] text-[9px] font-semibold uppercase tracking-[0.08em] text-[#1630B7]">
            New
          </span>
          <span className="whitespace-nowrap">Latest integration just arrived</span>
        </div>

        {/* Heading */}
        <h1 className="mt-7 text-[42px] font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-[64px] lg:text-[78px]">
          <span className="block">Stop Spending</span>
          <span className="block bg-gradient-to-b leading-[1.2] from-white via-[#C9D1FF] to-[#97A6FF] bg-clip-text text-transparent">
            Start scaling with AI.
          </span>
        </h1>

        {/* Paragraph */}
        <p className="mt-6 max-w-[760px] text-[14px] leading-[1.8] text-white/75 sm:text-[16px]">
          Wheedle.ai is your autonomous marketing department. Our AI agents
          research, design, and manage your Meta &amp; Google ads guaranteeing
          better ROAS in 5 minutes.
        </p>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
          <div className="flex min-w-[172px]">
            <Button variant="primary" className="!rounded-[8px] border border-[#223AAB]">
              Start 3-days trial for free
            </Button>
          </div>
          <div className="flex min-w-[150px]">
            <Button variant="primary" className="!rounded-[8px] border border-[#223AAB]">
              Watch live demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;