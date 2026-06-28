import { InputHTMLAttributes, LabelHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-slate-light/80 outline-none transition-colors focus:border-ink/40 focus:ring-2 focus:ring-gold/20",
            error && "border-crimson focus:border-crimson focus:ring-crimson/15",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-crimson">{error}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate",
        className
      )}
      {...props}
    />
  );
}
