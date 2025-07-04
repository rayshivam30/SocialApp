import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth"
import { sendMessage, getMessagesBetweenUsers } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const userId = Number(searchParams.get("userId"))
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }
    const messages = await getMessagesBetweenUsers(user.id, userId)
    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { receiverId, content } = await request.json()
    if (!receiverId || !content) {
      return NextResponse.json({ error: "Missing receiverId or content" }, { status: 400 })
    }
    const message = await sendMessage(user.id, receiverId, content)
    return NextResponse.json({ message })
  } catch (error) {
    console.error("Send message error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 