"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface SignupBannerProps {
  onJoinClick: () => void;
}

const STORAGE_KEY = "cws_banner_dismissed";
const DELAY_MS = 10_000;

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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg animate-fade-in-up">
      <div className="relative bg-card border border-border rounded-2xl shadow-xl overflow-hidden">

        {/* Flower decorations */}
        <Image
          src="/flower1.webp"
          alt=""
          width={64}
          height={64}
          aria-hidden="true"
          className="absolute -top-3 -left-3 w-16 h-16 object-contain opacity-70 rotate-[-20deg] pointer-events-none select-none"
        />
        <Image
          src="/flower2.webp"
          alt=""
          width={56}
          height={56}
          aria-hidden="true"
          className="absolute -bottom-2 left-8 w-14 h-14 object-contain opacity-60 rotate-[15deg] pointer-events-none select-none"
        />
        <Image
          src="/flower3.webp"
          alt=""
          width={60}
          height={60}
          aria-hidden="true"
          className="absolute -top-2 right-16 w-15 h-15 object-contain opacity-60 rotate-[10deg] pointer-events-none select-none"
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
          {/* Logo + text */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Image
              src="/cws-logo.png"
              alt="CWS logo"
              width={40}
              height={40}
              className="shrink-0 rounded-lg"
            />
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
