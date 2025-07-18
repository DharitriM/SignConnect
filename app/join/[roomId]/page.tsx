"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Video, Mail, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

export default function JoinRoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const { toast } = useToast()
   const { user } = useAuth();
console.log({user})
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (email: string) => {
    return email.toLowerCase().includes("gmail.com")
  }

  const handleJoin = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive",
      })
      return
    }

    if (!email.trim() || !validateEmail(email)) {
      toast({
        title: "Gmail required",
        description: "Please enter a valid Gmail address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Store user info in localStorage
    const userInfo = {
      name: name.trim(),
      email: email.trim(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    }

    localStorage.setItem("userInfo", JSON.stringify(userInfo))

    // Navigate to call room
    router.push(`/call/${roomId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Join Room {roomId}</CardTitle>
          <CardDescription>Enter your details to join the video call</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Gmail Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="your.email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500">Only Gmail accounts are allowed</p>
          </div>

          <Button
            onClick={handleJoin}
            disabled={isLoading || !name.trim() || !email.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500"
          >
            {isLoading ? "Joining..." : "Join Video Call"}
          </Button>

          <div className="text-center text-sm text-gray-500">
            <p>🔒 Your information is only used for this call session</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
