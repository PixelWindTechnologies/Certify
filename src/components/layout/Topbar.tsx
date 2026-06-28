"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import type { NavItem } from "./Sidebar";
import { cn } from "@/lib/utils";

export function Topbar({
  title,
  items,
}: {
  title: string;
  items: NavItem[];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-paper/90 px-4 py-3.5 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <button
          className="rounded-md border border-line p-2 text-ink lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Open menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </button>

        {user ? (
          <div className="hidden items-center gap-3 rounded-full border border-line bg-white px-3 py-2 text-sm text-ink sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper">
              {user.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{user.full_name}</p>
              <p className="truncate text-[11px] uppercase tracking-wide text-slate-light">
                {user.role?.replace("_", " ")}
              </p>
            </div>
          </div>
        ) : (
          <img
            src="/logo.ico"
            alt="Pixelwind logo"
            className="h-8 w-8 rounded-full border border-line bg-white p-1"
          />
        )}

        <h1 className="font-display text-lg text-ink">{title}</h1>
      </div>

      <div className="hidden items-center gap-2 lg:flex">
        <button
          onClick={logout}
          className="rounded-lg border border-line px-3 py-2 text-sm text-slate-light transition hover:border-ink hover:text-ink"
        >
          Sign out
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="w-64 bg-ink p-4 text-paper">
            <nav className="space-y-1">
              {items.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                      active ? "bg-ink-light text-paper" : "text-slate-light"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={logout}
                className="mt-3 w-full rounded-lg border border-ink-soft px-3 py-2 text-left text-xs text-slate-light"
              >
                Sign out
              </button>
            </nav>
          </div>
          <div className="flex-1 bg-ink/40" onClick={() => setOpen(false)} />
        </div>
      )}
    </header>
  );
}
