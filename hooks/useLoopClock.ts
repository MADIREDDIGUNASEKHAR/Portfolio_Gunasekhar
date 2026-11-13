"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Drives looping, time-based visualizations. Returns elapsed ms within the current
 * cycle and the cycle count. Only ticks while `active`; frozen at `staticAt` otherwise.
 */
export function useLoopClock(cycleMs: number, active: boolean, staticAt = cycleMs * 0.8) {
  const [state, setState] = useState({ t: staticAt, cycle: 0 });
  const elapsed = useRef(staticAt);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      elapsed.current += Math.min(now - last, 64);
      last = now;
      setState({ t: elapsed.current % cycleMs, cycle: Math.floor(elapsed.current / cycleMs) });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, cycleMs]);

  return state;
}
