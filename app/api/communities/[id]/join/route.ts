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
    const communityId = Number.parseInt(id)
    const { action } = await request.json()

    // Check if community exists
    const community = await sql`
      SELECT * FROM communities WHERE id = ${communityId} LIMIT 1
    `

    if (community.length === 0) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 })
    }

    if (action === "join") {
      try {
        await sql`
          INSERT INTO community_members (user_id, community_id, role)
          VALUES (${user.id}, ${communityId}, 'member')
        `

        // Update member count
        await sql`
          UPDATE communities 
          SET member_count = member_count + 1 
          WHERE id = ${communityId}
        `

        return NextResponse.json({ success: true, message: "Joined community successfully" })
      } catch (error) {
        // Handle duplicate key error (already a member)
        return NextResponse.json({ success: false, error: "Already a member of this community" })
      }
    } else if (action === "leave") {
      const result = await sql`
        DELETE FROM community_members 
        WHERE user_id = ${user.id} AND community_id = ${communityId}
      `

      if (result.length > 0) {
        // Update member count
        await sql`
          UPDATE communities 
          SET member_count = GREATEST(member_count - 1, 0) 
          WHERE id = ${communityId}
        `
      }

      return NextResponse.json({ success: true, message: "Left community successfully" })
    } else {
      return NextResponse.json({ error: "Invalid action. Use 'join' or 'leave'" }, { status: 400 })
    }
  } catch (error) {
    console.error("Join/leave community error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
