"use client";

import { GraduationCap, MapPin } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import { siteConfig } from "@/config/site";
import { type DiagramNodeId, interests, stats } from "@/data/about";
import { education } from "@/data/experience";
import { cn } from "@/lib/utils";
import { SystemDiagram } from "./SystemDiagram";

export function About() {
  const [interestId, setInterestId] = useState<string | null>(null);
  const [hoverNode, setHoverNode] = useState<DiagramNodeId | null>(null);

  const activeNodes = useMemo(() => {
    if (hoverNode) return [hoverNode];
    return interests.find((i) => i.id === interestId)?.nodes ?? null;
  }, [interestId, hoverNode]);

  const linkedInterests = hoverNode ? interests.filter((i) => i.nodes.includes(hoverNode)).map((i) => i.id) : [];

  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="container-x">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-5">
            <SectionHeading
              titleId="about-title"
              index="01"
              eyebrow="About"
              title="I turn complex engineering problems into"
              accent="production-ready software."
            />
            <Reveal delay={0.1}>
              <div className="mt-8 space-y-4 text-[16.5px] leading-relaxed text-muted text-pretty">
                <p>
                  For about three years I&apos;ve built production software where correctness matters —{" "}
                  <span className="text-fg">payments, refunds, insurance, KYC and billing</span> — across Node.js
                  microservices, React dashboards and AWS.
                </p>
                <p>
                  I like owning a feature end to end: the API contract, the data model, the failure modes, and the admin
                  UI the operations team will live in. Lately that also means real-time systems, workflow orchestration
                  and putting LLMs to practical use.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <p className="eyebrow mt-10">What I gravitate to</p>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="Engineering interests">
                {interests.map((it) => {
                  const on = interestId === it.id || linkedInterests.includes(it.id);
                  return (
                    <li key={it.id}>
                      <button
                        type="button"
                        aria-pressed={interestId === it.id}
                        onPointerEnter={() => setInterestId(it.id)}
                        onPointerLeave={() => setInterestId(null)}
                        onFocus={() => setInterestId(it.id)}
                        onBlur={() => setInterestId(null)}
                        onClick={() => setInterestId((cur) => (cur === it.id ? null : it.id))}
                        className={cn(
                          "rounded-full border px-3.5 py-1.5 text-[13.5px] transition-all duration-300",
                          on
                            ? "border-accent bg-accent-soft text-fg"
                            : "border-line-strong text-muted hover:border-fg/30 hover:text-fg",
                        )}
                      >
                        {it.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          </div>

          <div className="min-w-0 lg:col-span-7 lg:pt-6">
            <Reveal delay={0.1}>
              <figure className="panel relative overflow-hidden rounded-[28px] p-4 sm:p-6">
                <div aria-hidden className="bg-dots absolute inset-0 opacity-40" />
                <div className="relative flex items-center justify-between gap-4 pb-3">
                  <span className="eyebrow !text-[10.5px]">system.map — the shape of my day-to-day</span>
                  <span className="hidden items-center gap-1.5 font-mono text-[10.5px] text-subtle sm:flex">
                    <span className="size-1.5 rounded-full bg-accent" /> live traffic
                  </span>
                </div>
                <div className="relative -mx-4 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
                  <div className="min-w-[600px] sm:min-w-0">
                    <SystemDiagram active={activeNodes} onHoverNode={setHoverNode} />
                  </div>
                </div>
                <figcaption className="relative mt-3 text-[13px] text-subtle">
                  <span className="sm:hidden">Swipe to explore · tap an interest to trace it through the stack.</span>
                  <span className="max-sm:hidden">Hover an interest — or a node — to trace it through the stack.</span>
                </figcaption>
              </figure>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="group mt-6 grid overflow-hidden rounded-[28px] border border-line bg-bg-elev/50 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                <div className="relative aspect-[5/4] overflow-hidden sm:aspect-auto sm:min-h-[320px]">
                  <Image
                    src={siteConfig.photo.src}
                    alt={siteConfig.photo.alt}
                    fill
                    sizes="(min-width: 1024px) 300px, (min-width: 640px) 40vw, 100vw"
                    className="object-cover object-[50%_28%] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg/60 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-transparent sm:to-bg/30" />
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--glass-strong)] px-2.5 py-1 font-mono text-[10.5px] text-fg backdrop-blur-md">
                    <span className="size-1.5 rounded-full bg-accent" /> open to opportunities
                  </span>
                </div>
                <div className="flex flex-col gap-6 p-6 sm:p-7">
                  <div>
                    <p className="eyebrow">Hello, I&apos;m</p>
                    <p className="mt-2 text-[24px] leading-tight font-medium tracking-[-0.02em]">{siteConfig.name}</p>
                    <p className="mt-1.5 text-[14.5px] text-muted">
                      {siteConfig.title} · {siteConfig.currentRole.title} at {siteConfig.currentRole.company}
                    </p>
                  </div>
                  <dl className="grid grid-cols-2 gap-4 border-y border-line py-4">
                    <div>
                      <dt className="eyebrow !text-[10px]">Based in</dt>
                      <dd className="mt-1 flex items-center gap-1.5 text-[14px]">
                        <MapPin size={13} className="text-accent" /> {siteConfig.location}
                      </dd>
                    </div>
                    <div>
                      <dt className="eyebrow !text-[10px]">Experience</dt>
                      <dd className="mt-1 text-[14px]">{siteConfig.experience}</dd>
                    </div>
                  </dl>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <a
                      href={siteConfig.linkedin.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center gap-2 rounded-full border border-line-strong px-3.5 text-[13px] transition-colors hover:border-accent hover:text-accent"
                    >
                      <LinkedinIcon size={14} /> LinkedIn
                    </a>
                    <a
                      href={siteConfig.github.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center gap-2 rounded-full border border-line-strong px-3.5 text-[13px] transition-colors hover:border-accent hover:text-accent"
                    >
                      <GithubIcon size={14} /> GitHub
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-[24px] border border-line bg-line lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06} className="bg-bg">
              <div className="flex h-full flex-col justify-between gap-6 p-5 sm:p-7">
                <p className="text-[clamp(2.25rem,4.4vw,3.5rem)] leading-none font-medium tracking-[-0.04em]">
                  {s.value}
                  {s.suffix && <span className="ml-1 text-[0.45em] tracking-normal text-muted">{s.suffix}</span>}
                </p>
                <p className="text-[13.5px] text-muted">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-3 font-mono text-[11px] text-subtle">Figures as stated on my resume.</p>

        <Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {education.map((ed) => (
              <div key={ed.school} className="flex gap-4 rounded-[20px] border border-line p-5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                  <GraduationCap size={18} />
                </span>
                <div>
                  <p className="font-medium">{ed.school}</p>
                  <p className="text-[14px] text-muted">{ed.program}</p>
                  {ed.detail && <p className="mt-0.5 text-[13px] text-subtle">{ed.detail}</p>}
                  <p className="mt-2 font-mono text-[11.5px] text-subtle">{ed.period}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
