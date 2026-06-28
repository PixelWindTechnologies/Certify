"use client";

import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm animate-fade-up">
        <h2 className="font-display text-2xl text-ink">Password recovery disabled</h2>
        <p className="mt-1.5 text-sm text-slate-light">
          Forgot password is not available. Please contact your administrator to reset your password.
        </p>
        <p className="mt-2 text-sm text-slate-light">
          If you forgot your credentials, please contact the Pixelwind super admin for help.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm text-slate hover:text-ink">
          ← Back to sign in
        </Link>
      </div>
    </div>
  );
}
