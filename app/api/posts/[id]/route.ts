import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const postId = Number.parseInt(params.id)
    // Check if the post exists and belongs to the user
    const post = await sql`SELECT * FROM posts WHERE id = ${postId} LIMIT 1`
    if (!post[0]) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }
    if (post[0].user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    await sql`DELETE FROM posts WHERE id = ${postId}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete post error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 