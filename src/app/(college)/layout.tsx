"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { IconHome, IconUsers, IconLayers, IconAward, IconChart, IconClipboard } from "@/components/layout/icons";

const NAV = [
  { href: "/college-dashboard", label: "Overview", icon: <IconHome /> },
  { href: "/college-dashboard/students", label: "Students", icon: <IconUsers /> },
  { href: "/college-dashboard/enrollments", label: "Enrollments", icon: <IconClipboard /> },
  { href: "/college-dashboard/certificates", label: "Certificates", icon: <IconAward /> },
  { href: "/college-dashboard/reports", label: "Reports", icon: <IconChart /> },
];

export default function CollegeLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "COLLEGE_ADMIN")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Sidebar items={NAV} brandSub="College Admin" />
      <div className="lg:pl-64">
        <Topbar title="College Console" items={NAV} />
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
