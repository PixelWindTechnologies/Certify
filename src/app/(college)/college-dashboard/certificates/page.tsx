"use client";

import { useEffect, useState, useMemo } from "react";
import { apiFetch, apiFetchPaged, API_V1, getToken } from "@/lib/api";
import type { Certificate, Course, Enrollment, Student } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";

export default function CollegeCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCertificates, setTotalCertificates] = useState(0);

  useEffect(() => {
    Promise.all([
      apiFetchPaged<Certificate[]>(`/certificates?page=${page}&page_size=${pageSize}`),
      apiFetch<Enrollment[]>("/enrollments?page=1&page_size=1000"),
      apiFetch<Student[]>("/students?page=1&page_size=1000"),
      apiFetch<Course[]>("/courses?page=1&page_size=1000"),
    ])
      .then(([certResult, enr, st, co]) => {
        setCertificates(certResult.data);
        setTotalCertificates(certResult.totalCount);
        setEnrollments(enr);
        setStudents(st);
        setCourses(co);
      })
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  const enrollmentMap = useMemo(() => new Map(enrollments.map((e) => [e.id, e])), [enrollments]);
  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s.full_name])), [students]);
  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c.name])), [courses]);
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
        <h2 className="font-display text-xl text-ink">Certificates</h2>
        <p className="text-sm text-slate-light">Issued certificates for your college&apos;s students.</p>
      </div>

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
            description="Certificates appear automatically once enrollments are completed and approved."
          />
        ) : (
          <Table>
            <THead>
              <Tr>
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
                const enrollment = enrollmentMap.get(cert.enrollment_id);
                return (
                  <Tr key={cert.id}>
                    <Td className="font-mono-id text-xs text-ink">{enrollment?.internship_id || "—"}</Td>
                    <Td>{enrollment ? studentMap.get(enrollment.student_id) || "—" : "—"}</Td>
                    <Td>{enrollment ? courseMap.get(enrollment.course_id) || "—" : "—"}</Td>
                    <Td>{formatDate(cert.issue_date)}</Td>
                    <Td>
                      <Badge tone={cert.verification_status === "VALID" ? "emerald" : "crimson"}>
                        {cert.verification_status}
                      </Badge>
                    </Td>
                    <Td>
                      <button onClick={() => download(cert)} className="text-xs font-medium text-gold-dark hover:underline">
                        Download
                      </button>
                    </Td>
                  </Tr>
                );
              })}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
