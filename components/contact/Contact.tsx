"use client";

import { ArrowUpRight, Check, Copy, Download, Mail, Phone } from "lucide-react";
import { type ReactNode, useState } from "react";
import { GithubIcon, LinkedinIcon } from "@/components/ui/BrandIcons";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, SplitReveal } from "@/components/ui/Reveal";
import { mailto, siteConfig } from "@/config/site";
import { DotField } from "./DotField";

function ContactRow({
  icon,
  label,
  value,
  href,
  external,
  download,
  action,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href: string;
  external?: boolean;
  download?: string;
  action?: ReactNode;
}) {
  return (
    <li className="group relative flex items-center gap-4 border-b border-line py-5 first:border-t">
      <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong text-muted transition-colors duration-300 group-hover:border-accent group-hover:text-accent">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="eyebrow !text-[10.5px]">{label}</p>
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          download={download}
          className="mt-0.5 block truncate text-[17px] transition-colors after:absolute after:inset-0 hover:text-accent sm:text-[19px]"
        >
          {value}
        </a>
      </div>
      {action ?? <ArrowUpRight size={18} className="text-subtle transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />}
    </li>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(siteConfig.email);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          window.location.href = mailto();
        }
      }}
      className="relative z-10 inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong px-3 text-[12.5px] text-muted transition-colors hover:border-accent hover:text-fg"
      aria-label={copied ? "Email copied" : "Copy email address"}
    >
      {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function Contact() {
  return (
    <section id="contact" className="relative isolate overflow-hidden pt-[clamp(110px,14vw,180px)] pb-16" aria-labelledby="contact-title">
      <DotField className="absolute inset-0 -z-10 h-full w-full" />
      <div
        aria-hidden
        className="absolute bottom-[-30%] left-1/2 -z-10 h-[70vh] w-[90vw] -translate-x-1/2 rounded-full opacity-70 blur-[120px]"
        style={{ background: "radial-gradient(ellipse, var(--accent-soft), transparent 70%)" }}
      />

      <div className="container-x">
        <Reveal>
          <p className="eyebrow flex items-center gap-3">
            <span className="text-accent">06</span>
            <span className="h-px w-8 bg-line-strong" />
            Contact
          </p>
        </Reveal>

        <h2 id="contact-title" className="display mt-7 max-w-5xl text-[clamp(2.6rem,7vw,6.5rem)] text-balance">
          <SplitReveal text="Have a challenging problem?" />{" "}
          <SplitReveal text="Let's build something" delay={0.2} className="text-muted" />{" "}
          <SplitReveal text="remarkable." delay={0.35} className="serif-accent text-accent" />
        </h2>

        <div className="mt-14 grid gap-14 lg:grid-cols-12 lg:gap-10">
          <Reveal className="min-w-0 lg:col-span-5" delay={0.1}>
            <p className="max-w-md text-[17px] leading-relaxed text-muted text-pretty">
              I&apos;m open to full-time engineering roles and interesting problems — backend platforms, real-time
              systems, integrations, or products that need someone to own them end to end.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href={mailto("Let's start a conversation")} icon={<ArrowUpRight size={17} />}>
                Start a Conversation
              </ButtonLink>
              <ButtonLink href={siteConfig.resume.href} download={siteConfig.resume.fileName} variant="secondary" icon={<Download size={16} />}>
                Resume
              </ButtonLink>
            </div>
            <p className="mt-8 flex items-center gap-2 text-[13.5px] text-subtle">
              <span className="relative flex size-2">
                <span className="animate-ping-soft absolute inset-0 rounded-full bg-accent" />
                <span className="relative size-2 rounded-full bg-accent" />
              </span>
              Based in {siteConfig.location} · IST (UTC+5:30)
            </p>
          </Reveal>

          <Reveal className="min-w-0 lg:col-span-7" delay={0.15}>
            <ul>
              <ContactRow icon={<Mail size={18} />} label="Email" value={siteConfig.email} href={mailto()} action={<CopyEmail />} />
              <ContactRow icon={<GithubIcon size={18} />} label="GitHub" value={`github.com/${siteConfig.github.handle}`} href={siteConfig.github.url} external />
              <ContactRow
                icon={<LinkedinIcon size={17} />}
                label="LinkedIn"
                value={siteConfig.linkedin.isProfileUrl ? siteConfig.linkedin.handle : "Find me on LinkedIn"}
                href={siteConfig.linkedin.url}
                external
              />
              <ContactRow icon={<Phone size={18} />} label="Phone" value={siteConfig.phone} href={siteConfig.phoneHref} />
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
