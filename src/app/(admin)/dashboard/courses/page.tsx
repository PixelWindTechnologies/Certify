"use client";

import { useEffect, useState, FormEvent } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { Course } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Label } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

const emptyForm = { name: "", code: "", description: "", duration_weeks: "" };

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => setForm(emptyForm);

  const openCreate = () => {
    setEditingCourse(null);
    resetForm();
    setOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setForm({
      name: course.name,
      code: course.code,
      description: course.description || "",
      duration_weeks: course.duration_weeks ? String(course.duration_weeks) : "",
    });
    setOpen(true);
  };

  const onDelete = async (course: Course) => {
    if (!window.confirm(`Delete ${course.name}? This cannot be undone.`)) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiFetch(`/courses/${course.id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete course");
      setLoading(false);
    }
  };

  const load = () => {
    setLoading(true);
    apiFetch<Course[]>("/courses")
      .then(setCourses)
      .catch(() => setError("Could not load courses"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        code: form.code,
        description: form.description || undefined,
        duration_weeks: form.duration_weeks ? Number(form.duration_weeks) : undefined,
      };

      if (editingCourse) {
        await apiFetch(`/courses/${editingCourse.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/courses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setOpen(false);
      setEditingCourse(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : editingCourse ? "Could not update course" : "Could not create course");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-ink">Courses</h2>
          <p className="text-sm text-slate-light">
            Internship programs offered, e.g. Data Analytics, Web Development.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openCreate}>+ Add course</Button>
          {editingCourse ? (
            <Button
              variant="secondary"
              onClick={() => {
                setEditingCourse(null);
                setOpen(false);
                resetForm();
              }}
            >
              Cancel edit
            </Button>
          ) : null}
        </div>
      </div>

      <Card>
        {loading ? (
          <p className="px-5 py-8 text-center text-sm text-slate-light">Loading…</p>
        ) : courses.length === 0 ? (
          <EmptyState title="No courses yet" description="Add your first internship course." />
        ) : (
          <Table>
            <THead>
              <Tr>
                <Th>Name</Th>
                <Th>Code</Th>
                <Th>Duration</Th>
                <Th>Status</Th>
                <Th />
              </Tr>
            </THead>
            <TBody>
              {courses.map((c) => (
                <Tr key={c.id}>
                  <Td className="font-medium text-ink">{c.name}</Td>
                  <Td className="font-mono-id text-xs">{c.code}</Td>
                  <Td>{c.duration_weeks ? `${c.duration_weeks} weeks` : "—"}</Td>
                  <Td>
                    <Badge tone={c.is_active ? "emerald" : "neutral"}>
                      {c.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </Td>
                  <Td className="flex gap-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="text-xs font-medium text-gold-dark hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(c)}
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
          setEditingCourse(null);
          resetForm();
        }}
        title={editingCourse ? "Edit course" : "Add course"}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Course name</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Data Analytics" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Code</Label>
              <Input
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="DA"
              />
            </div>
            <div>
              <Label>Duration (weeks)</Label>
              <Input
                type="number"
                min={1}
                value={form.duration_weeks}
                onChange={(e) => setForm({ ...form, duration_weeks: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          {error ? <p className="rounded-lg bg-crimson-light px-3 py-2 text-sm text-crimson">{error}</p> : null}
          <Button type="submit" className="w-full" loading={saving}>
            {editingCourse ? "Save changes" : "Create course"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
