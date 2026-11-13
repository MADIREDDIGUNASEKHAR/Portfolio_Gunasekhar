"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Reveal, SectionHeading } from "@/components/ui/Reveal";
import { type SkillCategoryId, skillCategories, skillLinks } from "@/data/skills";
import { cn } from "@/lib/utils";

const CX = 450;
const CY = 300;
const RX = 318;
const RY = 214;

type Placed = { name: string; cat: SkillCategoryId; x: number; y: number; ax: number; ay: number };

function useLayout() {
  return useMemo(() => {
    const hubs = skillCategories.map((c, i) => {
      const a = (-90 + i * 60) * (Math.PI / 180);
      return { id: c.id, label: c.label, x: CX + Math.cos(a) * RX, y: CY + Math.sin(a) * RY, angle: a };
    });
    const skills: Placed[] = [];
    skillCategories.forEach((c, ci) => {
      const hub = hubs[ci];
      const n = c.skills.length;
      c.skills.forEach((s, si) => {
        const a = hub.angle + (si / n) * Math.PI * 2 + 0.3;
        const r = n > 6 ? (si % 2 ? 122 : 92) : 88;
        skills.push({
          name: s.name,
          cat: c.id,
          x: hub.x + Math.cos(a) * r,
          y: hub.y + Math.sin(a) * r * 0.8,
          ax: Math.cos(a),
          ay: Math.sin(a),
        });
      });
    });
    const byName = Object.fromEntries(skills.map((s) => [s.name, s]));
    return { hubs, skills, byName };
  }, []);
}

