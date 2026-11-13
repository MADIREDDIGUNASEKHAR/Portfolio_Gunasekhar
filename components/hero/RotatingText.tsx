"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/useMediaQuery";

export function RotatingText({ phrases, interval = 3200 }: { phrases: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % phrases.length), interval);
    return () => window.clearInterval(id);
  }, [phrases.length, interval, reduced]);

  return (
    <span className="relative inline-grid overflow-hidden align-bottom" aria-live="off">
      {/* Reserve width of the longest phrase to prevent layout shift */}
      <span className="invisible col-start-1 row-start-1">
        {phrases.reduce((a, b) => (b.length > a.length ? b : a))}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={phrases[index]}
          className="col-start-1 row-start-1"
          initial={{ y: "100%", opacity: 0, filter: "blur(6px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-100%", opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {phrases[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
