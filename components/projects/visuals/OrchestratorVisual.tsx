"use client";

import { useRef } from "react";
import { useInView } from "@/hooks/useInView";
import { useLoopClock } from "@/hooks/useLoopClock";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { cn, easeInOut, segment } from "@/lib/utils";

const CYCLE = 7800;

type Pt = [number, number];
const CLIENT: Pt = [66, 76];
const WF: Pt = [276, 76];
const SUP: Record<"A" | "B" | "C", Pt> = { A: [540, 36], B: [540, 96], C: [540, 156] };
const MERGE: Pt = [276, 214];

type SupplierState = "idle" | "calling" | "ok" | "timeout" | "retry" | "down";

const OFFERS = [
  { hotel: "htl_118", price: 112, supplier: "B" },
  { hotel: "htl_204", price: 128, supplier: "A" },
  { hotel: "htl_051", price: 141, supplier: "C" },
  { hotel: "htl_377", price: 167, supplier: "A" },
];

function Packet({ from, to, p, tone = "accent" }: { from: Pt; to: Pt; p: number; tone?: "accent" | "warn" | "danger" }) {
  if (p <= 0 || p >= 1) return null;
  const e = easeInOut(p);
  const x = from[0] + (to[0] - from[0]) * e;
  const y = from[1] + (to[1] - from[1]) * e;
  const fill = tone === "accent" ? "var(--accent)" : tone === "warn" ? "var(--warn)" : "var(--danger)";
  return (
    <g>
      <circle cx={x} cy={y} r={9} fill={fill} opacity={0.18} />
      <circle cx={x} cy={y} r={4} fill={fill} />
    </g>
  );
}

