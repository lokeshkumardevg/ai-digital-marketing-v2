import aiBotImage from '../assets/images/ai-bot.png';

function ContactForm() {
  return (
    <section className="section-shell py-24">
      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,20,60,0.95),rgba(5,10,30,0.98))] px-6 py-12 shadow-[0_20px_80px_rgba(59,91,255,0.25)] sm:px-10 lg:px-16">

        {/* Glow Effects */}
        <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-primary/30 blur-[120px]" />
        <div className="pointer-events-none absolute right-0 top-0 h-60 w-60 rounded-full bg-accent/20 blur-[120px]" />

        <div className="relative grid items-center gap-12 lg:grid-cols-[0.75fr_1.25fr]">

          {/* LEFT IMAGE */}
          <div className="flex justify-center lg:justify-start">
            <img
              src={aiBotImage}
              alt="AI Bot"
              className="max-h-[440px] w-auto object-contain drop-shadow-[0_0_40px_rgba(80,120,255,0.35)] transition duration-500 hover:scale-105"
            />
          </div>

          {/* RIGHT FORM */}
          <div className="max-w-[720px]">
            <h2 className="text-3xl font-semibold text-white sm:text-2xl">
              See How Our AI Can Grow Your Business
            </h2>

            <p className="mt-4 text-white/70 text-lg leading-8">
              Book a free live demo  
              <span className="text-primary font-medium"> no commitment, no pressure.</span>
            </p>

            <form className="mt-10 space-y-5">

              {/* INPUT FIELD */}
              {[
                "Company / Business Name",
                "Contact Person Name",
              ].map((placeholder, index) => (
                <div key={index} className="relative">
                  <input
                    type="text"
                    placeholder=" "
                    className="peer h-14 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white backdrop-blur-md outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                  <label className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/60 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary">
                    {placeholder}
                  </label>
                </div>
              ))}

              <div className="grid gap-5 sm:grid-cols-2">
                {["WhatsApp Number", "Email ID"].map((placeholder, index) => (
                  <div key={index} className="relative">
                    <input
                      type={index === 0 ? "tel" : "email"}
                      placeholder=" "
                      className="peer h-14 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-white backdrop-blur-md outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
                    />
                    <label className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/60 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary">
                      {placeholder}
                    </label>
                  </div>
                ))}
              </div>

              {/* BUTTON */}
              <button className="group relative mx-auto mt-6 block w-full max-w-[260px] overflow-hidden rounded-xl bg-gradient-to-r from-[#3B5BFF] to-[#6C8CFF] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_40px_rgba(60,90,255,0.6)] transition-all duration-300 hover:scale-105">
                
                <span className="relative z-10">Get Free Demo</span>

                {/* Animated Shine */}
                <span className="absolute left-[-100%] top-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-700 group-hover:left-[100%]" />
              </button>

            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactForm;