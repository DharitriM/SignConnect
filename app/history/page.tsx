"use client"

import { useEffect, useState } from "react"
import { Video, Phone, Clock, Calendar, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import Link from "next/link"

interface CallHistoryItem {
  _id: string
  roomId: string
  type: "incoming" | "outgoing" | "missed"
  startTime: string
  endTime?: string
  duration?: number
  participants?: string[]
}

export default function CallHistoryPage() {
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchCallHistory()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchCallHistory = async () => {
    try {
      const response = await fetch("/api/call-history")
      if (response.ok) {
        const data = await response.json()
        setCallHistory(data)
      }
    } catch (error) {
      console.error("Failed to fetch call history:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  const getCallTypeIcon = (type: string) => {
    switch (type) {
      case "incoming":
        return "↙️"
      case "outgoing":
        return "↗️"
      case "missed":
        return "❌"
      default:
        return "📞"
    }
  }

  const getCallTypeColor = (type: string) => {
    switch (type) {
      case "incoming":
        return "bg-green-100 text-green-800"
      case "outgoing":
        return "bg-blue-100 text-blue-800"
      case "missed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-gray-400 mb-6">You need to sign in to view your call history</p>
            <div className="space-y-3">
              <Link href="/login">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="w-full">
                  Create Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your call history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-ring mb-2">Call History</h1>
            <p className="text-gray-400">Your recent video calls with sign language interpretation</p>
          </div>

          {callHistory.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Phone className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Call History Yet</h3>
                <p className="text-gray-500 mb-6">Start your first call to see your history here</p>
                <Link href="/">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                    <Video className="mr-2 h-4 w-4" />
                    Start a Call
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {callHistory.map((call) => (
                <Card key={call._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                          {getCallTypeIcon(call.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-lg">Room {call.roomId}</h3>
                            <Badge className={getCallTypeColor(call.type)}>{call.type}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(call.startTime)}
                            </div>
                            {call.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDuration(call.duration)}
                              </div>
                            )}
                            {call.participants && call.participants.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {call.participants.length} participant{call.participants.length !== 1 ? "s" : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/call/${call.roomId}`}>
                          <Button variant="outline" size="sm">
                            <Video className="h-4 w-4 mr-2" />
                            Call Again
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
