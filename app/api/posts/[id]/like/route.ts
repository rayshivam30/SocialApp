import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const postId = Number.parseInt(id)

    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 })
    }

    // Check if post exists
    const postExists = await sql`
      SELECT id FROM posts WHERE id = ${postId} LIMIT 1
    `

    if (postExists.length === 0) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    // Check if like exists
    const existingLike = await sql`
      SELECT id FROM likes WHERE user_id = ${user.id} AND post_id = ${postId} LIMIT 1
    `

    let liked = false

    if (existingLike.length > 0) {
      // Remove like
      await sql`DELETE FROM likes WHERE user_id = ${user.id} AND post_id = ${postId}`
      liked = false
    } else {
      // Add like
      await sql`INSERT INTO likes (user_id, post_id) VALUES (${user.id}, ${postId})`
      liked = true
    }

    // Get updated like count
    const likeCountResult = await sql`
      SELECT COUNT(*) as count FROM likes WHERE post_id = ${postId}
    `

    const likeCount = Number.parseInt(likeCountResult[0].count)

    return NextResponse.json({
      liked,
      likeCount,
      message: liked ? "Post liked" : "Post unliked",
    })
  } catch (error) {
    console.error("Toggle like error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
