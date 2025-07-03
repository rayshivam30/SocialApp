"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users } from "lucide-react"
import { PostCard } from "@/components/posts/post-card"

export default function CommunityProfilePage() {
  const { id } = useParams() as { id: string }
  const [community, setCommunity] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

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

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>
  if (!community) return <div className="p-8 text-center">Community not found.</div>

  return (
    <div className="max-w-3xl mx-auto py-10 px-2 sm:px-0">
      <Card className="mb-8 shadow-lg border-0 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-blue-900">{community.name}</CardTitle>
          <CardDescription className="text-lg text-gray-700">{community.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-gray-600 text-base font-medium">
            <Users className="h-5 w-5 mr-2 text-blue-500" />
            {community.member_count} members
          </div>
        </CardContent>
      </Card>
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