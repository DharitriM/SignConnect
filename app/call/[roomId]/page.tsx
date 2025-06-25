"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Copy,
  Users,
  Settings,
  Monitor,
  MonitorOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { SignLanguageDetector } from "@/components/sign-language-detector"
import { WebRTCManager } from "@/components/webrtc-manager"
import { useAuth } from "@/components/auth-provider"

interface Participant {
  id: string
  name: string
  isLocal: boolean
  stream?: MediaStream
}

export default function CallRoom() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const { toast } = useToast()
  const { user } = useAuth()

  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isSignDetectionOn, setIsSignDetectionOn] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [detectedSigns, setDetectedSigns] = useState<Array<{ text: string; timestamp: Date; user: string }>>([])
  const [callDuration, setCallDuration] = useState(0)
  const [callStartTime, setCallStartTime] = useState<Date | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting")
  const [isInitiator, setIsInitiator] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const screenShareRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isConnected && callStartTime) {
      interval = setInterval(() => {
        const now = new Date()
        const duration = Math.floor((now.getTime() - callStartTime.getTime()) / 1000)
        setCallDuration(duration)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isConnected, callStartTime])

  useEffect(() => {
    // Save call start to history when component mounts
    if (user && !callStartTime) {
      const startTime = new Date()
      setCallStartTime(startTime)
      saveCallToHistory(startTime)
    }
  }, [user, roomId])

  const saveCallToHistory = async (startTime: Date, endTime?: Date) => {
    if (!user) return

    try {
      await fetch("/api/call-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          type: "outgoing",
          startTime: startTime.toISOString(),
          endTime: endTime?.toISOString(),
          duration: endTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : undefined,
          participants: participants.filter((p) => !p.isLocal).map((p) => p.name),
        }),
      })
    } catch (error) {
      console.error("Failed to save call history:", error)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const copyRoomLink = () => {
    const link = `${window.location.origin}/call/${roomId}`
    navigator.clipboard.writeText(link)
    toast({
      title: "Room link copied!",
      description: "Share this link with others to join the call",
    })
  }

  const handleSignDetected = (text: string) => {
    setDetectedSigns((prev) => [
      ...prev,
      {
        text,
        timestamp: new Date(),
        user: user?.name || "You",
      },
    ])
  }

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected)
    setConnectionStatus(connected ? "connected" : "disconnected")
  }

  const handleParticipantsChange = (newParticipants: string[], initiator: boolean) => {
    setIsInitiator(initiator)
    const participantObjects: Participant[] = [
      {
        id: "local",
        name: user?.name || "You",
        isLocal: true,
      },
      ...newParticipants
        .filter((id) => id !== "local")
        .map((id, index) => ({
          id,
          name: `Participant ${index + 1}`,
          isLocal: false,
        })),
    ]
    setParticipants(participantObjects)
  }

  const handleEndCall = async () => {
    if (callStartTime) {
      const endTime = new Date()
      await saveCallToHistory(callStartTime, endTime)
    }
    router.push("/")
  }

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })

        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream
        }

        setIsScreenSharing(true)

        // Handle screen share end
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          if (screenShareRef.current) {
            screenShareRef.current.srcObject = null
          }
        }
      } else {
        if (screenShareRef.current?.srcObject) {
          const stream = screenShareRef.current.srcObject as MediaStream
          stream.getTracks().forEach((track) => track.stop())
          screenShareRef.current.srcObject = null
        }
        setIsScreenSharing(false)
      }
    } catch (error) {
      console.error("Screen share error:", error)
      toast({
        title: "Screen share failed",
        description: "Unable to start screen sharing",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-sm border-b border-border p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="hover:bg-muted">
                ← Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold">Room: {roomId}</h1>
              <p className="text-sm text-muted-foreground">
                {connectionStatus === "connected" && callDuration > 0
                  ? `Connected • ${formatDuration(callDuration)}`
                  : connectionStatus === "connecting"
                    ? "Connecting..."
                    : "Disconnected"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={isConnected ? "default" : "secondary"} className="bg-green-600 text-white">
              <Users className="h-3 w-3 mr-1" />
              {participants.length} participant{participants.length !== 1 ? "s" : ""}
            </Badge>
            {isInitiator && (
              <Badge variant="outline" className="border-blue-500 text-blue-600">
                Host
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={copyRoomLink} className="border-border hover:bg-muted">
              <Copy className="h-4 w-4 mr-2" />
              Share Room
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 h-[calc(100vh-80px)] flex gap-4">
        {/* Main Video Area */}
        <div className="flex-1 relative">
          <Card className="h-full bg-card/40 backdrop-blur-sm border-border">
            <CardContent className="p-0 h-full relative">
              {/* Remote Video */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-lg"
                style={{ display: isConnected ? "block" : "none" }}
              />

              {/* Screen Share Video */}
              {isScreenSharing && (
                <video
                  ref={screenShareRef}
                  autoPlay
                  playsInline
                  className="absolute top-4 left-4 w-64 h-48 object-cover rounded-lg border-2 border-primary z-10"
                />
              )}

              {/* Waiting State */}
              {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-12 w-12 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">
                      {isInitiator ? "Waiting for others to join..." : "Connecting to the call..."}
                    </h3>
                    <p className="text-muted-foreground">
                      {isInitiator ? "Share the room link to invite participants" : "Please wait while we connect you"}
                    </p>
                    <div className="mt-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Local Video (Picture-in-Picture) */}
              <div className="absolute top-4 right-4 w-64 h-48 bg-background/60 rounded-lg border border-border overflow-hidden">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="bg-background/80 text-foreground">
                    {user?.name || "You"}
                  </Badge>
                </div>
                {!isVideoOn && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <VideoOff className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Sign Language Detection Overlay */}
              {isSignDetectionOn && (
                <div className="absolute bottom-20 left-4 right-4">
                  <Card className="bg-background/90 backdrop-blur-sm border-primary/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-primary flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Sign Language Detection Active
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-24">
                        <div className="space-y-1">
                          {detectedSigns.slice(-3).map((sign, index) => (
                            <div key={index} className="text-sm p-2 bg-primary/10 rounded">
                              <span className="text-primary font-medium">{sign.user}:</span> {sign.text}
                            </div>
                          ))}
                          {detectedSigns.length === 0 && (
                            <p className="text-muted-foreground text-sm">Start signing to see translations here...</p>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Call Controls */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-3 bg-background/80 backdrop-blur-sm rounded-full px-6 py-4 border border-border shadow-lg">
                  <Button
                    variant={isMuted ? "destructive" : "secondary"}
                    size="lg"
                    className="rounded-full w-12 h-12"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>

                  <Button
                    variant={isVideoOn ? "secondary" : "destructive"}
                    size="lg"
                    className="rounded-full w-12 h-12"
                    onClick={() => setIsVideoOn(!isVideoOn)}
                  >
                    {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>

                  <Button
                    variant={isScreenSharing ? "default" : "secondary"}
                    size="lg"
                    className="rounded-full w-12 h-12"
                    onClick={toggleScreenShare}
                  >
                    {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                  </Button>

                  <Button variant="destructive" size="lg" className="rounded-full w-14 h-14" onClick={handleEndCall}>
                    <PhoneOff className="h-6 w-6" />
                  </Button>

                  <Button
                    variant={isSignDetectionOn ? "default" : "outline"}
                    size="lg"
                    className="rounded-full w-12 h-12 bg-primary hover:bg-primary/90"
                    onClick={() => setIsSignDetectionOn(!isSignDetectionOn)}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>

                  <Button variant="outline" size="lg" className="rounded-full w-12 h-12">
                    <Settings className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="w-80 space-y-4">
          {/* Room Info */}
          <Card className="bg-card/40 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="text-lg">Room Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Room ID</p>
                <p className="font-mono text-lg">{roomId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={isConnected ? "default" : "secondary"}>
                  {connectionStatus === "connected"
                    ? "Connected"
                    : connectionStatus === "connecting"
                      ? "Connecting"
                      : "Disconnected"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-mono text-lg">{formatDuration(callDuration)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <Badge variant={isInitiator ? "default" : "secondary"}>{isInitiator ? "Host" : "Participant"}</Badge>
              </div>
              <Button onClick={copyRoomLink} variant="outline" className="w-full">
                <Copy className="h-4 w-4 mr-2" />
                Copy Room Link
              </Button>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card className="bg-card/40 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participants ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{participant.name}</p>
                      <p className="text-xs text-muted-foreground">{participant.isLocal ? "You" : "Remote"}</p>
                    </div>
                    {participant.isLocal && isInitiator && (
                      <Badge variant="outline" className="text-xs">
                        Host
                      </Badge>
                    )}
                  </div>
                ))}
                {participants.length <= 1 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Waiting for participants...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sign Detection History */}
          <Card className="bg-card/40 backdrop-blur-sm border-border flex-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Sign Detection History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {detectedSigns.map((sign, index) => (
                    <div key={index} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-primary">{sign.user}</span>
                        <span className="text-xs text-muted-foreground">{sign.timestamp.toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm">{sign.text}</p>
                    </div>
                  ))}
                  {detectedSigns.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No signs detected yet</p>
                      <p className="text-xs">Enable sign detection to start</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* WebRTC Manager */}
      <WebRTCManager
        roomId={roomId}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        onConnectionChange={handleConnectionChange}
        onParticipantsChange={handleParticipantsChange}
        isMuted={isMuted}
        isVideoOn={isVideoOn}
      />

      {/* Sign Language Detector */}
      {isSignDetectionOn && <SignLanguageDetector videoRef={localVideoRef} onSignDetected={handleSignDetected} />}
    </div>
  )
}
