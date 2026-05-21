import stepsFlowImage from "../assets/images/stepsimage1.png";

const steps = [
  {
    num: "01",
    title: "Analyze Your Brand",
    description:
      "Paste your product URL. Our AI performs deep competitive research, identifies your USP, and builds a winning marketing persona instantly.",
    gradient: "linear-gradient(160deg, rgba(61,84,196,0.6), rgba(99,60,220,0.3) 50%, rgba(255,255,255,0.05))",
    inner: "#090f22",
    badge: "linear-gradient(135deg, #1B43D1, #6b52e8)",
    badgeShadow: "rgba(27,67,209,0.45)",
    divider: "rgba(61,84,196,0.6)",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="rgba(130,160,255,0.85)" strokeWidth="1.8">
        <circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    num: "02",
    title: "Generate & Launch Ads",
    description:
      "AI writes high-converting copy and designs stunning creatives for Meta and Google. Review, hit launch, and you're live in 60 sec.",
    gradient: "linear-gradient(160deg, rgba(99,60,220,0.65), rgba(27,67,209,0.35) 50%, rgba(255,255,255,0.05))",
    inner: "#0a0c22",
    badge: "linear-gradient(135deg, #6b52e8, #a855f7)",
    badgeShadow: "rgba(107,82,232,0.45)",
    divider: "rgba(99,60,220,0.7)",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="rgba(180,130,255,0.85)" strokeWidth="1.8">
        <path d="M12 3l1.5 5h5l-4 3 1.5 5L12 13l-4 3 1.5-5-4-3h5z" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    num: "03",
    title: "Auto-Scaling Results",
    description:
      "Our autonomous agent manages your budget 24/7, killing losing ads and scaling winners to ensure you get the highest ROAS possible.",
    gradient: "linear-gradient(160deg, rgba(20,160,120,0.4), rgba(27,67,209,0.3) 50%, rgba(255,255,255,0.04))",
    inner: "#07121a",
    badge: "linear-gradient(135deg, #0e9e7a, #1B43D1)",
    badgeShadow: "rgba(14,158,122,0.45)",
    divider: "rgba(20,160,120,0.6)",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="rgba(80,220,170,0.85)" strokeWidth="1.8">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="17 6 23 6 23 12" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

function Steps() {
  return (
    <section className="relative overflow-hidden px-6 py-20" style={{ background: "#060b18", fontFamily: "'Sora', sans-serif" }}>
      {/* Glows */}
      <div className="pointer-events-none absolute left-1/2 top-[15%] h-[400px] w-[700px] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(27,67,209,0.22) 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute bottom-[5%] right-[10%] h-[300px] w-[300px] rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(99,60,220,0.12) 0%, transparent 70%)" }} />

      <div className="relative mx-auto max-w-[1100px]">
        {/* Eyebrow pill */}
        <div className="mb-5 flex justify-center">
          <span className="rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
            style={{ background: "rgba(61,84,196,0.18)", border: "1px solid rgba(61,84,196,0.45)", color: "#7b9ef8" }}>
            How it works
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-center text-[34px] font-bold leading-tight text-white sm:text-[44px]">
          Master Wheedle.ai in{" "}
          <span style={{ background: "linear-gradient(90deg, #0665ff 50%, #22d3ee 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            3 steps
          </span>
        </h2>

        <p className="mx-auto mt-4 max-w-[520px] text-center text-[20px] leading-[1.7]" style={{ color: "rgba(255,255,255,0.55)" }}>
          No expertise required. Our AI agents handle the heavy lifting while you focus on your business.
        </p>

        {/* Flow image */}
        <div className="mt-14">
          <img src={stepsFlowImage} alt="AI workflow visualization" className="w-full object-contain" />
        </div>

      {/* Cards row — 5-column grid: card / arrow / card / arrow / card */}
<div className="mt-4 grid gap-5 md:grid-cols-3">
  {steps.map((step) => (
    <div key={step.num} className="flex flex-col items-center">

      {/* Vertical arrow — matches screenshot style */}
      <div className="mb-1.5 flex flex-col items-center">
        <div className="w-[1.5px] h-9"
          style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.75))" }} />
        <div className="w-0 h-0 -mt-px"
          style={{
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "9px solid rgba(255,255,255,0.8)",
          }} />
      </div>

      {/* Card */}
<div key={step.num} className="rounded-[24px] p-[2px] transition-all duration-300 hover:-translate-y-1.5"
        style={{ background: step.gradient }}>
        <div className="h-full rounded-[22px] px-7 py-8" style={{ background: step.inner }}>                                                        
          <div className="mb-6 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] text-base font-bold text-white"
              style={{ background: step.badge, boxShadow: `0 6px 20px ${step.badgeShadow}` }}>
              {step.num}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px]"
              style={{ background: "rgba(61,84,196,0.12)", border: "1px solid rgba(61,84,196,0.25)" }}>
              {step.icon}
            </div>
          </div>
          <h3 className="mb-3 text-[19px] font-bold leading-tight text-white">{step.title}</h3>
          <div className="mb-4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${step.divider}, transparent)` }} />
          <p className="text-[14px] leading-[1.75]" style={{ color: "rgba(255,255,255,0.58)" }}>{step.description}</p>
        </div>
      </div>


    </div>
  ))}
</div>
      </div>
    </section>
  );
}

export default Steps;