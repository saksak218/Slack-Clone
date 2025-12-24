import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { authComponent } from "@/convex/auth";
import { preloadAuthQuery } from "./lib/auth-server";
import { api } from "./convex/_generated/api";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicRoute = ["/login", "/signup"].includes(path);

  try {
    const [currentUser] = await Promise.all([
      preloadAuthQuery(api.auth.getCurrentUser),
      // Load multiple queries in parallel if needed
    ]);

    console.log("Session", currentUser);

    // If logged in and on a public route (login/signup), redirect to home
    if (currentUser && isPublicRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // If NOT logged in and on a protected route, redirect to login
    if (!currentUser && !isPublicRoute) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } catch (error) {
    console.error("Auth check failed", error);

    // If on public route, allow access (we are not logged in, which is fine for login page)
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // If auth check fails (e.g. Unauthenticated error), redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup"], // Specify the routes the middleware applies to
};
