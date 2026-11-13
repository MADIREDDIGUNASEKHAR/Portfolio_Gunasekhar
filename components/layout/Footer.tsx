"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Monogram } from "@/components/ui/BrandIcons";
import { siteConfig } from "@/config/site";
import { scrollToSection } from "@/lib/scroll";

function LocalTime() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: siteConfig.timeZone, hour12: false });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = window.setInterval(update, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time ?? "--:--"} IST</span>;
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="container-x flex flex-col gap-6 py-8 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Monogram size={26} />
          <span>
            © 2026 {siteConfig.name}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11.5px]">
          <span>
            {siteConfig.location} · <LocalTime />
          </span>
          <span className="text-subtle">Next.js · React Three Fiber · GSAP</span>
          <button
            type="button"
            onClick={() => scrollToSection("home")}
            className="inline-flex items-center gap-1.5 text-fg transition-colors hover:text-accent"
          >
            Back to top <ArrowUp size={13} />
          </button>
        </div>
      </div>
    </footer>
  );
}
