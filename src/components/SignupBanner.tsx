"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface SignupBannerProps {
  onJoinClick: () => void;
}

const STORAGE_KEY = "cws_banner_dismissed";
const DELAY_MS = 10_000; // 10 seconds

const SignupBanner = ({ onJoinClick }: SignupBannerProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  const handleJoin = () => {
    dismiss();
    onJoinClick();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-fade-in-up">
      <div className="bg-card border border-border rounded-2xl shadow-xl px-6 py-4 flex items-center gap-4">
        {/* Icon */}
        <span className="text-2xl shrink-0">🌸</span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-body font-semibold text-foreground text-sm leading-snug">
            Join Colorado Women in STEM
          </p>
          <p className="font-body text-muted-foreground text-xs mt-0.5 leading-snug">
            Connect with women in STEM across Denver — events, mentorship & more.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleJoin}
          className="shrink-0 bg-secondary text-secondary-foreground font-body font-semibold text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          Join CWS
        </button>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default SignupBanner;
