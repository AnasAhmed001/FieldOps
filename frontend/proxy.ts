import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Using a basic middleware since we store our token in an httpOnly cookie
// We can't decode the JWT easily in Edge runtime without crypto libraries, 
// but we can check if the token exists, and we generally rely on the client
// redirect and API protection for deep role checks. 
// A more robust app might use simple jwt-decode here.

export function proxy(request: NextRequest) {
  const token = request.cookies.get("refreshToken")?.value;
  const url = request.nextUrl.clone();

  // Redirect to login if accessing protected route without a token
  if (!token && url.pathname.startsWith("/admin") || 
      !token && url.pathname.startsWith("/technician") ||
      !token && url.pathname.startsWith("/client")) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If going to login but already has token, redirect to dashboard root (which will redirect to correct role)
  // Actually, we don't know the role here easily, so let the client handle it, or redirect to a generic loading page.
  // We'll just let the login page redirect them if AuthContext finds a user.

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/technician/:path*", "/client/:path*"],
};
