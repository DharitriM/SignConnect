"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Copy,
  Users,
  MessageSquare,
  Monitor,
  MonitorOff,
  Send,
  Settings,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { UserInfoModal } from "@/components/user-info-modal";
import { useAuth } from "@/components/auth-provider";
import { Message, Participant } from "@/types/webrtc";
import {
  useWebRTCManager,
  WebRTCManagerHandle,
} from "@/components/webrtc-manager";

export default function CallRoom() {
  /* -------------------------------------------------------------------- */
  /* Basic react / auth state                                             */
  /* -------------------------------------------------------------------- */
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  /* -------------------------------------------------------------------- */
  /* Refs for local / remote media elements                               */
  /* -------------------------------------------------------------------- */
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<HTMLDivElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* -------------------------------------------------------------------- */
  /* UI + room state                                                      */
  /* -------------------------------------------------------------------- */
  const [userInfo, setUserInfo] = useState<any>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  const [showChat, setShowChat] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "failed"
  >("connecting");

  const mgr = useWebRTCManager({
    roomId,
    userInfo,
    isCreatingRoom: false,
    localVideoRef,
    remoteVideosRef,
    screenShareRef,
    isMuted,
    isVideoOn,
    isScreenSharing,
    onConnectionChange: (connected: boolean) => {
      setIsConnected(connected);
      setConnectionStatus(connected ? "connected" : "connecting");
    },
    onRoomCreated: (data) => {
      setIsHost(true);
      setParticipants(data.participants);
      setCallStartTime(new Date());
    },
    onRoomJoined: (data) => {
      setIsHost(data.isHost);
      setParticipants(data.participants);
      setMessages(data.messages);
      setCallStartTime(new Date());
    },
    onRoomError: (err) =>
      toast({
        title: "Connection error",
        description: err,
        variant: "destructive",
      }),
    onMessageReceived: (m) => setMessages((prev: any) => [...prev, m]),
    onParticipantUpdate: setParticipants,
    onUserMediaChanged: (uid, ms) =>
      setParticipants((prev) =>
        prev.map((p) => (p.id === uid ? { ...p, mediaState: ms } : p))
      ),
    onScreenShareStarted: () => setIsScreenSharing(true),
    onScreenShareStopped: () => setIsScreenSharing(false),
    onMediaStateChange: () => {},
    onWaitingForApproval: () => {},
    onJoinApproved: () => {},
    onJoinRejected: () => {},
    onJoinRequest: () => {},
    onNewHostAssigned: () => {},
    onSignLanguageInterpretation: () => {},
    onVoiceToText: () => {},
  });

  /* -------------------------------------------------------------------- */
  /* 1.  Build userInfo or show modal                                     */
  /* -------------------------------------------------------------------- */
  useEffect(() => {
    if (user) {
      setUserInfo({
        id: user.id, // assume your auth provider gives it
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      });
    } else {
      setShowUserModal(true);
    }
  }, [user]);

  /* -------------------------------------------------------------------- */
  /* 3.  Derived helpers                                                  */
  /* -------------------------------------------------------------------- */
  const formatDuration = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return h > 0
      ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      : `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  /* -------------------------------------------------------------------- */
  /* 4.  Timers & auto‑scroll                                             */
  /* -------------------------------------------------------------------- */
  useEffect(() => {
    if (!callStartTime) return;
    const t = setInterval(() => {
      setCallDuration(
        Math.floor((Date.now() - callStartTime.getTime()) / 1000)
      );
    }, 1000);
    return () => clearInterval(t);
  }, [callStartTime]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* -------------------------------------------------------------------- */
  /* 5.  Command helpers (use mgrRef)                                     */
  /* -------------------------------------------------------------------- */
  const sendMessage = () => {
    const message = newMessage.trim();
    if (!message) return;
    mgr.sendMessage?.(message);
    setNewMessage("");
  };

  const toggleScreenShare = () => {
    mgr.toggleScreenShare();
  };

  // Initialize user info
  useEffect(() => {
    if (user) {
      const loggedUserInfo = {
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      };
      setUserInfo(loggedUserInfo);
    } else {
      setShowUserModal(true);
    }
  }, [user]);

  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor(
          (now.getTime() - callStartTime.getTime()) / 1000
        );
        setCallDuration(duration);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStartTime]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // const formatDuration = (seconds: number) => {
  //   const hours = Math.floor(seconds / 3600)
  //   const mins = Math.floor((seconds % 3600) / 60)
  //   const secs = seconds % 60

  //   if (hours > 0) {
  //     return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  //   }
  //   return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  // }

  const copyRoomLink = () => {
    const link = `${window.location.origin}/call/${roomId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Room link copied!",
      description: "Share this link with others to join the call",
    });
  };

  const handleUserInfoSubmit = (info: { name: string; email: string }) => {
    const userInfoWithAvatar = {
      ...info,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        info.name
      )}`,
    };
    setUserInfo(userInfoWithAvatar);
    setShowUserModal(false);
  };

  const handleRoomJoined = (data: any) => {
    console.log("🏠 Room joined:", data);
    setIsHost(data.isHost);
    setParticipants(data.participants || []);
    setMessages(data.messages || []);
    setCallStartTime(new Date());
    setConnectionStatus("connected");
    toast({
      title: "Joined room successfully!",
      description: `You are ${data.isHost ? "the host" : "a participant"}`,
    });
  };

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
    setConnectionStatus(connected ? "connected" : "connecting");
    if (connected) {
      toast({
        title: "Video connected!",
        description: "You are now connected to another participant",
      });
    }
  };

  const handleParticipantUpdate = (newParticipants: Participant[]) => {
    setParticipants(newParticipants);
  };

  const handleMessageReceived = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleEndCall = () => {
    router.push("/");
  };

  const retryConnection = () => {
    window.location.reload();
  };

  if (!userInfo) {
    return (
      <>
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Setting up your call...</p>
          </div>
        </div>
        <UserInfoModal isOpen={showUserModal} onSubmit={handleUserInfoSubmit} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-gray-700"
            >
              ← Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Room: {roomId}</h1>
            <p className="text-sm text-gray-400">
              {connectionStatus === "connected"
                ? `Connected • ${formatDuration(callDuration)}`
                : "Connecting..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-green-600 text-white">
            <Users className="h-3 w-3 mr-1" />
            {participants.length} participant
            {participants.length !== 1 ? "s" : ""}
          </Badge>
          {isHost && (
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              Host
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={copyRoomLink}
            className="border-gray-600 hover:bg-gray-700 bg-transparent"
          >
            Share Room
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Video Area */}
        <div className="flex-1 relative bg-black">
          {/* Remote Video */}
          {/* <video
            ref={remoteVideosRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={{ display: isConnected ? "block" : "none" }}
          /> */}
          <div
            ref={remoteVideosRef}
            className="w-full h-full object-cover"
            style={{ display: isConnected ? "block" : "none" }}
          ></div>

          {/* Screen Share Video */}
          {isScreenSharing && (
            <video
              ref={screenShareRef}
              autoPlay
              playsInline
              className="absolute top-4 left-4 w-64 h-48 object-cover rounded-lg border-2 border-blue-500 z-10"
            />
          )}

          {/* Waiting/Connection State */}
          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  {connectionStatus === "failed" ? (
                    <AlertCircle className="h-12 w-12 text-red-400" />
                  ) : (
                    <Users className="h-12 w-12" />
                  )}
                </div>
                <h3 className="text-2xl font-semibold mb-2">
                  {connectionStatus === "failed"
                    ? "Connection Failed"
                    : isHost
                    ? "Waiting for others to join..."
                    : "Connecting to the call..."}
                </h3>
                <p className="text-gray-400 mb-4">
                  {connectionStatus === "failed"
                    ? "Unable to establish connection"
                    : isHost
                    ? "Share the room link to invite participants"
                    : "Please wait while we connect you"}
                </p>
                {connectionStatus === "failed" ? (
                  <Button
                    onClick={retryConnection}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Retry Connection
                  </Button>
                ) : (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                )}
              </div>
            </div>
          )}

          {/* Local Video */}
          <div className="absolute top-4 right-4 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden border border-gray-600">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="bg-gray-700 text-white">
                {userInfo.name} (You)
              </Badge>
            </div>
            {!isVideoOn && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-3 bg-gray-800/90 rounded-full px-6 py-4 border border-gray-600">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="lg"
                className="rounded-full w-12 h-12"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant={isVideoOn ? "secondary" : "destructive"}
                size="lg"
                className="rounded-full w-12 h-12"
                onClick={() => setIsVideoOn(!isVideoOn)}
              >
                {isVideoOn ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <VideoOff className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant={isScreenSharing ? "default" : "secondary"}
                size="lg"
                className="rounded-full w-12 h-12"
                onClick={toggleScreenShare}
              >
                {isScreenSharing ? (
                  <MonitorOff className="h-5 w-5" />
                ) : (
                  <Monitor className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="destructive"
                size="lg"
                className="rounded-full w-14 h-14"
                onClick={handleEndCall}
              >
                <PhoneOff className="h-6 w-6" />
              </Button>

              <Button
                variant={showChat ? "default" : "secondary"}
                size="lg"
                className="rounded-full w-12 h-12"
                onClick={() => setShowChat(!showChat)}
              >
                <MessageSquare className="h-5 w-5" />
              </Button>

              <Button
                variant="secondary"
                size="lg"
                className="rounded-full w-12 h-12"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Room Info */}
          <Card className="bg-gray-700 border-gray-600 m-4">
            <CardHeader>
              <CardTitle className="text-lg text-white">
                Room Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Room ID</p>
                <p className="font-mono text-lg text-white">{roomId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <Badge
                  className={
                    connectionStatus === "connected"
                      ? "bg-green-600"
                      : connectionStatus === "failed"
                      ? "bg-red-600"
                      : "bg-yellow-600"
                  }
                >
                  {connectionStatus === "connected"
                    ? "Connected"
                    : connectionStatus === "failed"
                    ? "Failed"
                    : "Connecting"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-400">Duration</p>
                <p className="font-mono text-lg text-white">
                  {formatDuration(callDuration)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Role</p>
                <Badge variant={isHost ? "default" : "secondary"}>
                  {isHost ? "Host" : "Participant"}
                </Badge>
              </div>
              <Button
                onClick={copyRoomLink}
                variant="outline"
                className="w-full border-gray-600 hover:bg-gray-600 bg-transparent"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Room Link
              </Button>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card className="bg-gray-700 border-gray-600 mx-4 mb-4">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participants ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {participants.map((participant, index) => (
                    <div
                      key={participant.id || index}
                      className="flex items-center gap-3 p-2 bg-gray-600 rounded-lg"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={participant.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {participant.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {participant.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {participant.isHost ? "Host" : "Participant"}
                        </p>
                      </div>
                      {participant.isHost && (
                        <Badge
                          variant="outline"
                          className="text-xs border-blue-500 text-blue-400"
                        >
                          Host
                        </Badge>
                      )}
                    </div>
                  ))}
                  {participants.length === 0 && (
                    <div className="text-center py-4 text-gray-400">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Waiting for participants...</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat */}
          {showChat && (
            <Card className="bg-gray-700 border-gray-600 mx-4 mb-4 flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div key={message.id} className="flex gap-3">
                        <Avatar className="w-6 h-6">
                          <AvatarImage
                            src={message.sender.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback className="text-xs">
                            {message.sender.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-white">
                              {message.sender.name}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">
                            {message.text}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-gray-600">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                    <Button
                      onClick={sendMessage}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* WebRTC Manager */}
      {/* {userInfo && (
        <WebRTCManager
          roomId={roomId}
          userInfo={userInfo}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          onConnectionChange={handleConnectionChange}
          onRoomJoined={handleRoomJoined}
          onParticipantUpdate={handleParticipantUpdate}
          onMessageReceived={handleMessageReceived}
          isMuted={isMuted}
          isVideoOn={isVideoOn}
        />
      )} */}
    </div>
  );
}
