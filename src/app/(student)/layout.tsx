"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { IconHome, IconBook, IconAward, IconUser } from "@/components/layout/icons";

const NAV = [
  { href: "/student-dashboard", label: "Overview", icon: <IconHome /> },
  { href: "/student-dashboard/my-courses", label: "My internships", icon: <IconBook /> },
  { href: "/student-dashboard/my-certificates", label: "My certificates", icon: <IconAward /> },
  { href: "/student-dashboard/profile", label: "Profile", icon: <IconUser /> },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "STUDENT")) {
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
      <Sidebar items={NAV} brandSub="Student" />
      <div className="lg:pl-64">
        <Topbar title="My Dashboard" items={NAV} />
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
