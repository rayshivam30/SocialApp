"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"

function ChatModal({ open, onClose, currentUser, otherUser }: any) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let interval: any
    if (open && currentUser && otherUser) {
      fetchMessages()
      interval = setInterval(fetchMessages, 2000)
    }
    return () => clearInterval(interval)
    // eslint-disable-next-line
  }, [open, otherUser?.id])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/messages?userId=${otherUser.id}`)
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
        body: JSON.stringify({ receiverId: otherUser.id, content: input })
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
        <h2 className="text-xl font-bold mb-2">Chat with {otherUser.full_name || otherUser.username}</h2>
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

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    fetchCurrentUser()
    fetchConversations()
  }, [])

  const fetchCurrentUser = async () => {
    const res = await fetch("/api/auth/me")
    if (res.ok) {
      const data = await res.json()
      setCurrentUser(data.user)
    }
  }

  const fetchConversations = async () => {
    // For MVP, get all users you've messaged or received messages from
    const res = await fetch("/api/messages/conversations")
    if (res.ok) {
      const data = await res.json()
      setConversations(data.conversations)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-2 sm:px-0">
      <BackButton />
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <Card className="mb-6 p-4">
        {conversations.length === 0 ? (
          <div className="text-gray-500">No conversations yet.</div>
        ) : (
          <div className="space-y-4">
            {conversations.map((user: any) => (
              <div key={user.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded" onClick={() => { setSelectedUser(user); setChatOpen(true) }}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.profile_picture_url || "/placeholder.svg"} />
                  <AvatarFallback>{user.full_name?.charAt(0) || user.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{user.full_name || user.username}</div>
                  <div className="text-xs text-gray-500">@{user.username}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <ChatModal open={chatOpen} onClose={() => setChatOpen(false)} currentUser={currentUser} otherUser={selectedUser} />
    </div>
  )
} 