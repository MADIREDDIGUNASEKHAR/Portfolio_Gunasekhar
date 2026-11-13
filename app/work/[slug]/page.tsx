import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";
import { notFound } from "next/navigation";
import { ArchitectureDiagram, ArchitectureLegend } from "@/components/projects/ArchitectureDiagram";
import { ProjectVisual } from "@/components/projects/ProjectVisual";
import { GithubIcon } from "@/components/ui/BrandIcons";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig } from "@/config/site";
import { getProject, projects } from "@/data/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    openGraph: { title: `${project.title} — ${siteConfig.name}`, description: project.summary, type: "article" },
    alternates: { canonical: `/work/${project.slug}` },
  };
}

function Block({ index, title, children }: { index: string; title: string; children: ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-line py-14 sm:py-20 lg:grid-cols-12 lg:gap-10">
      <Reveal className="lg:col-span-4">
        <p className="eyebrow">
          <span className="text-accent">{index}</span> — {title}
        </p>
      </Reveal>
      <div className="min-w-0 lg:col-span-8">{children}</div>
    </section>
  );
}

/** Sync shell: params are read inside Suspense so navigations stay instant (Cache Components). */
export default function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  return (
    <Suspense fallback={<CaseStudyFallback />}>
      <CaseStudy params={params} />
    </Suspense>
  );
}

function CaseStudyFallback() {
  return (
    <main id="main" className="container-x min-h-[100svh] pt-40" aria-busy="true">
      <div className="h-4 w-32 rounded-full bg-line" />
      <div className="mt-10 h-16 max-w-3xl rounded-2xl bg-line" />
      <div className="mt-4 h-16 max-w-xl rounded-2xl bg-line" />
    </main>
  );
}

async function CaseStudy({ params }: { params: PageProps<"/work/[slug]">["params"] }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const idx = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(idx + 1) % projects.length];

  return (
    <main id="main" className="relative">
      <div aria-hidden className="bg-grid absolute inset-x-0 top-0 -z-10 h-[90vh] opacity-60" />

      <article className="container-x pt-32 sm:pt-40">
        <Reveal>
          <Link href="/#projects" className="inline-flex items-center gap-2 text-[13.5px] text-muted transition-colors hover:text-fg">
            <ArrowLeft size={15} /> All projects
          </Link>
        </Reveal>

        <header className="mt-10 max-w-5xl">
          <Reveal delay={0.05}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[13px] text-accent">Project {project.index}</span>
              <span className="chip">{project.category}</span>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="display mt-6 text-[clamp(2.5rem,7vw,6rem)] text-balance">{project.title}</h1>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="serif-accent mt-4 text-[clamp(1.4rem,2.6vw,2rem)] text-accent">{project.tagline}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-3xl text-[18px] leading-relaxed text-muted text-pretty">{project.summary}</p>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {project.repo ? (
                <ButtonLink href={project.repo} target="_blank" rel="noreferrer" icon={<GithubIcon size={16} />}>
                  View on GitHub
                </ButtonLink>
              ) : (
                <p className="rounded-full border border-line-strong px-4 py-2.5 text-[13.5px] text-muted">{project.repoNote}</p>
              )}
            </div>
          </Reveal>
        </header>

        <Reveal delay={0.1}>
          <div className="panel mt-14 rounded-[30px] p-3 sm:p-5">
            <div className="rounded-[22px] border border-line bg-bg-sunk/70 p-4 sm:p-7">
              <ProjectVisual kind={project.visual} large />
            </div>
          </div>
        </Reveal>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {project.stack.map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>

        <div className="mt-16">
          <Block index="01" title="The problem">
            <Reveal>
              <p className="text-[clamp(1.35rem,2.4vw,2rem)] leading-snug font-medium tracking-[-0.02em] text-balance">{project.problem}</p>
            </Reveal>
          </Block>

          <Block index="02" title="Architecture">
            <Reveal>
              <figure className="panel overflow-hidden rounded-[26px] p-4 sm:p-6">
                <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                  <div className="min-w-[640px]">
                    <ArchitectureDiagram architecture={project.architecture} id={project.slug} />
                  </div>
                </div>
                <figcaption className="mt-5 flex flex-col gap-4 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[13.5px] text-muted">{project.architecture.caption}</span>
                  <ArchitectureLegend />
                </figcaption>
              </figure>
            </Reveal>
          </Block>

          <Block index="03" title="Key technical decisions">
            <ol className="grid gap-4 sm:grid-cols-2">
              {project.decisions.map((d, i) => (
                <li key={d.title}>
                  <Reveal delay={i * 0.05} className="h-full">
                    <div className="h-full rounded-[22px] border border-line bg-bg-elev/50 p-6">
                      <span className="font-mono text-[12px] text-accent">D{i + 1}</span>
                      <h3 className="mt-3 text-[19px] leading-snug font-medium tracking-tight">{d.title}</h3>
                      <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted">{d.body}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </Block>

          <Block index="04" title="Implementation">
            <div className="grid gap-10">
              <Reveal>
                <ul className="space-y-3.5">
                  {project.implementation.map((it) => (
                    <li key={it} className="flex gap-3 text-[15.5px] leading-relaxed">
                      <span aria-hidden className="mt-[11px] h-px w-3 shrink-0 bg-accent" />
                      {it}
                    </li>
                  ))}
                </ul>
              </Reveal>
              <div className="min-w-0 space-y-4">
                {project.snippets.map((sn) => (
                  <Reveal key={sn.label}>
                    <figure>
                      <figcaption className="mb-2 flex items-center justify-between font-mono text-[11px] text-muted">
                        <span>{sn.label}</span>
                        <span className="text-subtle">{sn.lang} · simplified sketch</span>
                      </figcaption>
                      <pre className="code-block" data-lenis-prevent>
                        <code>{sn.code}</code>
                      </pre>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </div>
          </Block>

          <Block index="05" title="Engineering challenges">
            <ul className="divide-y divide-line border-y border-line">
              {project.challenges.map((c) => (
                <li key={c.challenge}>
                  <Reveal>
                    <div className="grid gap-2 py-5 sm:grid-cols-2 sm:gap-8">
                      <p className="text-[15.5px] font-medium">{c.challenge}</p>
                      <p className="flex gap-2 text-[15px] text-muted">
                        <ArrowRight size={16} className="mt-1 shrink-0 text-accent" />
                        {c.approach}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </Block>
        </div>

        <nav aria-label="Next project" className="border-t border-line py-16 sm:py-24">
          <Link href={`/work/${next.slug}`} className="group block">
            <p className="eyebrow">Next project · {next.index}</p>
            <p className="display mt-4 flex items-center gap-4 text-[clamp(2rem,5.5vw,4.5rem)] transition-colors group-hover:text-accent">
              {next.title}
              <ArrowUpRight className="size-[0.6em] shrink-0 transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2" />
            </p>
            <p className="serif-accent mt-2 text-[22px] text-muted">{next.tagline}</p>
          </Link>
        </nav>
      </article>
    </main>
  );
}