export function Skills() {
  const { hubs, skills, byName } = useLayout();
  const [activeCat, setActiveCat] = useState<SkillCategoryId>("backend");
  const [hovered, setHovered] = useState<string | null>(null);

  const category = skillCategories.find((c) => c.id === activeCat)!;
  const hoveredSkill = hovered ? skillCategories.flatMap((c) => c.skills.map((s) => ({ ...s, cat: c }))).find((s) => s.name === hovered) : null;
  const linkedToHovered = new Set(
    hovered ? skillLinks.filter(([a, b]) => a === hovered || b === hovered).flatMap(([a, b]) => [a, b]) : [],
  );

  return (
    <section id="skills" className="section overflow-hidden" aria-labelledby="skills-title">
      <div className="container-x">
        <SectionHeading
          titleId="skills-title"
          index="04"
          eyebrow="Skills"
          title="A connected"
          accent="toolkit."
          intro="No percentages, no star ratings — just where each tool shows up in my work. Links connect skills I've used together in the same system."
        />

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Constellation */}
          <Reveal className="min-w-0 lg:col-span-7">
            <div className="relative">
              <svg
                viewBox="-70 -40 1040 680"
                className="h-auto w-full select-none"
                role="img"
                aria-label="Constellation of skills grouped into six categories, with links between skills used together."
              >
                {/* spokes from centre */}
                {hubs.map((h) => (
                  <line
                    key={`spoke-${h.id}`}
                    x1={CX}
                    y1={CY}
                    x2={h.x}
                    y2={h.y}
                    stroke={h.id === activeCat ? "var(--accent)" : "var(--line-strong)"}
                    strokeOpacity={h.id === activeCat ? 0.6 : 1}
                    strokeDasharray="2 5"
                    className="transition-[stroke] duration-500"
                  />
                ))}

                {/* cross-links */}
                {skillLinks.map(([a, b]) => {
                  const p = byName[a];
                  const q = byName[b];
                  if (!p || !q) return null;
                  const on = hovered ? hovered === a || hovered === b : p.cat === activeCat || q.cat === activeCat;
                  const mx = (p.x + q.x) / 2 + (CX - (p.x + q.x) / 2) * 0.35;
                  const my = (p.y + q.y) / 2 + (CY - (p.y + q.y) / 2) * 0.35;
                  return (
                    <path
                      key={`${a}-${b}`}
                      d={`M${p.x} ${p.y} Q${mx} ${my} ${q.x} ${q.y}`}
                      fill="none"
                      stroke={on ? "var(--accent)" : "var(--line-strong)"}
                      strokeOpacity={on ? 0.7 : 0.55}
                      strokeWidth={on ? 1.3 : 1}
                      className="transition-all duration-500"
                    />
                  );
                })}

                {/* hub → skill tethers */}
                {skills.map((s) => {
                  const hub = hubs.find((h) => h.id === s.cat)!;
                  return (
                    <line
                      key={`t-${s.name}`}
                      x1={hub.x}
                      y1={hub.y}
                      x2={s.x}
                      y2={s.y}
                      stroke={s.cat === activeCat ? "var(--accent)" : "var(--line)"}
                      strokeOpacity={s.cat === activeCat ? 0.35 : 1}
                    />
                  );
                })}

                {/* centre */}
                <circle cx={CX} cy={CY} r={26} fill="var(--accent-soft)" stroke="var(--accent)" strokeOpacity={0.5} />
                <circle cx={CX} cy={CY} r={5} fill="var(--accent)" />

                {/* skills */}
                {skills.map((s, i) => {
                  const inCat = s.cat === activeCat;
                  const isHovered = hovered === s.name;
                  const linked = linkedToHovered.has(s.name);
                  const showLabel = inCat || isHovered || linked;
                  const lx = s.x + s.ax * 13;
                  const ly = s.y + s.ay * 13;
                  const anchor = s.ax > 0.3 ? "start" : s.ax < -0.3 ? "end" : "middle";
                  return (
                    <g
                      key={s.name}
                      onPointerEnter={() => setHovered(s.name)}
                      onPointerLeave={() => setHovered(null)}
                      onClick={() => setActiveCat(s.cat)}
                      className="cursor-pointer"
                      style={{ animation: `float-y ${5 + (i % 4)}s ease-in-out ${(i % 7) * -0.8}s infinite` }}
                    >
                      <circle cx={s.x} cy={s.y} r={14} fill="transparent" />
                      {(isHovered || linked) && <circle cx={s.x} cy={s.y} r={10} fill="var(--accent)" opacity={0.18} />}
                      <circle
                        cx={s.x}
                        cy={s.y}
                        r={isHovered ? 5.5 : inCat ? 4.2 : 3}
                        fill={inCat || isHovered || linked ? "var(--accent)" : "var(--fg-subtle)"}
                        className="transition-all duration-300"
                      />
                      <text
                        x={lx}
                        y={ly}
                        textAnchor={anchor}
                        dominantBaseline="central"
                        className={cn(
                          "pointer-events-none text-[17px] transition-opacity duration-300",
                          isHovered ? "fill-[var(--fg)] font-medium" : "fill-[var(--fg-muted)]",
                        )}
                        opacity={showLabel ? 1 : 0}
                      >
                        {s.name}
                      </text>
                    </g>
                  );
                })}

                {/* hubs */}
                {hubs.map((h) => {
                  const on = h.id === activeCat;
                  const w = h.label.length * 9.8 + 26;
                  return (
                    <g key={h.id} onClick={() => setActiveCat(h.id)} className="cursor-pointer">
                      <rect
                        x={h.x - w / 2}
                        y={h.y - 15}
                        width={w}
                        height={30}
                        rx={15}
                        fill={on ? "var(--accent)" : "var(--bg-elev)"}
                        stroke="var(--accent)"
                        strokeOpacity={on ? 1 : 0.45}
                        className="transition-all duration-300"
                      />
                      <text
                        x={h.x}
                        y={h.y + 1}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={cn("font-mono text-[13px] tracking-[0.12em] uppercase", on ? "fill-[var(--accent-fg)]" : "fill-[var(--fg-muted)]")}
                      >
                        {h.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </Reveal>

          {/* Detail panel */}
          <Reveal className="min-w-0 lg:col-span-5" delay={0.1}>
            <div role="tablist" aria-label="Skill categories" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
              {skillCategories.map((c) => (
                <button
                  key={c.id}
                  role="tab"
                  type="button"
                  aria-selected={c.id === activeCat}
                  aria-controls="skills-panel"
                  onClick={() => {
                    setActiveCat(c.id);
                    setHovered(null);
                  }}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] transition-all duration-300",
                    c.id === activeCat ? "border-accent bg-accent text-accent-fg" : "border-line-strong text-muted hover:text-fg",
                  )}
                >
                  {c.label}
                  <span className={cn("ml-1.5 font-mono text-[10.5px]", c.id === activeCat ? "opacity-70" : "text-subtle")}>{c.skills.length}</span>
                </button>
              ))}
            </div>

            <div id="skills-panel" role="tabpanel" className="panel mt-5 rounded-[26px] p-6 sm:p-7">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeCat}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-[26px] font-medium tracking-tight">{category.label}</h3>
                  <p className="mt-1 text-[14.5px] text-muted">{category.blurb}</p>
                  <ul className="mt-5 grid grid-cols-2 gap-1.5">
                    {category.skills.map((s) => (
                      <li key={s.name}>
                        <button
                          type="button"
                          onPointerEnter={() => setHovered(s.name)}
                          onPointerLeave={() => setHovered(null)}
                          onFocus={() => setHovered(s.name)}
                          onBlur={() => setHovered(null)}
                          onClick={() => setHovered((h) => (h === s.name ? null : s.name))}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-[14px] transition-all duration-200",
                            hovered === s.name ? "border-accent bg-accent-soft" : "border-line hover:border-line-strong",
                          )}
                        >
                          <span className={cn("size-1.5 shrink-0 rounded-full", hovered === s.name ? "bg-accent" : "bg-subtle")} />
                          {s.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>

              <div className="mt-5 min-h-[76px] rounded-2xl border border-dashed border-line-strong p-4" aria-live="polite">
                {hoveredSkill ? (
                  <>
                    <p className="font-mono text-[10.5px] tracking-wider text-accent uppercase">
                      {hoveredSkill.name} · {hoveredSkill.cat.label}
                    </p>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-fg/90">{hoveredSkill.context}</p>
                  </>
                ) : (
                  <p className="text-[13.5px] text-subtle">Hover or tap a skill to see where I&apos;ve used it.</p>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
