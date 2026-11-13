"use client";

import { ArrowUpRight, Plus } from "lucide-react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import { type Experience as ExperienceItem, experience } from "@/data/experience";
import { cn } from "@/lib/utils";

function TimelineItem({ item, index }: { item: ExperienceItem; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <li className="relative pl-10 sm:pl-16">
      {/* node on the rail */}
      <span aria-hidden className="absolute top-8 left-[11px] grid size-[11px] place-items-center sm:left-[19px]">
        {item.current && <span className="animate-ping-soft absolute inset-0 rounded-full bg-accent" />}
        <span
          className={cn(
            "relative size-[11px] rounded-full border-2",
            item.current ? "border-accent bg-accent" : "border-line-strong bg-bg",
          )}
        />
      </span>

      <Reveal delay={index * 0.05}>
        <article
          className={cn(
            "relative overflow-hidden rounded-[26px] border p-6 transition-colors duration-500 sm:p-8",
            item.current ? "panel border-accent/40" : "border-line bg-bg-elev/40 hover:border-line-strong",
          )}
        >
          {item.current && (
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full opacity-70 blur-3xl"
              style={{ background: "radial-gradient(circle, var(--accent-soft), transparent 70%)" }}
            />
          )}

          <header className="relative flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className={cn("font-medium tracking-tight", item.current ? "text-[28px] sm:text-[34px]" : "text-[24px] sm:text-[28px]")}>
                  {item.company}
                </h3>
                {item.current && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 font-mono text-[10.5px] font-medium tracking-wider text-accent-fg uppercase">
                    Current role
                  </span>
                )}
              </div>
              <p className="mt-1 text-[15.5px] text-fg/90">{item.role}</p>
            </div>
            <p className="font-mono text-[12.5px] text-muted">{item.period}</p>
          </header>

          <p className="relative mt-4 max-w-2xl text-[15.5px] text-muted">{item.context}</p>

          <dl className="relative mt-6 flex flex-wrap gap-x-10 gap-y-4">
            {item.metrics.map((m) => (
              <div key={m.label}>
                <dt className="sr-only">{m.label}</dt>
                <dd>
                  <span className="block text-[30px] leading-none font-medium tracking-[-0.03em] text-accent">{m.value}</span>
                  <span className="mt-1.5 block text-[12.5px] text-muted">{m.label}</span>
                </dd>
              </div>
            ))}
          </dl>

          <ul className="relative mt-7 space-y-3">
            {item.highlights.map((h) => (
              <li key={h} className="flex gap-3 text-[15px] leading-relaxed text-fg/85">
                <span aria-hidden className="mt-[9px] h-px w-3 shrink-0 bg-accent" />
                {h}
              </li>
            ))}
          </ul>

          <div className="relative mt-7 flex flex-wrap gap-1.5">
            {item.stack.map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>

          <div className="relative mt-7 flex flex-wrap items-center gap-3 border-t border-line pt-5">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
              className="group inline-flex items-center gap-2.5 text-[14px] font-medium"
            >
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full border border-line-strong transition-all duration-300 group-hover:border-accent group-hover:text-accent",
                  open && "rotate-45 border-accent text-accent",
                )}
              >
                <Plus size={14} />
              </span>
              {open ? "Hide engineering breakdown" : "View engineering breakdown"}
            </button>
            {item.relatedProject && (
              <Link
                href={`/work/${item.relatedProject}`}
                className="ml-auto inline-flex items-center gap-1 text-[13.5px] text-muted transition-colors hover:text-accent"
              >
                Case study <ArrowUpRight size={14} />
              </Link>
            )}
          </div>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id={panelId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative overflow-hidden"
              >
                <div className="grid gap-x-8 gap-y-7 pt-7 md:grid-cols-2">
                  {item.breakdown.map((g, gi) => (
                    <motion.div
                      key={g.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * gi + 0.1 }}
                    >
                      <p className="eyebrow !text-accent">{g.title}</p>
                      <ul className="mt-3 space-y-2.5">
                        {g.items.map((it) => (
                          <li key={it} className="text-[14px] leading-relaxed text-muted">
                            {it}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </article>
      </Reveal>
    </li>
  );
}

export function Experience() {
  const listRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionHeading
              titleId="experience-title"
              index="02"
              eyebrow="Experience"
              title="Production systems,"
              accent="end to end."
              intro="Three roles, one through-line: shipping software that handles real money, real users and real failure modes."
            />
          </div>
        </div>

        <div className="relative min-w-0 lg:col-span-8">
          <div aria-hidden className="absolute top-2 bottom-2 left-4 w-px bg-line sm:left-6">
            <motion.div style={{ scaleY: progress }} className="h-full w-px origin-top bg-gradient-to-b from-accent via-accent to-transparent" />
          </div>
          <ol ref={listRef} className="space-y-8">
            {experience.map((item, i) => (
              <TimelineItem key={item.id} item={item} index={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
