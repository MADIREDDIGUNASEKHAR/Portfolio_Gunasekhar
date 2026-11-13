"use client";

import { motion } from "motion/react";
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Fades and lifts content into view once. */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Splits text into words that rise through a mask, staggered. */
export function SplitReveal({
  text,
  as: Tag = "span",
  className,
  delay = 0,
  stagger = 0.045,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(" ");
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        className="inline"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ staggerChildren: stagger, delayChildren: delay }}
      >
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
            <motion.span
              className="inline-block will-change-transform"
              variants={{ hidden: { y: "105%" }, show: { y: "0%" } }}
              transition={{ duration: 0.95, ease: EASE }}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  accent,
  intro,
  className,
  align = "left",
  titleId,
}: {
  titleId?: string;
  index: string;
  eyebrow: string;
  title: string;
  /** Trailing words rendered in the serif accent face. */
  accent?: string;
  intro?: ReactNode;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-4xl", align === "center" && "mx-auto text-center", className)}>
      <Reveal>
        <p className={cn("eyebrow flex items-center gap-3", align === "center" && "justify-center")}>
          <span className="text-accent">{index}</span>
          <span className="h-px w-8 bg-line-strong" />
          {eyebrow}
        </p>
      </Reveal>
      <h2 id={titleId} className="h2 mt-6">
        <SplitReveal text={title} />
        {accent && (
          <>
            {" "}
            <SplitReveal text={accent} className="serif-accent text-accent" delay={0.15} />
          </>
        )}
      </h2>
      {intro && (
        <Reveal delay={0.15}>
          <div className="mt-6 max-w-2xl text-[17px] leading-relaxed text-muted text-pretty">{intro}</div>
        </Reveal>
      )}
    </div>
  );
}
