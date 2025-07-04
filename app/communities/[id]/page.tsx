"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, ArrowLeft } from "lucide-react"
import { PostCard } from "@/components/posts/post-card"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { FloatingActionButton } from "@/components/ui/floating-action-button"
import { CreatePostModal } from "@/components/posts/create-post-modal"

export default function CommunityProfilePage() {
  const { id } = useParams() as { id: string }
  const [community, setCommunity] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isMember, setIsMember] = useState<boolean>(false)
  const [joinLoading, setJoinLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/communities/${id}`)
        if (!res.ok) throw new Error("Failed to fetch community")
        const data = await res.json()
        setCommunity(data.community)
        setIsMember(!!data.community.is_member)
        // Fetch posts for this community
        const postsRes = await fetch(`/api/posts?communityId=${id}`)
        if (!postsRes.ok) throw new Error("Failed to fetch posts")
        const postsData = await postsRes.json()
        setPosts(postsData.posts || [])
        // Fetch current user
        const userRes = await fetch("/api/auth/me")
        if (userRes.ok) {
          const userData = await userRes.json()
          setCurrentUser(userData.user)
        }
      } catch (err: any) {
        setError(err.message || "Unknown error")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleJoinLeave = async () => {
    if (!community) return
    setJoinLoading(true)
    try {
      const res = await fetch(`/api/communities/${community.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isMember ? "leave" : "join" })
      })
      const data = await res.json()
      if (data.success) {
        setIsMember(!isMember)
        setCommunity((prev: any) => prev ? { ...prev, member_count: prev.member_count + (isMember ? -1 : 1) } : prev)
      }
    } finally {
      setJoinLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>
  if (!community) return <div className="p-8 text-center">Community not found.</div>

  return (
    <div className="max-w-3xl mx-auto py-10 px-2 sm:px-0">
      <BackButton />
      <Card className="mb-8 shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-blue-900">{community.name}</CardTitle>
          <CardDescription className="text-lg text-gray-700">{community.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-gray-600 text-base font-medium mb-2">
            <Users className="h-5 w-5 mr-2 text-blue-500" />
            {community.member_count} members
          </div>
          <Button
            variant={isMember ? "secondary" : "default"}
            onClick={handleJoinLeave}
            disabled={joinLoading}
            className="mt-2"
          >
            {isMember ? "Joined" : "Join Community"}
          </Button>
        </CardContent>
      </Card>
      {isMember && currentUser && (
        <>
          <FloatingActionButton onCreatePost={() => setShowCreateModal(true)} />
          <CreatePostModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            user={currentUser}
            onPostCreated={() => window.location.reload()}
            communityId={community.id}
          />
        </>
      )}
      <h2 className="text-2xl font-bold mb-6 text-purple-800">Posts</h2>
      {posts.length === 0 ? (
        <div className="text-gray-500 text-center py-8 bg-white rounded-lg shadow">No posts in this community yet.</div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={currentUser} />
          ))}
        </div>
      )}
    </div>
  )
} 