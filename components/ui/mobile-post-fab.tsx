"use client"

import { useState, useEffect } from "react"
import { FloatingActionButton } from "@/components/ui/floating-action-button"
import { CreatePostModal } from "@/components/posts/create-post-modal"
import { useIsMobile } from "@/hooks/use-mobile"

export default function MobilePostFAB() {
  const isMobile = useIsMobile()
  const [user, setUser] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isMobile) return
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch {}
      setLoading(false)
    }
    fetchUser()
  }, [isMobile])

  if (!isMobile || loading || !user) return null

  return (
    <>
      <FloatingActionButton onCreatePost={() => setShowModal(true)} className="sm:hidden" />
      <CreatePostModal isOpen={showModal} onClose={() => setShowModal(false)} user={user} />
    </>
  )
} 