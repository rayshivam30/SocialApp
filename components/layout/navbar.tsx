"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, Menu, Home, Users, Settings, LogOut, MessageCircle } from "lucide-react"

interface User {
  id: number
  username: string
  email: string
  full_name: string
  profile_picture_url?: string
}

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setIsMobileMenuOpen(false)
    }
  }

  const handleProfileClick = () => {
    if (user?.username) {
      router.push(`/profile/${user.username}`)
      setIsMobileMenuOpen(false)
    }
  }

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link
        href="/feed"
        className={`flex items-center gap-2 ${mobile ? "text-base py-2" : "text-sm"} hover:text-blue-600 transition-colors`}
        onClick={() => mobile && setIsMobileMenuOpen(false)}
      >
        <Home className="h-4 w-4" />
        Feed
      </Link>
      <Link
        href="/communities"
        className={`flex items-center gap-2 ${mobile ? "text-base py-2" : "text-sm"} hover:text-blue-600 transition-colors`}
        onClick={() => mobile && setIsMobileMenuOpen(false)}
      >
        <Users className="h-4 w-4" />
        Communities
      </Link>
      <Link
        href="/direct-messages"
        className={`flex items-center gap-2 ${mobile ? "text-base py-2" : "text-sm"} hover:text-blue-600 transition-colors`}
        onClick={() => mobile && setIsMobileMenuOpen(false)}
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Messages</span>
      </Link>
    </>
  )

  if (isLoading) {
    return (
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-4 sm:gap-6">
              <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600">
                SocialApp
              </Link>
            </div>
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href={user ? "/feed" : "/"} className="text-xl sm:text-2xl font-bold text-blue-600">
              SocialApp
            </Link>

            {/* Desktop Navigation */}
            {user && (
              <div className="hidden md:flex items-center gap-6">
                <NavLinks />
              </div>
            )}
          </div>

          {/* Search Bar - Desktop */}
          {user && (
            <div className="hidden sm:block flex-1 max-w-md mx-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search users, communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </form>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                {/* Desktop User Menu */}
                <div className="hidden sm:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profile_picture_url || "/placeholder.svg"} alt={user.username} />
                          <AvatarFallback>
                            {user.full_name?.charAt(0) || user.username?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">{user.full_name || user.username}</p>
                          <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                        <Home className="mr-2 h-4 w-4" />
                        Your Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Menu */}
                <div className="sm:hidden">
                  <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80">
                      <div className="flex flex-col h-full">
                        {/* User Info */}
                        <div className="flex items-center gap-3 pb-4 border-b">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.profile_picture_url || "/placeholder.svg"} alt={user.username} />
                            <AvatarFallback>
                              {user.full_name?.charAt(0) || user.username?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.full_name || user.username}</p>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>

                        {/* Search Bar - Mobile */}
                        <div className="py-4 border-b">
                          <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              type="text"
                              placeholder="Search..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 pr-4 py-2 w-full"
                            />
                          </form>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex flex-col gap-1 py-4 border-b">
                          <NavLinks mobile />
                        </div>

                        {/* User Actions */}
                        <div className="flex flex-col gap-1 py-4 flex-1">
                          <Button
                            variant="ghost"
                            onClick={handleProfileClick}
                            className="justify-start gap-2 h-auto py-3"
                          >
                            <Home className="h-4 w-4" />
                            Your Profile
                          </Button>
                          <Button variant="ghost" asChild className="justify-start gap-2 h-auto py-3">
                            <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                              <Settings className="h-4 w-4" />
                              Settings
                            </Link>
                          </Button>
                        </div>

                        {/* Logout */}
                        <div className="pt-4 border-t">
                          <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4" />
                            Log out
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="text-sm">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild className="text-sm">
                  <Link href="/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
