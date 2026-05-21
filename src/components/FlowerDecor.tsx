"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export interface FlowerItem {
  src: 1 | 2 | 3;
  position: string;
  size: number;
  mobileHide?: boolean;   // hide this flower on mobile
  opacity?: number;
  anim?: "cw" | "ccw" | "drift";
  dur?: number;
  mx?: number;
  my?: number;
  td?: number;
  tint?: string;
}

export const BURGUNDY = "#5B1B3A";
export const PEACH    = "#F2D8C2";

const animName = (a: FlowerItem["anim"]) =>
  a === "ccw" ? "flower-spin-ccw" : a === "drift" ? "flower-spin-drift" : "flower-spin-cw";

export default function FlowerDecor({ flowers }: { flowers: FlowerItem[] }) {
  const [mouse,   setMouse]    = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY]  = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile once on mount + on resize
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Desktop: mouse parallax  |  Mobile: scroll-driven oscillation
  useEffect(() => {
    if (isMobile) {
      const onScroll = () => setScrollY(window.scrollY);
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    } else {
      const onMouse = (e: MouseEvent) => setMouse({
        x: (e.clientX / window.innerWidth  - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
      window.addEventListener("mousemove", onMouse);
      return () => window.removeEventListener("mousemove", onMouse);
    }
  }, [isMobile]);

  return (
    <>
      {flowers.map((f, i) => {
        if (f.mobileHide && isMobile) return null;

        // Flowers are ~50% smaller on mobile
        const size = isMobile ? Math.round(f.size * 0.5) : f.size;

        // Scroll oscillation: each flower gets a phase offset so they move independently
        const transform = isMobile
          ? `rotate(${Math.sin(scrollY * 0.013 + i * 1.4) * 30}deg) translateY(${Math.cos(scrollY * 0.009 + i * 0.8) * 9}px)`
          : `rotate(${mouse.x * (f.mx ?? 20)}deg) translateY(${mouse.y * (f.my ?? 10)}px)`;

        return (
          <div
            key={i}
            className={`absolute pointer-events-none ${f.position}`}
            style={{
              transform,
              transition: isMobile
                ? "transform 0.1s ease-out"
                : `transform ${f.td ?? 450}ms ease-out`,
            }}
          >
            <div style={{ animation: `${animName(f.anim)} ${f.dur ?? 25}s linear infinite` }}>
              <div className="relative drop-shadow-md" style={{ isolation: "isolate" }}>
                <Image
                  src={`/flower${f.src}.webp`}
                  alt=""
                  width={size}
                  height={size}
                  style={{ opacity: f.opacity ?? 0.7, display: "block" }}
                />
                {f.tint && (
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: f.tint, mixBlendMode: "color", opacity: 0.9 }}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
