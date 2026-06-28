"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setTokens, clearAuth } from "./api";
import type { AuthUser, TokenResponse } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  clearMustChangePassword: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function roleHome(role: string) {
  if (role === "SUPER_ADMIN") return "/dashboard";
  if (role === "COLLEGE_ADMIN") return "/college-dashboard";
  return "/student-dashboard";
}

function persistUser(data: TokenResponse) {
  window.localStorage.setItem("role", data.role);
  window.localStorage.setItem("user_id", data.user_id);
  if (data.full_name) {
    window.localStorage.setItem("full_name", data.full_name);
  }
  window.localStorage.setItem("must_change_password", data.must_change_password ? "1" : "0");
  document.cookie = `pw_auth=1; path=/; max-age=${60 * 60 * 24 * 7}`;
  document.cookie = `pw_role=${data.role}; path=/; max-age=${60 * 60 * 24 * 7}`;
  document.cookie = `pw_change=${data.must_change_password ? "1" : ""}; path=/; max-age=${
    60 * 60 * 24 * 7
  }`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const role = window.localStorage.getItem("role");
    const userId = window.localStorage.getItem("user_id");
    const fullName = window.localStorage.getItem("full_name");
    const collegeId = window.localStorage.getItem("college_id");
    const mustChange = window.localStorage.getItem("must_change_password") === "1";
    const access = window.localStorage.getItem("access_token");
    if (access && role && userId) {
      setUser({
        user_id: userId,
        role: role as AuthUser["role"],
        full_name: fullName,
        college_id: collegeId,
        must_change_password: mustChange,
      });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiFetch<TokenResponse>("/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password }),
    });
    setTokens(data.access_token, data.refresh_token);
    persistUser(data);
    const authUser: AuthUser = {
      user_id: data.user_id,
      role: data.role,
      full_name: data.full_name,
      must_change_password: data.must_change_password,
    };
    setUser(authUser);
    return authUser;
  };

  const clearMustChangePassword = () => {
    window.localStorage.setItem("must_change_password", "0");
    document.cookie = "pw_change=; path=/; max-age=0";
    setUser((prev) => (prev ? { ...prev, must_change_password: false } : prev));
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, clearMustChangePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { roleHome };
