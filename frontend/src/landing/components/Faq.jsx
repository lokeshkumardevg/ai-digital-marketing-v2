import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const defaultFaqs = [
  {
    q: "How does Wheedle.ai automate my advertising campaigns?",
    a: "Wheedle.ai uses advanced AI models to analyze your brand, competitors, and audience data, then autonomously generates creatives, writes ad copy, sets targeting parameters, and continuously optimizes bids.",
  },
  {
    q: "Which platforms does Wheedle.ai support?",
    a: "We currently support Meta, Google Ads, LinkedIn, WhatsApp and many other platforms from a unified dashboard.",
  },
  {
    q: "Do I need marketing experience to use Wheedle.ai?",
    a: "No. The platform is built for businesses of all sizes and requires no technical or marketing expertise.",
  },
  {
    q: "How is my data kept secure?",
    a: "We use enterprise-grade encryption, secure cloud infrastructure, and strict access controls to protect your data.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes. You can upgrade, downgrade, or cancel your subscription whenever you want.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section
      className="relative py-24 overflow-hidden"
      style={{ backgroundColor: "#050a12" }}
    >
      {/* Bottom-right radial blue glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-80px",
          right: "-80px",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(29,78,216,0.38) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-6">
        {/* Heading */}
<h2
  className="
    text-center
    font-semibold
    mb-14
    bg-gradient-to-r
    from-white
    via-[#e8eaff]
    to-[#8b93ff]
    bg-clip-text
    text-transparent
  "
  style={{
    fontSize: "52px",
    letterSpacing: "-0.5px",
  }}
>
  Frequently asked questions
</h2>

        {/* FAQ List */}
        <div className="flex flex-col gap-3">
          {defaultFaqs.map((item, index) => {
            const isOpen = open === index;

            return (
              <div
                key={index}
                className="overflow-hidden"
                style={{
                  borderRadius: "8px",
                  border: "1px solid rgba(6,182,212,0.2)",
                  background: "rgba(0,0,0,0.55)",
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="w-full flex items-stretch"
                >
                  {/* Left content */}
                  <div className="flex-1 flex items-start gap-10 px-8 py-6 text-left">
                    {/* Number */}
                    <span
                      className="font-light"
                      style={{
                        color: "rgba(255,255,255,0.85)",
                        fontSize: "18px",
                        minWidth: "36px",
                        paddingTop: "2px",
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Question + Answer */}
                    <div className="flex-1">
                      <h3
                        className="text-white font-light"
                        style={{ fontSize: "20px", lineHeight: "1.4" }}
                      >
                        {item.q}
                      </h3>

                      {/* Animated answer */}
                      <div
                        className={`grid transition-all duration-500 ease-in-out ${
                          isOpen
                            ? "grid-rows-[1fr] opacity-100 mt-4"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p
                            style={{
                              color: "rgba(255,255,255,0.55)",
                              fontSize: "15px",
                              lineHeight: "1.85",
                            }}
                          >
                            {item.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toggle button */}
                  <div
                    className="flex items-center justify-center transition-all duration-300"
                    style={{
                      width: "80px",
                      flexShrink: 0,
                      background: isOpen
                        ? "linear-gradient(to bottom, #3b82f6, #22d3ee)"
                        : "#1a2530",
                    }}
                  >
                    {isOpen ? (
                      <Minus size={28} className="text-white" />
                    ) : (
                      <Plus size={28} className="text-white" />
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}