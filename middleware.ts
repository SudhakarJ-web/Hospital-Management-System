import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept any direct call to /dashboard/doctor
  if (pathname === "/dashboard/doctor" || pathname === "/dashboard/doctor/") {
    const doctorCookie = request.cookies.get("gavane_active_doctor_slug")?.value;

    if (doctorCookie && doctorCookie !== "doctor") {
      return NextResponse.redirect(new URL(`/dashboard/${doctorCookie}`, request.url));
    }

    // Redirect to home with login trigger instead of hardcoding Dr. Priya
    return NextResponse.redirect(new URL("/?auth=doctor", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/doctor/:path*", "/dashboard/doctor"],
};