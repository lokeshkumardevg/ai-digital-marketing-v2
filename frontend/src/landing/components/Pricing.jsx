import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Starter",
    price: "1,599",
    features: [
      "1 Platform (Meta or Google)",
      "AI Ad Copy Generation",
      "Daily Performance Report",
      "Up to ₹50K Ad Spend",
      "DigiMarketer Access",
    ],
    button: "Start Free Trial",
  },
  {
    name: "Growth",
    price: "2,999",
    features: [
      "Multi-Channel (All Platforms)",
      "AI Image & Creative Lab",
      "Real-time Dashboards",
      "AI Sale Bot Integration",
      "Up to ₹2L Ad Spend",
      "DigiMarketer + AI Website",
    ],
    button: "Get Started Now",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "5,999",
    features: [
      "Unlimited Accounts & Platforms",
      "24/7 Dedicated Support",
      "Custom AI Workflows",
      "AI Sale Bot + AI Website",
      "Unlimited Ad Spend",
      "Full DigiMarketer Suite",
      "Priority Onboarding",
    ],
    button: "Contact Sales",
  },
];

const CheckIcon = () => (
  <span className="text-white text-[12px] mt-[2px]">✔</span>
);

function PricingCard({ tier }) {
  const isCenter = tier.highlighted;

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-[14px] overflow-hidden transition-all duration-500 ease-out
      hover:-translate-y-3 hover:scale-[1.02]
      ${
        isCenter
          ? "z-20 min-h-[550px] border border-[#5B6CFF]/60 translate-y-[20px] hover:shadow-[0_25px_80px_rgba(91,108,255,0.35)]"
          : "z-10 h-[480px] border border-[#2E3EA6]/40 hover:border-[#5B6CFF]/60 hover:shadow-[0_20px_60px_rgba(59,91,255,0.25)]"
      }`}
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[#020617]" />

      {/* HOVER GLOW */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-[radial-gradient(circle_at_50%_100%,rgba(88,101,255,0.25),transparent_60%)] blur-[60px]" />

      {/* SHINE EFFECT */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700">
        <div className="absolute -left-[100%] top-0 h-full w-[60%] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] group-hover:left-[120%] transition-all duration-1000" />
      </div>

      {/* CENTER SPECIAL EFFECTS */}
      {isCenter && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_85%,rgba(88,101,255,0.45),transparent_60%)] blur-[60px]" />
          <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:60px_60px]" />
        </>
      )}

      <div className="relative flex flex-col h-full p-6">
        {/* TITLE */}
        <h3 className="text-center text-white text-[22px] font-medium">
          {tier.name}
        </h3>

        {/* PRICE */}
        <div className="text-center mt-2">
          <span
            className={`${
              isCenter ? "text-[38px]" : "text-[30px]"
            } text-white font-semibold`}
          >
            ₹{tier.price}
          </span>
          <span className="text-white/60 text-sm ml-1">/mo</span>
        </div>

        <p className="text-center text-[11px] text-white/40 mt-1">
          + GST applicable
        </p>

        {/* DIVIDER */}
        <div className="h-px bg-white/10 my-5" />

        {/* FEATURES */}
        <div className="flex-1 space-y-2 px-6">
          {tier.features.map((f) => (
            <div
              key={f}
              className="flex gap-2 text-[13px] text-white/85 transition-all duration-300 group-hover:translate-x-1"
            >
              <CheckIcon />
              {f}
            </div>
          ))}
        </div>

        {/* BUTTON */}
        <button
          className={`mt-10 h-[36px] rounded-[8px] text-[13px] font-medium transition-all duration-300
          hover:scale-[1.05] active:scale-[0.98]
          ${
            isCenter
              ? "bg-gradient-to-b from-[#3B5BFF] to-[#1C2FAF] shadow-[0_10px_30px_rgba(60,90,255,0.6)] hover:shadow-[0_15px_40px_rgba(60,90,255,0.9)]"
              : "bg-white/10 border border-white/20 backdrop-blur hover:bg-white/20 hover:border-white/40"
          }`}
        >
          {tier.button}
        </button>
      </div>
    </div>
  );
}

export default function Pricing() {
  return (
    <section className="relative bg-black py-28 px-6 overflow-hidden">
      {/* MAIN GLOW */}
      <div className="absolute left-1/2 top-[65%] w-[600px] h-[400px] -translate-x-1/2 bg-[#3A22FF]/30 blur-[140px]" />

      <div className="max-w-6xl mx-auto text-center relative">
        {/* HEADING */}
        <h2 className="text-[52px] font-semibold text-white leading-tight">
          Made Just for Your Business
        </h2>

        <p className="mt-5 text-white/70 max-w-xl mx-auto text-[15px]">
          Transparent Indian pricing - simple, affordable,
          <br />
          and built to scale your brand with AI.
        </p>

        {/* CARDS */}
        <div className="mt-20 grid lg:grid-cols-3 gap-3 items-center">
          {/* LEFT */}
          <div className="translate-y-10">
            <PricingCard tier={tiers[0]} />
          </div>

          {/* CENTER */}
          <div className="scale-[1.05]">
            <PricingCard tier={tiers[1]} />
          </div>

          {/* RIGHT */}
          <div className="translate-y-10">
            <PricingCard tier={tiers[2]} />
          </div>
        </div>
      </div>
    </section>
  );
}