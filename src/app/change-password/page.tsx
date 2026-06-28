"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth, roleHome } from "@/lib/auth";
import { apiFetch, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";

export default function ChangePasswordPage() {
  const { user, clearMustChangePassword } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const forced = !!user?.must_change_password;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ new_password: password }),
      });
      clearMustChangePassword();
      router.push(user ? roleHome(user.role) : "/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm animate-fade-up">
        <h2 className="font-display text-2xl text-ink">
          {forced ? "Set a new password" : "Change your password"}
        </h2>
        <p className="mt-1.5 text-sm text-slate-light">
          {forced
            ? "You're using a temporary password. Choose a new one to continue."
            : "Choose a strong password for your account."}
        </p>

        <form onSubmit={onSubmit} className="mt-7 space-y-4">
          <div>
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          {error ? (
            <p className="rounded-lg bg-crimson-light px-3 py-2 text-sm text-crimson">{error}</p>
          ) : null}
          <Button type="submit" className="w-full" loading={loading}>
            Update password
          </Button>
        </form>
      </div>
    </div>
  );
}
