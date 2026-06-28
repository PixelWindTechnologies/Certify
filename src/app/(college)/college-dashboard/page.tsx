"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";
import { StatCard } from "@/components/ui/StatCard";
import { IconUsers, IconClipboard, IconAward } from "@/components/layout/icons";

export default function CollegeOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    apiFetch<DashboardStats>("/reports/dashboard").then(setStats).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="font-display text-xl text-ink">Overview</h2>
        <p className="text-sm text-slate-light">A snapshot of your college&apos;s students and certificates.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={stats?.total_students ?? "—"} icon={<IconUsers />} tone="ink" />
        <StatCard label="Total Enrollments" value={stats?.total_enrollments ?? "—"} icon={<IconClipboard />} tone="gold" />
        <StatCard label="Completed" value={stats?.completed_students ?? "—"} tone="emerald" />
        <StatCard
          label="Certificates Generated"
          value={stats?.certificates_generated ?? "—"}
          icon={<IconAward />}
          tone="emerald"
        />
      </div>
    </div>
  );
}
