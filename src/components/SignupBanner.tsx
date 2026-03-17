"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface SignupBannerProps {
  onJoinClick: () => void;
}

const STORAGE_KEY = "cws_banner_dismissed";
const DELAY_MS = 7_000;

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
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center animate-fade-in-up">
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">

        {/* Flower decorations */}
        <Image
          src="/flower2.webp"
          alt=""
          width={56}
          height={56}
          aria-hidden="true"
          className="absolute -bottom-2 left-6 w-14 h-14 object-contain opacity-50 rotate-[15deg] pointer-events-none select-none"
        />
        <Image
          src="/flower3.webp"
          alt=""
          width={56}
          height={56}
          aria-hidden="true"
          className="absolute -top-2 right-20 w-14 h-14 object-contain opacity-50 rotate-[10deg] pointer-events-none select-none"
        />

        {/* Dismiss button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="Dismiss"
        >
          <X size={15} />
        </button>

        {/* Content */}
        <div className="px-5 pt-4 pb-4 flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Emoji + text */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-2xl shrink-0">🌸</span>
            <div className="min-w-0">
              <p className="font-body font-semibold text-foreground text-sm leading-snug">
                Join Colorado Women in STEM
              </p>
              <p className="font-body text-muted-foreground text-xs mt-0.5 leading-snug">
                Events, mentorship & community for women in STEM across Denver.
              </p>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleJoin}
            className="shrink-0 bg-secondary text-secondary-foreground font-body font-semibold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-opacity w-full sm:w-auto"
          >
            Join CWS
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupBanner;
