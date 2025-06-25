"use client"

import type React from "react"

import { useState } from "react"
import { Video, Play, ArrowRight, Zap, Globe, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"

const features = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Real-time Translation",
    description: "AI-powered sign language to text conversion in milliseconds",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "No Downloads Required",
    description: "Works directly in your browser with WebRTC technology",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Privacy First",
    description: "Peer-to-peer connections ensure your conversations stay private",
  },
]

export default function HomePage() {
  const [roomCode, setRoomCode] = useState("")
  const router = useRouter()
  const { user } = useAuth()

  const generateRoomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomCode(code)
  }

  const joinRoom = async () => {
    if (roomCode.trim()) {
      // Save room to history if user is logged in
      if (user) {
        try {
          await fetch("/api/call-history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomId: roomCode,
              type: "outgoing",
              startTime: new Date(),
            }),
          })
        } catch (error) {
          console.error("Failed to save call history:", error)
        }
      }
      router.push(`/call/${roomCode}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      joinRoom()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary to-primary/80 text-primary-foreground">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">🚀 Powered by AI & WebRTC</Badge>
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  Bridge the
                  <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                    {" "}
                    Communication{" "}
                  </span>
                  Gap
                </h1>
                <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed">
                  Real-time Sign Language Video Calling with AI-powered interpretation. Connect instantly, communicate
                  naturally.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => document.getElementById("call-section")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start a Call
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-full font-semibold"
                  onClick={() => router.push("/guide")}
                >
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-blue-200">
                <div className="flex items-center gap-2">✓ No phone numbers needed</div>
                <div className="flex items-center gap-2">✓ Works offline after load</div>
                <div className="flex items-center gap-2">✓ ASL & ISL supported</div>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <div className="aspect-video bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Video className="h-16 w-16 mx-auto mb-4 text-white/80" />
                    <p className="text-white/80 text-lg">Live Video Call Preview</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-black/20 rounded-xl">
                  <p className="text-sm text-white/80">🤟 "Hello, how are you?" - Detected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose SignConnect?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of accessible communication with cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call Room Section */}
      <section className="py-20 bg-muted" id="call-section">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto border-0 shadow-2xl">
            <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
              <CardTitle className="text-3xl">Start or Join a Call</CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                {user ? `Welcome back, ${user.name}!` : "No phone or Gmail needed. Just share the room link!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-12">
              <div className="max-w-md mx-auto space-y-6">
                <div className="space-y-4">
                  <label className="text-lg font-semibold text-gray-700">Room Code</label>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter room code (e.g., ABC123)"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      onKeyPress={handleKeyPress}
                      className="text-lg py-6 text-center font-mono tracking-wider"
                    />
                    <Button variant="outline" onClick={generateRoomCode} className="px-6 py-6 whitespace-nowrap">
                      Generate
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={joinRoom}
                  disabled={!roomCode.trim()}
                  size="lg"
                  className="w-full py-6 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Video className="mr-2 h-5 w-5" />
                  {roomCode.trim() ? `Join Room ${roomCode}` : "Enter Room Code"}
                </Button>

                <div className="text-center text-sm text-gray-500 space-y-2">
                  <p>
                    💡 <strong>Tip:</strong> Share the room code with others to join your call
                  </p>
                  <p>
                    🔗 Room URL:{" "}
                    <code className="bg-gray-100 px-2 py-1 rounded">yourdomain.com/call/{roomCode || "ROOMCODE"}</code>
                  </p>
                  {!user && (
                    <p className="text-blue-600">
                      <Button variant="link" onClick={() => router.push("/login")} className="p-0 h-auto">
                        Sign in
                      </Button>{" "}
                      to save your call history
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
