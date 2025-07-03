"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Comment {
  id: number
  content: string
  created_at: string
  username: string
  full_name: string
  profile_picture_url?: string
}

interface CommentSectionProps {
  postId: number
  isOpen: boolean
  onClose: () => void
  onCommentAdded?: () => void
  currentUser: {
    username: string
    full_name?: string
    profile_picture_url?: string
  }
}

export function CommentSection({ postId, isOpen, onClose, onCommentAdded, currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchComments()
    }
  }, [isOpen, postId])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/posts/${postId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      } else {
        console.error("Failed to fetch comments")
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        // Add the new comment to the list
        const newCommentData = {
          id: data.comment.id,
          content: data.comment.content,
          created_at: data.comment.created_at,
          username: currentUser.username,
          full_name: currentUser.full_name || currentUser.username,
          profile_picture_url: currentUser.profile_picture_url,
        }
        setComments((prev) => [...prev, newCommentData])
        setNewComment("")
        onCommentAdded?.()
      } else {
        const errorData = await response.json()
        console.error("Error adding comment:", errorData.error)
      }
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="border-t pt-4 mt-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">Comments ({comments.length})</h4>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Hide
          </Button>
        </div>

        {/* Add Comment Form */}
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser.profile_picture_url || "/placeholder.svg"} />
            <AvatarFallback>{currentUser.full_name?.charAt(0) || currentUser.username.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex space-x-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] resize-none"
              disabled={submitting}
            />
            <Button type="submit" disabled={!newComment.trim() || submitting} size="sm">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <Card key={comment.id} className="p-3">
                <CardContent className="p-0">
                  <div className="flex space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.profile_picture_url || "/placeholder.svg"} />
                      <AvatarFallback>{comment.full_name?.charAt(0) || comment.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-sm">{comment.full_name || comment.username}</span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </div>
  )
}
