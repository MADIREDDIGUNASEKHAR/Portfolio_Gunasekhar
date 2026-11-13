"use client";

import { ArrowDown, ArrowRight, Download } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { scrollToSection } from "@/lib/scroll";
import { HeroScene } from "./HeroScene";
import { RotatingText } from "./RotatingText";

const PHRASES = ["From Architecture to Production.", "From API Design to Admin UI.", "From Data Model to Dashboard."];

const meta = [
  { label: "Role", value: "Full-Stack Engineer" },
  { label: "Experience", value: `${siteConfig.experience}` },
  { label: "Based in", value: siteConfig.location },
  { label: "Currently", value: `${siteConfig.currentRole.title} @ ${siteConfig.currentRole.company}` },
];

export function Hero() {
  return (
    <section id="home" aria-label="Introduction" className="relative isolate min-h-[100svh] overflow-hidden">
      {/* Atmosphere */}
      <div aria-hidden className="bg-grid absolute inset-0 -z-20 opacity-70" />
      <div
        aria-hidden
        className="absolute top-[10%] right-[-10%] -z-20 h-[70vh] w-[70vh] rounded-full opacity-60 blur-[120px]"
        style={{ background: "radial-gradient(circle, var(--accent-soft), transparent 70%)" }}
      />
      <div className="absolute inset-0 -z-10 max-lg:opacity-60">
        <HeroScene />
      </div>
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-bg"
      />

      <div className="container-x flex min-h-[100svh] flex-col pt-32 pb-8 sm:pt-36 lg:pt-40">
        <div className="flex flex-1 flex-col justify-center">
          <p
            className="animate-fade-up inline-flex w-fit items-center gap-2.5 rounded-full border border-line-strong bg-[var(--glass)] py-1 pr-4 pl-1 text-[12.5px] text-muted backdrop-blur-md"
            style={{ animationDelay: "0.05s" }}
          >
            <span className="relative shrink-0">
              <Image
                src={siteConfig.photo.src}
                alt=""
                width={28}
                height={28}
                loading="eager"
                className="size-7 rounded-full object-cover object-[50%_30%] ring-1 ring-line-strong"
              />
              <span className="absolute -right-0.5 -bottom-0.5 flex size-2.5">
                <span className="animate-ping-soft absolute inset-0 rounded-full bg-accent" />
                <span className="relative size-2.5 rounded-full border-2 border-bg bg-accent" />
              </span>
            </span>
            Available for engineering opportunities
          </p>

          <h1 className="display mt-7 text-[clamp(2.9rem,8.6vw,8.25rem)]">
            <span className="block overflow-hidden pb-[0.06em]">
              <span className="animate-rise block" style={{ animationDelay: "0.1s" }}>
                Building Systems.
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.1em]">
              <span className="animate-rise block" style={{ animationDelay: "0.22s" }}>
                Engineering <span className="serif-accent text-accent">Possibilities.</span>
              </span>
            </span>
          </h1>

          <p
            className="animate-fade-up mt-5 font-mono text-[13px] tracking-wide text-muted sm:text-sm"
            style={{ animationDelay: "0.45s" }}
          >
            <span className="mr-2 text-accent">→</span>
            <RotatingText phrases={PHRASES} />
          </p>

          <p
            className="animate-fade-up mt-7 max-w-xl text-[17px] leading-relaxed text-muted text-pretty sm:text-lg"
            style={{ animationDelay: "0.55s" }}
          >
            I&apos;m <span className="text-fg">Guna</span> — a Full-Stack Engineer building scalable backend systems,
            intelligent applications and real-world software products.
          </p>

          <div className="animate-fade-up mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: "0.65s" }}>
            <ButtonLink
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("projects");
              }}
              icon={<ArrowRight size={17} />}
            >
              Explore My Work
            </ButtonLink>
            <ButtonLink
              href={siteConfig.resume.href}
              download={siteConfig.resume.fileName}
              variant="secondary"
              icon={<Download size={16} />}
            >
              Download Resume
            </ButtonLink>
            <ButtonLink
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("contact");
              }}
              variant="ghost"
              className="underline-offset-4 hover:underline"
            >
              Let&apos;s Connect
            </ButtonLink>
          </div>
        </div>

        <dl
          className="animate-fade-up mt-14 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 md:grid-cols-4"
          style={{ animationDelay: "0.8s" }}
        >
          {meta.map((m) => (
            <div key={m.label}>
              <dt className="eyebrow !text-[10.5px]">{m.label}</dt>
              <dd className="mt-1.5 text-[14.5px] text-fg">{m.value}</dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={() => scrollToSection("about")}
          className="mx-auto mt-8 hidden flex-col items-center gap-2 text-subtle transition-colors hover:text-fg sm:flex"
          aria-label="Scroll to About"
        >
          <span className="relative h-10 w-px overflow-hidden bg-line-strong">
            <span className="animate-scroll-cue absolute inset-x-0 top-0 h-1/2 bg-accent" />
          </span>
          <ArrowDown size={14} />
        </button>
      </div>
    </section>
  );
}
