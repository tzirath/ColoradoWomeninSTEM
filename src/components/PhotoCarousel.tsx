"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Photo { id: string; url: string; }

export default function PhotoCarousel({ photos }: { photos: Photo[] }) {
  const [idx, setIdx]         = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const visible  = isMobile ? 1 : Math.min(3, photos.length);
  const maxIdx   = Math.max(0, photos.length - visible);
  const slotPct  = 100 / visible;

  const next = useCallback(
    () => setIdx((i) => (i >= maxIdx ? 0 : i + 1)),
    [maxIdx]
  );
  const prev = () => setIdx((i) => (i <= 0 ? maxIdx : i - 1));

  useEffect(() => {
    if (photos.length <= visible) return;
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [next, photos.length, visible]);

  if (!photos.length) return null;

  return (
    <div className="relative select-none px-5">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${idx * slotPct}%)` }}
        >
          {photos.map((p) => (
            <div key={p.id} className="shrink-0 px-2" style={{ width: `${slotPct}%` }}>
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
                <img
                  src={p.url}
                  alt=""
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
                {/* transparent overlay blocks right-click save */}
                <div
                  className="absolute inset-0"
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {photos.length > visible && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card border border-border shadow-sm flex items-center justify-center hover:bg-primary/5 transition-colors z-10"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-card border border-border shadow-sm flex items-center justify-center hover:bg-primary/5 transition-colors z-10"
          >
            <ChevronRight size={15} />
          </button>
        </>
      )}

      {maxIdx > 0 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: maxIdx + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
