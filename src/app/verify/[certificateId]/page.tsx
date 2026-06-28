"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import type { VerificationResponse } from "@/lib/types";
import { Seal } from "@/components/ui/Seal";
import { formatDate } from "@/lib/utils";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line/70 py-2.5 last:border-b-0">
      <span className="text-xs uppercase tracking-wide text-slate">{label}</span>
      <span className="text-right text-sm font-medium text-ink">{value}</span>
    </div>
  );
}

export default function VerifyPage() {
  const params = useParams<{ certificateId: string }>();
  const [data, setData] = useState<VerificationResponse | null>(null);
  const [error, setError] = useState<"not_found" | "server_error" | "">("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<VerificationResponse>(`/verify/${params.certificateId}`, { auth: false })
      .then(setData)
      .catch((err) => {
        setError(err instanceof ApiError && err.status === 404 ? "not_found" : "server_error");
      })
      .finally(() => setLoading(false));
  }, [params.certificateId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="mb-6 flex items-center justify-center gap-2.5 text-paper">
          <img
            src="/logo.ico"
            alt="Pixel Wind logo"
            className="h-9 w-9 rounded-full border border-gold/40 bg-white p-1"
          />
          <div>
            <p className="font-display text-sm">Pixel Wind Technologies</p>
            <p className="text-[11px] uppercase tracking-wide text-slate-light">
              Certificate Verification
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-paper/20 border-t-paper" />
          </div>
        ) : error === "not_found" ? (
          <div className="animate-fade-up rounded-xl2 border border-line bg-white p-10 text-center shadow-panel">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-crimson-light text-crimson">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </div>
            <p className="font-display text-lg text-ink">Certificate not found</p>
            <p className="mt-1.5 text-sm text-slate-light">
              We couldn&apos;t find a certificate matching this ID. Please check the certificate
              ID and try again, or contact Pixel Wind Technologies if you believe this is an
              error.
            </p>
          </div>
        ) : error === "server_error" || !data ? (
          <div className="animate-fade-up rounded-xl2 border border-line bg-white p-10 text-center shadow-panel">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-crimson-light text-crimson">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </div>
            <p className="font-display text-lg text-ink">Unable to verify this certificate</p>
            <p className="mt-1.5 text-sm text-slate-light">
              There was a problem checking this certificate. Please try again later or contact
              Pixel Wind Technologies if the problem persists.
            </p>
          </div>
        ) : (
          <div className="relative animate-fade-up overflow-hidden rounded-xl2 border border-line bg-white shadow-panel">
            {/* Diagonal ribbon */}
            <div
              className={`absolute right-[-58px] top-[22px] z-10 w-[220px] rotate-45 py-1.5 text-center text-xs font-semibold uppercase tracking-widest text-white shadow-sm ${
                data.verification_status === "VALID" ? "bg-emerald" : "bg-crimson"
              }`}
            >
              {data.verification_status === "VALID" ? "Valid" : "Revoked"}
            </div>

            <div className="border-b border-line bg-paper px-8 py-8 text-center">
              <Seal status={data.verification_status} size={72} />
              <p className="mt-4 font-display text-2xl text-ink">{data.student_name}</p>
              <p className="mt-1 text-sm text-slate-light">
                has successfully completed the {data.training_type === "INDUSTRIAL_TRAINING" ? "Industrial Training" : "Internship"} program in
              </p>
              <p className="font-display text-lg text-gold-dark">{data.course_name}</p>
              <p className="mt-1 text-sm text-slate-light">
                at <span className="font-medium text-ink">{data.issued_by}</span>
              </p>
            </div>

            <div className="px-8 py-6">
              <Row label="Certificate ID" value={data.certificate_id} />
              <Row label="Internship ID" value={data.internship_id} />
              {data.father_name ? <Row label="Father's name" value={data.father_name} /> : null}
              {data.admission_date ? <Row label="Joined" value={formatDate(data.admission_date)} /> : null}
              {data.relieving_date ? <Row label="Relieved" value={formatDate(data.relieving_date)} /> : null}
              {data.performance_grade ? <Row label="Performance" value={data.performance_grade} /> : null}
              <Row label="Issue date" value={formatDate(data.issue_date)} />
              <Row label="Issued by" value={data.issued_by} />
            </div>

            <div className="border-t border-line bg-paper px-8 py-4 text-center">
              <p className="text-xs text-slate-light">
                This page confirms the authenticity of a certificate issued by Pixel Wind
                Technologies. Verified by certificate ID — never by student ID.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
