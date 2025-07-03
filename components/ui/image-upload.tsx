"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ImageUploadProps {
  currentImage?: string
  onImageChange: (imageUrl: string) => void
  className?: string
  size?: "sm" | "md" | "lg"
}

export function ImageUpload({ currentImage, onImageChange, className, size = "md" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (max 2MB for base64 storage)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB")
      return
    }

    setError("")
    setUploading(true)

    try {
      // Convert to base64 for storage
      const base64String = await convertToBase64(file)

      // Set preview immediately
      setPreview(base64String)

      // Call the callback with the base64 string
      onImageChange(base64String)
    } catch (error) {
      setError("Failed to process image. Please try again.")
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onImageChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const displayImage = preview || currentImage

  return (
    <div className={className}>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Avatar className={sizeClasses[size]}>
            <AvatarImage src={displayImage || "/placeholder.svg"} />
            <AvatarFallback>
              <Camera className="h-6 w-6 text-gray-400" />
            </AvatarFallback>
          </Avatar>

          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}

          {displayImage && !uploading && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
              onClick={handleRemoveImage}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                {displayImage ? "Change Photo" : "Upload Photo"}
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
