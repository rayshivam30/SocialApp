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
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Get user ID first
    const userResult = await sql`
      SELECT id FROM users WHERE username = ${username} LIMIT 1
    `

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = userResult[0].id

    // Get user's posts
    const posts = await sql`
      SELECT 
        p.*,
        u.username,
        u.full_name,
        u.profile_picture_url,
        c.name as community_name,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        (SELECT COUNT(*) > 0 FROM likes WHERE post_id = p.id AND user_id = ${authUser.id}) as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN communities c ON p.community_id = c.id
      WHERE p.user_id = ${userId}
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Get user posts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
