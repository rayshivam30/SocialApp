import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { full_name, bio, profile_picture_url, is_private } = await request.json()

    // Update user profile
    await sql`
      UPDATE users 
      SET 
        full_name = ${full_name || null},
        bio = ${bio || null},
        profile_picture_url = ${profile_picture_url || null},
        is_private = ${is_private || false},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${authUser.id}
    `

    return NextResponse.json({ message: "Profile updated successfully" })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
