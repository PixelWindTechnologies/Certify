"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, roleHome } from "@/lib/auth";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace(user.must_change_password ? "/change-password" : roleHome(user.role));
    } else {
      router.replace("/login");
    }
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper">
      <Image src="/logo.ico" alt="Pixelwind logo" width={72} height={72} className="rounded-lg" />
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
    </div>
  );
}
