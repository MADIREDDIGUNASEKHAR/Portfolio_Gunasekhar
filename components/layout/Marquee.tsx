import { marqueeSkills } from "@/data/skills";

/** Infinite, GPU-only marquee of core technologies. Pauses on hover; static with reduced motion. */
export function Marquee() {
  const items = [...marqueeSkills, ...marqueeSkills];
  return (
    <div className="group relative overflow-hidden border-y border-line py-5" aria-label="Core technologies">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg to-transparent" />
      <ul className="animate-marquee flex w-max items-center gap-10 group-hover:[animation-play-state:paused]">
        {items.map((s, i) => (
          <li
            key={`${s}-${i}`}
            aria-hidden={i >= marqueeSkills.length}
            className="flex items-center gap-10 text-[clamp(1.25rem,2.4vw,1.9rem)] font-medium tracking-tight text-muted"
          >
            {s}
            <span className="text-[0.6em] text-accent">✦</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
