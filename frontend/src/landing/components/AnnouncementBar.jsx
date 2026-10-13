// src/landing/components/AnnouncementBar.jsx
// Spec Section 12.1 #1: "Short news line... Dismissible bar."
// Remembers dismissal in localStorage (per-browser, non-sensitive) so it doesn't
// reappear on every visit.
// Shows the four coworker avatars (overlapping) next to the news line.
import { useEffect, useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "wheedle_announcement_dismissed_v1";

// Same mascots as Coworkers.jsx — keep in sync
const COWORKER_AVATARS = [
  { name: "Max", src: "/assets/mascots/aarav_HD.png" },
  { name: "Stella", src: "/assets/mascots/meera_HD.png" },
  { name: "Atlas", src: "/assets/mascots/rohan_HD.png" },
  { name: "Echo", src: "/assets/mascots/kavi_HD.png" },
];

function AnnouncementBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") setVisible(true);
    } catch {
      setVisible(true); // storage blocked (private mode etc.) — just show it
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  if (!visible) return null;

  return (
    <div className="relative z-40 flex items-center justify-center gap-3 bg-gradient-to-r from-[#1468e8] to-[#1abfdf] pl-4 pr-11 text-center text-xs font-medium text-white sm:px-12 sm:py-2.5 sm:text-sm">
      <Link to="/agent-ecosystem" className="flex items-center gap-2.5 hover:underline">
        {/* overlapping coworker avatars (decorative — names are in the text) */}
        <span aria-hidden="true" className="flex flex-shrink-0 items-center">
          {COWORKER_AVATARS.map(({ name, src }, i) => (
            <span
              key={name}
              className={`h-6 w-6 overflow-hidden rounded-full bg-gradient-to-b from-[#e8f1fb] to-[#cfe0f3] ring-2 ring-white sm:h-7 sm:w-7 ${i > 0 ? "-ml-2" : ""}`}
              style={{ zIndex: COWORKER_AVATARS.length - i }}
            >
              <img src={src} alt="" className="h-full w-full object-cover object-top" draggable={false} />
            </span>
          ))}
        </span>

        <span className="text-left sm:text-center">
          New — meet your 4 AI coworkers: Max, Stella, Atlas &amp; Echo
        </span>
        <ArrowRight size={14} className="flex-shrink-0" />
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white sm:right-3"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export default AnnouncementBar;