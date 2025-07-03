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

    // Get user profile
    const userResult = await sql`
      SELECT 
        id, username, email, full_name, bio, profile_picture_url, 
        is_private, created_at
      FROM users 
      WHERE username = ${username}
      LIMIT 1
    `

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userResult[0]

    // Get follower/following counts
    const followerCount = await sql`
      SELECT COUNT(*) as count FROM followers WHERE following_id = ${user.id}
    `

    const followingCount = await sql`
      SELECT COUNT(*) as count FROM followers WHERE follower_id = ${user.id}
    `

    // Get post count
    const postCount = await sql`
      SELECT COUNT(*) as count FROM posts WHERE user_id = ${user.id}
    `

    // Check if current user is following this user
    const isFollowing = await sql`
      SELECT COUNT(*) as count FROM followers 
      WHERE follower_id = ${authUser.id} AND following_id = ${user.id}
    `

    return NextResponse.json({
      user: {
        ...user,
        follower_count: Number.parseInt(followerCount[0].count),
        following_count: Number.parseInt(followingCount[0].count),
        post_count: Number.parseInt(postCount[0].count),
        is_following: Number.parseInt(isFollowing[0].count) > 0,
        is_own_profile: authUser.id === user.id,
      },
    })
  } catch (error) {
    console.error("Get user profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
