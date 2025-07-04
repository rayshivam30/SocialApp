"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/ui/image-upload"
import { Lock, Bell, Shield, Trash2, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

interface UserProfile {
  id: number
  username: string
  email: string
  full_name?: string
  bio?: string
  profile_picture_url?: string
  is_private: boolean
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    profile_picture_url: "",
    is_private: false,
  })

  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    // Check if form data has changed from original user data
    if (user) {
      const hasChanged =
        formData.full_name !== (user.full_name || "") ||
        formData.bio !== (user.bio || "") ||
        formData.profile_picture_url !== (user.profile_picture_url || "") ||
        formData.is_private !== user.is_private

      setHasChanges(hasChanged)
    }
  }, [formData, user])

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (!response.ok) {
        router.push("/login")
        return
      }

      const data = await response.json()
      setUser(data.user)
      setFormData({
        full_name: data.user.full_name || "",
        bio: data.user.bio || "",
        profile_picture_url: data.user.profile_picture_url || "",
        is_private: data.user.is_private || false,
      })
    } catch (error) {
      setError("Failed to load user data")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/users/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSuccess("Profile updated successfully!")
        // Update the user state with new data
        setUser((prev) => (prev ? { ...prev, ...formData } : null))
        setHasChanges(false)

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update profile")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleImageChange = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, profile_picture_url: imageUrl }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={{ username: "loading", full_name: "Loading..." }} />
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
          <div className="text-center">Loading settings...</div>
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
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <BackButton />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">Account Settings</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Manage your account settings and preferences</p>
        </div>

        <div className="grid gap-4 sm:gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Shield className="h-5 w-5 mr-2" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Update your public profile information</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <form onSubmit={handleSave} className="space-y-4 sm:space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}

                {/* Profile Picture Upload */}
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">Profile Picture</Label>
                  <ImageUpload
                    currentImage={formData.profile_picture_url}
                    onImageChange={handleImageChange}
                    size="lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm sm:text-base">
                      Username
                    </Label>
                    <Input id="username" value={user.username} disabled className="text-sm sm:text-base" />
                    <p className="text-xs text-gray-500">Username cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm sm:text-base">
                      Email
                    </Label>
                    <Input id="email" type="email" value={user.email} disabled className="text-sm sm:text-base" />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm sm:text-base">
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter your full name"
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm sm:text-base">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500">Brief description for your profile</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm sm:text-base">Private Account</Label>
                    <p className="text-xs sm:text-sm text-gray-500">Only approved followers can see your posts</p>
                  </div>
                  <Switch
                    checked={formData.is_private}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_private: checked })}
                  />
                </div>

                <Button type="submit" disabled={saving || !hasChanges} className="w-full text-sm sm:text-base">
                  {saving ? "Saving Changes..." : hasChanges ? "Save Changes" : "No Changes to Save"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm sm:text-base">Email Notifications</Label>
                  <p className="text-xs sm:text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm sm:text-base">Push Notifications</Label>
                  <p className="text-xs sm:text-sm text-gray-500">Receive push notifications on your device</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm sm:text-base">New Followers</Label>
                  <p className="text-xs sm:text-sm text-gray-500">Get notified when someone follows you</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm sm:text-base">Likes and Comments</Label>
                  <p className="text-xs sm:text-sm text-gray-500">Get notified about interactions on your posts</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Lock className="h-5 w-5 mr-2" />
                Security
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              <Button variant="outline" className="w-full justify-start text-sm sm:text-base">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm sm:text-base">
                Two-Factor Authentication
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm sm:text-base">
                Active Sessions
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center text-red-600 text-lg sm:text-xl">
                <Trash2 className="h-5 w-5 mr-2" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Irreversible and destructive actions</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <Button variant="destructive" className="w-full text-sm sm:text-base">
                Delete Account
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                This action cannot be undone. This will permanently delete your account and remove your data from our
                servers.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
