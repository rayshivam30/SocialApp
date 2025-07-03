import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const communities = await sql`
      SELECT 
        c.*,
        u.username as creator_username,
        u.full_name as creator_name,
        (SELECT COUNT(*) FROM community_members WHERE community_id = c.id) as member_count,
        (SELECT COUNT(*) > 0 FROM community_members WHERE community_id = c.id AND user_id = ${user.id}) as is_member
      FROM communities c
      JOIN users u ON c.creator_id = u.id
      ORDER BY c.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    return NextResponse.json({ communities })
  } catch (error) {
    console.error("Get communities error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, category, is_private = false } = await request.json()

    if (!name || !description || !category) {
      return NextResponse.json({ error: "Name, description, and category are required" }, { status: 400 })
    }

    // Check if community name already exists
    const existingCommunity = await sql`
      SELECT id FROM communities WHERE name = ${name} LIMIT 1
    `

    if (existingCommunity.length > 0) {
      return NextResponse.json({ error: "A community with this name already exists" }, { status: 409 })
    }

    // Create the community
    const community = await sql`
      INSERT INTO communities (name, description, category, creator_id, is_private, member_count)
      VALUES (${name}, ${description}, ${category}, ${user.id}, ${is_private}, 1)
      RETURNING *
    `

    // Add creator as admin member
    await sql`
      INSERT INTO community_members (user_id, community_id, role)
      VALUES (${user.id}, ${community[0].id}, 'admin')
    `

    return NextResponse.json({
      community: community[0],
      message: "Community created successfully",
    })
  } catch (error) {
    console.error("Create community error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
