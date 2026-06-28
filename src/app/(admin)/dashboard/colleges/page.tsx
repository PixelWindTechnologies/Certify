"use client";

import { useEffect, useState, FormEvent } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { College } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input, Label } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

const emptyForm = {
  name: "",
  code: "",
  address: "",
  contact_email: "",
  contact_phone: "",
  admin_email: "",
  admin_password: "",
};

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => setForm(emptyForm);

  const openCreate = () => {
    setEditingCollege(null);
    resetForm();
    setOpen(true);
  };

  const openEdit = (college: College) => {
    setEditingCollege(college);
    setForm({
      name: college.name,
      code: college.code,
      address: college.address || "",
      contact_email: college.contact_email || "",
      contact_phone: college.contact_phone || "",
      admin_email: "",
      admin_password: "",
    });
    setOpen(true);
  };

  const onDelete = async (college: College) => {
    if (!window.confirm(`Delete ${college.name}? This cannot be undone.`)) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiFetch(`/colleges/${college.id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete college");
      setLoading(false);
    }
  };

  const load = () => {
    setLoading(true);
    apiFetch<College[]>("/colleges")
      .then(setColleges)
      .catch(() => setError("Could not load colleges"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, string> = {
        name: form.name,
        code: form.code,
      };
      if (form.address) payload.address = form.address;
      if (form.contact_email) payload.contact_email = form.contact_email;
      if (form.contact_phone) payload.contact_phone = form.contact_phone;
      if (!editingCollege && form.admin_email) payload.admin_email = form.admin_email;
      if (!editingCollege && form.admin_password) payload.admin_password = form.admin_password;

      if (editingCollege) {
        await apiFetch(`/colleges/${editingCollege.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/colleges", { method: "POST", body: JSON.stringify(payload) });
      }

      setOpen(false);
      setEditingCollege(null);
      resetForm();
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : editingCollege ? "Could not update college" : "Could not create college");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-ink">Colleges</h2>
          <p className="text-sm text-slate-light">Onboard colleges and their admin accounts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={openCreate}>+ Add college</Button>
          {editingCollege ? (
            <Button
              variant="secondary"
              onClick={() => {
                setEditingCollege(null);
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
        ) : colleges.length === 0 ? (
          <EmptyState title="No colleges yet" description="Add your first college to get started." />
        ) : (
          <Table>
            <THead>
              <Tr>
                <Th>Name</Th>
                <Th>Code</Th>
                <Th>Contact</Th>
                <Th>Status</Th>
                <Th>Added</Th>
                <Th />
              </Tr>
            </THead>
            <TBody>
              {colleges.map((c) => (
                <Tr key={c.id}>
                  <Td className="font-medium text-ink">{c.name}</Td>
                  <Td className="font-mono-id text-xs">{c.code}</Td>
                  <Td>{c.contact_email || c.contact_phone || "—"}</Td>
                  <Td>
                    <Badge tone={c.is_active ? "emerald" : "neutral"}>
                      {c.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </Td>
                  <Td>{formatDate(c.created_at)}</Td>
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
          setEditingCollege(null);
          resetForm();
        }}
        title={editingCollege ? "Edit college" : "Add college"}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>College name</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Code</Label>
            <Input
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="e.g. ANU01"
            />
          </div>
          <div>
            <Label>Address</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Contact email</Label>
              <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
            </div>
            <div>
              <Label>Contact phone</Label>
              <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
            </div>
          </div>
          <div className="border-t border-line pt-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate">
              College admin account (optional)
            </p>
            <div className="space-y-3">
              <div>
                <Label>Admin email</Label>
                <Input type="email" value={form.admin_email} onChange={(e) => setForm({ ...form, admin_email: e.target.value })} />
              </div>
              <div>
                <Label>Temporary password</Label>
                <Input type="text" value={form.admin_password} onChange={(e) => setForm({ ...form, admin_password: e.target.value })} />
              </div>
            </div>
          </div>
          {error ? <p className="rounded-lg bg-crimson-light px-3 py-2 text-sm text-crimson">{error}</p> : null}
          <Button type="submit" className="w-full" loading={saving}>
            {editingCollege ? "Save changes" : "Create college"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
