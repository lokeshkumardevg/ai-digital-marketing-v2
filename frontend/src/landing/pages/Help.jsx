import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';

const categories = [
  {
    icon: "📖",
    title: "Getting Started",
    description:
      "Set up essentials before launching your first ad.",
    articles: 10,
  },
  {
    icon: "⚡",
    title: "AI Creatives",
    description:
      "Generate ad copy, images, and videos using AI.",
    articles: 10,
  },
  {
    icon: "🎚️",
    title: "Support",
    description:
      "Troubleshooting common issues and questions.",
    articles: 10,
  },
  {
    icon: "📄",
    title: "Help Articles",
    description:
      "Guides for using WheedleAI features and tools.",
    articles: 10,
  },
];

export default function Help() {
  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at center,#09123d 0%,#020617 45%,#000 100%)",
      }}
    >
      <Navbar />

      {/* Hero */}
<section className="relative pt-28 pb-24 overflow-hidden bg-black">
  {/* Purple Glow */}
  <div className="absolute inset-0 flex justify-center pointer-events-none">
    <div className="w-[900px] h-[400px] bg-blue-700/20 blur-[120px] rounded-full mt-24" />
  </div>

  <div className="relative max-w-7xl mx-auto px-6">
    {/* Heading */}
    <h1 className="text-center text-white font-medium text-[28px] md:text-[42px] tracking-[-0.03em] mb-12">
      Where Curiosity Meets Genius: The Wheedle.ai Edition
    </h1>

    {/* Search */}
    <div className="max-w-5xl mx-auto mb-20">
      <div className="h-[72px] rounded-full border border-cyan-300/60 bg-[#1c2230]/90 backdrop-blur-md flex items-center px-6 shadow-[0_0_40px_rgba(124,58,237,0.25)]">
        {/* Search Icon */}
        <svg
          className="w-7 h-7 text-white/80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>

        <input
          type="text"
          placeholder="Search for articles..."
          className="flex-1 bg-transparent px-6 text-white text-2xl outline-none placeholder:text-white/35"
        />

        {/* Send Icon */}
        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
        </button>
      </div>
    </div>

    {/* Category Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {[
        {
          icon: "📖",
          title: "Getting Started",
          desc: "Set up essentials before launching your first ad.",
        },
        {
          icon: "⚡",
          title: "AI Creatives",
          desc: "Generate ad copy, images, and videos using AI.",
        },
        {
          icon: "🔧",
          title: "Support",
          desc: "Troubleshooting common issues and questions.",
        },
        {
          icon: "📄",
          title: "Help Articles",
          desc: "Guides for using WheedleAI features and tools.",
        },
      ].map((card) => (
        <div
          key={card.title}
          className="
            group
            rounded-xl
            border border-white/10
            bg-black/60
            backdrop-blur-sm
            p-8
            text-center
            transition-all
            duration-300
            hover:border-cyan-400/40
            hover:-translate-y-1
          "
        >
          <div className="text-4xl mb-6">{card.icon}</div>

          <h3 className="text-white text-2xl font-semibold mb-4">
            {card.title}
          </h3>

          <p className="text-white/60 text-sm leading-relaxed min-h-[48px]">
            {card.desc}
          </p>

          <div className="mt-6 pt-4 border-t border-white/10 flex justify-between text-xs text-white/40">
            <span>By WheedleAI</span>
            <span>10 articles</span>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* Reusable Components */}
      <Newsletter />
      <Footer />
    </div>
  );
}