"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  IconBuilding,
  IconUsers,
  IconClipboard,
  IconAward,
} from "@/components/layout/icons";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<DashboardStats>("/reports/dashboard")
      .then(setStats)
      .catch(() => setError("Could not load dashboard stats"));
  }, []);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="font-display text-xl text-ink">Overview</h2>
        <p className="text-sm text-slate-light">
          A snapshot of certificates, enrollments, and colleges across the platform.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg bg-crimson-light px-3 py-2 text-sm text-crimson">{error}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Colleges" value={stats?.total_colleges ?? "—"} icon={<IconBuilding />} tone="ink" />
        <StatCard label="Total Students" value={stats?.total_students ?? "—"} icon={<IconUsers />} tone="gold" />
        <StatCard label="Total Enrollments" value={stats?.total_enrollments ?? "—"} icon={<IconClipboard />} tone="ink" />
        <StatCard
          label="Certificates Generated"
          value={stats?.certificates_generated ?? "—"}
          icon={<IconAward />}
          tone="emerald"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Active internships" value={stats?.active_students ?? "—"} tone="ink" />
        <StatCard label="Completed internships" value={stats?.completed_students ?? "—"} tone="emerald" />
        <StatCard label="Dropped enrollments" value={stats?.dropped_students ?? "—"} tone="crimson" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick guide</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-slate-light">
            New here? Start by adding a college under{" "}
            <span className="font-medium text-ink">Colleges</span>, define the
            internship programs under <span className="font-medium text-ink">Courses</span>,
            then enroll students into a course at a college. Students can be added one at a time or bulk-imported from an Excel sheet
            under <span className="font-medium text-ink">Students</span>. Certificates are
            generated automatically once an enrollment is marked completed and approved.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
