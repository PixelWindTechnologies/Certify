"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch, apiFetchPaged, API_V1, getToken } from "@/lib/api";
import type { Certificate, Enrollment } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";

export default function MyCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCertificates, setTotalCertificates] = useState(0);

  useEffect(() => {
    Promise.all([
      apiFetchPaged<Certificate[]>(`/certificates?page=${page}&page_size=${pageSize}`),
      apiFetch<Enrollment[]>("/enrollments"),
    ])
      .then(([certificateResult, e]) => {
        setCertificates(certificateResult.data);
        setTotalCertificates(certificateResult.totalCount);
        setEnrollments(e);
      })
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  const enrollmentMap = useMemo(() => new Map(enrollments.map((e) => [e.id, e])), [enrollments]);
  const pageCount = Math.max(1, Math.ceil(totalCertificates / pageSize));

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const download = async (cert: Certificate) => {
    const token = getToken("access_token");
    const res = await fetch(`${API_V1}/certificates/${cert.id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cert.id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="font-display text-xl text-ink">My certificates</h2>
        <p className="text-sm text-slate-light">Download your issued internship certificates.</p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-light">Loading…</p>
      ) : certificates.length === 0 ? (
        <Card>
          <EmptyState
            title="No certificates yet"
            description="Your certificate will appear here once your internship is completed and approved."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {certificates.map((cert) => {
            const enrollment = enrollmentMap.get(cert.enrollment_id);
            return (
              <Card key={cert.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono-id text-xs text-slate-light">{enrollment?.internship_id}</p>
                    <p className="mt-1 font-display text-base text-ink">Internship certificate</p>
                  </div>
                  <Badge tone={cert.verification_status === "VALID" ? "emerald" : "crimson"}>
                    {cert.verification_status}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-slate-light">Issued {formatDate(cert.issue_date)}</p>
                <div className="mt-4 flex items-center gap-3">
                  <Button size="sm" onClick={() => download(cert)}>
                    Download PDF
                  </Button>
                  <Link
                    href={`/verify/${cert.id}`}
                    target="_blank"
                    className="text-xs font-medium text-gold-dark hover:underline"
                  >
                    View public verification →
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
