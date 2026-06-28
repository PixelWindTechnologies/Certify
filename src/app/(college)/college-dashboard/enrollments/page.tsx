"use client";

import { useEffect, useState, useMemo } from "react";
import { apiFetch, apiFetchPaged } from "@/lib/api";
import type { Certificate, Enrollment, EnrollmentStatus, CertificateApproval, Student } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";

const statusTone: Record<EnrollmentStatus, "neutral" | "emerald" | "crimson"> = {
  ACTIVE: "neutral",
  COMPLETED: "emerald",
  DROPPED: "crimson",
};

const approvalTone: Record<CertificateApproval, "neutral" | "emerald" | "crimson"> = {
  PENDING: "neutral",
  APPROVED: "emerald",
  REJECTED: "crimson",
};

export default function CollegeEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState([] as { id: string; name: string }[]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<EnrollmentStatus | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalEnrollments, setTotalEnrollments] = useState(0);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterStatus) params.set("status", filterStatus);

    Promise.all([
      apiFetchPaged<Enrollment[]>(`/enrollments?${params.toString()}&page=${page}&page_size=${pageSize}`),
      apiFetch<Student[]>("/students?page=1&page_size=1000"),
      apiFetch<{ id: string; name: string }[]>("/courses?page=1&page_size=1000"),
      apiFetch<Certificate[]>("/certificates?page=1&page_size=1000"),
    ])
      .then(([enrollmentResult, s, b, c]) => {
        setEnrollments(enrollmentResult.data);
        setTotalEnrollments(enrollmentResult.totalCount);
        setStudents(s);
        setCourses(b);
        setCertificates(c);
      })
      .catch(() => setError("Could not load enrollments"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [search, filterStatus, page, pageSize]);

  const studentMap = useMemo(() => new Map(students.map((s) => [s.id, s.full_name])), [students]);
  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c.name])), [courses]);
  const generatedEnrollmentIds = useMemo(
    () => new Set(certificates.map((c) => c.enrollment_id)),
    [certificates]
  );
  const pageCount = Math.max(1, Math.ceil(totalEnrollments / pageSize));

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">Enrollments</h2>
          <p className="text-sm text-slate-light">
            Mark internships completed and approved to release certificates.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Search name, internship ID, college, or year…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-gold/20"
          />
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as EnrollmentStatus | "") }>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="DROPPED">Dropped</option>
          </Select>
        </div>
      </div>

      {error ? <p className="rounded-lg bg-crimson-light px-3 py-2 text-sm text-crimson">{error}</p> : null}

      <Card>
        {!loading && enrollments.length > 0 ? (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalEnrollments}
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
        ) : enrollments.length === 0 ? (
          <EmptyState title="No enrollments yet" description="There are no enrollments to display for your college." />
        ) : (
          <Table>
            <THead>
              <Tr>
                <Th>Internship ID</Th>
                <Th>Training</Th>
                <Th>Student</Th>
                <Th>Course</Th>
                <Th>Status</Th>
                <Th>Certificate Approval</Th>
                <Th>Certificate Generated</Th>
                <Th>Relieving</Th>
                <Th />
              </Tr>
            </THead>
            <TBody>
              {enrollments.map((en) => (
                <Tr key={en.id}>
                  <Td className="font-mono-id text-xs text-ink">{en.internship_id}</Td>
                  <Td>{en.training_type.replace("_", " ")}</Td>
                  <Td>{studentMap.get(en.student_id) || "—"}</Td>
                  <Td>{courseMap.get(en.course_id) || "—"}</Td>
                  <Td>
                    <Badge tone={statusTone[en.status]}>{en.status}</Badge>
                  </Td>
                  <Td>
                    <Badge tone={approvalTone[en.certificate_approval]}>{en.certificate_approval}</Badge>
                  </Td>
                  <Td>
                    <Badge tone={generatedEnrollmentIds.has(en.id) ? "emerald" : "neutral"}>
                      {generatedEnrollmentIds.has(en.id) ? "Generated" : "Not generated"}
                    </Badge>
                  </Td>
                  <Td>{formatDate(en.relieving_date)}</Td>
                  <Td />
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

    </div>
  );
}