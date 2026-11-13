"use client";

import type Lenis from "lenis";

let lenisInstance: Lenis | null = null;

export const registerLenis = (instance: Lenis | null) => {
  lenisInstance = instance;
};

export const getLenis = () => lenisInstance;

/** Smooth-scroll to a section id (or the top for "home"), falling back to native scrolling. */
export function scrollToSection(id: string) {
  const target = id === "home" ? null : document.getElementById(id);
  if (id !== "home" && !target) return;

  if (lenisInstance) {
    lenisInstance.scrollTo(target ?? 0, { duration: 1.4 });
  } else {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = reduce ? "auto" : "smooth";
    if (target) target.scrollIntoView({ behavior });
    else window.scrollTo({ top: 0, behavior });
  }

  window.history.replaceState(null, "", id === "home" ? window.location.pathname : `#${id}`);
}
