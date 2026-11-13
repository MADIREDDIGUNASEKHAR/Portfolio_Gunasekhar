"use client";

import { Check, RotateCw, X } from "lucide-react";
import { useRef } from "react";
import { useInView } from "@/hooks/useInView";
import { useLoopClock } from "@/hooks/useLoopClock";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

const STAGES = [
  { name: "Ingest", sub: "Excel · JSON" },
  { name: "Extract", sub: "keywords" },
  { name: "Tailor", sub: "Llama 3-70B" },
  { name: "DOCX", sub: "render" },
  { name: "Send", sub: "SMTP" },
];

const JOBS = [
  { id: "job_01", role: "Backend Engineer", keywords: ["node.js", "kafka", "microservices"], angle: "distributed systems" },
  { id: "job_02", role: "Full-Stack Developer", keywords: ["react", "next.js", "rest apis"], angle: "end-to-end ownership" },
  { id: "job_03", role: "Platform Engineer", keywords: ["docker", "aws", "redis"], angle: "reliability", retryAt: 2 },
  { id: "job_04", role: "Node.js Developer", keywords: ["express", "mongodb", "jwt"], angle: "api design" },
  { id: "job_05", role: "Software Engineer", keywords: ["typescript", "postgresql", "system design"], angle: "performance", failAt: 4 },
];

const D = 600; // base stage duration (ms)
const GAP = 1000; // stagger between jobs
const CYCLE = 12000;

type Window = { from: number; to: number; kind: "run" | "backoff"; label?: string };
type StageSchedule = { start: number; end: number; windows: Window[]; outcome: "ok" | "fail" };

const SCHEDULE: StageSchedule[][] = JOBS.map((job, j) => {
  let cursor = j * GAP;
  const stages: StageSchedule[] = [];
  for (let s = 0; s < STAGES.length; s++) {
    const start = cursor;
    const windows: Window[] = [];
    const run = () => {
      windows.push({ from: cursor, to: cursor + D, kind: "run" });
      cursor += D;
    };
    const backoff = (ms: number, label: string) => {
      windows.push({ from: cursor, to: cursor + ms, kind: "backoff", label });
      cursor += ms;
    };
    run();
    let outcome: "ok" | "fail" = "ok";
    if (job.retryAt === s) {
      backoff(700, "retry 1 · 1s");
      run();
    }
    if (job.failAt === s) {
      backoff(600, "retry 1 · 1s");
      run();
      backoff(900, "retry 2 · 2s");
      run();
      outcome = "fail";
    }
    stages.push({ start, end: cursor, windows, outcome });
    if (outcome === "fail") break;
  }
  return stages;
});

type CellState = { kind: "pending" | "active" | "backoff" | "done" | "failed" | "skipped"; progress?: number; label?: string };

function cellState(job: number, stage: number, t: number): CellState {
  const stages = SCHEDULE[job];
  const st = stages[stage];
  if (!st) {
    const failedStage = stages[stages.length - 1];
    return t >= failedStage.end ? { kind: "skipped" } : { kind: "pending" };
  }
  if (t < st.start) return { kind: "pending" };
  if (t >= st.end) return { kind: st.outcome === "ok" ? "done" : "failed" };
  const w = st.windows.find((win) => t >= win.from && t < win.to)!;
  if (w.kind === "backoff") return { kind: "backoff", label: w.label };
  return { kind: "active", progress: (t - w.from) / (w.to - w.from) };
}

