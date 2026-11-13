"use client";

import { useEffect, useRef } from "react";
import type { DiagramNodeId } from "@/data/about";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

type NodeDef = { id: DiagramNodeId; x: number; y: number; w: number; label: string; sub?: string };

const NODES: NodeDef[] = [
  { id: "client", x: 75, y: 215, w: 120, label: "Client", sub: "React · Next.js" },
  { id: "gateway", x: 228, y: 140, w: 124, label: "API layer", sub: "REST · JWT · RBAC" },
  { id: "realtime", x: 228, y: 300, w: 124, label: "Realtime", sub: "WebSockets" },
  { id: "svcRider", x: 398, y: 80, w: 122, label: "rider-svc", sub: "Node.js" },
  { id: "svcPay", x: 398, y: 215, w: 122, label: "payments-svc", sub: "Node.js" },
  { id: "svcVehicle", x: 398, y: 350, w: 122, label: "vehicle-svc", sub: "Node.js" },
  { id: "mongo", x: 668, y: 95, w: 132, label: "MongoDB", sub: "indexes · pipelines" },
  { id: "redis", x: 668, y: 215, w: 132, label: "Redis", sub: "cache · sorted sets" },
  { id: "llm", x: 668, y: 335, w: 132, label: "LLM API", sub: "Groq · Llama 3" },
];
const BUS = { x: 530, top: 52, bottom: 378 };
const H = 48;

const byId = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<DiagramNodeId, NodeDef>;

type EdgeDef = { from: DiagramNodeId; to: DiagramNodeId; d: string };

const curve = (x1: number, y1: number, x2: number, y2: number) => {
  const mx = (x1 + x2) / 2;
  return `M${x1} ${y1} C${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
};
const right = (n: NodeDef) => n.x + n.w / 2;
const left = (n: NodeDef) => n.x - n.w / 2;

const EDGES: EdgeDef[] = [
  ["client", "gateway"],
  ["client", "realtime"],
  ["gateway", "svcRider"],
  ["gateway", "svcPay"],
  ["gateway", "svcVehicle"],
  ["realtime", "svcVehicle"],
].map(([f, t]) => {
  const a = byId[f as DiagramNodeId];
  const b = byId[t as DiagramNodeId];
  return { from: a.id, to: b.id, d: curve(right(a), a.y, left(b), b.y) };
});

const SVC_TO_BUS: EdgeDef[] = (["svcRider", "svcPay", "svcVehicle"] as const).map((id) => {
  const n = byId[id];
  return { from: id, to: "svcPay", d: `M${right(n)} ${n.y} L${BUS.x - 13} ${n.y}` };
});
const BUS_TO_DATA: EdgeDef[] = (["mongo", "redis", "llm"] as const).map((id) => {
  const n = byId[id];
  return { from: id, to: id, d: `M${BUS.x + 13} ${n.y} L${left(n)} ${n.y}` };
});

export function SystemDiagram({
  active,
  onHoverNode,
}: {
  active: DiagramNodeId[] | null;
  onHoverNode: (id: DiagramNodeId | null) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const inView = useInView(svgRef, "0px");
  const isOn = (id: DiagramNodeId) => !active || active.includes(id);
  const busOn = !active || active.some((id) => id.startsWith("svc"));

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    if (inView) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [inView]);

  const renderEdge = (e: EdgeDef, i: number, on: boolean, keyPrefix: string) => (
    <g key={`${keyPrefix}${i}`} className="transition-opacity duration-500" opacity={on ? 1 : 0.18}>
      <path d={e.d} fill="none" stroke={on && active ? "var(--accent)" : "var(--line-strong)"} strokeWidth={1.25} />
      <circle r={2.6} fill="var(--accent)" className="svg-packet">
        <animateMotion dur={`${1.8 + ((i * 7) % 10) / 8}s`} repeatCount="indefinite" path={e.d} begin={`-${((i * 0.37) % 2).toFixed(2)}s`} />
      </circle>
    </g>
  );

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 760 430"
      className="h-auto w-full"
      role="img"
      aria-label="Diagram of a typical system I work on: clients call an API layer and realtime gateway, which route to Node.js microservices connected by a Kafka event bus to MongoDB, Redis and an LLM API."
    >
      {/* edges */}
      {EDGES.map((e, i) => renderEdge(e, i, isOn(e.from) && isOn(e.to), "e"))}
      {SVC_TO_BUS.map((e, i) => renderEdge(e, i + 6, isOn(e.from) && busOn, "s"))}
      {BUS_TO_DATA.map((e, i) => renderEdge(e, i + 9, isOn(e.from) && busOn, "d"))}

      {/* Kafka bus */}
      <g className="transition-opacity duration-500" opacity={busOn ? 1 : 0.25}>
        <rect
          x={BUS.x - 13}
          y={BUS.top}
          width={26}
          height={BUS.bottom - BUS.top}
          rx={13}
          fill="var(--bg-elev)"
          stroke={busOn && active ? "var(--accent)" : "var(--line-strong)"}
        />
        <text
          x={BUS.x}
          y={(BUS.top + BUS.bottom) / 2}
          transform={`rotate(-90 ${BUS.x} ${(BUS.top + BUS.bottom) / 2})`}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-[var(--fg-muted)] font-mono text-[10px] tracking-[0.25em] uppercase"
        >
          Kafka · event bus
        </text>
      </g>

      {/* nodes */}
      {NODES.map((n) => {
        const on = isOn(n.id);
        const highlighted = !!active && on;
        return (
          <g
            key={n.id}
            onPointerEnter={() => onHoverNode(n.id)}
            onPointerLeave={() => onHoverNode(null)}
            className={cn("cursor-default transition-opacity duration-500")}
            opacity={on ? 1 : 0.28}
          >
            <rect
              x={n.x - n.w / 2}
              y={n.y - H / 2}
              width={n.w}
              height={H}
              rx={12}
              fill={highlighted ? "var(--accent-soft)" : "var(--bg-elev)"}
              stroke={highlighted ? "var(--accent)" : "var(--line-strong)"}
              className="transition-[fill,stroke] duration-300"
            />
            <circle cx={n.x - n.w / 2 + 13} cy={n.y - 7} r={3} fill={highlighted ? "var(--accent)" : "var(--fg-subtle)"} />
            <text x={n.x - n.w / 2 + 22} y={n.y - 3} className="fill-[var(--fg)] text-[12.5px] font-medium">
              {n.label}
            </text>
            {n.sub && (
              <text x={n.x - n.w / 2 + 13} y={n.y + 14} className="fill-[var(--fg-muted)] font-mono text-[9.5px]">
                {n.sub}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
