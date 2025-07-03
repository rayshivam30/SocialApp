import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"
import { verifyPassword, setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("Login attempt for:", email) // Debug log

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get user from database
    const user = await getUserByEmail(email)
    console.log("User found:", user ? "Yes" : "No") // Debug log

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    console.log("Password valid:", isValidPassword) // Debug log

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Set auth cookie
    await setAuthCookie({
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
    })

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
