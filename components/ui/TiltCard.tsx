"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { type PointerEvent, type ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";

/** 3D tilt with a cursor-tracking light. Fine pointers only; inert for touch and reduced motion. */
export function TiltCard({
  children,
  className,
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const lx = useMotionValue(50);
  const ly = useMotionValue(50);
  const glow = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 18 });
  const sry = useSpring(ry, { stiffness: 150, damping: 18 });
  const sglow = useSpring(glow, { stiffness: 120, damping: 20 });
  const light = useMotionTemplate`radial-gradient(520px circle at ${lx}% ${ly}%, var(--accent-soft), transparent 60%)`;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * max * 2);
    rx.set(-(py - 0.5) * max * 2);
    lx.set(px * 100);
    ly.set(py * 100);
    glow.set(1);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
    glow.set(0);
  };

  return (
    <div className={cn("[perspective:1400px]", className)} onPointerMove={onMove} onPointerLeave={reset} ref={ref}>
      <motion.div
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        className="relative h-full w-full will-change-transform"
      >
        {children}
        <motion.div
          aria-hidden
          style={{ background: light, opacity: sglow }}
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
        />
      </motion.div>
    </div>
  );
}
