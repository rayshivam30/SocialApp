"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export const BackButton = () => {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex items-center mb-4 text-blue-700 hover:text-blue-900 font-medium transition-colors"
    >
      <ArrowLeft className="h-5 w-5 mr-2" />
      Back
    </button>
  )
} 