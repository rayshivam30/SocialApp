import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "./lib/auth"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/signup", "/api/auth/login", "/api/auth/signup", "/api/create-demo-user"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // If no token and trying to access protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If token exists, verify it
  if (token) {
    const user = verifyToken(token)

    // If token is invalid, redirect to login
    if (!user && !isPublicRoute) {
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("auth-token")
      return response
    }

    // If user is authenticated and trying to access login/signup, redirect to feed
    if (user && (pathname === "/login" || pathname === "/signup")) {
      return NextResponse.redirect(new URL("/feed", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|placeholder.svg).*)"],
}
