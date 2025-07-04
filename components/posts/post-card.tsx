"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share2, MoreHorizontal, Loader2, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { CommentSection } from "./comment-section"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"

interface PostCardProps {
  post: {
    id: number
    content: string
    image_url?: string
    created_at: string
    username: string
    full_name: string
    profile_picture_url?: string
    community_name?: string
    like_count: number
    comment_count: number
    is_liked: boolean
    hashtags?: string[]
    user_id: number
  }
  currentUser?: {
    id: number
    username: string
    full_name?: string
    profile_picture_url?: string
  }
  onLike?: (postId: number) => void
}

export function PostCard({ post, currentUser, onLike }: PostCardProps) {
  const [liked, setLiked] = useState(post.is_liked)
  const [likeCount, setLikeCount] = useState(Number(post.like_count))
  const [commentCount, setCommentCount] = useState(post.comment_count)
  const [showComments, setShowComments] = useState(false)
  const [likingInProgress, setLikingInProgress] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)

  const handleCommentAdded = () => {
    setCommentCount((prev) => prev + 1)
  }

  const handleLike = async () => {
    if (!currentUser || likingInProgress) return

    setLikingInProgress(true)

    // Optimistic update (fix: only increment/decrement by 1, never set to 21)
    const wasLiked = liked
    const previousCount = likeCount
    const newLiked = !wasLiked
    setLiked(newLiked)
    setLikeCount(Number(previousCount) + (newLiked ? 1 : -1))

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLiked(data.liked)
        setLikeCount(Number(data.likeCount)) // Always use backend count as a number
        onLike?.(post.id)
      } else {
        // Revert optimistic update on error
        setLiked(wasLiked)
        setLikeCount(previousCount)
        console.error("Failed to toggle like")
      }
    } catch (error) {
      // Revert optimistic update on error
      setLiked(wasLiked)
      setLikeCount(previousCount)
      console.error("Error toggling like:", error)
    } finally {
      setLikingInProgress(false)
    }
  }

  const handleCommentClick = () => {
    setShowComments(!showComments)
  }

  const handleDelete = async () => {
    if (!currentUser || currentUser.id !== post.user_id) return
    if (!window.confirm("Are you sure you want to delete this post?")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" })
      if (res.ok) {
        setDeleted(true)
      } else {
        alert("Failed to delete post.")
      }
    } catch (e) {
      alert("Error deleting post.")
    } finally {
      setDeleting(false)
    }
  }

  const renderContent = (content: string) => {
    return content.split(" ").map((word, index) => {
      if (word.startsWith("#")) {
        return (
          <span key={index} className="text-blue-600 hover:underline cursor-pointer">
            {word}{" "}
          </span>
        )
      }
      return word + " "
    })
  }

  if (deleted) return null

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2 p-3 sm:p-4">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
            <AvatarImage src={post.profile_picture_url || "/placeholder.svg"} />
            <AvatarFallback className="text-xs sm:text-sm">
              {post.full_name?.charAt(0) || post.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <Link
              href={`/profile/${post.username}`}
              className="font-semibold hover:underline text-sm sm:text-base truncate"
            >
              {post.full_name || post.username}
            </Link>
            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
              <span className="truncate">@{post.username}</span>
              {post.community_name && (
                <>
                  <span className="mx-1">•</span>
                  <Link href={`/communities/${post.community_name}`} className="hover:underline truncate">
                    {post.community_name}
                  </Link>
                </>
              )}
              <span className="mx-1 hidden sm:inline">•</span>
              <span className="hidden sm:inline">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
            <div className="sm:hidden text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-auto sm:w-auto">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {currentUser && currentUser.id === post.user_id && (
              <DropdownMenuItem onClick={handleDelete} disabled={deleting} className="text-red-600 flex items-center">
                <Trash2 className="h-4 w-4 mr-2" /> Delete Post
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 pt-0">
        <div className="text-sm sm:text-base leading-relaxed break-words">{renderContent(post.content)}</div>

        {post.image_url && (
          <div className="rounded-lg overflow-hidden">
            <Image
              src={post.image_url || "/placeholder.svg"}
              alt="Post image"
              width={600}
              height={400}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={!currentUser || likingInProgress}
              className={`flex items-center space-x-1 transition-all duration-200 hover:scale-105 h-8 px-2 sm:h-auto sm:px-3 ${
                liked ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-red-500"
              }`}
            >
              {likingInProgress ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className={`h-4 w-4 transition-all duration-200 ${liked ? "fill-current" : ""}`} />
              )}
              <span className="font-medium text-xs sm:text-sm">{likeCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCommentClick}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-all duration-200 hover:scale-105 h-8 px-2 sm:h-auto sm:px-3"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium text-xs sm:text-sm">{commentCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-green-500 transition-all duration-200 hover:scale-105 h-8 px-2 sm:h-auto sm:px-3"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Comment Section */}
        {currentUser && (
          <CommentSection
            postId={post.id}
            isOpen={showComments}
            onClose={() => setShowComments(false)}
            onCommentAdded={handleCommentAdded}
            currentUser={currentUser}
          />
        )}
      </CardContent>
    </Card>
  )
}
