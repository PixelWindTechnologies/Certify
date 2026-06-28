"use client";

import { useEffect, useState, FormEvent, useRef, useMemo } from "react";
import { apiFetch, apiFetchPaged, ApiError, API_V1, getToken } from "@/lib/api";
import type { College, ImportReport, Student } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Modal } from "@/components/ui/Modal";
import { Input, Label } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";

const emptyForm = {
  full_name: "",
  father_name: "",
  phone: "",
  email: "",
  gender: "",
  roll_number: "",
  graduation_year: "",
  college_id: "",
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalStudents, setTotalStudents] = useState(0);
  const [form, setForm] = useState(emptyForm);

  const [importCollege, setImportCollege] = useState("");
  const [importing, setImporting] = useState(false);
  const [report, setReport] = useState<ImportReport | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [resetting, setResetting] = useState<Student | null>(null);
  const [resetResult, setResetResult] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const resetForm = () => setForm(emptyForm);

  const openCreate = () => {
    setEditingStudent(null);
    resetForm();
    setOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setForm({
      full_name: student.full_name,
      father_name: student.father_name || "",
      phone: student.phone,
      email: student.email,
      gender: student.gender || "",
      roll_number: student.roll_number || "",
      graduation_year: student.graduation_year ? String(student.graduation_year) : "",
      college_id: student.college_id,
    });
    setOpen(true);
  };

  const onDelete = async (student: Student) => {
    if (!window.confirm(`Delete ${student.full_name}? This cannot be undone.`)) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiFetch(`/students/${student.id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete student");
      setLoading(false);
    }
  };

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
        setColleges(collegesResult);
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

  const collegeMap = useMemo(() => new Map(colleges.map((c) => [c.id, c.name])), [colleges]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        full_name: form.full_name,
        father_name: form.father_name || undefined,
        phone: form.phone,
        email: form.email,
        gender: form.gender || undefined,
        roll_number: form.roll_number || undefined,
        graduation_year: form.graduation_year ? Number(form.graduation_year) : undefined,
        college_id: form.college_id,
      };

      if (editingStudent) {
        await apiFetch(`/students/${editingStudent.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/students", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setOpen(false);
      setEditingStudent(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : editingStudent ? "Could not update student" : "Could not create student");
    } finally {
      setSaving(false);
    }
  };

  const downloadTemplate = async () => {
    const token = getToken("access_token");
    const res = await fetch(`${API_V1}/students/template`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_import_template.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = async (e: FormEvent) => {
    e.preventDefault();
    if (!fileRef.current?.files?.[0] || !importCollege) return;
    setImporting(true);
    setReport(null);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", fileRef.current.files[0]);
      const result = await apiFetch<ImportReport>(
        `/students/import?college_id=${encodeURIComponent(importCollege)}`,
        { method: "POST", body: formData, isForm: true }
      );
      setReport(result);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const onResetPassword = async () => {
    if (!resetting) return;
    setResetLoading(true);
    setError("");
    try {
      const res = await apiFetch<{ temporary_password: string }>(
        `/students/${resetting.id}/reset-password`,
        { method: "POST" }
      );
      setResetResult(res.temporary_password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reset password");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">Students</h2>
          <p className="text-sm text-slate-light">Manage student records, individually or in bulk.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setImportOpen(true)}>
            Import Excel
          </Button>
          <Button onClick={openCreate}>+ Add student</Button>
          {editingStudent ? (
            <Button
              variant="secondary"
              onClick={() => {
                setEditingStudent(null);
                setOpen(false);
                resetForm();
              }}
            >
              Cancel edit
            </Button>
          ) : null}
        </div>
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
          <EmptyState title="No students yet" description="Add a student manually or import from Excel." />
        ) : (
          <Table>
            <THead>
              <Tr>
                <Th>Name</Th>
                <Th>College</Th>
                <Th>Email</Th>
                <Th>Phone</Th>
                <Th />
              </Tr>
            </THead>
            <TBody>
              {students.map((s) => (
                <Tr key={s.id}>
                  <Td className="font-medium text-ink">{s.full_name}</Td>
                  <Td>{collegeMap.get(s.college_id) || "—"}</Td>
                  <Td>{s.email}</Td>
                  <Td>{s.phone}</Td>
                  <Td className="flex items-center justify-center gap-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openEdit(s)}
                      className="text-xs font-medium text-gold-dark hover:underline"
                    >
                      Edit
                    </button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setResetting(s);
                        setResetResult(null);
                      }}
                    >
                      Reset password
                    </Button>
                    <button
                      type="button"
                      onClick={() => onDelete(s)}
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

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingStudent(null);
          resetForm();
        }}
        title={editingStudent ? "Edit student" : "Add student"}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>College</Label>
            <Select required value={form.college_id} onChange={(e) => setForm({ ...form, college_id: e.target.value })}>
              <option value="">Select college</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Full name</Label>
            <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Father&apos;s name</Label>
              <Input value={form.father_name} onChange={(e) => setForm({ ...form, father_name: e.target.value })} />
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email</Label>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Roll number</Label>
            <Input value={form.roll_number} onChange={(e) => setForm({ ...form, roll_number: e.target.value })} />
            <p className="mt-1 text-xs text-slate-light">Optional. Leave blank if your student does not have an assigned roll number.</p>
          </div>
          <div>
            <Label>Graduation year</Label>
            <Input
              type="number"
              value={form.graduation_year}
              onChange={(e) => setForm({ ...form, graduation_year: e.target.value })}
            />
          </div>
          {error ? <p className="rounded-lg bg-crimson-light px-3 py-2 text-sm text-crimson">{error}</p> : null}
          <Button type="submit" className="w-full" loading={saving}>
            {editingStudent ? "Save changes" : "Create student"}
          </Button>
        </form>
      </Modal>

      <Modal
        open={importOpen}
        onClose={() => {
          setImportOpen(false);
          setReport(null);
        }}
        title="Import students from Excel"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-light">
            Download the template, fill in student details, and upload it back. Required
            columns: Student Name, Father Name, Gender, Phone Number, Email Address,
            Graduation Year, College Name, Course Name. The <strong>Course</strong> must
            already exist in the system (case doesn&apos;t matter). A login account is
            created automatically for each new student (email as username, a default
            password of PW@ + the last 4 digits of their phone number) — they&apos;ll be
            asked to set a real password on first login. You can optionally include
            <strong>Internship Start Date</strong> and <strong>Internship End Date</strong>
            columns (any common date format) — if present, they&apos;re used directly instead
            of defaulting the start date to today and leaving the end date blank. You can
            also optionally include an <strong>Internship ID</strong> column to set the
            exact ID yourself instead of letting the system generate one — it must be
            unique across all enrollments. A separate optional <strong>AICTE Internship ID</strong>
            column sets AICTE&apos;s own ID for the internship, shown in its own spot on the
            certificate (no uniqueness requirement, since that&apos;s managed by AICTE).
          </p>
          <Button variant="secondary" type="button" onClick={downloadTemplate}>
            Download template
          </Button>

          <form onSubmit={onImport} className="space-y-4 border-t border-line pt-4">
            <div>
              <Label>College</Label>
              <Select required value={importCollege} onChange={(e) => setImportCollege(e.target.value)}>
                <option value="">Select college</option>
                {colleges.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Excel file</Label>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                required
                className="block w-full text-sm text-ink-soft"
              />
            </div>
            {error ? <p className="rounded-lg bg-crimson-light px-3 py-2 text-sm text-crimson">{error}</p> : null}
            <Button type="submit" className="w-full" loading={importing}>
              Upload and import
            </Button>
          </form>

          {report ? (
            <div className="space-y-2 border-t border-line pt-4">
              <div className="flex gap-2">
                <Badge tone="emerald">{report.success_count} imported</Badge>
                <Badge tone={report.failure_count ? "crimson" : "neutral"}>
                  {report.failure_count} failed
                </Badge>
                {report.accounts_created > 0 && (
                  <Badge tone="gold">{report.accounts_created} login accounts created</Badge>
                )}
              </div>
              {report.errors.length > 0 && (
                <div className="max-h-48 overflow-y-auto rounded-lg border border-line">
                  {report.errors.map((e, i) => (
                    <div key={i} className="border-b border-line px-3 py-2 text-xs last:border-b-0">
                      <span className="font-medium text-crimson">Row {e.row_number}:</span>{" "}
                      {e.errors.join(", ")}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </Modal>

      <Modal
        open={!!resetting}
        onClose={() => {
          setResetting(null);
          setResetResult(null);
        }}
        title="Reset student password"
      >
        {resetResult ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-light">
              {resetting?.full_name}&apos;s password has been reset. There&apos;s no email
              integration yet, so share this temporary password with them directly — they&apos;ll
              be required to set a new one on next login.
            </p>
            <div className="rounded-lg border border-line bg-paper px-4 py-3 text-center">
              <p className="font-mono-id text-lg text-ink">{resetResult}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-light">
              This resets <strong>{resetting?.full_name}</strong>&apos;s password back to the
              default (PW@ + last 4 digits of their phone number) and forces them to choose a
              new one on next login.
            </p>
            {error ? <p className="rounded-lg bg-crimson-light px-3 py-2 text-sm text-crimson">{error}</p> : null}
            <Button onClick={onResetPassword} className="w-full" loading={resetLoading}>
              Reset password
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}