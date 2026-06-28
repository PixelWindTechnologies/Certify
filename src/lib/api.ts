export const API_V1 = "/api/v1";

function getToken(key: "access_token" | "refresh_token"): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function setTokens(access: string, refresh: string) {
  window.localStorage.setItem("access_token", access);
  window.localStorage.setItem("refresh_token", refresh);
}

function clearAuth() {
  window.localStorage.removeItem("access_token");
  window.localStorage.removeItem("refresh_token");
  window.localStorage.removeItem("role");
  window.localStorage.removeItem("user_id");
  window.localStorage.removeItem("full_name");
  document.cookie = "pw_auth=; path=/; max-age=0";
  document.cookie = "pw_role=; path=/; max-age=0";
}

async function tryRefresh(): Promise<string | null> {
  const refresh = getToken("refresh_token");
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_V1}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    setTokens(data.access_token, data.refresh_token);
    return data.access_token as string;
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

interface ApiOptions extends RequestInit {
  auth?: boolean; // default true
  isForm?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { auth = true, isForm = false, headers, ...rest } = options;
  const url = path.startsWith("http") ? path : `${API_V1}${path}`;

  const doFetch = async (token: string | null) => {
    const finalHeaders: Record<string, string> = {
      ...(headers as Record<string, string>),
    };
    if (!isForm && rest.body && !finalHeaders["Content-Type"]) {
      finalHeaders["Content-Type"] = "application/json";
    }
    if (auth && token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
    return fetch(url, { ...rest, headers: finalHeaders });
  };

  let token = auth ? getToken("access_token") : null;
  let res = await doFetch(token);

  if (auth && res.status === 401) {
    const newToken = await tryRefresh();
    if (newToken) {
      res = await doFetch(newToken);
    } else {
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new ApiError(401, "Session expired");
    }
  }

  if (!res.ok) {
    let detail: unknown = undefined;
    try {
      detail = await res.json();
    } catch {
      /* ignore */
    }
    const message =
      typeof detail === "string"
        ? detail
        : (detail as { detail?: string; message?: string })?.detail ||
          (detail as { detail?: string; message?: string })?.message ||
          res.statusText ||
          "Request failed";
    throw new ApiError(res.status, message, detail);
  }

  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.blob()) as unknown as T;
}

export async function apiFetchPaged<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<{ data: T; totalCount: number }> {
  const { auth = true, isForm = false, headers, ...rest } = options;
  const url = path.startsWith("http") ? path : `${API_V1}${path}`;

  const doFetch = async (token: string | null) => {
    const finalHeaders: Record<string, string> = {
      ...(headers as Record<string, string>),
    };
    if (!isForm && rest.body && !finalHeaders["Content-Type"]) {
      finalHeaders["Content-Type"] = "application/json";
    }
    if (auth && token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
    return fetch(url, { ...rest, headers: finalHeaders });
  };

  let token = auth ? getToken("access_token") : null;
  let res = await doFetch(token);

  if (auth && res.status === 401) {
    const newToken = await tryRefresh();
    if (newToken) {
      res = await doFetch(newToken);
    } else {
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new ApiError(401, "Session expired");
    }
  }

  if (!res.ok) {
    let detail: unknown = undefined;
    try {
      detail = await res.json();
    } catch {
      /* ignore */
    }
    const message =
      typeof detail === "string"
        ? detail
        : (detail as { detail?: string; message?: string })?.detail ||
          (detail as { detail?: string; message?: string })?.message ||
          res.statusText ||
          "Request failed";
    throw new ApiError(res.status, message, detail);
  }

  if (res.status === 204) {
    return { data: undefined as unknown as T, totalCount: 0 };
  }

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? ((await res.json()) as T)
    : ((await res.blob()) as unknown as T);
  const totalCount = Number(res.headers.get("X-Total-Count") ?? 0);
  return { data, totalCount };
}

export { setTokens, clearAuth, getToken };
