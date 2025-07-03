import { NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

export async function POST() {
  try {
    // Check if demo user already exists
    const existingUser = await getUserByEmail("demo@example.com")
    if (existingUser) {
      return NextResponse.json({ message: "Demo user already exists", user: existingUser })
    }

    // Create demo user with known password
    const passwordHash = await hashPassword("password123")
    const user = await createUser({
      username: "demo_user",
      email: "demo@example.com",
      password_hash: passwordHash,
      full_name: "Demo User",
    })

    return NextResponse.json({
      message: "Demo user created successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
      },
      credentials: {
        email: "demo@example.com",
        password: "password123",
      },
    })
  } catch (error) {
    console.error("Create demo user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
