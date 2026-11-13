"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Magnetic } from "./Magnetic";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none transition-[background-color,border-color,color,box-shadow,transform] duration-300 active:scale-[0.97] disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-fg hover:bg-accent-strong shadow-[0_0_0_1px_var(--accent),0_12px_40px_-12px_var(--accent-glow)] hover:shadow-[0_0_0_1px_var(--accent-strong),0_18px_50px_-12px_var(--accent-glow)]",
  secondary: "glass text-fg hover:border-line-strong hover:bg-[var(--glass-strong)]",
  ghost: "text-fg hover:bg-accent-soft",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  magnetic?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

function Inner({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <>
      <span>{children}</span>
      {icon && (
        <span className="inline-flex transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-px">
          {icon}
        </span>
      )}
    </>
  );
}

type ButtonLinkProps = CommonProps & Omit<ComponentProps<"a">, "className" | "children">;

/** Anchor-based button. Internal routes use next/link; hash/mailto/tel/external use <a>. */
export function ButtonLink({
  variant = "primary",
  size = "lg",
  magnetic = true,
  icon,
  children,
  className,
  href = "#",
  ...rest
}: ButtonLinkProps) {
  const cls = cn(base, variants[variant], sizes[size], className);
  const isInternalRoute = href.startsWith("/") && !rest.download;
  const el = isInternalRoute ? (
    <Link href={href} className={cls} {...rest}>
      <Inner icon={icon}>{children}</Inner>
    </Link>
  ) : (
    <a href={href} className={cls} {...rest}>
      <Inner icon={icon}>{children}</Inner>
    </a>
  );
  return magnetic ? <Magnetic>{el}</Magnetic> : el;
}

type ButtonProps = CommonProps & Omit<ComponentProps<"button">, "className" | "children">;

export function Button({
  variant = "primary",
  size = "lg",
  magnetic = false,
  icon,
  children,
  className,
  type = "button",
  ...rest
}: ButtonProps) {
  const el = (
    <button type={type} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      <Inner icon={icon}>{children}</Inner>
    </button>
  );
  return magnetic ? <Magnetic>{el}</Magnetic> : el;
}
