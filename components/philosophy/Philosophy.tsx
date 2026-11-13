"use client";

import { Activity, Compass, Gauge, LifeBuoy, Rocket, ShieldCheck } from "lucide-react";
import { useRef } from "react";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import { philosophy } from "@/data/about";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const ICONS = [Compass, Activity, ShieldCheck, Gauge, LifeBuoy, Rocket];

function StepCard({ step, i, horizontal }: { step: (typeof philosophy)[number]; i: number; horizontal: boolean }) {
  const Icon = ICONS[i];
  return (
    <article
      data-step={i}
      className={cn(
        "step group relative flex flex-col rounded-[26px] border border-line bg-bg-elev/60 p-6 transition-[border-color,background-color] duration-500 sm:p-7",
        horizontal && "w-[min(400px,80vw)] shrink-0",
        "data-[active=true]:border-accent/50 data-[active=true]:bg-bg-elev",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[13px] text-accent">{step.index}</span>
        <span className="grid size-11 place-items-center rounded-full border border-line-strong text-muted transition-colors duration-500 group-data-[active=true]:border-accent group-data-[active=true]:bg-accent group-data-[active=true]:text-accent-fg">
          <Icon size={18} strokeWidth={1.75} />
        </span>
      </div>
      <h3 className="mt-10 text-[26px] leading-tight font-medium tracking-[-0.025em]">{step.title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{step.body}</p>
      <div className="mt-auto pt-8">
        <div className="hairline mb-4" />
        <p className="eyebrow !text-[10px]">In practice</p>
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-fg/85">{step.example}</p>
      </div>
    </article>
  );
}

export function Philosophy() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const steps = gsap.utils.toArray<HTMLElement>(".step", el);
        const distance = () => el.scrollWidth - el.clientWidth;
        steps[0]?.setAttribute("data-active", "true");

        gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 0.4}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
              const activeIdx = Math.min(steps.length - 1, Math.floor(self.progress * steps.length * 0.999 + 0.35));
              steps.forEach((s, i) => s.setAttribute("data-active", String(i <= activeIdx)));
            },
          },
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} id="philosophy" className="relative overflow-hidden py-[clamp(96px,13vw,168px)] lg:motion-safe:flex lg:motion-safe:h-[100svh] lg:motion-safe:flex-col lg:motion-safe:justify-center lg:motion-safe:py-0" aria-labelledby="philosophy-title">
      <div aria-hidden className="bg-grid absolute inset-0 opacity-50" />
      <div className="container-x relative">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            titleId="philosophy-title"
            index="05"
            eyebrow="Engineering philosophy"
            title="I care about what happens"
            accent="after the code works."
            className="max-w-3xl [&_.h2]:text-[clamp(2.1rem,4.4vw,4rem)]"
          />
          <p className="hidden max-w-[240px] font-mono text-[11px] text-subtle lg:motion-safe:block">Scroll to walk the workflow →</p>
        </div>

        {/* progress rail (desktop) */}
        <div className="relative mt-10 hidden h-px bg-line lg:motion-safe:block">
          <div ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-accent" />
        </div>
      </div>

      {/* Desktop: horizontal track */}
      <div className="relative mt-8 hidden lg:motion-safe:block">
        <div ref={track} className="flex gap-5 pr-[40px] pl-[max(40px,calc((100vw-1320px)/2+40px))] will-change-transform">
          {philosophy.map((step, i) => (
            <StepCard key={step.index} step={step} i={i} horizontal />
          ))}
          <div className="flex w-[min(360px,70vw)] shrink-0 flex-col justify-center rounded-[26px] border border-dashed border-line-strong p-7">
            <p className="serif-accent text-[30px] leading-tight text-accent">…and then do it again.</p>
            <p className="mt-3 text-[14.5px] text-muted">Production is a loop, not a launch.</p>
          </div>
        </div>
      </div>

      {/* Mobile / tablet / reduced motion: vertical flow */}
      <ol className="container-x relative mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:motion-safe:hidden">
        {philosophy.map((step, i) => (
          <li key={step.index}>
            <Reveal delay={(i % 2) * 0.05}>
              <StepCard step={step} i={i} horizontal={false} />
            </Reveal>
          </li>
        ))}
      </ol>
    </section>
  );
}
