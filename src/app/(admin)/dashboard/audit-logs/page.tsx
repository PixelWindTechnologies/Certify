"use client";

import { useEffect, useState } from "react";
import { apiFetch, apiFetchPaged } from "@/lib/api";
import type { AuditLogOut } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";

const ENTITY_TYPES = [
  "",
  "College",
  "Course",
  "Batch",
  "Student",
  "Enrollment",
  "Certificate",
  "CertificateTemplate",
  "Signature",
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set("entity_type", filter);
    params.set("page", String(page));
    params.set("page_size", String(pageSize));

    apiFetchPaged<AuditLogOut[]>(`/audit-logs?${params.toString()}`)
      .then((result) => {
        setLogs(result.data);
        setTotalLogs(result.totalCount);
      })
      .finally(() => setLoading(false));
  }, [filter, page, pageSize]);

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">Audit logs</h2>
          <p className="text-sm text-slate-light">A trail of every meaningful change made on the platform.</p>
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-xs">
          {ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t || "All entity types"}
            </option>
          ))}
        </Select>
      </div>

      <Card>
        {!loading && logs.length > 0 ? (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalItems={totalLogs}
            pageCount={Math.max(1, Math.ceil(totalLogs / pageSize))}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        ) : null}
        {loading ? (
          <p className="px-5 py-8 text-center text-sm text-slate-light">Loading…</p>
        ) : logs.length === 0 ? (
          <EmptyState title="No audit entries" description="Activity will appear here as it happens." />
        ) : (
          <Table>
            <THead>
              <Tr>
                <Th>Action</Th>
                <Th>Entity</Th>
                <Th>Entity ID</Th>
                <Th>Timestamp</Th>
              </Tr>
            </THead>
            <TBody>
              {logs.map((log) => (
                <Tr key={log.id}>
                  <Td className="font-medium text-ink">{log.action}</Td>
                  <Td>{log.entity_type}</Td>
                  <Td className="font-mono-id text-xs">{log.entity_id ? `${log.entity_id.slice(0, 8)}…` : "—"}</Td>
                  <Td>{new Date(log.timestamp).toLocaleString("en-IN")}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
