"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type { Certificate, Enrollment } from "@/lib/types";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { IconBook, IconAward, IconClipboard } from "@/components/layout/icons";

export default function StudentOverviewPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiFetch<Enrollment[]>("/enrollments"), apiFetch<Certificate[]>("/certificates")])
      .then(([e, c]) => {
        setEnrollments(e);
        setCertificates(c);
      })
      .finally(() => setLoading(false));
  }, []);

  const active = useMemo(() => enrollments.filter((e) => e.status === "ACTIVE").length, [enrollments]);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="font-display text-xl text-ink">
          Welcome{user?.full_name ? `, ${user.full_name}` : ""}
        </h2>
        <p className="text-sm text-slate-light">Here&apos;s a summary of your internships and certificates.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Internships" value={loading ? "—" : enrollments.length} icon={<IconBook />} tone="ink" />
        <StatCard label="Ongoing" value={loading ? "—" : active} icon={<IconClipboard />} tone="gold" />
        <StatCard label="Certificates" value={loading ? "—" : certificates.length} icon={<IconAward />} tone="emerald" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What happens next</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-slate-light">
            Once your internship is marked completed and your certificate is approved by your
            college, your certificate is generated automatically — no action needed from you.
            You can download it from <span className="font-medium text-ink">My certificates</span> as
            soon as it&apos;s ready.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
