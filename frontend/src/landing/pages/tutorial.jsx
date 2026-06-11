import React from "react";
import Navbar from "../components/Navbar";
import LaunchCTA from "../components/LaunchCTA";
import FAQ from "../components/FAQ";
import ContactForm from "../components/ContactForm";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";

export default function Tutorial() {
  return (
    <div className="bg-black min-h-screen overflow-hidden">
      <Navbar />

      {/* ================= HERO VIDEO SECTION ================= */}
      <section className="relative pt-24 pb-20">
        {/* Background Glow */}
        <div className="absolute inset-0 flex justify-center pointer-events-none">
          <div className="w-[800px] h-[500px] bg-blue-700/15 blur-[150px] rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6">
          {/* Heading */}
<h2 className="text-center text-white text-[22px] md:text-[32px] font-semibold mb-5">
  From Setup to Scale - Learn Every Step
</h2>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-center text-white/60 text-sm md:text-base mb-12">
            Whether you're new to digital advertising or an experienced
            marketer, our tutorials provide everything you need to understand
            Wheedle.ai and maximize your campaign success.
          </p>

          {/* Video Container */}
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-xl border-[4px] border-cyan-400 overflow-hidden shadow-[0_0_60px_rgba(0,180,255,0.25)]">
              <div className="bg-[#071237] p-6">
                <div className="relative rounded-lg overflow-hidden">
                  {/* Video Thumbnail */}
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200"
                    alt="Tutorial Video"
                    className="w-full object-cover"
                  />

                  {/* Play Button */}
                  <button className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <svg
                        width="30"
                        height="30"
                        fill="white"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>

              {/* Laptop Base */}
              <div className="h-4 bg-gradient-to-r from-gray-300 via-white to-gray-300" />
            </div>
          </div>
        </div>
      </section>

      {/* Reusable Sections */}
      <LaunchCTA />
      <FAQ />
      <ContactForm />
      <Newsletter />
      <Footer />
    </div>
  );
}