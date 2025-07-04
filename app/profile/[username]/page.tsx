"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { PostCard } from "@/components/posts/post-card"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Users, Heart, MessageCircle, Settings, UserPlus, UserMinus, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { BackButton } from "@/components/ui/back-button"

interface UserProfile {
  id: number
  username: string
  full_name: string
  bio?: string
  profile_picture_url?: string
  created_at: string
  follower_count: number
  following_count: number
  post_count: number
  is_following: boolean
  is_own_profile: boolean
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

interface Community {
  id: number
  name: string
  description: string
  category: string
  role: string
  joined_at: string
  member_count: number
}

interface CurrentUser {
  id: number
  username: string
  email: string
  full_name?: string
  profile_picture_url?: string
}

function ChatModal({ open, onClose, currentUser, profile }: any) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let interval: any
    if (open && currentUser && profile) {
      fetchMessages()
      interval = setInterval(fetchMessages, 2000)
    }
    return () => clearInterval(interval)
    // eslint-disable-next-line
  }, [open])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/messages?userId=${profile.id}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return
    setSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: profile.id, content: input })
      })
      if (res.ok) {
        setInput("")
        fetchMessages()
      }
    } finally {
      setSending(false)
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">&times;</button>
        <h2 className="text-xl font-bold mb-2">Chat with {profile.full_name || profile.username}</h2>
        <div className="h-64 overflow-y-auto border rounded p-2 mb-2 bg-gray-50">
          {loading ? <div>Loading...</div> : messages.length === 0 ? <div className="text-gray-400">No messages yet.</div> : (
            messages.map((msg, i) => (
              <div key={i} className={`mb-2 flex ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg ${msg.sender_id === currentUser.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded px-2 py-1"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
            placeholder="Type a message..."
            disabled={sending}
          />
          <button
            className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
            onClick={handleSend}
            disabled={sending || !input.trim()}
          >Send</button>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const params = useParams()
  const username = params.username as string
  const router = useRouter()

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [followLoading, setFollowLoading] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    if (username) {
      fetchCurrentUser()
      fetchProfile()
      fetchPosts()
      fetchCommunities()
    }
  }, [username])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        const userWithDefaults = {
          id: data.user.id,
          username: data.user.username || "user",
          email: data.user.email,
          full_name: data.user.full_name || data.user.username,
          profile_picture_url: data.user.profile_picture_url,
        }
        setCurrentUser(userWithDefaults)
      }
    } catch (error) {
      console.error("Error fetching current user:", error)
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${username}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to load profile")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    }
  }

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/users/${username}/posts`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    }
  }

  const fetchCommunities = async () => {
    try {
      const response = await fetch(`/api/users/${username}/communities`)
      if (response.ok) {
        const data = await response.json()
        setCommunities(data.communities)
      }
    } catch (error) {
      console.error("Error fetching communities:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!profile) return

    setFollowLoading(true)
    try {
      const response = await fetch(`/api/users/${profile.username}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: profile.is_following ? "unfollow" : "follow",
        }),
      })

      if (response.ok) {
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                is_following: !prev.is_following,
                follower_count: prev.is_following ? prev.follower_count - 1 : prev.follower_count + 1,
              }
            : null,
        )
      } else {
        const errorData = await response.json()
        console.error("Follow error:", errorData.error)
      }
    } catch (error) {
      console.error("Error following/unfollowing user:", error)
    } finally {
      setFollowLoading(false)
    }
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
        <Navbar user={currentUser || { username: "loading", full_name: "Loading..." }} />
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
          <ProfileSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={currentUser || { username: "error", full_name: "Error" }} />
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={currentUser || { username: "notfound", full_name: "Not Found" }} />
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
          <Alert>
            <AlertDescription>User not found</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={currentUser || { username: "user", full_name: "User" }} />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
        <BackButton />
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col space-y-4">
              {/* Profile Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mx-auto sm:mx-0">
                  <AvatarImage src={profile.profile_picture_url || "/placeholder.svg"} />
                  <AvatarFallback className="text-xl sm:text-2xl">
                    {profile.full_name?.charAt(0) || profile.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold">{profile.full_name || profile.username}</h1>
                      <p className="text-gray-600 text-sm sm:text-base">@{profile.username}</p>
                    </div>

                    <div className="flex justify-center sm:justify-start space-x-2 mt-3 sm:mt-0">
                      {profile.is_own_profile ? (
                        <Button variant="outline" asChild className="w-full sm:w-auto">
                          <Link href="/settings">
                            <Settings className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Link>
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={handleFollow}
                            disabled={followLoading}
                            variant={profile.is_following ? "outline" : "default"}
                            className="w-full sm:w-auto"
                          >
                            {followLoading ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : profile.is_following ? (
                              <UserMinus className="h-4 w-4 mr-2" />
                            ) : (
                              <UserPlus className="h-4 w-4 mr-2" />
                            )}
                            {profile.is_following ? "Unfollow" : "Follow"}
                          </Button>
                          <Button
                            variant="secondary"
                            className="w-full sm:w-auto"
                            onClick={() => router.push(`/direct-messages?user=${profile.username}`)}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {profile.bio && <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">{profile.bio}</p>}

                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                    <div className="flex items-center justify-center sm:justify-start">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                    </div>
                  </div>

                  <div className="flex justify-center sm:justify-start space-x-4 sm:space-x-6 text-sm">
                    <div className="text-center sm:text-left">
                      <span className="font-semibold">{profile.post_count}</span>
                      <span className="text-gray-600 ml-1">Posts</span>
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="font-semibold">{profile.follower_count}</span>
                      <span className="text-gray-600 ml-1">Followers</span>
                    </div>
                    <div className="text-center sm:text-left">
                      <span className="font-semibold">{profile.following_count}</span>
                      <span className="text-gray-600 ml-1">Following</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts" className="text-xs sm:text-sm">
              Posts
            </TabsTrigger>
            <TabsTrigger value="communities" className="text-xs sm:text-sm">
              Communities
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-3 sm:space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} currentUser={currentUser} onLike={handlePostLike} />
              ))
            ) : (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-500 text-sm sm:text-base">
                  {profile.is_own_profile ? "You haven't posted anything yet" : "No posts yet"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="communities">
            <div className="grid gap-3 sm:gap-4">
              {communities.length > 0 ? (
                communities.map((community) => (
                  <Card key={community.id}>
                    <CardContent className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{community.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 capitalize">{community.category}</p>
                        <p className="text-xs text-gray-500">
                          {community.role} • Joined{" "}
                          {formatDistanceToNow(new Date(community.joined_at), { addSuffix: true })}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {community.role}
                      </Badge>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-gray-500 text-sm sm:text-base">
                    {profile.is_own_profile
                      ? "You haven't joined any communities yet"
                      : "Not a member of any communities"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            {profile.is_own_profile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <h3 className="font-semibold flex items-center text-sm sm:text-base">
                      <Heart className="h-4 w-4 mr-2 text-red-500" />
                      Total Likes Received
                    </h3>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="text-2xl sm:text-3xl font-bold">
                      {posts.reduce((sum, post) => sum + post.like_count, 0)}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">Across all posts</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <h3 className="font-semibold flex items-center text-sm sm:text-base">
                      <MessageCircle className="h-4 w-4 mr-2 text-blue-500" />
                      Total Comments
                    </h3>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="text-2xl sm:text-3xl font-bold">
                      {posts.reduce((sum, post) => sum + post.comment_count, 0)}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">Engagement conversations</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <h3 className="font-semibold flex items-center text-sm sm:text-base">
                      <Users className="h-4 w-4 mr-2 text-green-500" />
                      Community Memberships
                    </h3>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="text-2xl sm:text-3xl font-bold">{communities.length}</div>
                    <p className="text-xs sm:text-sm text-gray-600">Active communities</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <h3 className="font-semibold flex items-center text-sm sm:text-base">
                      <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                      Account Age
                    </h3>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="text-2xl sm:text-3xl font-bold">
                      {Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">Days on platform</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <p className="text-gray-500 text-sm sm:text-base">Analytics are only visible to the profile owner</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        <ChatModal open={chatOpen} onClose={() => setChatOpen(false)} currentUser={currentUser} profile={profile} />
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <Card className="mb-4 sm:mb-6">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full" />
          <div className="flex-1 space-y-4 text-center sm:text-left">
            <div>
              <Skeleton className="h-6 sm:h-8 w-32 sm:w-48 mb-2 mx-auto sm:mx-0" />
              <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 mx-auto sm:mx-0" />
            </div>
            <Skeleton className="h-3 sm:h-4 w-full max-w-md mx-auto sm:mx-0" />
            <div className="flex justify-center sm:justify-start space-x-4 sm:space-x-6">
              <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}
