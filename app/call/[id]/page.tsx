"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, Bluetooth, MessageSquare, Camera, CameraOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock contact data
const contacts = [
  { id: "1", name: "Sarah Johnson", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "2", name: "Mike Chen", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "3", name: "Emma Davis", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "4", name: "Alex Rodriguez", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "5", name: "Lisa Wang", avatar: "/placeholder.svg?height=40&width=40" },
]

// Mock sign language interpretations
const mockInterpretations = [
  "Hello, how are you?",
  "I'm doing well, thank you!",
  "Can you help me with something?",
  "Yes, I'd be happy to help.",
  "Thank you so much!",
  "You're welcome!",
]

export default function VideoCallPage() {
  const params = useParams()
  const router = useRouter()
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isSignInterpreterActive, setIsSignInterpreterActive] = useState(false)
  const [interpretedText, setInterpretedText] = useState<string[]>([])
  const [messageToSend, setMessageToSend] = useState("")

  const contact = contacts.find((c) => c.id === params.id)

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isSignInterpreterActive) {
      const interval = setInterval(() => {
        const randomInterpretation = mockInterpretations[Math.floor(Math.random() * mockInterpretations.length)]
        setInterpretedText((prev) => [...prev, randomInterpretation])
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [isSignInterpreterActive])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleEndCall = () => {
    router.push("/")
  }

  const handleSendMessage = () => {
    if (messageToSend.trim()) {
      setInterpretedText((prev) => [...prev, `You: ${messageToSend}`])
      setMessageToSend("")
    }
  }

  if (!contact) {
    return <div>Contact not found</div>
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
            <AvatarFallback>
              {contact.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{contact.name}</h2>
            <p className="text-sm text-gray-400">{formatDuration(callDuration)}</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-green-600">
          Connected
        </Badge>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Video Area */}
        <div className="flex-1 relative">
          {/* Remote Video */}
          <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
            <div className="text-center">
              <Avatar className="w-32 h-32 mx-auto mb-4">
                <AvatarImage src={contact.avatar || "/placeholder.svg"} alt={contact.name} />
                <AvatarFallback className="text-4xl">
                  {contact.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <p className="text-xl">{contact.name}</p>
              <p className="text-gray-400">Video call in progress</p>
            </div>

            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-700 rounded-lg border-2 border-gray-600 flex items-center justify-center">
              {isCameraOn ? (
                <div className="text-center">
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">You</p>
                </div>
              ) : (
                <div className="text-center">
                  <CameraOff className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Camera Off</p>
                </div>
              )}
            </div>

            {/* Sign Language Interpretation Overlay */}
            {isSignInterpreterActive && (
              <div className="absolute bottom-20 left-4 right-4">
                <Card className="bg-black/80 border-blue-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-blue-400">Sign Language Interpretation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-32 mb-4">
                      <div className="space-y-2">
                        {interpretedText.map((text, index) => (
                          <div key={index} className="p-2 bg-blue-900/50 rounded text-sm">
                            {text}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Type a message to convert to sign language..."
                        value={messageToSend}
                        onChange={(e) => setMessageToSend(e.target.value)}
                        className="flex-1 bg-gray-800 border-gray-600 text-white"
                        rows={2}
                      />
                      <Button onClick={handleSendMessage} size="sm">
                        Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-4 bg-gray-900/90 backdrop-blur-sm rounded-full px-6 py-4">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>

              <Button
                variant={isCameraOn ? "secondary" : "destructive"}
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={() => setIsCameraOn(!isCameraOn)}
              >
                {isCameraOn ? <Camera className="h-6 w-6" /> : <CameraOff className="h-6 w-6" />}
              </Button>

              <Button variant="destructive" size="lg" className="rounded-full w-16 h-16" onClick={handleEndCall}>
                <PhoneOff className="h-8 w-8" />
              </Button>

              <Button
                variant={isSpeakerOn ? "secondary" : "outline"}
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              >
                {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
              </Button>

              <Button
                variant={isBluetoothConnected ? "secondary" : "outline"}
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={() => setIsBluetoothConnected(!isBluetoothConnected)}
              >
                <Bluetooth className="h-6 w-6" />
              </Button>

              <Button
                variant={isSignInterpreterActive ? "default" : "outline"}
                size="lg"
                className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsSignInterpreterActive(!isSignInterpreterActive)}
              >
                <MessageSquare className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
