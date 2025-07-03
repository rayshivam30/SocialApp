import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { username } = await params
    const { action } = await request.json()

    // Get the target user's ID from username
    const targetUserResult = await sql`
      SELECT id FROM users WHERE username = ${username} LIMIT 1
    `

    if (targetUserResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const targetUserId = targetUserResult[0].id

    // Prevent following yourself
    if (authUser.id === targetUserId) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 })
    }

    if (action === "follow") {
      try {
        await sql`
          INSERT INTO followers (follower_id, following_id)
          VALUES (${authUser.id}, ${targetUserId})
        `
        return NextResponse.json({ success: true, message: "User followed successfully" })
      } catch (error) {
        // Handle duplicate key error (already following)
        return NextResponse.json({ success: false, error: "Already following this user" })
      }
    } else if (action === "unfollow") {
      await sql`
        DELETE FROM followers 
        WHERE follower_id = ${authUser.id} AND following_id = ${targetUserId}
      `
      return NextResponse.json({ success: true, message: "User unfollowed successfully" })
    } else {
      return NextResponse.json({ error: "Invalid action. Use 'follow' or 'unfollow'" }, { status: 400 })
    }
  } catch (error) {
    console.error("Follow/unfollow error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
