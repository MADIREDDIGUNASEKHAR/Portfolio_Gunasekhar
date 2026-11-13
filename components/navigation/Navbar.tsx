"use client";

import { Download, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import { mailto, navItems, type SectionId, siteConfig } from "@/config/site";
import { getLenis, scrollToSection } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import { GithubIcon, Monogram } from "@/components/ui/BrandIcons";
import { ThemeToggle } from "./ThemeToggle";

function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<SectionId | null>("home");
  useEffect(() => {
    if (!enabled) return;
    // Philosophy isn't in the nav; observing it clears the indicator while it's in view.
    const ids = [...navItems.map((n) => n.id), "philosophy"];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const navIds = new Set<string>(navItems.map((n) => n.id));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(navIds.has(entry.target.id) ? (entry.target.id as SectionId) : null);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [enabled]);
  return enabled ? active : null;
}

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const active = useActiveSection(isHome);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock scroll + Escape to close while the mobile menu is open
  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const trigger = menuButtonRef.current;
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  const handleNav = (e: MouseEvent<HTMLAnchorElement>, id: SectionId) => {
    setOpen(false);
    if (!isHome) return; // let Next navigate to /#id
    e.preventDefault();
    // Wait a tick so the menu's scroll lock releases first
    window.setTimeout(() => scrollToSection(id), open ? 60 : 0);
  };

  const hrefFor = (id: SectionId) => (isHome ? (id === "home" ? "#home" : `#${id}`) : id === "home" ? "/" : `/#${id}`);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4 sm:pt-4">
        <nav
          aria-label="Primary"
          className={cn(
            "glass flex w-full max-w-[1120px] items-center justify-between gap-2 rounded-full py-1.5 pr-1.5 pl-2 transition-[background-color,box-shadow] duration-500",
            scrolled && "bg-[var(--glass-strong)]",
          )}
        >
          <Link
            href={hrefFor("home")}
            onClick={(e) => handleNav(e, "home")}
            className="flex items-center gap-2.5 rounded-full py-1 pr-3 pl-1"
            aria-label={`${siteConfig.name} — home`}
          >
            <Monogram size={30} />
            <span className="text-[14px] font-medium tracking-tight">
              Guna Sekhar<span className="hidden text-muted sm:inline"> Madireddi</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-0.5 lg:flex">
            {navItems.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={hrefFor(item.id)}
                    onClick={(e) => handleNav(e, item.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "relative block rounded-full px-3.5 py-2 text-[13.5px] transition-colors duration-300",
                      isActive ? "text-fg" : "text-muted hover:text-fg",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-full border border-line-strong bg-accent-soft"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <a
              href={siteConfig.resume.href}
              download={siteConfig.resume.fileName}
              className="hidden h-10 items-center gap-2 rounded-full bg-accent px-4 text-[13.5px] font-medium text-accent-fg transition-colors hover:bg-accent-strong md:inline-flex"
            >
              Resume <Download size={15} strokeWidth={2} />
            </a>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid size-10 place-items-center rounded-full text-fg hover:bg-accent-soft lg:hidden"
            >
              {open ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col bg-[var(--glass-strong)] px-6 pt-28 pb-10 backdrop-blur-2xl lg:hidden"
          >
            <ul className="flex flex-col gap-1">
              {navItems.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i + 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a
                    href={hrefFor(item.id)}
                    onClick={(e) => handleNav(e, item.id)}
                    className="flex items-baseline gap-4 border-b border-line py-3.5 text-[34px] font-medium tracking-tight"
                  >
                    <span className="font-mono text-xs text-accent">0{i + 1}</span>
                    <span className={cn(active === item.id ? "text-fg" : "text-muted")}>{item.label}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-auto flex flex-col gap-3"
            >
              <a
                href={siteConfig.resume.href}
                download={siteConfig.resume.fileName}
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-accent font-medium text-accent-fg"
              >
                Download Resume <Download size={16} />
              </a>
              <div className="flex gap-3">
                <a href={mailto()} className="glass flex h-12 flex-1 items-center justify-center rounded-full text-sm">
                  Email
                </a>
                <a
                  href={siteConfig.github.url}
                  target="_blank"
                  rel="noreferrer"
                  className="glass flex h-12 flex-1 items-center justify-center gap-2 rounded-full text-sm"
                >
                  <GithubIcon size={16} /> GitHub
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
