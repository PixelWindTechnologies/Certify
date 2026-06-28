"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function ICONS_HOME() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
      <path d="M4 11.5 12 4l8 7.5M6 10v9h12v-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Sidebar({
  items,
  brandSub,
}: {
  items: NavItem[];
  brandSub: string;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-ink text-paper lg:flex">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <img
          src="/logo.ico"
          alt="Pixelwind logo"
          className="h-9 w-9 rounded-full border border-gold/40 bg-white p-1 object-cover"
        />
        <div>
          <p className="font-display text-sm leading-tight text-paper">
            Pixelwind
          </p>
          <p className="text-[11px] uppercase tracking-wide text-slate-light">
            {brandSub}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 no-scrollbar">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-ink-light text-paper"
                  : "text-slate-light hover:bg-ink-light/60 hover:text-paper"
              )}
            >
              <span className={cn(active ? "text-gold" : "text-slate-light")}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}

export { ICONS_HOME };
