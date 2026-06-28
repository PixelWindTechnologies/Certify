"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import {
  IconHome,
  IconBuilding,
  IconBook,
  IconLayers,
  IconUsers,
  IconClipboard,
  IconAward,
  IconChart,
  IconSettings,
  IconHistory,
} from "@/components/layout/icons";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: <IconHome /> },
  { href: "/dashboard/colleges", label: "Colleges", icon: <IconBuilding /> },
  { href: "/dashboard/courses", label: "Courses", icon: <IconBook /> },
  { href: "/dashboard/students", label: "Students", icon: <IconUsers /> },
  { href: "/dashboard/enrollments", label: "Enrollments", icon: <IconClipboard /> },
  { href: "/dashboard/certificates", label: "Certificates", icon: <IconAward /> },
  { href: "/dashboard/reports", label: "Reports", icon: <IconChart /> },
  { href: "/dashboard/audit-logs", label: "Audit Logs", icon: <IconHistory /> },
  { href: "/dashboard/settings", label: "Settings", icon: <IconSettings /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "SUPER_ADMIN")) {
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
      <Sidebar items={NAV} brandSub="Super Admin" />
      <div className="lg:pl-64">
        <Topbar title="Admin Console" items={NAV} />
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
