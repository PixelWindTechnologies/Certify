"use client";

import { useEffect, useState, FormEvent, useMemo } from "react";
import { apiFetch, apiFetchPaged, ApiError, API_V1, getToken } from "@/lib/api";
import type {
  Course,
  Certificate,
  Enrollment,
  EnrollmentStatus,
  CertificateApproval,
  Student,
  TrainingType,
} from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Label } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";

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

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<EnrollmentStatus | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalEnrollments, setTotalEnrollments] = useState(0);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    student_id: "",
    course_id: "",
    training_type: "INTERNSHIP" as TrainingType,
    admission_date: "",
    relieving_date: "",
    roll_number: "",
  });
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState<Enrollment | null>(null);
  const [editForm, setEditForm] = useState({
    status: "ACTIVE" as EnrollmentStatus,
    certificate_approval: "PENDING" as CertificateApproval,
    training_type: "INTERNSHIP" as TrainingType,
    admission_date: "",
    relieving_date: "",
    performance_grade: "",
    aicte_internship_id: "",
    roll_number: "",
  });

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterStatus) params.set("status", filterStatus);
    params.set("page", String(page));
    params.set("page_size", String(pageSize));

    Promise.all([
      apiFetchPaged<Enrollment[]>(`/enrollments?${params.toString()}`),
      apiFetch<Student[]>("/students?page=1&page_size=1000"),
      apiFetch<Course[]>("/courses?page=1&page_size=1000"),
      apiFetch<Certificate[]>("/certificates?page=1&page_size=1000"),
    ])
      .then(([enrollmentsResult, s, c, cert]) => {
        setEnrollments(enrollmentsResult.data);
        setTotalEnrollments(enrollmentsResult.totalCount);
        setStudents(s);
        setCourses(c);
        setCertificates(cert);
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

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await apiFetch("/enrollments", {
        method: "POST",
        body: JSON.stringify({
          ...createForm,
          roll_number: createForm.roll_number || undefined,
        }),
      });
      setCreateOpen(false);
      setCreateForm({
        student_id: "",
        course_id: "",
        training_type: "INTERNSHIP",
        admission_date: "",
        relieving_date: "",
        roll_number: "",
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create enrollment");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (en: Enrollment) => {
    setEditing(en);
    setEditForm({
      status: en.status,
      certificate_approval: en.certificate_approval,
      training_type: en.training_type,
      admission_date: en.admission_date || "",
      relieving_date: en.relieving_date || "",
      performance_grade: en.performance_grade || "",
      aicte_internship_id: en.aicte_internship_id || "",
      roll_number: en.roll_number || "",
    });
  };

  const pageCount = Math.max(1, Math.ceil(totalEnrollments / pageSize));

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const onSaveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(`/enrollments/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: editForm.status,
          certificate_approval: editForm.certificate_approval,
          training_type: editForm.training_type,
          admission_date: editForm.admission_date || undefined,
          relieving_date: editForm.relieving_date || undefined,
          performance_grade: editForm.performance_grade || undefined,
          aicte_internship_id: editForm.aicte_internship_id || undefined,
          roll_number: editForm.roll_number || undefined,
        }),
      });
      setEditing(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update enrollment");
    } finally {
      setSaving(false);
    }
  };

  const onPreview = async () => {
    if (!editing) return;
    setPreviewing(true);
    setError("");
    try {
      const token = getToken("access_token");
      const res = await fetch(`${API_V1}/certificates/preview/${editing.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Could not generate preview");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      setError("Could not generate certificate preview");
    } finally {
      setPreviewing(false);
    }
  };

  const onDelete = async (enrollment: Enrollment) => {
    if (!window.confirm(`Delete enrollment ${enrollment.internship_id}? This cannot be undone.`)) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiFetch(`/enrollments/${enrollment.id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete enrollment");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">Enrollments</h2>
          <p className="text-sm text-slate-light">
            Enroll a student into a course at a college, then track status through to certificate approval.
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
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as EnrollmentStatus | "")}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="DROPPED">Dropped</option>
          </Select>
          <Button onClick={() => setCreateOpen(true)}>+ Enroll student</Button>
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
          <EmptyState title="No enrollments yet" description="Enroll a student to get started." />
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
                  <Td className="flex gap-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openEdit(en)}
                      className="text-xs font-medium text-gold-dark hover:underline"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(en)}
                      className="text-xs font-medium text-crimson hover:underline"
                    >
                      Delete
                    </button>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Enroll a student">
        <form onSubmit={onCreate} className="space-y-4">
          <div>
            <Label>Student</Label>
            <Select
              required
              value={createForm.student_id}
              onChange={(e) => setCreateForm({ ...createForm, student_id: e.target.value })}
              disabled={loading}
            >
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.email})
                </option>
              ))}
            </Select>
            {loading ? (
              <p className="text-xs text-slate-light">Loading students...</p>
            ) : null}
          </div>
          <div>
            <Label>Course</Label>
            <Select
              required
              value={createForm.course_id}
              onChange={(e) => setCreateForm({ ...createForm, course_id: e.target.value })}
              disabled={loading}
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </Select>
            {loading ? (
              <p className="text-xs text-slate-light">Loading courses...</p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Training type</Label>
              <Select
                required
                value={createForm.training_type}
                onChange={(e) => setCreateForm({ ...createForm, training_type: e.target.value as TrainingType })}
              >
                <option value="INTERNSHIP">Internship</option>
                <option value="INDUSTRIAL_TRAINING">Industrial Training</option>
              </Select>
            </div>
            <div>
              <Label>Roll number</Label>
              <Input
                value={createForm.roll_number}
                onChange={(e) => setCreateForm({ ...createForm, roll_number: e.target.value })}
                placeholder="Optional"
              />
              <p className="mt-1 text-xs text-slate-light">Optional. Use only if this enrollment has a roll number.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Admission date</Label>
              <input
                type="date"
                value={createForm.admission_date}
                onChange={(e) => setCreateForm({ ...createForm, admission_date: e.target.value })}
                className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-gold/20"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Relieving date</Label>
              <input
                type="date"
                value={createForm.relieving_date}
                onChange={(e) => setCreateForm({ ...createForm, relieving_date: e.target.value })}
                className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-gold/20"
              />
            </div>
          </div>
          {error ? <p className="rounded-lg bg-crimson-light px-3 py-2 text-sm text-crimson">{error}</p> : null}
          <Button type="submit" className="w-full" loading={saving}>
            Enroll
          </Button>
        </form>
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Update ${editing?.internship_id || ""}`}>
        <form onSubmit={onSaveEdit} className="space-y-4">
          <div>
            <Label>Status</Label>
            <Select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as EnrollmentStatus })}
            >
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="DROPPED">Dropped</option>
            </Select>
          </div>
          <div>
            <Label>Certificate approval</Label>
            <Select
              value={editForm.certificate_approval}
              onChange={(e) =>
                setEditForm({ ...editForm, certificate_approval: e.target.value as CertificateApproval })
              }
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </Select>
          </div>
          <div>
            <Label>Training type</Label>
            <Select
              value={editForm.training_type}
              onChange={(e) => setEditForm({ ...editForm, training_type: e.target.value as TrainingType })}
            >
              <option value="INTERNSHIP">Internship</option>
              <option value="INDUSTRIAL_TRAINING">Industrial Training</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Admission date</Label>
              <input
                type="date"
                value={editForm.admission_date}
                onChange={(e) => setEditForm({ ...editForm, admission_date: e.target.value })}
                className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-gold/20"
              />
            </div>
            <div>
              <Label>Roll number</Label>
              <Input
                value={editForm.roll_number}
                onChange={(e) => setEditForm({ ...editForm, roll_number: e.target.value })}
                placeholder="Optional"
              />
              <p className="mt-1 text-xs text-slate-light">Optional. Use only if this enrollment has a roll number.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Relieving date</Label>
              <input
                type="date"
                value={editForm.relieving_date}
                onChange={(e) => setEditForm({ ...editForm, relieving_date: e.target.value })}
                className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-gold/20"
              />
            </div>
          </div>
          <div>
            <Label>Performance grade</Label>
            <input
              value={editForm.performance_grade}
              onChange={(e) => setEditForm({ ...editForm, performance_grade: e.target.value })}
              placeholder="A+"
              className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-gold/20"
            />
          </div>
          <div>
            <Label>AICTE Internship ID</Label>
            <input
              value={editForm.aicte_internship_id}
              onChange={(e) => setEditForm({ ...editForm, aicte_internship_id: e.target.value })}
              placeholder="AICTE's own ID — separate from ours, shown lower on the certificate"
              className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink/40 focus:ring-2 focus:ring-gold/20"
            />
          </div>
          <p className="text-xs text-slate-light">
            Once status is Completed and certificate approval is Approved, the certificate
            generates automatically on the next scheduled run.
          </p>
          {error ? <p className="rounded-lg bg-crimson-light px-3 py-2 text-sm text-crimson">{error}</p> : null}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="w-full" loading={previewing} onClick={onPreview}>
              Preview certificate
            </Button>
            <Button type="submit" className="w-full" loading={saving}>
              Save changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}