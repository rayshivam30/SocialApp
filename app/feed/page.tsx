"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { PostCard } from "@/components/posts/post-card"
import { FloatingActionButton } from "@/components/ui/floating-action-button"
import { CreatePostModal } from "@/components/posts/create-post-modal"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2, RefreshCw, TrendingUp, Users, Heart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface User {
  id: number
  username: string
  email: string
  full_name?: string
  profile_picture_url?: string
}

interface Post {
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
}

export default function FeedPage() {
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [offset, setOffset] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchUserAndPosts()
  }, [])

  const fetchUserAndPosts = async () => {
    try {
      // Get current user
      const userResponse = await fetch("/api/auth/me")
      if (!userResponse.ok) {
        router.push("/login")
        return
      }

      const userData = await userResponse.json()
      // Ensure we have the proper user structure
      const userWithDefaults = {
        id: userData.user.id,
        username: userData.user.username || "user",
        email: userData.user.email,
        full_name: userData.user.full_name || userData.user.username,
        profile_picture_url: userData.user.profile_picture_url,
      }
      setUser(userWithDefaults)

      // Get posts
      const response = await fetch("/api/posts?limit=20&offset=0")
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      } else {
        // If no posts from API, show some sample posts
        setPosts(generateSamplePosts(userWithDefaults))
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setError("Failed to load feed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const generateSamplePosts = (currentUser: User): Post[] => {
    return [
      {
        id: 1,
        content:
          "Welcome to our social platform! 🎉 This is a sample post to get you started. Share your thoughts, connect with others, and build amazing communities! #welcome #social",
        created_at: new Date().toISOString(),
        username: currentUser.username,
        full_name: currentUser.full_name || currentUser.username,
        profile_picture_url: currentUser.profile_picture_url,
        like_count: 5,
        comment_count: 2,
        is_liked: false,
        hashtags: ["welcome", "social"],
      },
      {
        id: 2,
        content:
          "Just joined this amazing community! Looking forward to connecting with like-minded people and sharing my journey. #newbie #excited",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        username: "community_user",
        full_name: "Community User",
        like_count: 12,
        comment_count: 4,
        is_liked: true,
        hashtags: ["newbie", "excited"],
      },
    ]
  }

  const loadMorePosts = async () => {
    setLoadingMore(true)
    try {
      const newOffset = offset + 20
      const response = await fetch(`/api/posts?limit=20&offset=${newOffset}`)
      if (response.ok) {
        const data = await response.json()
        setPosts((prev) => [...prev, ...(data.posts || [])])
        setOffset(newOffset)
      }
    } catch (error) {
      console.error("Error loading more posts:", error)
    } finally {
      setLoadingMore(false)
    }
  }

  const handlePostCreated = () => {
    setRefreshing(true)
    setOffset(0)
    fetchUserAndPosts().finally(() => setRefreshing(false))
  }

  const handleRefresh = () => {
    setRefreshing(true)
    setOffset(0)
    fetchUserAndPosts().finally(() => setRefreshing(false))
  }

  const handlePostLike = (postId: number) => {
    // Update the post in the local state
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              is_liked: !post.is_liked,
              like_count: post.is_liked ? post.like_count - 1 : post.like_count + 1,
            }
          : post,
      ),
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={{ username: "loading", full_name: "Loading..." }} />
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
          <FeedSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user || { username: "error", full_name: "Error" }} />
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={handleRefresh} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-0 shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <CardTitle className="text-lg sm:text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Welcome back, {user.full_name || user.username}! 👋
                    </CardTitle>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">What's on your mind today?</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
                    {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-3 sm:space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} currentUser={user} onLike={handlePostLike} />
              ))}
            </div>

            {/* Load More */}
            {posts.length > 0 && (
              <div className="text-center">
                <Button
                  onClick={loadMorePosts}
                  disabled={loadingMore}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading more posts...
                    </>
                  ) : (
                    "Load More Posts"
                  )}
                </Button>
              </div>
            )}

            {/* Empty State */}
            {posts.length === 0 && (
              <Card className="text-center py-8 sm:py-12">
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                      <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Your feed is empty</h3>
                      <p className="text-gray-500 mb-4 text-sm sm:text-base">
                        Follow some users or join communities to see posts in your feed!
                      </p>
                      <Button asChild className="w-full sm:w-auto">
                        <a href="/communities">Explore Communities</a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Hidden on mobile */}
          <div className="hidden lg:block space-y-6">
            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["#photography", "#webdev", "#fitness", "#travel", "#cooking"].map((tag, index) => (
                  <div
                    key={tag}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  >
                    <span className="text-blue-600 font-medium">{tag}</span>
                    <span className="text-xs text-gray-500">{Math.floor(Math.random() * 1000) + 100} posts</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Suggested Communities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="h-5 w-5 mr-2 text-green-500" />
                  Suggested Communities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["Photography Masters", "Tech Innovators", "Fitness Journey"].map((community) => (
                  <div key={community} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{community}</p>
                      <p className="text-xs text-gray-500">{Math.floor(Math.random() * 5000) + 1000} members</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Join
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onCreatePost={() => setShowCreateModal(true)} />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        user={user}
        onPostCreated={handlePostCreated}
      />
    </div>
  )
}

function FeedSkeleton() {
  return (
    <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
        <div className="bg-white rounded-lg p-4 sm:p-6">
          <div className="flex space-x-3">
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-16 sm:h-20 w-full" />
            </div>
          </div>
        </div>

        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 sm:p-6">
            <div className="flex space-x-3 mb-4">
              <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
                <Skeleton className="h-2 sm:h-3 w-16 sm:w-24" />
              </div>
            </div>
            <Skeleton className="h-3 sm:h-4 w-full mb-2" />
            <Skeleton className="h-3 sm:h-4 w-3/4 mb-4" />
            <Skeleton className="h-32 sm:h-48 w-full rounded-lg" />
          </div>
        ))}
      </div>
      <div className="hidden lg:block space-y-6">
        <Skeleton className="h-64 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    </div>
  )
}
