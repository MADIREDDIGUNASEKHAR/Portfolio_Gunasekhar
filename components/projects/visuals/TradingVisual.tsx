"use client";

import { motion } from "motion/react";
import { type PointerEvent, useId, useMemo, useRef, useState } from "react";
import { cn, mulberry32 } from "@/lib/utils";

const DAYS = 60;
const VW = 600;
const VH = 220;
const PAD = { l: 8, r: 8, t: 16, b: 18 };

/** Illustrative data only — a seeded random walk, not real trading results. */
function useSeries() {
  return useMemo(() => {
    const r = mulberry32(2024);
    const daily = Array.from({ length: DAYS }, () => +((r() - 0.4) * 3.2).toFixed(2));
    let acc = 0;
    const equity = daily.map((d) => (acc = +(acc + d).toFixed(2)));
    const min = Math.min(0, ...equity);
    const max = Math.max(...equity);
    const x = (i: number) => PAD.l + (i / (DAYS - 1)) * (VW - PAD.l - PAD.r);
    const y = (v: number) => PAD.t + (1 - (v - min) / (max - min || 1)) * (VH - PAD.t - PAD.b);
    const line = equity.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const area = `${line} L${x(DAYS - 1).toFixed(1)} ${VH - PAD.b} L${x(0).toFixed(1)} ${VH - PAD.b} Z`;
    const wins = daily.filter((d) => d > 0).length;
    let peak = -Infinity;
    let maxDd = 0;
    equity.forEach((v) => {
      peak = Math.max(peak, v);
      maxDd = Math.min(maxDd, v - peak);
    });
    return { daily, equity, x, y, line, area, zeroY: y(0), winRate: Math.round((wins / DAYS) * 100), net: equity[DAYS - 1], maxDd };
  }, []);
}

const TRADES = [
  { sym: "NIFTY", side: "Long", tag: "breakout", r: "+1.8R", up: true },
  { sym: "BANKNIFTY", side: "Short", tag: "mean-reversion", r: "−0.6R", up: false },
  { sym: "RELIANCE", side: "Long", tag: "trend", r: "+2.4R", up: true },
];

export function TradingVisual({ className, large = false }: { className?: string; large?: boolean }) {
  const s = useSeries();
  const gradId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    const px = ((e.clientX - r.left) / r.width) * VW;
    const i = Math.round(((px - PAD.l) / (VW - PAD.l - PAD.r)) * (DAYS - 1));
    setHover(Math.max(0, Math.min(DAYS - 1, i)));
  };

  const hi = hover ?? DAYS - 1;

  return (
    <div className={cn("flex h-full w-full flex-col gap-3", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <p className="font-mono text-[10.5px] text-muted">equity curve · cumulative R</p>
          <p className="mt-1 text-[26px] leading-none font-medium tracking-tight tabular-nums">
            {s.equity[hi] >= 0 ? "+" : ""}
            {s.equity[hi].toFixed(1)}R
            <span className="ml-2 font-mono text-[11px] text-subtle">day {hi + 1}</span>
          </p>
        </div>
        <span className="rounded-full border border-line-strong px-2 py-0.5 font-mono text-[10px] text-subtle">illustrative data</span>
      </div>

      <div className="relative rounded-2xl border border-line bg-bg-sunk/60 p-2">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VW} ${VH}`}
          className="h-auto w-full touch-none"
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          role="img"
          aria-label="Illustrative equity curve from a trading journal dashboard."
        >
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1={0} x2={VW} y1={VH * f} y2={VH * f} stroke="var(--line)" />
          ))}
          <line x1={0} x2={VW} y1={s.zeroY} y2={s.zeroY} stroke="var(--line-strong)" strokeDasharray="3 4" />
          <motion.path
            d={s.area}
            fill={`url(#${gradId})`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.6 }}
          />
          <motion.path
            d={s.line}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2}
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: [0.65, 0, 0.35, 1] }}
          />
          {hover !== null && (
            <g>
              <line x1={s.x(hi)} x2={s.x(hi)} y1={0} y2={VH} stroke="var(--fg-muted)" strokeDasharray="2 3" />
              <circle cx={s.x(hi)} cy={s.y(s.equity[hi])} r={8} fill="var(--accent)" opacity={0.2} />
              <circle cx={s.x(hi)} cy={s.y(s.equity[hi])} r={3.5} fill="var(--accent)" />
            </g>
          )}
        </svg>
      </div>

      <div className={cn("grid gap-3", large ? "sm:grid-cols-[1fr_1.3fr]" : "grid-cols-[auto_1fr]")}>
        <div className="rounded-2xl border border-line p-3">
          <p className="font-mono text-[10px] text-subtle">daily PnL</p>
          <div className="mt-2 grid grid-cols-10 gap-[3px]" aria-hidden>
            {s.daily.slice(-40).map((d, i) => (
              <span
                key={i}
                className="aspect-square w-[11px] rounded-[3px] sm:w-3"
                style={{
                  background: d >= 0 ? "var(--accent)" : "var(--danger)",
                  opacity: 0.18 + Math.min(Math.abs(d) / 2.2, 1) * 0.7,
                }}
              />
            ))}
          </div>
        </div>
        <div className="min-w-0 rounded-2xl border border-line p-3">
          <div className="flex items-center justify-between font-mono text-[10px] text-subtle">
            <span>trades</span>
            <span>imported via broker API</span>
          </div>
          <ul className="mt-2 space-y-1.5">
            {TRADES.slice(0, large ? 3 : 2).map((tr) => (
              <li key={tr.sym} className="flex items-center gap-2 text-[11.5px]">
                <span className="truncate font-medium">{tr.sym}</span>
                <span className="text-subtle">{tr.side}</span>
                <span className="chip !px-1.5 !py-0 !text-[9.5px] max-sm:hidden">{tr.tag}</span>
                <span className={cn("ml-auto font-mono", tr.up ? "text-accent" : "text-danger")}>{tr.r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
