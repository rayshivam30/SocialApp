import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { username } = await params

    // Get user ID first
    const userResult = await sql`
      SELECT id FROM users WHERE username = ${username} LIMIT 1
    `

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = userResult[0].id

    // Get user's communities
    const communities = await sql`
      SELECT 
        c.*,
        cm.role,
        cm.joined_at
      FROM communities c
      JOIN community_members cm ON c.id = cm.community_id
      WHERE cm.user_id = ${userId}
      ORDER BY cm.joined_at DESC
    `

    return NextResponse.json({ communities })
  } catch (error) {
    console.error("Get user communities error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
