import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/verify"];

function roleHome(role: string | undefined) {
  if (role === "SUPER_ADMIN") return "/dashboard";
  if (role === "COLLEGE_ADMIN") return "/college-dashboard";
  if (role === "STUDENT") return "/student-dashboard";
  return "/login";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isResetPasswordPublic = pathname === "/reset-password" && req.nextUrl.searchParams.has("token");

  if (
    pathname === "/" ||
    isResetPasswordPublic ||
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const authed = req.cookies.get("pw_auth")?.value;
  const role = req.cookies.get("pw_role")?.value;
  const mustChangePassword = req.cookies.get("pw_change")?.value === "1";

  if (!authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (mustChangePassword && pathname !== "/change-password") {
    const url = req.nextUrl.clone();
    url.pathname = "/change-password";
    return NextResponse.redirect(url);
  }

  const isAdminArea = pathname.startsWith("/dashboard");
  const isCollegeArea = pathname.startsWith("/college-dashboard");
  const isStudentArea = pathname.startsWith("/student-dashboard");

  const allowed =
    (isAdminArea && role === "SUPER_ADMIN") ||
    (isCollegeArea && role === "COLLEGE_ADMIN") ||
    (isStudentArea && role === "STUDENT") ||
    (!isAdminArea && !isCollegeArea && !isStudentArea);

  if (!allowed) {
    const url = req.nextUrl.clone();
    url.pathname = roleHome(role);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|files|.*\\..*).*)"],
};
