"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp } from "lucide-react"
import { CreateCommunityDialog } from "@/components/communities/create-community-dialog"
import Link from "next/link"

interface Community {
  id: number
  name: string
  description: string
  category: string
  member_count: number
  cover_image_url?: string
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [joinedCommunities, setJoinedCommunities] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  // Mock user for navbar
  const mockUser = {
    username: "current_user",
    full_name: "Current User",
  }

  useEffect(() => {
    fetchCommunities()
    fetchJoinedCommunities()
  }, [])

  const fetchCommunities = async () => {
    try {
      const response = await fetch("/api/communities")
      if (response.ok) {
        const data = await response.json()
        setCommunities(data.communities || [])
      }
    } catch (error) {
      console.error("Error fetching communities:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchJoinedCommunities = async () => {
    try {
      // Get current user
      const meRes = await fetch("/api/auth/me")
      if (!meRes.ok) return
      const meData = await meRes.json()
      const username = meData.user?.username
      if (!username) return
      // Get joined communities
      const joinedRes = await fetch(`/api/users/${username}/communities`)
      if (!joinedRes.ok) return
      const joinedData = await joinedRes.json()
      setJoinedCommunities((joinedData.communities || []).map((c: any) => c.id))
    } catch (error) {
      console.error("Error fetching joined communities:", error)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      photography: "bg-purple-100 text-purple-800",
      dance: "bg-pink-100 text-pink-800",
      technology: "bg-blue-100 text-blue-800",
      fitness: "bg-green-100 text-green-800",
      art: "bg-orange-100 text-orange-800",
      cooking: "bg-red-100 text-red-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={mockUser} />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold">Communities</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Discover and join communities that match your interests
            </p>
          </div>
          <CreateCommunityDialog onCommunityCreated={() => window.location.reload()} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {communities.map((community) => (
            <Link href={`/communities/${community.id}`} key={community.id} className="block">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <Badge className={`${getCategoryColor(community.category)} text-xs`}>{community.category}</Badge>
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{community.name}</CardTitle>
                  <CardDescription className="line-clamp-2 text-sm sm:text-base">{community.description}</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      {community.member_count.toLocaleString()} members
                    </div>
                    <div className="flex items-center text-xs sm:text-sm text-green-600">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Active
                    </div>
                  </div>
                  <Button
                    className="w-full text-sm sm:text-base"
                    disabled={joinedCommunities.includes(community.id)}
                    onClick={async () => {
                      if (joinedCommunities.includes(community.id)) return
                      try {
                        const response = await fetch(`/api/communities/${community.id}/join`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "join" }),
                        })
                        if (response.ok) {
                          fetchJoinedCommunities()
                        }
                      } catch (error) {
                        console.error("Error joining community:", error)
                      }
                    }}
                  >
                    {joinedCommunities.includes(community.id) ? "Joined" : "Join Community"}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {communities.length === 0 && !loading && (
          <div className="text-center py-8 sm:py-12">
            <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No communities found</h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              Be the first to create a community for your interests!
            </p>
            <CreateCommunityDialog onCommunityCreated={() => window.location.reload()} />
          </div>
        )}
      </div>
    </div>
  )
}
