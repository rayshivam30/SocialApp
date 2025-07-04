import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { createPost, getFeedPosts, getCommunityPosts } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const communityId = searchParams.get("communityId")

    let posts
    if (communityId) {
      posts = await getCommunityPosts(Number(communityId), limit, offset)
    } else {
      posts = await getFeedPosts(user.id, limit, offset)
    }
    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Get posts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, communityId, imageUrl, postType = "personal" } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Extract hashtags from content
    const hashtags = content.match(/#\w+/g)?.map((tag: string) => tag.slice(1)) || []

    const post = await createPost({
      user_id: user.id,
      content,
      community_id: communityId,
      image_url: imageUrl,
      post_type: postType,
      hashtags,
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Create post error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
