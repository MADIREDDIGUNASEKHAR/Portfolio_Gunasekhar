"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode, useEffect, useState } from "react";
import { StaticNetwork } from "@/components/three/StaticNetwork";
import { useIsMobile, useReducedMotion } from "@/hooks/useMediaQuery";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const SystemsScene = dynamic(() => import("@/components/three/SystemsScene"), { ssr: false });

/** Cheap capability check — avoids creating a throwaway GL context (costly on some GPUs/drivers). */
function supportsWebGL() {
  return typeof window.WebGL2RenderingContext === "function" || typeof window.WebGLRenderingContext === "function";
}

/** If the renderer fails at runtime (blocked GPU, lost context on init), fall back to the SVG. */
class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Mounts the WebGL scene once the browser is idle (so it never competes with first paint),
 * cross-fading from a static SVG. Falls back to the SVG permanently without WebGL.
 */
export function HeroScene() {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [mode, setMode] = useState<"pending" | "webgl" | "fallback">("pending");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const start = () => setMode(supportsWebGL() ? "webgl" : "fallback");
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(start, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(start, 200);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div
        className={cn(
          "absolute inset-0 flex items-start justify-center pt-[14vh] transition-opacity duration-1000 lg:items-center lg:justify-end lg:pt-0 lg:pr-[6vw]",
          ready ? "opacity-0" : "opacity-60",
        )}
      >
        <StaticNetwork className="h-[64vh] max-h-[620px] w-auto max-w-[90vw] opacity-80" />
      </div>
      {mode === "webgl" && (
        <div className={cn("absolute inset-0 transition-opacity duration-[1400ms]", ready ? "opacity-100" : "opacity-0")}>
          <SceneBoundary onError={() => setMode("fallback")}>
            <SystemsScene theme={theme} reducedMotion={reducedMotion} isMobile={isMobile} onReady={() => setReady(true)} />
          </SceneBoundary>
        </div>
      )}
    </div>
  );
}
