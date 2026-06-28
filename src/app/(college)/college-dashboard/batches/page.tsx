"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CollegeBatchesPage() {
  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="font-display text-xl text-ink">Batches</h2>
        <p className="text-sm text-slate-light">Cohorts running at your college.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Legacy batch page</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Batch management removed"
            description="This page is deprecated. Manage enrollments using course and college workflows instead."
          />
        </CardContent>
      </Card>

    </div>
  );
}
