"use client";

import { useEffect, useState, useMemo } from "react";
import { apiFetch, apiFetchPaged } from "@/lib/api";
import type { College, Student } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";

export default function CollegeStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [college, setCollege] = useState<College | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalStudents, setTotalStudents] = useState(0);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("page_size", String(pageSize));

    Promise.all([
      apiFetchPaged<Student[]>(`/students?${params.toString()}`),
      apiFetch<College[]>("/colleges"),
    ])
      .then(([studentsResult, collegesResult]) => {
        setStudents(studentsResult.data);
        setTotalStudents(studentsResult.totalCount);
        setCollege(collegesResult[0] || null);
      })
      .catch(() => setError("Could not load students"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [search, page, pageSize]);

  const pageCount = Math.max(1, Math.ceil(totalStudents / pageSize));

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="font-display text-xl text-ink">Students</h2>
        <p className="text-sm text-slate-light">Students enrolled at {college?.name || "your college"}.</p>
      </div>

      <Input
        placeholder="Search by name, student ID, college, or year…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="max-w-xs"
      />

      <Card>
        {!loading && students.length > 0 ? (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalStudents}
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
        ) : students.length === 0 ? (
          <EmptyState title="No students yet" description="Your college has no students to display." />
        ) : (
          <Table>
            <THead>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th>Roll No.</Th>
              </Tr>
            </THead>
            <TBody>
              {students.map((s) => (
                <Tr key={s.id}>
                  <Td className="font-medium text-ink">{s.full_name}</Td>
                  <Td>{s.email}</Td>
                  <Td>{s.phone}</Td>
                  <Td className="font-mono-id text-xs">{s.roll_number || "—"}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>



    </div>
  );
}