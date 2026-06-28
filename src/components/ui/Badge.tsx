import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "emerald" | "crimson" | "gold" | "slate";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-line/60 text-ink-soft",
  emerald: "bg-emerald-light text-emerald",
  crimson: "bg-crimson-light text-crimson",
  gold: "bg-gold/15 text-gold-dark",
  slate: "bg-slate/10 text-slate",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tracking-wide",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
