"use client";

import { useEffect, useState, FormEvent, useMemo } from "react";
import Link from "next/link";
import { apiFetch, apiFetchPaged, ApiError, API_V1, getToken } from "@/lib/api";
import type { Course, Certificate, Enrollment, Student } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Label } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCertificates, setTotalCertificates] = useState(0);

  const [revoking, setRevoking] = useState<Certificate | null>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      apiFetchPaged<Certificate[]>(`/certificates?page=${page}&page_size=${pageSize}`),
      apiFetch<Enrollment[]>("/enrollments?page=1&page_size=1000"),
      apiFetch<Student[]>("/students?page=1&page_size=1000"),
      apiFetch<Course[]>("/courses?page=1&page_size=1000"),
    ])
      .then(([certResult, enr, st, c]) => {
        setCertificates(certResult.data);
        setTotalCertificates(certResult.totalCount);
        setEnrollments(enr);
        setStudents(st);
        setCourses(c);
      })
      .catch(() => setError("Could not load certificates"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, pageSize]);

  const enrollmentMap = useMemo(() => new Map(enrollments.map((e) => [e.id, e])), [enrollments]);
  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s.full_name])), [students]);
  const courseMap = useMemo(() => new Map(courses.map((course) => [course.id, course.name])), [courses]);

  const rowMeta = (cert: Certificate) => {
    const enrollment = enrollmentMap.get(cert.enrollment_id);
    return {
      internshipId: enrollment?.internship_id || "—",
      student: enrollment ? studentMap.get(enrollment.student_id) || "—" : "—",
      course: enrollment ? courseMap.get(enrollment.course_id) || "—" : "—",
    };
  };

  const pageCount = Math.max(1, Math.ceil(totalCertificates / pageSize));

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const triggerGenerate = async () => {
    setGenerating(true);
    setGenerateMsg("");
    try {
      const res = await apiFetch<{ generated: number }>("/certificates/generate-pending", {
        method: "POST",
      });
      setGenerateMsg(`${res.generated} certificate(s) generated.`);
      load();
    } catch (err) {
      setGenerateMsg(err instanceof ApiError ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

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

  const onRevoke = async (e: FormEvent) => {
    e.preventDefault();
    if (!revoking) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/certificates/${revoking.id}/revoke`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      setRevoking(null);
      setReason("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not revoke certificate");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">Certificates</h2>
          <p className="text-sm text-slate-light">
            Certificates auto-generate for completed and approved enrollments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/settings" className="text-sm text-slate hover:text-ink">
            Template &amp; signature →
          </Link>
          <Button onClick={triggerGenerate} loading={generating} variant="gold">
            Run generation now
          </Button>
        </div>
      </div>

      {generateMsg ? (
        <p className="rounded-lg bg-emerald-light px-3 py-2 text-sm text-emerald">{generateMsg}</p>
      ) : null}
      {error ? <p className="rounded-lg bg-crimson-light px-3 py-2 text-sm text-crimson">{error}</p> : null}

      <Card>
        {!loading && certificates.length > 0 ? (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalCertificates}
            pageCount={pageCount}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        ) : null}
        {loading ? (
          <p className="px-5 py-8 text-center text-sm text-slate-light">Loading…</p>
        ) : certificates.length === 0 ? (
          <EmptyState
            title="No certificates yet"
            description="Certificates appear here automatically once enrollments are completed and approved."
          />
        ) : (
          <Table>
            <THead>
              <Tr>
                <Th>Certificate ID</Th>
                <Th>Internship ID</Th>
                <Th>Student</Th>
                <Th>Course</Th>
                <Th>Issued</Th>
                <Th>Status</Th>
                <Th />
              </Tr>
            </THead>
            <TBody>
              {certificates.map((cert) => {
                const meta = rowMeta(cert);
                return (
                  <Tr key={cert.id}>
                    <Td className="font-mono-id text-xs text-ink">{cert.id.slice(0, 8)}…</Td>
                    <Td className="font-mono-id text-xs">{meta.internshipId}</Td>
                    <Td>{meta.student}</Td>
                    <Td>{meta.course}</Td>
                    <Td>{formatDate(cert.issue_date)}</Td>
                    <Td>
                      <Badge tone={cert.verification_status === "VALID" ? "emerald" : "crimson"}>
                        {cert.verification_status}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex gap-3">
                        <button
                          onClick={() => download(cert)}
                          className="text-xs font-medium text-gold-dark hover:underline"
                        >
                          Download
                        </button>
                        {cert.verification_status === "VALID" && (
                          <button
                            onClick={() => setRevoking(cert)}
                            className="text-xs font-medium text-crimson hover:underline"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>

      <Modal open={!!revoking} onClose={() => setRevoking(null)} title="Revoke certificate">
        <form onSubmit={onRevoke} className="space-y-4">
          <p className="text-sm text-slate-light">
            This certificate will be marked revoked and the verification page will display it
            as no longer valid. This cannot be undone.
          </p>
          <div>
            <Label>Reason</Label>
            <Input required value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          {error ? <p className="rounded-lg bg-crimson-light px-3 py-2 text-sm text-crimson">{error}</p> : null}
          <Button type="submit" variant="danger" className="w-full" loading={saving}>
            Revoke certificate
          </Button>
        </form>
      </Modal>
    </div>
  );
}
