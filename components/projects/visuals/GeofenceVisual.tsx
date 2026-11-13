"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { useTheme } from "@/lib/theme";
import { cn, mulberry32 } from "@/lib/utils";

/* World is 100 × 64 units; streets on a grid. */
const W = 100;
const H = 64;
const XS = [6, 22, 38, 54, 70, 86, 96];
const YS = [6, 20, 34, 48, 60];

type Pt = [number, number];
interface Zone {
  id: string;
  label: string;
  poly: Pt[];
  flash: number;
}
interface Vehicle {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number;
  trail: Pt[];
  zones: Set<string>;
}
interface Ripple {
  x: number;
  y: number;
  age: number;
  enter: boolean;
}
export interface GeoEvent {
  key: number;
  type: "ENTER" | "EXIT";
  vehicle: string;
  zone: string;
  t: number;
}

const ZONES: Omit<Zone, "flash">[] = [
  { id: "z1", label: "Z-01 · hub-north", poly: [[12, 3], [44, 4], [48, 24], [30, 28], [10, 22]] },
  { id: "z2", label: "Z-02 · depot-east", poly: [[60, 12], [93, 9], [97, 33], [79, 41], [58, 30]] },
  { id: "z3", label: "Z-03 · restricted", poly: [[28, 38], [52, 36], [60, 56], [40, 62], [24, 54]] },
];

/** Ray-casting point-in-polygon — the same question PostGIS answers with ST_Covers. */
function inside([x, y]: Pt, poly: Pt[]) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function createSim(vehicleCount: number) {
  const rand = mulberry32(42);
  const zones: Zone[] = ZONES.map((z) => ({ ...z, flash: 0 }));
  const vehicles: Vehicle[] = Array.from({ length: vehicleCount }, (_, i) => {
    const horizontal = rand() > 0.5;
    const x = horizontal ? 6 + rand() * 88 : XS[Math.floor(rand() * XS.length)];
    const y = horizontal ? YS[Math.floor(rand() * YS.length)] : 6 + rand() * 52;
    const dir = rand() > 0.5 ? 1 : -1;
    return {
      id: `veh-${String(i + 1).padStart(2, "0")}`,
      x,
      y,
      dx: horizontal ? dir : 0,
      dy: horizontal ? 0 : dir,
      speed: 5 + rand() * 5,
      trail: [],
      zones: new Set<string>(),
    };
  });
  vehicles.forEach((v) => zones.forEach((z) => inside([v.x, v.y], z.poly) && v.zones.add(z.id)));
  return { zones, vehicles, ripples: [] as Ripple[], time: 0, rand, eventKey: 0 };
}
type Sim = ReturnType<typeof createSim>;

function step(sim: Sim, dt: number, onEvent: (e: GeoEvent) => void) {
  sim.time += dt;
  for (const v of sim.vehicles) {
    const prevX = v.x;
    const prevY = v.y;
    v.x += v.dx * v.speed * dt;
    v.y += v.dy * v.speed * dt;

    // Crossing an intersection? Snap and maybe turn.
    const grid = v.dx !== 0 ? XS : YS;
    const pos = v.dx !== 0 ? v.x : v.y;
    const prev = v.dx !== 0 ? prevX : prevY;
    const crossed = grid.find((g) => (prev < g && pos >= g) || (prev > g && pos <= g));
    if (crossed !== undefined) {
      if (v.dx !== 0) v.x = crossed;
      else v.y = crossed;
      const options: Pt[] = [];
      const cx = v.x;
      const cy = v.y;
      if (YS.includes(Math.round(cy)) || v.dx === 0) {
        if (cx < 95) options.push([1, 0]);
        if (cx > 7) options.push([-1, 0]);
      }
      if (XS.includes(Math.round(cx)) || v.dy === 0) {
        if (cy < 59) options.push([0, 1]);
        if (cy > 7) options.push([0, -1]);
      }
      const forward = options.find(([a, b]) => a === v.dx && b === v.dy);
      const nonReverse = options.filter(([a, b]) => !(a === -v.dx && b === -v.dy));
      const r = sim.rand();
      const pick = forward && r < 0.55 ? forward : nonReverse[Math.floor(sim.rand() * nonReverse.length)] ?? options[0];
      if (pick) {
        if (pick[0] !== 0) v.y = YS.reduce((a, b) => (Math.abs(b - v.y) < Math.abs(a - v.y) ? b : a));
        if (pick[1] !== 0) v.x = XS.reduce((a, b) => (Math.abs(b - v.x) < Math.abs(a - v.x) ? b : a));
        v.dx = pick[0];
        v.dy = pick[1];
      }
    }
    if (v.x < 6 || v.x > 96) v.dx *= -1;
    if (v.y < 6 || v.y > 60) v.dy *= -1;
    v.x = Math.min(96, Math.max(6, v.x));
    v.y = Math.min(60, Math.max(6, v.y));

    v.trail.push([v.x, v.y]);
    if (v.trail.length > 46) v.trail.shift();

    // Diff zone membership against previous state → transition events
    for (const z of sim.zones) {
      const now = inside([v.x, v.y], z.poly);
      const was = v.zones.has(z.id);
      if (now !== was) {
        if (now) v.zones.add(z.id);
        else v.zones.delete(z.id);
        z.flash = 1;
        sim.ripples.push({ x: v.x, y: v.y, age: 0, enter: now });
        onEvent({ key: sim.eventKey++, type: now ? "ENTER" : "EXIT", vehicle: v.id, zone: z.label.split(" · ")[0], t: sim.time });
      }
    }
  }
  for (const z of sim.zones) z.flash = Math.max(0, z.flash - dt * 1.4);
  sim.ripples.forEach((r) => (r.age += dt));
  sim.ripples = sim.ripples.filter((r) => r.age < 1.2);
}

