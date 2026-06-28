import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  tone?: "ink" | "gold" | "emerald" | "crimson";
  hint?: string;
}

const toneClasses: Record<string, string> = {
  ink: "bg-ink text-paper",
  gold: "bg-gold/15 text-gold-dark",
  emerald: "bg-emerald-light text-emerald",
  crimson: "bg-crimson-light text-crimson",
};

export function StatCard({ label, value, icon, tone = "ink", hint }: StatCardProps) {
  return (
    <div className="rounded-xl2 border border-line bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate">
          {label}
        </p>
        {icon ? (
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              toneClasses[tone]
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-2xl text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-light">{hint}</p> : null}
    </div>
  );
}
