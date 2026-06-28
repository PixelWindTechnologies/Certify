"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { apiFetch, ApiError, API_V1, getToken } from "@/lib/api";
import type { CertificateTemplateOut, SignatureOut } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input, Label } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";

export default function SettingsPage() {
  const [templates, setTemplates] = useState<CertificateTemplateOut[]>([]);
  const [signatures, setSignatures] = useState<SignatureOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [templateName, setTemplateName] = useState("");
  const templateFileRef = useRef<HTMLInputElement>(null);
  const [uploadingTemplate, setUploadingTemplate] = useState(false);

  const [signatureLabel, setSignatureLabel] = useState("Authorized Signatory");
  const signatureFileRef = useRef<HTMLInputElement>(null);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      apiFetch<CertificateTemplateOut[]>("/certificates/templates/list"),
      apiFetch<SignatureOut[]>("/certificates/signature/list"),
    ])
      .then(([t, s]) => {
        setTemplates(t);
        setSignatures(s);
      })
      .catch(() => setError("Could not load settings"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onUploadTemplate = async (e: FormEvent) => {
    e.preventDefault();
    if (!templateFileRef.current?.files?.[0]) return;
    setUploadingTemplate(true);
    setError("");
    setMsg("");
    try {
      const formData = new FormData();
      formData.append("file", templateFileRef.current.files[0]);
      await apiFetch(`/certificates/templates/upload?name=${encodeURIComponent(templateName)}`, {
        method: "POST",
        body: formData,
        isForm: true,
      });
      setTemplateName("");
      if (templateFileRef.current) templateFileRef.current.value = "";
      setMsg("Template uploaded.");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploadingTemplate(false);
    }
  };

  const onUploadSignature = async (e: FormEvent) => {
    e.preventDefault();
    if (!signatureFileRef.current?.files?.[0]) return;
    setUploadingSignature(true);
    setError("");
    setMsg("");
    try {
      const formData = new FormData();
      formData.append("file", signatureFileRef.current.files[0]);
      await apiFetch(`/certificates/signature/upload?label=${encodeURIComponent(signatureLabel)}`, {
        method: "POST",
        body: formData,
        isForm: true,
      });
      if (signatureFileRef.current) signatureFileRef.current.value = "";
      setMsg("Signature uploaded and set active.");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploadingSignature(false);
    }
  };

  const activateSignature = async (s: SignatureOut) => {
    setError("");
    setMsg("");
    try {
      await apiFetch(`/certificates/signature/${s.id}/activate`, { method: "POST" });
      setMsg(`"${s.label}" is now the active signature.`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not activate signature");
    }
  };

  const previewSignature = async (s: SignatureOut) => {
    const token = getToken("access_token");
    const res = await fetch(`${API_V1}/certificates/signature/${s.id}/preview`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return;
    const blob = await res.blob();
    window.open(URL.createObjectURL(blob), "_blank");
  };

  const toggleTemplate = async (t: CertificateTemplateOut) => {
    setError("");
    try {
      await apiFetch(`/certificates/templates/${t.id}/${t.is_active ? "deactivate" : "activate"}`, {
        method: "POST",
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update template");
    }
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="font-display text-xl text-ink">Settings</h2>
        <p className="text-sm text-slate-light">
          Manage certificate background templates and the authorized signature image used on
          every issued certificate.
        </p>
      </div>

      {msg ? <p className="rounded-lg bg-emerald-light px-3 py-2 text-sm text-emerald">{msg}</p> : null}
      {error ? <p className="rounded-lg bg-crimson-light px-3 py-2 text-sm text-crimson">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Certificate templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-slate-light">Loading…</p>
          ) : templates.length === 0 ? (
            <EmptyState
              title="No templates uploaded"
              description="Without a template, certificates render on a built-in default layout."
            />
          ) : (
            <div className="space-y-2">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-line px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{t.name}</p>
                    <p className="text-xs text-slate-light">{t.file_path}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={t.is_active ? "emerald" : "neutral"}>
                      {t.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <button
                      onClick={() => toggleTemplate(t)}
                      className="text-xs font-medium text-gold-dark hover:underline"
                    >
                      {t.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={onUploadTemplate} className="space-y-3 border-t border-line pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate">Upload new template</p>
            <div>
              <Label>Template name</Label>
              <Input required value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
            </div>
            <div>
              <Label>Background image (PNG/JPG)</Label>
              <input
                ref={templateFileRef}
                type="file"
                accept="image/png,image/jpeg"
                required
                className="block w-full text-sm text-ink-soft"
              />
            </div>
            <Button type="submit" loading={uploadingTemplate}>
              Upload template
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Authorized signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-slate-light">Loading…</p>
          ) : signatures.length === 0 ? (
            <EmptyState
              title="No signatures uploaded"
              description="Upload one below — it appears on every certificate from then on."
            />
          ) : (
            <div className="space-y-2">
              {signatures.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-line px-4 py-3"
                >
                  <p className="text-sm font-medium text-ink">{s.label}</p>
                  <div className="flex items-center gap-3">
                    <Badge tone={s.is_active ? "emerald" : "neutral"}>
                      {s.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <button
                      onClick={() => previewSignature(s)}
                      className="text-xs font-medium text-slate hover:text-ink hover:underline"
                    >
                      Preview
                    </button>
                    {!s.is_active && (
                      <button
                        onClick={() => activateSignature(s)}
                        className="text-xs font-medium text-gold-dark hover:underline"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={onUploadSignature} className="space-y-3 border-t border-line pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate">
              Upload new signature
            </p>
            <p className="text-sm text-slate-light">
              Uploading a new signature replaces the active one immediately. Only one
              signature is ever active — every future certificate uses it.
            </p>
            <div>
              <Label>Signatory label</Label>
              <Input value={signatureLabel} onChange={(e) => setSignatureLabel(e.target.value)} />
            </div>
            <div>
              <Label>Signature image (PNG, transparent background recommended)</Label>
              <input
                ref={signatureFileRef}
                type="file"
                accept="image/png,image/jpeg"
                required
                className="block w-full text-sm text-ink-soft"
              />
            </div>
            <Button type="submit" loading={uploadingSignature}>
              Upload signature
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
