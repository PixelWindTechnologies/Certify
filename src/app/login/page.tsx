"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, roleHome } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      router.push(user.must_change_password ? "/change-password" : roleHome(user.role));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink px-12 py-12 text-paper lg:flex">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-gold/20" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full border border-gold/10" />

        <div className="relative flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gold/40 bg-white p-1">
            <img
              src="/logo.ico"
              alt="Pixel Wind logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="font-display text-base">Pixel Wind Technologies</p>
            <p className="text-xs uppercase tracking-wide text-slate-light">
              Certification Portal
            </p>
          </div>
        </div>

        <div className="relative max-w-md">
          <p className="font-display text-3xl leading-snug">
            Every certificate, verifiably authentic.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-light">
            Issue, track, and verify internship certificates across colleges
            and internships — with a tamper-evident QR seal on every document.
          </p>
        </div>

        <p className="relative text-xs text-slate-light">
          © {new Date().getFullYear()} Pixel Wind Technologies. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-paper px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-gold/40 bg-white p-1">
              <img
                src="../../../logo.ico"
                alt="Pixel Wind logo"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="font-display text-base text-ink">Pixel Wind</p>
          </div>

          <h2 className="font-display text-2xl text-ink">Sign in</h2>
          <p className="mt-1.5 text-sm text-slate-light">
            Enter your credentials to access your dashboard.
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@pixelwind.in"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error ? (
              <p className="rounded-lg bg-crimson-light px-3 py-2 text-sm text-crimson">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
