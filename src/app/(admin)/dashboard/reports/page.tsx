"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { CollegeStat, CourseStat } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ReportsPage() {
  const [courseStats, setCourseStats] = useState<CourseStat[]>([]);
  const [collegeStats, setCollegeStats] = useState<CollegeStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<CourseStat[]>("/reports/courses"),
      apiFetch<CollegeStat[]>("/reports/colleges"),
    ])
      .then(([c, co]) => {
        setCourseStats(c);
        setCollegeStats(co);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="font-display text-xl text-ink">Reports</h2>
        <p className="text-sm text-slate-light">Enrollment distribution across courses and colleges.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>By college</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <p className="px-5 py-6 text-sm text-slate-light">Loading…</p>
            ) : collegeStats.length === 0 ? (
              <EmptyState title="No data yet" />
            ) : (
              <Table>
                <THead>
                  <Tr>
                    <Th>College</Th>
                    <Th>Students</Th>
                  </Tr>
                </THead>
                <TBody>
                  {collegeStats.map((c) => (
                    <Tr key={c.college_id}>
                      <Td className="text-ink">{c.college_name}</Td>
                      <Td>{c.student_count}</Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            )}
          </CardContent>
        </Card>

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
    </div>
  );
}
