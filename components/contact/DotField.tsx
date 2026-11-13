"use client";

import { useEffect, useRef } from "react";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { useTheme } from "@/lib/theme";

/** A field of dots with a slow travelling wave that brightens and parts around the cursor. */
export function DotField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(canvasRef, "0px");
  const reduced = useReducedMotion();
  const theme = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const styles = getComputedStyle(document.documentElement);
    const fg = styles.getPropertyValue("--fg").trim();
    const accent = styles.getPropertyValue("--accent").trim();
    let w = 0;
    let h = 0;
    let gap = 26;
    const pointer = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      gap = w < 640 ? 30 : 26;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      draw(0);
    });
    ro.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.tx = e.clientX - r.left;
      pointer.ty = e.clientY - r.top;
    };
    const onLeave = () => {
      pointer.tx = -9999;
      pointer.ty = -9999;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    function draw(time: number) {
      ctx!.clearRect(0, 0, w, h);
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;
      const t = time / 1000;
      const cols = Math.ceil(w / gap) + 1;
      const rows = Math.ceil(h / gap) + 1;
      const offX = (w - (cols - 1) * gap) / 2;
      for (let iy = 0; iy < rows; iy++) {
        for (let ix = 0; ix < cols; ix++) {
          let x = offX + ix * gap;
          let y = iy * gap;
          const wave = Math.sin(ix * 0.32 + iy * 0.18 - t * 1.1) * 0.5 + 0.5;
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const d = Math.hypot(dx, dy);
          const influence = Math.max(0, 1 - d / 170);
          if (influence > 0) {
            x += (dx / (d || 1)) * influence * 10;
            y += (dy / (d || 1)) * influence * 10;
          }
          const fade = Math.min(1, y / (h * 0.35)); // fade in from the top edge
          const size = 0.9 + wave * 0.6 + influence * 1.6;
          ctx!.globalAlpha = (0.1 + wave * 0.14 + influence * 0.7) * fade;
          ctx!.fillStyle = influence > 0.15 || wave > 0.93 ? accent : fg;
          ctx!.beginPath();
          ctx!.arc(x, y, size, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
      ctx!.globalAlpha = 1;
    }

    let raf = 0;
    const loop = (time: number) => {
      draw(time);
      raf = requestAnimationFrame(loop);
    };
    if (inView && !reduced) raf = requestAnimationFrame(loop);
    else draw(0);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [inView, reduced, theme]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
