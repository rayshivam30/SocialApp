"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Users, Globe, Lock, Smile, Hash, AtSign, Loader2, X } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    username: string
    full_name?: string
    profile_picture_url?: string
  }
  onPostCreated?: () => void
  communityId?: string | number
}

export function CreatePostModal({ isOpen, onClose, user, onPostCreated, communityId }: CreatePostModalProps) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [visibility, setVisibility] = useState<"public" | "private">("public")
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<string>("")
  const [imageError, setImageError] = useState("")
  const [imageLoading, setImageLoading] = useState(false)
  const [postError, setPostError] = useState("")

  const characterCount = content.length
  const maxCharacters = 280
  const isOverLimit = characterCount > maxCharacters

  // For debugging: track why the button is disabled
  const isContentOrImageEmpty = !content.trim() && !image
  const debugDisabledReason =
    isContentOrImageEmpty
      ? "Add text or an image to enable the Post button."
      : loading
      ? "Posting in progress."
      : isOverLimit
      ? "Character limit exceeded."
      : imageLoading
      ? "Image is still uploading."
      : "Button should be enabled."

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPostError("")
    if (!content.trim() && !image) return

    setLoading(true)
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          postType: "personal",
          visibility,
          communityId: communityId || selectedCommunity,
          imageUrl: image || undefined,
        }),
      })

      if (response.ok) {
        setContent("")
        setVisibility("public")
        setSelectedCommunity(null)
        setImage("")
        onClose()
        onPostCreated?.()
      } else {
        const data = await response.json().catch(() => ({}))
        setPostError(data.error || "Failed to create post. Please try again.")
      }
    } catch (error: any) {
      setPostError(error?.message || "Failed to create post. Please try again.")
      console.error("Error creating post:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setContent("")
      setVisibility("public")
      setSelectedCommunity(null)
      setImage("")
      onClose()
    }
  }

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setImageError("Please select an image file")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image size must be less than 2MB")
      return
    }
    setImageError("")
    setImageLoading(true)
    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        setImage(reader.result as string)
        setImageLoading(false)
      }
      reader.onerror = () => {
        setImageError("Failed to process image. Please try again.")
        setImageLoading(false)
      }
    } catch {
      setImageError("Failed to process image. Please try again.")
      setImageLoading(false)
    }
  }

  const handleRemoveImage = () => {
    setImage("")
    setImageError("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden max-h-[90vh] w-[95vw] sm:w-full flex flex-col">
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create a new post
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm sm:text-base">
              Share your thoughts with the community
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-blue-200">
              <AvatarImage src={user.profile_picture_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-sm sm:text-base">
                {user.full_name?.charAt(0) || user.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">{user.full_name || user.username}</p>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {visibility === "public" ? (
                    <>
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </>
                  )}
                </Badge>
                {(communityId || selectedCommunity) && (
                  <Badge variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    Community
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Content Input */}
          <div className="space-y-3">
            <Textarea
              placeholder="What's happening? Share your thoughts, experiences, or ask a question..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] sm:min-h-[120px] resize-none border-2 border-gray-200 focus:border-blue-400 rounded-xl text-base sm:text-lg placeholder:text-gray-400"
              disabled={loading}
            />
            {/* Twitter-style Image Upload */}
            <div>
              {image && (
                <div className="relative w-full max-w-xs mt-2">
                  <img
                    src={image}
                    alt="Preview"
                    className="rounded-lg border object-cover w-full h-48"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1 hover:bg-opacity-80"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none"
                disabled={imageLoading}
              >
                <ImageIcon className="h-5 w-5 mr-1" />
                {image ? "Change Photo" : "Add Photo"}
                {imageLoading && <span className="ml-2 text-xs">Loading...</span>}
              </button>
              {imageError && <div className="text-xs text-red-500 mt-1">{imageError}</div>}
            </div>

            {/* Character Count */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-500">
                <span className="flex items-center">
                  <Hash className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Use hashtags
                </span>
                <span className="flex items-center">
                  <AtSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Mention users
                </span>
              </div>
              <div className={`text-sm font-medium ${isOverLimit ? "text-red-500" : "text-gray-500"}`}>
                {characterCount}/{maxCharacters}
              </div>
            </div>
          </div>
        </div>
        {/* Action Buttons - sticky at bottom, outside scrollable area */}
        <div className="sticky bottom-0 left-0 right-0 bg-white pt-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 z-10 pb-2 px-4 sm:px-6">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-purple-600 hover:bg-purple-50 text-xs sm:text-sm"
              >
                <Smile className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Emoji
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-green-600 hover:bg-green-50 text-xs sm:text-sm"
                onClick={() => setVisibility(visibility === "public" ? "private" : "public")}
              >
                {visibility === "public" ? (
                  <>
                    <Globe className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Private
                  </>
                )}
              </Button>
            </div>
            <div className="flex space-x-2 sm:space-x-3">
              <Button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
              type="button"
              onClick={handleSubmit}
              disabled={(!content.trim() && !image) || loading || isOverLimit || imageLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 sm:px-6 flex-1 sm:flex-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post"
                )}
              </Button>
            </div>
          </div>
        {postError && (
          <div className="text-center text-red-600 text-sm font-medium mt-2 mb-2 px-4">
            {postError}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
