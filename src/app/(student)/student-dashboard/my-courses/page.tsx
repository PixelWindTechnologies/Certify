"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, apiFetchPaged } from "@/lib/api";
import type { Course, Enrollment, EnrollmentStatus } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";

const statusTone: Record<EnrollmentStatus, "neutral" | "emerald" | "crimson"> = {
  ACTIVE: "neutral",
  COMPLETED: "emerald",
  DROPPED: "crimson",
};

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<EnrollmentStatus | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalEnrollments, setTotalEnrollments] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterStatus) params.set("status", filterStatus);
    params.set("page", String(page));
    params.set("page_size", String(pageSize));
    const enrollmentUrl = params.toString() ? `/enrollments?${params.toString()}` : "/enrollments";

    Promise.all([
      apiFetchPaged<Enrollment[]>(enrollmentUrl),
      apiFetch<Course[]>("/courses?page=1&page_size=1000"),
    ])
      .then(([enrollmentResult, c]) => {
        setEnrollments(enrollmentResult.data);
        setTotalEnrollments(enrollmentResult.totalCount);
        setCourses(c);
      })
      .finally(() => setLoading(false));
  }, [search, filterStatus, page, pageSize]);

  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c.name])), [courses]);
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
          <h2 className="font-display text-xl text-ink">My internships</h2>
          <p className="text-sm text-slate-light">Every internship you&apos;re enrolled in.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Search internship ID, course, or year…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-gold/20"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as EnrollmentStatus | "")}
            className="rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-gold/20"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="DROPPED">Dropped</option>
          </select>
        </div>
      </div>

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
          <EmptyState title="No internships yet" description="Your college admin will enroll you into the course directly." />
        ) : (
          <Table>
            <THead>
              <Tr>
                <Th>Internship ID</Th>
                <Th>Course</Th>
                <Th>Status</Th>
                <Th>Joined</Th>
                <Th>Relieved</Th>
              </Tr>
            </THead>
            <TBody>
              {enrollments.map((en) => (
                <Tr key={en.id}>
                  <Td className="font-mono-id text-xs text-ink">{en.internship_id}</Td>
                  <Td>{courseMap.get(en.course_id) || "—"}</Td>
                  <Td>
                    <Badge tone={statusTone[en.status]}>{en.status}</Badge>
                  </Td>
                  <Td>{formatDate(en.admission_date)}</Td>
                  <Td>{formatDate(en.relieving_date)}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
