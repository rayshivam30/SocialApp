import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { searchUsers, searchCommunities, searchFollowedUsers } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const type = searchParams.get("type") || "all"
    const followedOnly = searchParams.get("followedOnly") === "true"

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    const results: any = {}

    if (type === "users" || type === "all") {
      if (followedOnly) {
        results.users = await searchFollowedUsers(user.id, query)
      } else {
        results.users = await searchUsers(query)
      }
    }

    if (type === "communities" || type === "all") {
      results.communities = await searchCommunities(query)
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
