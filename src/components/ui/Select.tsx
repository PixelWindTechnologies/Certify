import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink/40 focus:ring-2 focus:ring-gold/20",
            error && "border-crimson",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error ? <p className="mt-1 text-xs text-crimson">{error}</p> : null}
      </div>
    );
  }
);
Select.displayName = "Select";
