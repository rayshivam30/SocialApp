"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon, Users } from "lucide-react"

interface CreatePostProps {
  user: {
    username: string
    full_name?: string
    profile_picture_url?: string
  }
  onPostCreated?: () => void
}

export function CreatePost({ user, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, postType: "personal" }),
      })

      if (response.ok) {
        setContent("")
        onPostCreated?.()
      }
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{"What's on your mind?"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.profile_picture_url || "/placeholder.svg"} />
              <AvatarFallback>{user.full_name?.charAt(0) || user.username.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Share your thoughts, progress, or ask a question..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button type="button" variant="ghost" size="sm">
                <ImageIcon className="h-4 w-4 mr-1" />
                Photo
              </Button>
              <Button type="button" variant="ghost" size="sm">
                <Users className="h-4 w-4 mr-1" />
                Community
              </Button>
            </div>

            <Button type="submit" disabled={!content.trim() || loading} className="px-6">
              {loading ? "Posting..." : "Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
