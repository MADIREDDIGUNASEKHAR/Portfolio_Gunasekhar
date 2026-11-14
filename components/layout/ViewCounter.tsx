"use client";

import { Eye } from "lucide-react";
import { animate, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface Stats {
  enabled: true;
  total: number;
  today: number;
  days: { date: string; count: number }[];
}

const SESSION_KEY = "portfolio:view-counted";
let inflight: Promise<Stats | null> | null = null;

/** POST once per browser session (refreshes and in-app navigation don't re-count); GET otherwise. */
function loadStats(): Promise<Stats | null> {
  if (inflight) return inflight;
  let counted = false;
  try {
    counted = sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    /* storage blocked — count anyway */
  }
  inflight = fetch("/api/views", { method: counted ? "GET" : "POST", cache: "no-store" })
    .then((r) => r.json())
    .then((data: Stats | { enabled: false }) => {
      if (!data.enabled) return null;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      return data;
    })
    .catch(() => null);
  return inflight;
}

const fmt = new Intl.NumberFormat("en-IN");
const dayLabel = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

function CountUp({ value, start }: { value: number; start: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!start || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = fmt.format(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = fmt.format(Math.round(v))),
    });
    return () => controls.stop();
  }, [value, start]);
  return <span ref={ref} className="tabular-nums">0</span>;
}

export function ViewCounter() {
  const [stats, setStats] = useState<Stats | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });

  useEffect(() => {
    let alive = true;
    loadStats().then((s) => alive && setStats(s));
    return () => {
      alive = false;
    };
  }, []);

  if (!stats) return <div ref={ref} />;

  const max = Math.max(1, ...stats.days.map((d) => d.count));

  return (
    <div
      ref={ref}
      className="flex flex-col gap-5 border-b border-line py-7 sm:flex-row sm:items-end sm:justify-between"
      aria-label={`${fmt.format(stats.total)} portfolio views in total, ${fmt.format(stats.today)} today`}
    >
      <div className="flex items-center gap-4">
        <span className="grid size-11 place-items-center rounded-full border border-line-strong text-accent">
          <Eye size={18} />
        </span>
        <div>
          <p className="text-[clamp(1.75rem,3.2vw,2.4rem)] leading-none font-medium tracking-[-0.03em]">
            <CountUp value={stats.total} start={inView} />
            <span className="ml-2 text-[0.42em] font-normal tracking-normal text-muted">portfolio views</span>
          </p>
          <p className="mt-1.5 font-mono text-[11px] text-subtle">
            <span className="text-accent">+{fmt.format(stats.today)}</span> today · counted once per visit
          </p>
        </div>
      </div>

      <figure className="flex flex-col gap-2 sm:items-end">
        <div className="flex h-10 items-end gap-[3px]" role="img" aria-label="Views per day over the last 14 days">
          {stats.days.map((d, i) => (
            <span
              key={d.date}
              title={`${dayLabel(d.date)} · ${d.count} ${d.count === 1 ? "view" : "views"}`}
              className="w-2.5 origin-bottom rounded-[3px] transition-transform duration-700 ease-out sm:w-3"
              style={{
                height: `${Math.max(8, (d.count / max) * 100)}%`,
                background: d.count ? "var(--accent)" : "var(--line-strong)",
                opacity: i === stats.days.length - 1 ? 1 : 0.35 + (d.count / max) * 0.5,
                transform: inView ? "scaleY(1)" : "scaleY(0)",
                transitionDelay: `${i * 35}ms`,
              }}
            />
          ))}
        </div>
        <figcaption className="font-mono text-[10.5px] text-subtle">last 14 days</figcaption>
      </figure>
    </div>
  );
}
