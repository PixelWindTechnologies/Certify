"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { CourseStat } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CollegeReportsPage() {
  const [courseStats, setCourseStats] = useState<CourseStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<CourseStat[]>("/reports/courses")
      .then(setCourseStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="font-display text-xl text-ink">Reports</h2>
        <p className="text-sm text-slate-light">Enrollment distribution across your college&apos;s courses.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>By course</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="px-5 py-6 text-sm text-slate-light">Loading…</p>
          ) : courseStats.length === 0 ? (
            <EmptyState title="No data yet" />
          ) : (
            <Table>
              <THead>
                <Tr>
                  <Th>Course</Th>
                  <Th>Enrollments</Th>
                </Tr>
              </THead>
              <TBody>
                {courseStats.map((c) => (
                  <Tr key={c.course_id}>
                    <Td className="text-ink">{c.course_name}</Td>
                    <Td>{c.enrollment_count}</Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
