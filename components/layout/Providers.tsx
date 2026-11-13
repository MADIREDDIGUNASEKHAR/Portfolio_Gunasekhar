"use client";

import Lenis from "lenis";
import { MotionConfig } from "motion/react";
import { type ReactNode, useEffect } from "react";
import { ScrollTrigger, gsap } from "@/lib/gsap";
import { registerLenis } from "@/lib/scroll";

function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.2 });
    registerLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Honour deep links like /#projects after the page settles
    if (window.location.hash) {
      const target = document.querySelector(window.location.hash);
      if (target) window.setTimeout(() => lenis.scrollTo(target as HTMLElement, { immediate: true }), 50);
    }

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      registerLenis(null);
    };
  }, []);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      {children}
    </MotionConfig>
  );
}