export function PipelineVisual({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduced = useReducedMotion();
  const { t } = useLoopClock(CYCLE, inView && !reduced, 7400);

  // Job currently in the LLM stages drives the prompt-layer panel
  const focusIdx = (() => {
    let idx = 0;
    JOBS.forEach((_, j) => {
      const ext = SCHEDULE[j][1];
      if (ext && t >= ext.start) idx = j;
    });
    return idx;
  })();
  const focus = JOBS[focusIdx];
  const extracted = SCHEDULE[focusIdx][1] && t >= SCHEDULE[focusIdx][1].end;

  const doneCount = JOBS.filter((_, j) => {
    const last = SCHEDULE[j][SCHEDULE[j].length - 1];
    return SCHEDULE[j].length === STAGES.length && last.outcome === "ok" && t >= last.end;
  }).length;
  const isolated = JOBS.filter((_, j) => {
    const last = SCHEDULE[j][SCHEDULE[j].length - 1];
    return last.outcome === "fail" && t >= last.end;
  }).length;

  return (
    <div ref={ref} className={cn("flex h-full w-full flex-col gap-3", className)}>
      <div className="glass rounded-2xl p-3.5">
        <div className="flex items-center justify-between font-mono text-[10.5px] text-muted">
          <span>prompt layer · {focus.id}</span>
          <span className="text-subtle">Groq · Llama 3-70B</span>
        </div>
        <p className="mt-2 truncate text-[13.5px] font-medium">{focus.role}</p>
        <div className="mt-2 flex min-h-[26px] flex-wrap items-center gap-1.5">
          {extracted ? (
            <>
              {focus.keywords.map((k, i) => (
                <span key={k} className="chip animate-fade-up !border-accent/40 !text-fg" style={{ animationDelay: `${i * 80}ms` }}>
                  {k}
                </span>
              ))}
              <span className="ml-1 font-mono text-[10.5px] text-muted">
                focus → <span className="text-accent">{focus.angle}</span>
              </span>
            </>
          ) : (
            <span className="font-mono text-[11px] text-subtle">extracting keywords…</span>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-bg-sunk/60 p-3">
        <div className="grid grid-cols-[minmax(64px,1.1fr)_repeat(5,minmax(0,1fr))] gap-1.5 pb-2 font-mono text-[9.5px] text-subtle sm:text-[10px]">
          <span>job</span>
          {STAGES.map((s) => (
            <span key={s.name} className="truncate text-center">
              {s.name}
              <span className="hidden text-subtle/70 lg:block">{s.sub}</span>
            </span>
          ))}
        </div>
        <div className="grid flex-1 auto-rows-fr gap-1.5">
          {JOBS.map((job, j) => (
            <div key={job.id} className="grid grid-cols-[minmax(64px,1.1fr)_repeat(5,minmax(0,1fr))] items-stretch gap-1.5">
              <span className="self-center truncate font-mono text-[10.5px] text-muted">{job.id}</span>
              {STAGES.map((_, s) => {
                const c = cellState(j, s, t);
                return (
                  <div
                    key={s}
                    title={c.label}
                    className={cn(
                      "relative grid min-h-8 place-items-center overflow-hidden rounded-lg border text-[10px] transition-colors duration-300",
                      c.kind === "pending" && "border-line bg-transparent",
                      c.kind === "active" && "border-accent/60 bg-accent-soft",
                      c.kind === "backoff" && "animate-pulse-ring border-warn/70 bg-warn/10 text-warn",
                      c.kind === "done" && "border-accent/30 bg-accent-soft text-accent",
                      c.kind === "failed" && "border-danger/60 bg-danger/10 text-danger",
                      c.kind === "skipped" && "border-dashed border-line bg-transparent",
                    )}
                  >
                    {c.kind === "active" && (
                      <span className="absolute inset-y-0 left-0 bg-accent/25" style={{ width: `${(c.progress ?? 0) * 100}%` }} />
                    )}
                    {c.kind === "done" && <Check size={13} strokeWidth={2.5} />}
                    {c.kind === "failed" && <X size={13} strokeWidth={2.5} />}
                    {c.kind === "backoff" && (
                      <span className="flex items-center gap-1 font-mono">
                        <RotateCw size={11} className="motion-safe:animate-spin" />
                        <span className="hidden xl:inline">{c.label?.split(" · ")[1]}</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-1 font-mono text-[10.5px]">
        <span className="text-muted">
          batch {JOBS.length} · <span className="text-accent">sent {doneCount}</span> ·{" "}
          <span className={isolated ? "text-danger" : "text-subtle"}>isolated {isolated}</span>
        </span>
        <span className="text-subtle">{isolated ? "failure contained — batch continues" : "retry + exponential backoff"}</span>
      </div>
    </div>
  );
}
