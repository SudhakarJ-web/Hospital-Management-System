import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept any direct navigation to the forbidden /dashboard/doctor path
  if (pathname === "/dashboard/doctor" || pathname === "/dashboard/doctor/") {
    // Check if there is an active session cookie or redirect to root login
    const doctorCookie = request.cookies.get("gavane_active_doctor_slug")?.value;
    
    if (doctorCookie && doctorCookie !== "doctor") {
      return NextResponse.redirect(new URL(`/dashboard/${doctorCookie}`, request.url));
    }
    
    // Default fallback: direct to landing page or the primary physician console
    return NextResponse.redirect(new URL("/dashboard/doctor-priya", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/doctor/:path*", "/dashboard/doctor"],
};