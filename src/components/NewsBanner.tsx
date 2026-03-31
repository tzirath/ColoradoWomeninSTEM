"use client";

import { useState, useEffect, useRef } from "react";
import { Megaphone, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";

interface NewsItem { text: string; link: string | null; }

interface Props {
  items: NewsItem[];
}

export default function NewsBanner({ items }: Props) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const [height, setHeight] = useState<number | undefined>(undefined);
  const textRef = useRef<HTMLParagraphElement>(null);

  const goTo = (index: number, dir: "left" | "right") => {
    if (animating || items.length <= 1) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 300);
  };

  const prev = () => goTo((current - 1 + items.length) % items.length, "right");
  const next = () => goTo((current + 1) % items.length, "left");

  // Update container height whenever the visible text changes size
  useEffect(() => {
    if (!textRef.current) return;
    const update = () => setHeight(textRef.current?.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(textRef.current);
    return () => ro.disconnect();
  }, [current]);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => goTo((current + 1) % items.length, "left"), 4000);
    return () => clearInterval(id);
  }, [current, items.length]);

  if (!items.length) return null;

  return (
    <div className="bg-secondary/10 border-y border-secondary/20 py-3 md:py-4">
      <div className="container mx-auto px-6 flex items-center justify-center gap-4">
        <button onClick={prev} className="text-foreground/40 hover:text-secondary transition-colors shrink-0" aria-label="Previous">
          <ChevronLeft size={18} />
        </button>

        <div
          className="flex-1 max-w-2xl overflow-hidden relative flex items-center justify-center transition-[height] duration-200"
          style={{ height: height ? `${height}px` : "auto", minHeight: "1.75rem" }}
        >
          {(() => {
            const item = items[current];
            const style = {
              animation: animating
                ? direction === "left" ? "slideOutLeft 0.3s ease forwards" : "slideOutRight 0.3s ease forwards"
                : direction === "left" ? "slideInLeft 0.3s ease forwards" : "slideInRight 0.3s ease forwards",
            };
            const inner = (
              <>
                <Megaphone size={16} className="text-secondary shrink-0 mt-0.5" />
                <span>{item.text}</span>
                {item.link && <ExternalLink size={13} className="text-secondary/60 shrink-0 mt-0.5" />}
              </>
            );
            const cls = "font-body text-base font-semibold text-foreground absolute w-full text-center flex items-start justify-center gap-2 px-2 leading-snug";
            return item.link ? (
              item.link.startsWith("http") ? (
                <a ref={textRef as unknown as React.RefObject<HTMLAnchorElement>} key={current} href={item.link} target="_blank" rel="noopener noreferrer"
                  className={cls + " hover:text-primary transition-colors"} style={style}>{inner}</a>
              ) : (
                <Link ref={textRef as unknown as React.RefObject<HTMLAnchorElement>} key={current} href={item.link}
                  className={cls + " hover:text-primary transition-colors"} style={style}>{inner}</Link>
              )
            ) : (
              <p ref={textRef} key={current} className={cls} style={style}>{inner}</p>
            );
          })()}
        </div>

        <button onClick={next} className="text-foreground/40 hover:text-secondary transition-colors shrink-0" aria-label="Next">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex justify-center items-center gap-1.5 mt-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? "left" : "right")}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? "bg-secondary" : "bg-secondary/30"}`}
            aria-label={`Go to item ${i + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes slideInLeft {
          from { transform: translateX(40px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutLeft {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-40px); opacity: 0; }
        }
        @keyframes slideInRight {
          from { transform: translateX(-40px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(40px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
