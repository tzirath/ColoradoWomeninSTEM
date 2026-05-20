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
  filter?: string;
}

const animName = (a: FlowerItem["anim"]) =>
  a === "ccw" ? "flower-spin-ccw" : a === "drift" ? "flower-spin-drift" : "flower-spin-cw";

// CSS filter that tints flowers to approx #5B1B3A (dark burgundy)
export const BURGUNDY = "sepia(1) hue-rotate(285deg) saturate(5) brightness(0.6)";

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
          <div
            style={{
              animation: `${animName(f.anim)} ${f.dur ?? 25}s linear infinite`,
            }}
          >
            <Image
              src={`/flower${f.src}.webp`}
              alt=""
              width={f.size}
              height={f.size}
              style={{ opacity: f.opacity ?? 0.7, filter: f.filter }}
              className="drop-shadow-md"
            />
          </div>
        </div>
      ))}
    </>
  );
}
