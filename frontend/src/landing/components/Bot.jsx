export default function BotSVG() {
  return (
    <>
      <style>{`
        @keyframes eyeBlink {
          0%, 88%, 100% { transform: scaleY(1); }
          93%            { transform: scaleY(0.07); }
        }
        .bot-eye-left {
          transform-origin: 136px 221px;
          animation: eyeBlink 3.5s ease-in-out infinite;
        }
        .bot-eye-right {
          transform-origin: 243px 221px;
          animation: eyeBlink 3.5s ease-in-out infinite 0.12s;
        }
      `}</style>

      <svg
        width="160"
        height="182"
        viewBox="0 0 380 415"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        {/* Body glow ellipse */}
        <ellipse cx="190" cy="231" rx="190" ry="184" fill="url(#p0)" />

        {/* Head shell */}
        <rect
          x="34" y="122" width="312" height="217" rx="97"
          fill="url(#p1)" stroke="url(#p2)" strokeWidth="10"
        />

        {/* Dark inner face */}
        <rect x="55" y="138" width="270" height="185" rx="92.5" fill="#080811" />

        {/* Left eye */}
        <rect
          className="bot-eye-left"
          x="113" y="190" width="46" height="63" rx="23"
          fill="url(#p3)"
        />

        {/* Right eye */}
        <rect
          className="bot-eye-right"
          x="220" y="190" width="46" height="63" rx="23"
          fill="url(#p4)"
        />

        <defs>
          <linearGradient id="p0" x1="87.2554" y1="79.5" x2="311.464" y2="372.998" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FCFDFD" />
            <stop offset="1" stopColor="#AEBEE4" />
          </linearGradient>

          <linearGradient id="p1" x1="62.5" y1="163" x2="307" y2="313" gradientUnits="userSpaceOnUse">
            <stop stopColor="#01E7FF" />
            <stop offset="0.5" stopColor="#0275FF" />
            <stop offset="1" stopColor="#612DF7" />
          </linearGradient>

          <linearGradient id="p2" x1="190" y1="127" x2="190" y2="334" gradientUnits="userSpaceOnUse">
            <stop stopColor="#B1D6F9" />
            <stop offset="1" stopColor="#D3E1FB" />
          </linearGradient>

          <linearGradient id="p3" x1="136" y1="190" x2="136" y2="253" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9FF85F" />
            <stop offset="0.5" stopColor="#6EDEBE" />
            <stop offset="0.75" stopColor="#54AAFA" />
            <stop offset="1" stopColor="#694CF5" />
          </linearGradient>

          <linearGradient id="p4" x1="243" y1="190" x2="243" y2="253" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9FF85F" />
            <stop offset="0.5" stopColor="#6EDEBE" />
            <stop offset="0.75" stopColor="#54AAFA" />
            <stop offset="1" stopColor="#694CF5" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
}