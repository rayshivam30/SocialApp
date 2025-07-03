import { type NextRequest, NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/db"
import { hashPassword, setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, fullName } = await request.json()

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email, and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)
    const user = await createUser({
      username,
      email,
      password_hash: passwordHash,
      full_name: fullName,
    })

    // Set auth cookie
    await setAuthCookie(user)

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
