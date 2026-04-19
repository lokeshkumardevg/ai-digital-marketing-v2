import ringImage from "../assets/images/Visual.png";
import dashboardImage from "../assets/images/Visualreports1.png";
import graphImage1 from "../assets/images/Visualreports3.png";

function Verticals() {
  return (
    <section className="relative overflow-hidden px-6 py-24">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-[#1B43D1]/25 blur-[120px]" />

      <div className="relative mx-auto max-w-[1180px]">
        <h2 className="text-center text-[42px] font-semibold leading-none text-white sm:text-[52px]">
          Verticals
        </h2>

        <p className="mx-auto mt-6 max-w-[760px] text-center text-[28px] leading-[1.35] text-white">
          Whether you’re a local store or a global brand, we have a
          <br className="hidden sm:block" />
          specialised AI agent for every business.
        </p>

        <div className="mt-14 grid gap-4 lg:grid-cols-[0.9fr_1.6fr]">
          {/* Left card */}
          <div className="relative overflow-hidden rounded-[12px] border border-white/10 bg-[#050816]/90 group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(59,91,255,0.25)]">

            <div className="flex min-h-[380px] flex-col justify-between p-5">

              {/* Image */}
              <div className="flex flex-1 items-center justify-center relative">

                {/* Glow behind ring */}
                <div className="absolute w-[180px] h-[180px] bg-blue-600/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition duration-500" />

                <img
                  src={ringImage}
                  alt="Shopify Store"
                  className="h-auto w-[75%] max-w-[220px] object-contain
        transition-all duration-700
        group-hover:rotate-[20deg] group-hover:scale-110
        animate-float"
                />
              </div>

              {/* Text */}
              <div className="mt-4">
                <h3 className="text-[16px] font-medium text-white group-hover:text-blue-400 transition">
                  Shopify Store
                </h3>
                <p className="mt-2 max-w-[240px] text-[13px] leading-[1.6] text-white/60">
                  Sync your catalog and let AI generate high-converting Meta
                  product ads instantly.
                </p>
              </div>

            </div>
          </div>

          {/* Right card */}
          <div className="relative overflow-hidden rounded-[10px] border border-white/10 bg-[#050816]/90">
            <img
              src={dashboardImage}
              alt="Local Service dashboard"
              className="h-full min-h-[405px] w-full object-cover"
            />

            <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-[#0B1024] via-[#0B1024]/85 to-transparent" />

            <div className="absolute bottom-6 left-6 z-10">
              <h3 className="text-[18px] font-medium text-white">
                Local Service
              </h3>
              <p className="mt-3 max-w-[420px] text-[14px] leading-[1.7] text-white/60">
                Rank higher locally and capture leads with
                <br className="hidden sm:block" />
                AI-optimized Google Search Ads.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom centered card */}
        <div className="mx-auto mt-6 max-w-[65%]">
          <div className="relative overflow-hidden rounded-[14px] border border-white/10 bg-[#050816]/90 p-5 group transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(59,91,255,0.25)]">

            {/* Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition duration-500" />

            {/* GRAPH */}
            <div className="relative h-[170px] flex items-end gap-2 z-10">

              {[40, 60, 45, 80, 65, 95, 75].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-all duration-500 group-hover:scale-y-110 hover:brightness-125"
                  style={{
                    height: `${h}%`,
                    animation: `growBar 0.8s ease forwards`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}

              {/* Line */}
              <div className="absolute inset-0 pointer-events-none">
                <svg className="w-full h-full opacity-80 group-hover:opacity-100 transition">
                  <polyline
                    fill="none"
                    stroke="rgba(99,102,241,0.9)"
                    strokeWidth="2"
                    points="0,140 60,100 120,120 180,70 240,95 300,40 360,80"
                  />
                </svg>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 flex justify-between text-white z-10 relative">
              <div className="text-center">
                <p className="text-[18px] font-semibold group-hover:text-blue-400 transition">+240%</p>
                <p className="text-[10px] text-white/50">Growth</p>
              </div>
              <div className="text-center">
                <p className="text-[18px] font-semibold group-hover:text-blue-400 transition">3.2x</p>
                <p className="text-[10px] text-white/50">ROI</p>
              </div>
              <div className="text-center">
                <p className="text-[18px] font-semibold group-hover:text-blue-400 transition">89%</p>
                <p className="text-[10px] text-white/50">Conversion</p>
              </div>
            </div>

            {/* Text */}
            <div className="mt-4">
              <h3 className="text-[16px] font-medium text-white group-hover:text-blue-400 transition">
                SaaS and Tech
              </h3>
              <p className="mt-2 max-w-[300px] text-[13px] leading-[1.6] text-white/60">
                Build scalable growth loops for your
                recurring revenue with precision targeting.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default Verticals;