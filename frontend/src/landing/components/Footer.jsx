const footerGroups = {
  Product: ['AI Agents', 'Deep Research', 'AI Setup Bot', 'AI Studio', 'Workflows'],
  Company: ['About us', 'Careers', 'Blog', 'Contact'],
  Community: ['X/Twitter', 'LinkedIn', 'Discord', 'Documentation'],
};

function SocialIcon({ children }) {
  return (
    <a
      href="/"
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-white transition hover:border-primary/40 hover:text-white"
      onClick={(e) => e.preventDefault()}
    >
      {children}
    </a>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 pb-8 pt-16">
      <div className="section-shell">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h3 className="text-[30px] font-extrabold tracking-tight text-white">Wheedle.ai</h3>
            <p className="mt-5 max-w-[360px] text-sm leading-7 text-white">
            We're building the future of automated commerce. Wheedle.ai uses state-of-the-art Generative AI to manage world-class marketing for brands of all sizes.

            </p>

            <div className="mt-6 flex gap-3">
              <SocialIcon>
                <span className="text-xs font-bold">in</span>
              </SocialIcon>
              <SocialIcon>
                <span className="text-xs font-bold">X</span>
              </SocialIcon>
              <SocialIcon>
                <span className="text-xs font-bold">f</span>
              </SocialIcon>
              <SocialIcon>
                <span className="text-xs font-bold">▶</span>
              </SocialIcon>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {Object.entries(footerGroups).map(([title, links]) => (
              <div key={title}>
                <p className="text-sm font-semibold text-white">{title}</p>
                <ul className="mt-4 space-y-3 text-sm text-white">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="/" onClick={(e) => e.preventDefault()} className="transition hover:text-white">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-[#203387] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Wheedle Technologies Inc. All rights reserved. Built with ❤️ for Indian brands.</p>
          <div className="flex gap-5">
            <a href="/" onClick={(e) => e.preventDefault()} className="hover:text-white">Terms</a>
            <a href="/" onClick={(e) => e.preventDefault()} className="hover:text-white">Privacy</a>
            <a href="/" onClick={(e) => e.preventDefault()} className="hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
