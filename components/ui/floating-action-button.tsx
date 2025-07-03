"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, X, Edit3, Camera, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingActionButtonProps {
  onCreatePost: () => void
  className?: string
}

export function FloatingActionButton({ onCreatePost, className }: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const handleCreatePost = () => {
    onCreatePost()
    setIsExpanded(false)
  }

  return (
    <div className={cn("fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50", className)}>
      {/* Backdrop overlay when expanded */}
      {isExpanded && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10" onClick={() => setIsExpanded(false)} />
      )}

      {/* Action buttons */}
      <div className="flex flex-col items-end space-y-2 sm:space-y-3 mb-3 sm:mb-4">
        {/* Create Post Button */}
        <div
          className={`transform transition-all duration-300 ${
            isExpanded ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-75"
          }`}
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow-lg border">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Create Post</span>
            </div>
            <Button
              onClick={handleCreatePost}
              size="lg"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            >
              <Edit3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </Button>
          </div>
        </div>

        {/* Photo Post Button */}
        <div
          className={`transform transition-all duration-300 delay-75 ${
            isExpanded ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-75"
          }`}
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow-lg border">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Add Photo</span>
            </div>
            <Button
              onClick={() => {
                // Handle photo post
                setIsExpanded(false)
              }}
              size="lg"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            >
              <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </Button>
          </div>
        </div>

        {/* Community Post Button */}
        <div
          className={`transform transition-all duration-300 delay-150 ${
            isExpanded ? "translate-y-0 opacity-100 scale-100" : "translate-y-8 opacity-0 scale-75"
          }`}
        >
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow-lg border">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Community</span>
            </div>
            <Button
              onClick={() => {
                // Handle community post
                setIsExpanded(false)
              }}
              size="lg"
              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main FAB */}
      <Button
        onClick={toggleExpanded}
        size="lg"
        className={`h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 relative overflow-hidden group ${
          isExpanded ? "rotate-45" : "rotate-0"
        }`}
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Icon */}
        <div className="relative z-10">
          {isExpanded ? (
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-white transition-transform duration-300" />
          ) : (
            <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white transition-transform duration-300" />
          )}
        </div>

        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-active:opacity-20 transition-opacity duration-150" />
      </Button>

      {/* Floating particles effect */}
      {isExpanded && (
        <>
          <div className="absolute top-0 left-0 w-1 h-1 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-ping opacity-75" />
          <div className="absolute top-2 sm:top-4 right-1 sm:right-2 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-purple-400 rounded-full animate-pulse opacity-75" />
          <div className="absolute bottom-2 sm:bottom-4 left-1 sm:left-2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-pink-400 rounded-full animate-bounce opacity-75" />
        </>
      )}
    </div>
  )
}
