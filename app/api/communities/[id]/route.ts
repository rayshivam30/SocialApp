import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const communityId = Number.parseInt(id)

    const community = await sql`
      SELECT 
        c.*,
        u.username as creator_username,
        u.full_name as creator_name,
        (SELECT COUNT(*) FROM community_members WHERE community_id = c.id) as member_count,
        (SELECT COUNT(*) > 0 FROM community_members WHERE community_id = c.id AND user_id = ${user.id}) as is_member,
        (SELECT role FROM community_members WHERE community_id = c.id AND user_id = ${user.id}) as user_role
      FROM communities c
      JOIN users u ON c.creator_id = u.id
      WHERE c.id = ${communityId}
      LIMIT 1
    `

    if (community.length === 0) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 })
    }

    return NextResponse.json({ community: community[0] })
  } catch (error) {
    console.error("Get community error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
