import { mulberry32 } from "@/lib/utils";

/**
 * Lightweight SVG rendition of the hero network. Shown before WebGL loads
 * and as the permanent fallback when WebGL is unavailable.
 */
const { nodes, edges } = (() => {
  const r = mulberry32(21);
  const nodes = Array.from({ length: 34 }, (_, i) => {
    const a = (i / 34) * Math.PI * 2 * 3.1;
    const rad = 120 + r() * 140;
    return { x: 300 + Math.cos(a) * rad, y: 300 + Math.sin(a) * rad * 0.82, hub: i % 7 === 0 };
  });
  const edges: [number, number][] = [];
  nodes.forEach((n, i) => {
    const near = nodes
      .map((m, j) => ({ j, d: j === i ? Infinity : (m.x - n.x) ** 2 + (m.y - n.y) ** 2 }))
      .sort((p, q) => p.d - q.d)
      .slice(0, 2);
    near.forEach(({ j }) => edges.push([i, j]));
  });
  return { nodes, edges };
})();

export function StaticNetwork({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="sn-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="300" cy="300" r="120" fill="url(#sn-core)" opacity="0.5" />
      <g stroke="var(--fg)" strokeOpacity="0.12" strokeWidth="1">
        {edges.map(([a, b], i) => (
          <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} />
        ))}
        {nodes
          .filter((n) => n.hub)
          .map((n, i) => (
            <line key={`h${i}`} x1="300" y1="300" x2={n.x} y2={n.y} strokeOpacity="0.2" stroke="var(--accent)" />
          ))}
      </g>
      <ellipse cx="300" cy="300" rx="150" ry="52" fill="none" stroke="var(--accent)" strokeOpacity="0.25" transform="rotate(-18 300 300)" />
      <polygon
        points="300,232 359,266 359,334 300,368 241,334 241,266"
        fill="var(--bg-elev)"
        stroke="var(--accent)"
        strokeOpacity="0.7"
      />
      <circle cx="300" cy="300" r="12" fill="var(--accent)" />
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={n.hub ? 4 : 2.4} fill={n.hub ? "var(--accent)" : "var(--fg-muted)"} />
      ))}
    </svg>
  );
}
