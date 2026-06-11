import React from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
// -----campaign ------------

function LaunchCTA() {
  return (
    <section className="relative overflow-hidden py-32 bg-[#050a12]">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[900px] h-[900px] rounded-full bg-blue-700/20 blur-[140px]" />
      </div>

      {/* Circular Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[700px] h-[700px] rounded-full border border-white/[0.04]" />
        <div className="absolute w-[500px] h-[500px] rounded-full border border-white/[0.04]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Heading */}
        <h2 className="text-[52px] md:text-[72px] font-bold leading-[1.1] tracking-[-0.04em]">
          <span className="block text-white">
            Ready to launch
          </span>

          <span className="block bg-[linear-gradient(180deg,#ffffff_0%,#cfd5ff_45%,#8b93ff_100%)] bg-clip-text text-transparent">
            Smarter Campaigns?
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mt-8 text-lg text-white/70 max-w-2xl mx-auto">
          Generate your first AI-powered advertising strategy in minutes
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
          <Link to="/start-trial">
            <Button size="lg">
              Start 3-days trial for free
            </Button>
          </Link>

          <Link to="/demo">
            <Button variant="secondary" size="lg">
              Watch live demo
            </Button>
          </Link>
        </div>

        {/* Bottom Text */}
        <p className="mt-10 text-white/75 text-lg leading-relaxed">
          Join 1,000+ businesses using Wheedle to plan, launch, and optimize
          winning ad campaigns
          <br />
          <span className="text-white/55">
            3 days free trial • No credit card required
          </span>
        </p>
      </div>
    </section>
  );
}

export default LaunchCTA;