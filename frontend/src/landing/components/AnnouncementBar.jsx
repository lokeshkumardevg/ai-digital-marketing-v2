// src/landing/components/AnnouncementBar.jsx
// Spec Section 12.1 #1: "Short news line... Dismissible bar."
// Remembers dismissal in localStorage (per-browser, non-sensitive) so it doesn't
// reappear on every visit.
import { useEffect, useState } from "react";
import { X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "wheedle_announcement_dismissed_v1";

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
    <div className="relative z-40 flex items-center justify-center gap-3 bg-gradient-to-r from-[#1468e8] to-[#1abfdf] px-4 py-2.5 text-center text-sm font-medium text-white">
      <Link to="/agent-ecosystem" className="flex items-center gap-1.5 hover:underline">
        New — meet your 4 AI coworkers: Max, Stella, Atlas &amp; Echo
        <ArrowRight size={14} />
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 rounded-full p-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export default AnnouncementBar;