function readColors() {
  const s = getComputedStyle(document.documentElement);
  const v = (n: string) => s.getPropertyValue(n).trim();
  return { fg: v("--fg"), muted: v("--fg-muted"), line: v("--line-strong"), accent: v("--accent"), warn: v("--warn"), bg: v("--bg-elev") };
}

export function GeofenceVisual({ className, large = false, fill = false }: { className?: string; large?: boolean; fill?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(wrapRef);
  const reduced = useReducedMotion();
  const theme = useTheme();
  const [events, setEvents] = useState<GeoEvent[]>([]);
  const simRef = useRef<Sim | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Warm-start the simulation so trails and the event log are populated immediately
    if (!simRef.current) {
      const sim = createSim(large ? 9 : 7);
      const warm: GeoEvent[] = [];
      for (let i = 0; i < 900; i++) step(sim, 1 / 60, (e) => warm.push(e));
      simRef.current = sim;
      setEvents(warm.slice(-5).reverse());
    }
    const sim = simRef.current;
    const colors = readColors();
    let raf = 0;
    let last = performance.now();
    let pending: GeoEvent[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);

    function draw() {
      const r = canvas!.getBoundingClientRect();
      const s = Math.min(r.width / W, r.height / H);
      const ox = (r.width - W * s) / 2;
      const oy = (r.height - H * s) / 2;
      const P = (x: number, y: number): Pt => [ox + x * s, oy + y * s];
      ctx!.clearRect(0, 0, r.width, r.height);

      // Streets
      ctx!.strokeStyle = colors.line;
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      XS.forEach((x) => {
        ctx!.moveTo(...P(x, 6));
        ctx!.lineTo(...P(x, 60));
      });
      YS.forEach((y) => {
        ctx!.moveTo(...P(6, y));
        ctx!.lineTo(...P(96, y));
      });
      ctx!.stroke();

      // Zones
      ctx!.font = `500 ${Math.max(9, s * 1.7)}px ui-monospace, monospace`;
      sim.zones.forEach((z) => {
        ctx!.beginPath();
        z.poly.forEach(([x, y], i) => (i ? ctx!.lineTo(...P(x, y)) : ctx!.moveTo(...P(x, y))));
        ctx!.closePath();
        ctx!.globalAlpha = 0.07 + z.flash * 0.2;
        ctx!.fillStyle = colors.accent;
        ctx!.fill();
        ctx!.globalAlpha = 0.55 + z.flash * 0.45;
        ctx!.setLineDash([5, 4]);
        ctx!.lineDashOffset = -sim.time * 8;
        ctx!.strokeStyle = colors.accent;
        ctx!.lineWidth = 1.2;
        ctx!.stroke();
        ctx!.setLineDash([]);
        ctx!.globalAlpha = 0.8;
        z.poly.forEach(([x, y]) => {
          const [px, py] = P(x, y);
          ctx!.fillStyle = colors.bg;
          ctx!.fillRect(px - 2.5, py - 2.5, 5, 5);
          ctx!.strokeStyle = colors.accent;
          ctx!.lineWidth = 1;
          ctx!.strokeRect(px - 2.5, py - 2.5, 5, 5);
        });
        ctx!.globalAlpha = 0.9;
        ctx!.fillStyle = colors.accent;
        const [lx, ly] = P(z.poly[0][0] + 1.2, z.poly[0][1] + 4);
        ctx!.fillText(z.label, lx, ly);
        ctx!.globalAlpha = 1;
      });

      // Trails + vehicles
      sim.vehicles.forEach((v) => {
        const inZone = v.zones.size > 0;
        const col = inZone ? colors.accent : colors.fg;
        for (let i = 1; i < v.trail.length; i++) {
          ctx!.globalAlpha = (i / v.trail.length) * 0.5;
          ctx!.strokeStyle = col;
          ctx!.lineWidth = 1.6;
          ctx!.beginPath();
          ctx!.moveTo(...P(...v.trail[i - 1]));
          ctx!.lineTo(...P(...v.trail[i]));
          ctx!.stroke();
        }
        ctx!.globalAlpha = 1;
        const [px, py] = P(v.x, v.y);
        if (inZone) {
          ctx!.globalAlpha = 0.25;
          ctx!.fillStyle = colors.accent;
          ctx!.beginPath();
          ctx!.arc(px, py, 7, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.globalAlpha = 1;
        }
        ctx!.fillStyle = col;
        ctx!.beginPath();
        ctx!.arc(px, py, 3, 0, Math.PI * 2);
        ctx!.fill();
      });

      // Ripples on transitions
      sim.ripples.forEach((rp) => {
        const [px, py] = P(rp.x, rp.y);
        ctx!.globalAlpha = 1 - rp.age / 1.2;
        ctx!.strokeStyle = rp.enter ? colors.accent : colors.warn;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.arc(px, py, 4 + rp.age * 26, 0, Math.PI * 2);
        ctx!.stroke();
      });
      ctx!.globalAlpha = 1;
    }

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      step(sim, dt, (e) => pending.push(e));
      if (pending.length) {
        const fresh = pending;
        pending = [];
        setEvents((prev) => [...fresh.reverse(), ...prev].slice(0, 5));
      }
      draw();
      raf = requestAnimationFrame(loop);
    };

    draw();
    if (inView && !reduced) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [inView, reduced, theme, large]);

  return (
    <div ref={wrapRef} className={cn("relative flex h-full w-full flex-col", className)}>
      <div className="flex items-center justify-between gap-3 px-1 pb-3 font-mono text-[10.5px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="relative flex size-1.5">
            <span className="animate-ping-soft absolute inset-0 rounded-full bg-accent" />
            <span className="relative size-1.5 rounded-full bg-accent" />
          </span>
          ws · connected
        </span>
        <span className="hidden sm:inline">ST_Covers · 3 zones · simulated feed</span>
      </div>
      <div
        className={cn(
          "relative aspect-[100/64] w-full [perspective:1100px]",
          fill && "tall:aspect-auto tall:min-h-0 tall:flex-1",
        )}
      >
        <div className="absolute inset-0 origin-bottom [transform:rotateX(20deg)] transition-transform duration-700 group-hover/visual:[transform:rotateX(8deg)]">
          <canvas
            ref={canvasRef}
            className="block h-full w-full"
            role="img"
            aria-label="Simulated city map: vehicles move along streets; dashed polygons are geofences that flash when a vehicle enters or exits."
          />
        </div>
      </div>
      <div className="glass mt-3 rounded-2xl p-3 font-mono text-[11px]">
        <div className="mb-2 flex items-center justify-between text-subtle">
          <span>event stream</span>
          <span>entry / exit</span>
        </div>
        <ul aria-live="off" className={cn("space-y-1", large ? "min-h-[110px]" : "min-h-[92px]")}>
          {events.slice(0, large ? 5 : 4).map((e) => (
            <li key={e.key} className="flex items-center gap-2.5 animate-fade-up">
              <span
                className={cn(
                  "w-[46px] rounded px-1.5 py-px text-center text-[10px] font-semibold",
                  e.type === "ENTER" ? "bg-accent text-accent-fg" : "bg-warn/20 text-warn",
                )}
              >
                {e.type}
              </span>
              <span className="text-fg">{e.vehicle}</span>
              <span className="text-subtle">→</span>
              <span className="text-muted">{e.zone}</span>
              <span className="ml-auto text-subtle">t+{e.t.toFixed(1)}s</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
