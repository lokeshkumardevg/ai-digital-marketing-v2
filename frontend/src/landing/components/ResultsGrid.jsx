import researchImage from "../assets/images/research.png";
import targetingImage from "../assets/images/targeting.png";
import launchImage from "../assets/images/launch.png";
import analyticsImage from "../assets/images/analytics.png";

const steps = [
  {
    num: "Step 01",
    title: "Deep Research",
    desc: "Our AI analyzes your site and competitors to find high-intent audiences and winning angles.",
    img: researchImage,
    accent: { text: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/25" },
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
        <path d="M11 8v6M8 11h6"/>
      </svg>
    ),
    reverse: false,
  },
  {
    num: "Step 02",
    title: "Strategic Targeting",
    desc: "Stop wasting budget on wrong clicks. Reach the exact humans who are ready to buy.",
    img: targetingImage,
    accent: { text: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/25" },
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    ),
    reverse: true,
  },
  {
    num: "Step 03",
    title: "Instant Launch",
    desc: "Deploy multi-channel campaigns across Meta and Google in less than 60 seconds.",
    img: launchImage,
    accent: { text: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/25" },
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    reverse: false,
  },
  {
    num: "Step 04",
    title: "Revenue Growth Engine",
    desc: "Turn your marketing into a predictable growth system with autonomous optimization & scaling.",
    img: analyticsImage,
    accent: { text: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/25" },
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/>
        <path d="m19 9-5 5-4-4-3 3"/>
      </svg>
    ),
    reverse: true,
  },
];

export default function ResultsGrid() {
  return (
    <section className="relative py-28 bg-[#020617] overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-20 left-[-100px] w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-10 right-[-120px] w-[280px] h-[280px] bg-violet-500/20 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-[900px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-[3.5rem] font-bold text-white tracking-[-0.03em] leading-[1.1]">
            Results that{" "}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              never stop
            </span>
          </h2>
          <p className="mt-4 text-white/45 text-sm max-w-[360px] mx-auto leading-relaxed">
            Wheedle.ai powers every stage of your advertising growth loop with precision AI
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-6">
          {steps.map(({ num, title, desc, img, accent, icon, reverse }) => (
            <div
              key={num}
              className={`
                group relative flex items-center gap-8 p-8
                rounded-[22px]
                bg-white/[0.04] backdrop-blur-xl
                border border-white/[0.08]
                shadow-[0_10px_40px_rgba(0,0,0,0.25)]
                transition-all duration-500 ease-out
                hover:scale-[1.02]
                hover:bg-white/[0.06]
                hover:border-white/[0.2]
                hover:shadow-[0_20px_60px_rgba(0,0,0,0.45)]
                ${reverse ? "flex-row-reverse" : "flex-row"}
                max-md:flex-col max-md:items-start
              `}
            >
              {/* Gradient glow overlay */}
              <div className="absolute inset-0 rounded-[22px] opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none bg-gradient-to-r from-blue-500/20 via-violet-500/20 to-teal-500/20 blur-xl" />

              {/* Shine sweep */}
              <div className="absolute inset-0 overflow-hidden rounded-[22px]">
                <div className="absolute -left-[120%] top-0 h-full w-[120%] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] group-hover:left-[120%] transition-all duration-1000" />
              </div>

              {/* Icon box */}
              <div
                className={`
                  shrink-0 w-24 h-24 rounded-[18px] border flex items-center justify-center
                  backdrop-blur-md
                  ${accent.bg}
                  transition-all duration-300
                  group-hover:scale-110
                  group-hover:rotate-3
                `}
              >
                {icon}
              </div>

              {/* Divider */}
              <div className="w-px h-[60px] bg-white/[0.08] shrink-0 max-md:hidden" />

              {/* Text */}
              <div className="flex-1">
                <p className={`text-[11px] font-bold tracking-[0.1em] uppercase mb-2 ${accent.text}`}>
                  {num}
                </p>
                <h3 className="text-white text-xl font-bold tracking-[-0.02em] mb-2 transition-all duration-300 group-hover:translate-x-1">
                  {title}
                </h3>
                <p className="text-white/50 text-sm leading-[1.7] max-w-[420px]">
                  {desc}
                </p>
              </div>

              {/* Image */}
              <div
                className={`
                  relative shrink-0 w-[200px] h-[130px] rounded-[14px]
                  bg-white/[0.04] border border-white/[0.08]
                  overflow-hidden
                  ${reverse ? "mr-auto" : "ml-auto"}
                  max-md:w-full max-md:mx-0
                `}
              >
                <img
                  src={img}
                  alt={title}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                />
                {/* Glass overlay */}
                {/* <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px]" /> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}