export function OrchestratorVisual({ className, fill = false }: { className?: string; fill?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduced = useReducedMotion();
  const { t, cycle } = useLoopClock(CYCLE, inView && !reduced, 6200);
  const partial = cycle % 2 === 1;

  const supplierState = (s: "A" | "B" | "C"): SupplierState => {
    if (t < 1300) return t > 700 ? "calling" : "idle";
    if (s === "A") return "ok";
    if (s === "B") return t > 1600 ? "ok" : "calling";
    if (t < 2300) return "timeout";
    if (t < 3100) return "retry";
    return partial ? "down" : "ok";
  };

  const offers = partial ? OFFERS.filter((o) => o.supplier !== "C") : OFFERS;
  const zsetShown = (i: number) => segment(t, 4500 + i * 220, 400);
  const responded = partial ? 2 : 3;
  const done = t > 6400;

  const stateStyle: Record<SupplierState, { stroke: string; label: string; color: string }> = {
    idle: { stroke: "var(--line-strong)", label: "idle", color: "var(--fg-subtle)" },
    calling: { stroke: "var(--fg-muted)", label: "calling…", color: "var(--fg-muted)" },
    ok: { stroke: "var(--accent)", label: "ok", color: "var(--accent)" },
    timeout: { stroke: "var(--warn)", label: "timeout", color: "var(--warn)" },
    retry: { stroke: "var(--warn)", label: "retry 1 · backoff", color: "var(--warn)" },
    down: { stroke: "var(--danger)", label: "non-retryable", color: "var(--danger)" },
  };

  return (
    <div ref={ref} className={cn("relative flex h-full w-full flex-col", className)}>
      <div className="flex items-center justify-between px-1 pb-3 font-mono text-[10.5px] text-muted">
        <span>
          workflow · searchHotels <span className="text-subtle">run #{(cycle % 90) + 1}</span>
        </span>
        <span className={cn("rounded-full px-2 py-0.5", partial ? "bg-warn/15 text-warn" : "bg-accent-soft text-accent")}>
          {partial ? "supplier down → partial results" : "all suppliers healthy"}
        </span>
      </div>
      <div className={cn("relative aspect-[640/392] w-full", fill && "tall:aspect-auto tall:min-h-0 tall:flex-1")}>
      <svg viewBox="0 0 640 392" className="absolute inset-0 h-full w-full" role="img" aria-label="Simulated workflow: a search fans out to three suppliers in parallel, one times out and is retried, results are deduplicated and stored in a Redis sorted set by price.">
        {/* wires */}
        <g stroke="var(--line-strong)" strokeWidth={1.2} fill="none">
          <path d={`M116 76 H196`} />
          {(["A", "B", "C"] as const).map((s) => (
            <path key={s} d={`M356 76 C410 76, 410 ${SUP[s][1]}, 460 ${SUP[s][1]}`} />
          ))}
          <path d="M276 112 V196" strokeDasharray="3 4" />
          <path d="M356 214 H380" />
          <path d="M196 214 H66 V100" strokeDasharray="3 4" />
        </g>

        {/* client */}
        <g>
          <rect x={16} y={52} width={100} height={48} rx={12} fill="var(--bg-elev)" stroke="var(--line-strong)" />
          <text x={30} y={73} className="fill-[var(--fg)] text-[12px] font-medium">client</text>
          <text x={30} y={89} className="fill-[var(--fg-muted)] font-mono text-[9.5px]">GET /search</text>
        </g>

        {/* workflow */}
        <g>
          <rect x={196} y={40} width={160} height={72} rx={14} fill="var(--accent-soft)" stroke="var(--accent)" strokeOpacity={0.6} />
          <text x={212} y={64} className="fill-[var(--fg)] text-[12.5px] font-medium">Temporal workflow</text>
          <text x={212} y={81} className="fill-[var(--fg-muted)] font-mono text-[9.5px]">parallel activities</text>
          <text x={212} y={97} className="fill-[var(--fg-muted)] font-mono text-[9.5px]">timeouts · retries</text>
        </g>

        {/* suppliers */}
        {(["A", "B", "C"] as const).map((s) => {
          const st = stateStyle[supplierState(s)];
          const pulsing = supplierState(s) === "calling" || supplierState(s) === "retry";
          return (
            <g key={s}>
              <rect
                x={460}
                y={SUP[s][1] - 19}
                width={164}
                height={38}
                rx={10}
                fill="var(--bg-elev)"
                stroke={st.stroke}
                className={pulsing ? "animate-pulse-ring" : undefined}
              />
              <text x={474} y={SUP[s][1] + 4} className="fill-[var(--fg)] text-[12px] font-medium">
                supplier-{s.toLowerCase()}
              </text>
              <text x={612} y={SUP[s][1] + 4} textAnchor="end" className="font-mono text-[9.5px]" fill={st.color}>
                {st.label}
              </text>
            </g>
          );
        })}

        {/* dedupe */}
        <g>
          <rect x={196} y={196} width={160} height={38} rx={10} fill="var(--bg-elev)" stroke={t > 4100 ? "var(--accent)" : "var(--line-strong)"} />
          <text x={210} y={219} className="fill-[var(--fg)] text-[12px] font-medium">dedupe · by name</text>
        </g>

        {/* ZSET */}
        <g>
          <rect x={380} y={196} width={244} height={186} rx={14} fill="var(--bg-sunk)" stroke="var(--line-strong)" />
          <text x={396} y={220} className="fill-[var(--fg)] font-mono text-[10.5px]">redis · ZSET</text>
          <text x={610} y={220} textAnchor="end" className="fill-[var(--accent)] font-mono text-[9.5px]">MULTI / EXEC</text>
          <line x1={396} x2={608} y1={232} y2={232} stroke="var(--line)" />
          {offers.map((o, i) => {
            const p = zsetShown(i);
            const w = 70 + ((o.price - 100) / 70) * 90;
            const y = 248 + i * 32;
            return (
              <g key={o.hotel} opacity={p}>
                <text x={396} y={y + 9} className="fill-[var(--fg-muted)] font-mono text-[9.5px]">{o.hotel}</text>
                <rect x={448} y={y} width={w * easeInOut(p)} height={12} rx={3} fill="var(--accent)" opacity={0.25 + (i === 0 ? 0.6 : 0.25)} />
                <text x={608} y={y + 9} textAnchor="end" className="fill-[var(--fg)] font-mono text-[9.5px]">{o.price}</text>
              </g>
            );
          })}
        </g>

        {/* response card */}
        <g opacity={done ? 1 : 0.35} className="transition-opacity duration-500">
          <rect x={16} y={258} width={340} height={124} rx={14} fill="var(--bg-elev)" stroke={done ? "var(--accent)" : "var(--line)"} />
          <text x={32} y={284} className="fill-[var(--accent)] font-mono text-[10.5px]">200 OK</text>
          <text x={340} y={284} textAnchor="end" className="fill-[var(--fg-muted)] font-mono text-[9.5px]">
            {responded}/3 suppliers · {offers.length} hotels
          </text>
          {offers.slice(0, 3).map((o, i) => (
            <g key={o.hotel}>
              <text x={32} y={312 + i * 22} className="fill-[var(--fg)] text-[11.5px]">{o.hotel}</text>
              <text x={150} y={312 + i * 22} className="fill-[var(--fg-subtle)] font-mono text-[9.5px]">via supplier-{o.supplier.toLowerCase()}</text>
              <text x={340} y={312 + i * 22} textAnchor="end" className="fill-[var(--fg)] font-mono text-[10.5px]">{o.price}</text>
            </g>
          ))}
        </g>

        {/* packets */}
        <Packet from={CLIENT} to={WF} p={segment(t, 0, 650)} />
        {(["A", "B", "C"] as const).map((s) => (
          <Packet key={`out-${s}`} from={WF} to={SUP[s]} p={segment(t, 700, 600)} />
        ))}
        <Packet from={SUP.A} to={WF} p={segment(t, 1350, 600)} />
        <Packet from={SUP.B} to={WF} p={segment(t, 1650, 600)} />
        <Packet from={WF} to={SUP.C} p={segment(t, 2350, 650)} tone="warn" />
        {!partial && <Packet from={SUP.C} to={WF} p={segment(t, 3150, 650)} />}
        <Packet from={WF} to={MERGE} p={segment(t, 3900, 500)} />
        <Packet from={MERGE} to={[380, 214]} p={segment(t, 4300, 300)} />
        <Packet from={[196, 214]} to={[66, 214]} p={segment(t, 5600, 500)} />
        <Packet from={[66, 214]} to={[66, 100]} p={segment(t, 6050, 350)} />
      </svg>
      </div>
      <p className="mt-2 px-1 font-mono text-[10px] text-subtle">Simulated run · alternates healthy and degraded supplier scenarios</p>
    </div>
  );
}
