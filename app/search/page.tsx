"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, User } from "lucide-react"
import Link from "next/link"

interface SearchUser {
  id: number
  username: string
  full_name: string
  profile_picture_url?: string
  bio?: string
}

interface SearchCommunity {
  id: number
  name: string
  description: string
  category: string
  cover_image_url?: string
  member_count: number
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const [users, setUsers] = useState<SearchUser[]>([])
  const [communities, setCommunities] = useState<SearchCommunity[]>([])
  const [loading, setLoading] = useState(true)

  // Mock user for navbar
  const mockUser = {
    username: "current_user",
    full_name: "Current User",
  }

  useEffect(() => {
    if (query) {
      searchContent()
    }
  }, [query])

  const searchContent = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        setCommunities(data.communities || [])
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={mockUser} />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Search Results</h1>
          <p className="text-gray-600">Results for "{query}"</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="communities">Communities</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {users.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Users</h2>
                <div className="grid gap-4">
                  {users.slice(0, 3).map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              </div>
            )}

            {communities.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Communities</h2>
                <div className="grid gap-4">
                  {communities.slice(0, 3).map((community) => (
                    <CommunityCard key={community.id} community={community} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users">
            <div className="grid gap-4">
              {users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
              {users.length === 0 && <p className="text-center text-gray-500 py-8">No users found</p>}
            </div>
          </TabsContent>

          <TabsContent value="communities">
            <div className="grid gap-4">
              {communities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
              {communities.length === 0 && <p className="text-center text-gray-500 py-8">No communities found</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function UserCard({ user }: { user: SearchUser }) {
  return (
    <Card>
      <CardContent className="flex items-center space-x-4 p-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.profile_picture_url || "/placeholder.svg"} />
          <AvatarFallback>{user.full_name?.charAt(0) || user.username.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold">{user.full_name}</h3>
          <p className="text-sm text-gray-600">@{user.username}</p>
          {user.bio && <p className="text-sm text-gray-500 mt-1">{user.bio}</p>}
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/profile/${user.username}`}>
            <User className="h-4 w-4 mr-1" />
            View Profile
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function CommunityCard({ community }: { community: SearchCommunity }) {
  return (
    <Card>
      <CardContent className="flex items-center space-x-4 p-4">
        <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{community.name}</h3>
          <p className="text-sm text-gray-600 capitalize">{community.category}</p>
          <p className="text-sm text-gray-500 mt-1">{community.description}</p>
          <p className="text-xs text-gray-400 mt-1">{community.member_count} members</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/communities/${community.name}`}>
            <Users className="h-4 w-4 mr-1" />
            Join
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
