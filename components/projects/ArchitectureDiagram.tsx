import type { ArchKind, Project } from "@/data/projects";

const CELL_W = 252;
const CELL_H = 124;
const NODE_W = 170;
const NODE_H = 60;

const kindStyle: Record<ArchKind, { stroke: string; fill: string; dash?: string; tag: string }> = {
  client: { stroke: "var(--fg-muted)", fill: "var(--bg-elev)", tag: "client" },
  service: { stroke: "var(--accent)", fill: "var(--bg-elev)", tag: "service" },
  data: { stroke: "var(--accent)", fill: "var(--accent-soft)", tag: "data" },
  external: { stroke: "var(--fg-muted)", fill: "var(--bg-sunk)", dash: "4 4", tag: "external" },
  infra: { stroke: "var(--accent)", fill: "var(--bg-sunk)", dash: "4 4", tag: "cross-cutting" },
};

/** Clip a centre-to-centre line to the node rectangles so arrows start/end at the borders. */
function clip(ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const hw = NODE_W / 2 + 6;
  const hh = NODE_H / 2 + 6;
  const t = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
  return { x1: ax + dx * t, y1: ay + dy * t, x2: bx - dx * t, y2: by - dy * t };
}

export function ArchitectureDiagram({ architecture, id }: { architecture: Project["architecture"]; id: string }) {
  const { cols, rows, nodes, edges } = architecture;
  const width = cols * CELL_W;
  const height = rows * CELL_H;
  const pos = Object.fromEntries(
    nodes.map((n) => [n.id, { x: n.col * CELL_W + CELL_W / 2, y: n.row * CELL_H + CELL_H / 2 }]),
  );
  const markerId = `arrow-${id}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Architecture diagram: ${edges
        .map((e) => `${nodes.find((n) => n.id === e.from)?.label} to ${nodes.find((n) => n.id === e.to)?.label}${e.label ? ` (${e.label})` : ""}`)
        .join("; ")}.`}
    >
      <defs>
        <marker id={markerId} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="var(--fg-muted)" />
        </marker>
      </defs>

      {edges.map((e, i) => {
        const a = pos[e.from];
        const b = pos[e.to];
        const { x1, y1, x2, y2 } = clip(a.x, a.y, b.x, b.y);
        const d = `M${x1} ${y1} L${x2} ${y2}`;
        const horizontal = Math.abs(y2 - y1) < 4;
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2 - (horizontal ? 18 : 0);
        const lw = (e.label?.length ?? 0) * 6.4 + 14;
        return (
          <g key={i}>
            <path d={d} stroke="var(--line-strong)" strokeWidth={1.4} strokeDasharray={e.dashed ? "4 5" : undefined} fill="none" markerEnd={`url(#${markerId})`} />
            <circle r={3} fill="var(--accent)" className="svg-packet">
              <animateMotion dur={`${1.6 + (i % 3) * 0.4}s`} repeatCount="indefinite" path={d} begin={`-${(i * 0.3).toFixed(1)}s`} />
            </circle>
            {e.label && (
              <g>
                <rect x={mx - lw / 2} y={my - 10} width={lw} height={20} rx={10} fill="var(--bg)" stroke="var(--line)" />
                <text x={mx} y={my + 4} textAnchor="middle" className="fill-[var(--fg-muted)] font-mono text-[10.5px]">
                  {e.label}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {nodes.map((n) => {
        const p = pos[n.id];
        const s = kindStyle[n.kind];
        return (
          <g key={n.id}>
            <rect
              x={p.x - NODE_W / 2}
              y={p.y - NODE_H / 2}
              width={NODE_W}
              height={NODE_H}
              rx={14}
              fill={s.fill}
              stroke={s.stroke}
              strokeOpacity={0.7}
              strokeDasharray={s.dash}
            />
            <text x={p.x - NODE_W / 2 + 14} y={p.y - 4} className="fill-[var(--fg)] text-[13.5px] font-medium">
              {n.label}
            </text>
            {n.sub && (
              <text x={p.x - NODE_W / 2 + 14} y={p.y + 15} className="fill-[var(--fg-muted)] font-mono text-[10.5px]">
                {n.sub}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function ArchitectureLegend() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[10.5px] text-muted">
      {(Object.keys(kindStyle) as ArchKind[]).map((k) => (
        <li key={k} className="flex items-center gap-2">
          <span
            className="inline-block h-3 w-5 rounded-[4px] border"
            style={{
              borderColor: kindStyle[k].stroke,
              background: kindStyle[k].fill,
              borderStyle: kindStyle[k].dash ? "dashed" : "solid",
            }}
          />
          {kindStyle[k].tag}
        </li>
      ))}
    </ul>
  );
}
