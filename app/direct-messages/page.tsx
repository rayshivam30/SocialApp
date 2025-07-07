"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, Plus, ArrowLeft } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { io } from "socket.io-client"
import { useIsMobile } from "@/hooks/use-mobile"

const SOCKET_URL = "http://localhost:4000"
let socket: any = null

function ChatArea({ currentUser, otherUser, onBack, messages, setMessages }: any) {
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  // Connect to socket and join room
  useEffect(() => {
    if (!currentUser?.id) return
    if (!socket) {
      socket = io(SOCKET_URL)
      socket.on("connect", () => {
        socket.emit("join", currentUser.id)
      })
    } else {
      socket.emit("join", currentUser.id)
    }
    return () => {
      if (socket) socket.off("receive_message")
    }
  }, [currentUser?.id])

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return
    socket.on("receive_message", (msg: any) => {
      if (msg.from === otherUser?.id || msg.to === otherUser?.id) {
        setMessages((prev: any) => [...prev, msg])
      }
    })
    return () => {
      if (socket) socket.off("receive_message")
    }
  }, [otherUser?.id])

  // Always fetch messages when otherUser or currentUser changes
  useEffect(() => {
    if (!otherUser?.id || !currentUser?.id) return;
    setLoading(true);
    fetch(`/api/messages?userId=${otherUser.id}`)
      .then(res => res.ok ? res.json() : { messages: [] })
      .then(data => {
        // Normalize all messages to use 'from' and 'to'
        const normalized = (data.messages || []).map((msg: any) => ({
          ...msg,
          from: msg.sender_id ?? msg.from,
          to: msg.receiver_id ?? msg.to
        }));
        setMessages(normalized);
        setLoading(false);
      });
  }, [otherUser?.id, currentUser?.id]);

  const handleSend = async () => {
    if (!input.trim()) return
    setSending(true)
    try {
      // Send via socket
      socket.emit("send_message", {
        to: otherUser.id,
        from: currentUser.id,
        content: input
      })
      // Also save to DB
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: otherUser.id, content: input })
      })
      setMessages((prev: any) => [...prev, { from: currentUser.id, to: otherUser.id, content: input }])
      setInput("")
    } finally {
      setSending(false)
    }
  }

  if (!otherUser) return (
    <div className="flex flex-1 items-center justify-center text-gray-400 text-lg">Select a conversation</div>
  )

  return (
    <div className={`flex flex-col h-full flex-1 ${isMobile ? 'pt-0' : ''}`}>
      <div className="flex-1 overflow-y-auto px-4 py-2 bg-gray-50" style={isMobile ? {paddingTop: 0, paddingBottom: 80} : {}}>
        {loading ? <div>Loading...</div> : messages.length === 0 ? <div className="text-gray-400 text-center mt-10">No messages yet.</div> : (
          messages.map((msg: any, i: number) => (
            <div key={i} className={`mb-2 flex ${msg.from === currentUser.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-3 py-2 rounded-2xl max-w-xs break-words ${msg.from === currentUser.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="border-t px-4 py-3 flex gap-2 bg-white" style={isMobile ? {position: 'fixed', bottom: 0, left: 0, width: '100vw', zIndex: 50} : {}}>
        <Input
          className="flex-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend() }}
          placeholder="Message..."
          disabled={sending}
        />
        <Button onClick={handleSend} disabled={sending || !input.trim()}>
          Send
        </Button>
      </div>
    </div>
  )
}

export default function DirectMessagesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search, setSearch] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showNew, setShowNew] = useState(false)
  const searchParams = useSearchParams()
  const preselectUsername = searchParams.get("user")
  const [pendingUser, setPendingUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const router = useRouter()
  const isMobile = useIsMobile()

  useEffect(() => {
    fetchCurrentUser()
    fetchConversations()
  }, [])

  useEffect(() => {
    if (preselectUsername) {
      const user = conversations.find((u: any) => u.username === preselectUsername)
      if (user) {
        setSelectedUser(user)
        setPendingUser(null)
        console.log('Selected user from conversations:', user)
      } else {
        // Fetch user profile if not in conversations
        fetch(`/api/users/${preselectUsername}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data && data.user) {
              setPendingUser(data.user)
              setSelectedUser({
                id: data.user.id,
                username: data.user.username,
                full_name: data.user.full_name,
                profile_picture_url: data.user.profile_picture_url
              })
              console.log('Selected pending user:', data.user)
            } else {
              setPendingUser(null)
              setSelectedUser(null)
              console.log('User not found:', preselectUsername)
            }
          })
      }
    } else {
      setSelectedUser(null)
      setPendingUser(null)
      console.log('No user selected')
    }
    // eslint-disable-next-line
  }, [preselectUsername, conversations])

  const fetchCurrentUser = async () => {
    const res = await fetch("/api/auth/me")
    if (res.ok) {
      const data = await res.json()
      setCurrentUser(data.user)
    }
  }

  const fetchConversations = async () => {
    const res = await fetch("/api/messages/conversations")
    if (res.ok) {
      const data = await res.json()
      setConversations(data.conversations)
    }
  }

  const handleSearch = async (q: string) => {
    setSearch(q)
    if (!q.trim()) {
      setSearchResults([])
      return
    }
    // Search all users
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=users`)
    if (res.ok) {
      const data = await res.json()
      // Filter out the current user
      const filtered = (data.users || []).filter((u: any) => u.id !== currentUser?.id)
      setSearchResults(filtered)
    }
  }

  // Top bar with back button (always visible, shows avatar and name side by side when chat selected)
  const TopBar = (
    <div className="flex items-center gap-2 px-4 py-3 border-b shadow-sm bg-white sticky top-0 z-40 min-h-[56px]">
      <Button variant="ghost" size="icon" onClick={() => {
        if (selectedUser || pendingUser) setSelectedUser(null)
        else router.back()
      }} aria-label="Back">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <span className="font-bold text-lg flex items-center gap-2"><MessageCircle className="h-5 w-5" /> Direct</span>
    </div>
  )

  // Chat area header (avatar and name at the very top, full width, left-aligned)
  const ChatAreaHeader = (selectedUser || pendingUser) ? (
    <div className="flex items-center gap-3 px-4 py-3 border-b bg-white w-full">
      {isMobile && (
        <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      <Avatar className="h-9 w-9">
        <AvatarImage src={(pendingUser || selectedUser)?.profile_picture_url || "/placeholder.svg"} />
        <AvatarFallback>{(pendingUser || selectedUser)?.full_name?.charAt(0) || (pendingUser || selectedUser)?.username.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="font-semibold text-base">{(pendingUser || selectedUser)?.full_name || (pendingUser || selectedUser)?.username}</div>
    </div>
  ) : null

  // Mobile Instagram-like UI
  if (isMobile) {
    // Inbox view (no chat selected)
    if (!(selectedUser || pendingUser)) {
      return (
        <div className="fixed inset-0 z-50 flex flex-col bg-white h-[100dvh] w-full">
          {TopBar}
          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {pendingUser && !conversations.some((u: any) => u.id === pendingUser.id) && (
              <div className={`flex items-center gap-3 cursor-pointer hover:bg-gray-200 px-4 py-3 ${selectedUser?.id === pendingUser.id ? 'bg-gray-200' : ''}`}
                onClick={() => { setMessages([]); setSelectedUser({
                  id: pendingUser.id,
                  username: pendingUser.username,
                  full_name: pendingUser.full_name,
                  profile_picture_url: pendingUser.profile_picture_url
                }); setSidebarOpen(false); }}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={pendingUser.profile_picture_url || "/placeholder.svg"} />
                  <AvatarFallback>{pendingUser.full_name?.charAt(0) || pendingUser.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{pendingUser.full_name || pendingUser.username}</div>
                  <div className="text-xs text-gray-500">@{pendingUser.username} <span className="text-blue-500">New chat</span></div>
                </div>
              </div>
            )}
            {conversations.length === 0 && !pendingUser ? (
              <div className="text-gray-400 text-center mt-10">No conversations yet.</div>
            ) : (
              conversations.map((user: any) => (
                <div key={user.id} className={`flex items-center gap-3 cursor-pointer hover:bg-gray-100 px-4 py-3 ${selectedUser?.id === user.id ? 'bg-gray-200' : ''}`} onClick={() => { setMessages([]); setSelectedUser(user); setSidebarOpen(false) }}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.profile_picture_url || "/placeholder.svg"} />
                    <AvatarFallback>{user.full_name?.charAt(0) || user.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{user.full_name || user.username}</div>
                    <div className="text-xs text-gray-500">@{user.username}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* New Message Modal */}
          {showNew && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4 relative">
                <button onClick={() => setShowNew(false)} className="absolute top-2 right-2 text-gray-500 hover:text-black">&times;</button>
                <h2 className="text-xl font-bold mb-2">New Message</h2>
                <Input
                  className="mb-3"
                  placeholder="Search users..."
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  autoFocus
                />
                <div className="max-h-60 overflow-y-auto">
                  {searchResults.length === 0 && search.trim() ? (
                    <div className="text-gray-400">No users found.</div>
                  ) : (
                    searchResults.map((user: any) => (
                      <div key={user.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded" onClick={() => {
                        if (!conversations.some((c: any) => c.id === user.id)) {
                          setConversations((prev: any[]) => [user, ...prev])
                        }
                        setMessages([]);
                        setSelectedUser(user);
                        setPendingUser(null);
                        setShowNew(false);
                        setSearch("");
                        setSearchResults([]);
                      }}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profile_picture_url || "/placeholder.svg"} />
                          <AvatarFallback>{user.full_name?.charAt(0) || user.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{user.full_name || user.username}</div>
                          <div className="text-xs text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }
    // Chat view (chat selected)
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-white h-[100dvh] w-full">
        {ChatAreaHeader}
        <div className="flex-1 flex flex-col h-full pt-0" style={{paddingBottom: 80}}>
          <ChatArea currentUser={currentUser} otherUser={pendingUser || selectedUser} onBack={() => setSelectedUser(null)} messages={messages} setMessages={setMessages} />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex h-[90vh] w-full max-w-5xl mx-auto bg-white rounded-lg shadow overflow-hidden mt-8 border relative ${isMobile ? 'flex-col' : ''}`}>
      {/* Top bar for desktop, only in inbox */}
      {!(selectedUser || pendingUser) && <div className="absolute left-0 top-0 w-full z-40">{TopBar}</div>}
      {/* Sidebar */}
      <div className={`flex flex-col w-72 border-r bg-gray-50 ${isMobile && (selectedUser || pendingUser) ? 'hidden' : ''} ${isMobile ? 'pt-2' : ''}`} style={isMobile ? {height: '100vh', position: 'fixed', zIndex: 20, left: 0, top: 0, width: '100vw'} : {}}>
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-white">
          <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="font-bold text-lg flex items-center gap-2"><MessageCircle className="h-5 w-5" /> Direct</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* Show pendingUser at the top if not in conversations */}
          {pendingUser && !conversations.some((u: any) => u.id === pendingUser.id) && (
            <div className={`flex items-center gap-3 cursor-pointer hover:bg-gray-200 px-4 py-3 ${selectedUser?.id === pendingUser.id ? 'bg-gray-200' : ''}`}
              onClick={() => { setMessages([]); setSelectedUser({
                id: pendingUser.id,
                username: pendingUser.username,
                full_name: pendingUser.full_name,
                profile_picture_url: pendingUser.profile_picture_url
              }); setSidebarOpen(false); }}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={pendingUser.profile_picture_url || "/placeholder.svg"} />
                <AvatarFallback>{pendingUser.full_name?.charAt(0) || pendingUser.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{pendingUser.full_name || pendingUser.username}</div>
                <div className="text-xs text-gray-500">@{pendingUser.username} <span className="text-blue-500">New chat</span></div>
              </div>
            </div>
          )}
          {conversations.length === 0 && !pendingUser ? (
            <div className="text-gray-400 text-center mt-10">No conversations yet.</div>
          ) : (
            conversations.map((user: any) => (
              <div key={user.id} className={`flex items-center gap-3 cursor-pointer hover:bg-gray-200 px-4 py-3 ${selectedUser?.id === user.id ? 'bg-gray-200' : ''}`} onClick={() => { setMessages([]); setSelectedUser(user); setSidebarOpen(false) }}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.profile_picture_url || "/placeholder.svg"} />
                  <AvatarFallback>{user.full_name?.charAt(0) || user.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{user.full_name || user.username}</div>
                  <div className="text-xs text-gray-500">@{user.username}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col h-full ${isMobile && (selectedUser || pendingUser) ? 'pt-14' : ''}`} style={isMobile && (selectedUser || pendingUser) ? {height: '100vh', width: '100vw', position: 'fixed', left: 0, top: 0, zIndex: 10, background: 'white'} : {}}>
        {(selectedUser || pendingUser) && ChatAreaHeader}
        <ChatArea currentUser={currentUser} otherUser={pendingUser || selectedUser} onBack={() => setSelectedUser(null)} messages={messages} setMessages={setMessages} />
      </div>
      {/* New Message Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4 relative">
            <button onClick={() => setShowNew(false)} className="absolute top-2 right-2 text-gray-500 hover:text-black">&times;</button>
            <h2 className="text-xl font-bold mb-2">New Message</h2>
            <Input
              className="mb-3"
              placeholder="Search users..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              autoFocus
            />
            <div className="max-h-60 overflow-y-auto">
              {searchResults.length === 0 && search.trim() ? (
                <div className="text-gray-400">No users found.</div>
              ) : (
                searchResults.map((user: any) => (
                  <div key={user.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded" onClick={() => {
                    if (!conversations.some((c: any) => c.id === user.id)) {
                      setConversations((prev: any[]) => [user, ...prev])
                    }
                    setMessages([]);
                    setSelectedUser(user);
                    setPendingUser(null);
                    setShowNew(false);
                    setSearch("");
                    setSearchResults([]);
                  }}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profile_picture_url || "/placeholder.svg"} />
                      <AvatarFallback>{user.full_name?.charAt(0) || user.username.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{user.full_name || user.username}</div>
                      <div className="text-xs text-gray-500">@{user.username}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 