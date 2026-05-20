"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export interface FlowerItem {
  src: 1 | 2 | 3;
  position: string;
  size: number;
  opacity?: number;
  anim?: "cw" | "ccw" | "drift";
  dur?: number;
  mx?: number;
  my?: number;
  td?: number;
  tint?: string; // hex color — applied as mix-blend-mode:color overlay
}

const animName = (a: FlowerItem["anim"]) =>
  a === "ccw" ? "flower-spin-ccw" : a === "drift" ? "flower-spin-drift" : "flower-spin-cw";

export const BURGUNDY = "#5B1B3A";
export const PEACH = "#F2D8C2";

export default function FlowerDecor({ flowers }: { flowers: FlowerItem[] }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <>
      {flowers.map((f, i) => (
        <div
          key={i}
          className={`absolute pointer-events-none ${f.position}`}
          style={{
            transform: `rotate(${mouse.x * (f.mx ?? 20)}deg) translateY(${mouse.y * (f.my ?? 10)}px)`,
            transition: `transform ${f.td ?? 450}ms ease-out`,
          }}
        >
          <div style={{ animation: `${animName(f.anim)} ${f.dur ?? 25}s linear infinite` }}>
            {/* isolation:isolate ensures the blend mode composites against the flower only */}
            <div className="relative drop-shadow-md" style={{ isolation: "isolate" }}>
              <Image
                src={`/flower${f.src}.webp`}
                alt=""
                width={f.size}
                height={f.size}
                style={{ opacity: f.opacity ?? 0.7, display: "block" }}
              />
              {f.tint && (
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: f.tint,
                    mixBlendMode: "color",
                    opacity: 0.9,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
