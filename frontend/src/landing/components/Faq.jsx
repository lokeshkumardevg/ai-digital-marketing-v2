import { useState, useEffect, useRef } from "react";
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

export default function FAQ({ faqs = defaultFaqs, title } = {}) {
  const [open, setOpen] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const sectionRef = useRef(null);

  // Reveal once when the section scrolls into view (observer is removed after the first hit)
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setReduceMotion(true);
      setIsVisible(true);
      return;
    }

    const el = sectionRef.current;
    if (!el) return;

    // Old browsers without IntersectionObserver: just show everything
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const t = (value) => (reduceMotion ? "none" : value);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-14 sm:py-20 lg:py-24"
      style={{ backgroundColor: "#050a12" }}
    >
      {/* Bottom-right radial blue glow */}
      <div
        className="pointer-events-none absolute -bottom-20 -right-20 h-[320px] w-[320px] rounded-full sm:h-[520px] sm:w-[520px] lg:h-[700px] lg:w-[700px]"
        style={{
          background:
            "radial-gradient(circle, rgba(29,78,216,0.38) 0%, transparent 70%)",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0.8)",
          transition: t("opacity 1.2s ease-out 0.3s, transform 1.2s ease-out 0.3s"),
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
        {/* Heading */}
        <h2
          className="mb-8 bg-gradient-to-r from-white via-[#e8eaff] to-[#60a5fa] bg-clip-text text-center text-3xl font-semibold leading-tight tracking-tight text-transparent sm:mb-12 sm:text-4xl md:text-5xl lg:mb-14"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(-30px)",
            transition: t("opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s"),
          }}
        >
          {title || "Frequently asked questions"}
        </h2>

        {/* FAQ List */}
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {faqs.map((item, index) => {
            const isOpen = open === index;
            const delay = 0.3 + index * 0.12;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;

            return (
              <div
                key={index}
                className="flex items-stretch overflow-hidden rounded-lg"
                style={{
                  border: "1px solid rgba(6,182,212,0.2)",
                  background: "rgba(0,0,0,0.55)",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateX(0)" : "translateX(-40px)",
                  transition: t(
                    `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`
                  ),
                }}
              >
                {/* Left: question + answer */}
                <div className="min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6">
                  <button
                    id={buttonId}
                    type="button"
                    onClick={() => setOpen(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="flex w-full items-start gap-4 text-left sm:gap-8 md:gap-10"
                  >
                    {/* Number */}
                    <span className="w-7 shrink-0 pt-0.5 text-sm font-light text-white/85 sm:w-9 sm:text-lg">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Question */}
                    <span className="min-w-0 flex-1 break-words text-base font-light leading-snug text-white sm:text-lg md:text-xl">
                      {item.q}
                    </span>
                  </button>

                  {/* Animated answer (aligned under the question text) */}
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`grid pl-11 transition-all duration-500 ease-in-out sm:pl-[68px] md:pl-[76px] ${
                      isOpen
                        ? "mt-3 grid-rows-[1fr] opacity-100 sm:mt-4"
                        : "mt-0 grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="break-words text-sm leading-relaxed text-white/55 sm:text-[15px] sm:leading-[1.85]">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: toggle block (decorative, clicking it also toggles) */}
                <div
                  aria-hidden="true"
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="flex w-12 shrink-0 cursor-pointer items-center justify-center transition-all duration-300 sm:w-16 md:w-20"
                  style={{
                    background: isOpen
                      ? "linear-gradient(to bottom, #3b82f6, #22d3ee)"
                      : "#1a2530",
                  }}
                >
                  {isOpen ? (
                    <Minus className="h-5 w-5 text-white sm:h-6 sm:w-6 md:h-7 md:w-7" />
                  ) : (
                    <Plus className="h-5 w-5 text-white sm:h-6 sm:w-6 md:h-7 md:w-7" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}