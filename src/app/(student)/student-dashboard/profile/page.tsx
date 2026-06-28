"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type { Enrollment } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { initials } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuth();
  const [enrollmentCount, setEnrollmentCount] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<Enrollment[]>("/enrollments")
      .then((e) => setEnrollmentCount(e.length))
      .catch(() => setEnrollmentCount(null));
  }, []);

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="font-display text-xl text-ink">Profile</h2>
        <p className="text-sm text-slate-light">Your account details.</p>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4 py-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-lg font-medium text-paper">
            {initials(user?.full_name || "Student")}
          </div>
          <div>
            <p className="font-display text-lg text-ink">{user?.full_name || "Student"}</p>
            <p className="text-sm text-slate-light">Role: Student</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-light">
          <p>
            Internships on record:{" "}
            <span className="font-medium text-ink">{enrollmentCount ?? "—"}</span>
          </p>
          <p>
            To update your name, phone number, or other personal details, please contact your
            college&apos;s administrator — they manage student records directly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
