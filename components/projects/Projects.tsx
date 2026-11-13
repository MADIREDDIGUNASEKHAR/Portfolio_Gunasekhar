"use client";

import { ArrowUpRight } from "lucide-react";
import { type MotionValue, motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { siteConfig } from "@/config/site";
import { type Project, projects } from "@/data/projects";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { ProjectVisual } from "./ProjectVisual";

function ProjectPanel({
  project,
  i,
  total,
  progress,
  stacking,
}: {
  project: Project;
  i: number;
  total: number;
  progress: MotionValue<number>;
  stacking: boolean;
}) {
  const targetScale = 1 - (total - 1 - i) * 0.035;
  const scale = useTransform(progress, [i / total, 1], [1, targetScale]);
  const href = `/work/${project.slug}`;

  return (
    <div className="tall:sticky tall:top-0 tall:flex tall:h-[100svh] tall:items-center">
      <motion.article
        style={stacking ? { scale, top: `${i * 22}px` } : undefined}
        className="panel relative grid w-full origin-top !bg-bg-elev overflow-hidden rounded-[28px] sm:rounded-[34px] lg:grid-cols-12 tall:h-[calc(100svh-128px)] tall:max-h-[720px]"
        aria-labelledby={`project-${project.slug}`}
      >
        <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-50" />

        {/* Copy */}
        <div className="relative flex min-w-0 flex-col p-6 sm:p-9 lg:col-span-5 lg:p-10">
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-[13px] text-accent">
              {project.index}
              <span className="text-subtle"> / 0{total}</span>
            </span>
            <span className="chip">{project.category}</span>
          </div>

          <h3 id={`project-${project.slug}`} className="mt-6 text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] font-medium tracking-[-0.03em] text-balance">
            <Link href={href} className="transition-colors hover:text-accent">
              {project.title}
            </Link>
          </h3>
          <p className="serif-accent mt-2 text-[20px] text-accent sm:text-[22px]">{project.tagline}</p>
          <p className="mt-4 text-[14.5px] leading-relaxed text-muted text-pretty">{project.problem}</p>

          <ul className="mt-5 space-y-2.5">
            {project.highlights.map((h) => (
              <li key={h} className="flex gap-3 text-[13.5px] leading-relaxed text-fg/85">
                <span aria-hidden className="mt-[9px] h-px w-3 shrink-0 bg-accent" />
                {h}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {project.stack.map((s) => (
              <span key={s} className="chip !text-[10.5px]">
                {s}
              </span>
            ))}
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-7">
            <ButtonLink href={href} size="md" icon={<ArrowUpRight size={15} />}>
              Case study
            </ButtonLink>
            {project.repo ? (
              <ButtonLink
                href={project.repo}
                target="_blank"
                rel="noreferrer"
                variant="secondary"
                size="md"
                icon={<GithubIcon size={15} />}
              >
                Source
              </ButtonLink>
            ) : (
              <span className="text-[12.5px] text-subtle">{project.repoNote}</span>
            )}
          </div>
        </div>

        {/* Visual */}
        <div className="relative min-w-0 p-3 pt-0 sm:p-4 sm:pt-0 lg:col-span-7 lg:pt-4 lg:pl-0 tall:min-h-0">
          <Link
            href={href}
            aria-label={`Open the ${project.shortTitle} case study`}
            className="group/visual block h-full rounded-[22px] sm:rounded-[26px]"
          >
            <TiltCard className="h-full" max={4}>
              <div className="flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-bg-sunk/70 p-3.5 sm:rounded-[26px] sm:p-5">
                <ProjectVisual kind={project.visual} fill />
              </div>
            </TiltCard>
          </Link>
        </div>
      </motion.article>
    </div>
  );
}

export function Projects() {
  const stackRef = useRef<HTMLDivElement>(null);
  const stacking = useMediaQuery("(min-width: 1024px) and (min-height: 760px) and (prefers-reduced-motion: no-preference)");
  const { scrollYProgress } = useScroll({ target: stackRef, offset: ["start start", "end end"] });

  return (
    <section id="projects" className="section !pb-10" aria-labelledby="projects-title">
      <div className="container-x">
        <SectionHeading
          titleId="projects-title"
          index="03"
          eyebrow="Selected work"
          title="Systems built to"
          accent="survive production."
          intro="Each project below is a working system. The visuals are live simulations of what each one does — open a case study for the architecture, the trade-offs and the code."
        />

        <div ref={stackRef} className="relative mt-14 space-y-6 sm:mt-20 tall:mt-4 tall:space-y-0">
          {projects.map((p, i) => (
            <ProjectPanel key={p.slug} project={p} i={i} total={projects.length} progress={scrollYProgress} stacking={stacking} />
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 text-center tall:mt-6">
          <p className="text-muted">More experiments and source on GitHub.</p>
          <ButtonLink href={siteConfig.github.url} target="_blank" rel="noreferrer" variant="secondary" icon={<GithubIcon size={16} />}>
            @{siteConfig.github.handle}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
