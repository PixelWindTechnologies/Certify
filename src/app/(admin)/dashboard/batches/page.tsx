"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default function BatchesPage() {
  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="font-display text-xl text-ink">Batch management removed</h2>
        <p className="text-sm text-slate-light">
          Batch-based enrollment is no longer supported. Use course and college enrollment flows instead.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Legacy batch page</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No batch management here"
            description="This page has been deprecated. Enroll students using courses and colleges directly."
          />
        </CardContent>
      </Card>
    </div>
  );
}
