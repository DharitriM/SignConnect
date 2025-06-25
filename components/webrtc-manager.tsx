"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"

interface WebRTCManagerProps {
  roomId: string
  localVideoRef: React.RefObject<HTMLVideoElement>
  remoteVideoRef: React.RefObject<HTMLVideoElement>
  onConnectionChange: (connected: boolean) => void
  onParticipantsChange: (participants: string[], isInitiator: boolean) => void
  isMuted: boolean
  isVideoOn: boolean
}

export function WebRTCManager({
  roomId,
  localVideoRef,
  remoteVideoRef,
  onConnectionChange,
  onParticipantsChange,
  isMuted,
  isVideoOn,
}: WebRTCManagerProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const peerConnection = useRef<RTCPeerConnection | null>(null)
  const [isInitiator, setIsInitiator] = useState(false)
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>("new")

  useEffect(() => {
    initializeWebRTC()
    return () => {
      cleanup()
    }
  }, [roomId])

  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted
      })
    }
  }, [isMuted, localStream])

  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOn
      })
    }
  }, [isVideoOn, localStream])

  const initializeWebRTC = async () => {
    try {
      // Initialize Socket.io with better error handling
      const socketUrl = process.env.NODE_ENV === "production" ? "" : "http://localhost:3000"
      const newSocket = io(socketUrl, {
        path: "/api/socket",
        transports: ["websocket", "polling"],
        timeout: 20000,
        forceNew: true,
      })

      setSocket(newSocket)

      // Handle socket connection events
      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id)
      })

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error)
      })

      // Get user media with better constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      setLocalStream(stream)

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Initialize peer connection with STUN/TURN servers
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
        ],
        iceCandidatePoolSize: 10,
      })

      peerConnection.current = pc

      // Monitor connection state
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState
        setConnectionState(state)
        console.log("Connection state:", state)

        if (state === "connected") {
          onConnectionChange(true)
        } else if (state === "disconnected" || state === "failed") {
          onConnectionChange(false)
        }
      }

      // Handle ICE connection state
      pc.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", pc.iceConnectionState)
        if (pc.iceConnectionState === "failed") {
          // Restart ICE
          pc.restartIce()
        }
      }

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream)
      })

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log("Received remote track:", event.track.kind)
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0]
          onConnectionChange(true)
        }
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("Sending ICE candidate")
          newSocket.emit("ice-candidate", {
            roomId,
            candidate: event.candidate,
          })
        }
      }

      // Socket event handlers
      newSocket.on("room-joined", (data) => {
        console.log("Joined room:", data)
        const initiator = data.isInitiator
        setIsInitiator(initiator)
        onParticipantsChange(
          data.participants.filter((p: string) => p !== newSocket.id),
          initiator,
        )
      })

      newSocket.on("user-joined", async (data) => {
        console.log("User joined:", data)
        onParticipantsChange(
          data.participants.filter((p: string) => p !== newSocket.id),
          isInitiator,
        )

        if (isInitiator) {
          await createOffer()
        }
      })

      newSocket.on("offer", async (data) => {
        console.log("Received offer")
        await handleOffer(data.offer)
      })

      newSocket.on("answer", async (data) => {
        console.log("Received answer")
        await handleAnswer(data.answer)
      })

      newSocket.on("ice-candidate", async (data) => {
        console.log("Received ICE candidate")
        await handleIceCandidate(data.candidate)
      })

      newSocket.on("user-left", (data) => {
        console.log("User left:", data)
        onParticipantsChange(
          data.participants.filter((p: string) => p !== newSocket.id),
          isInitiator,
        )
        onConnectionChange(false)
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null
        }
      })

      // Join room
      newSocket.emit("join-room", roomId)
    } catch (error) {
      console.error("Error initializing WebRTC:", error)
      onConnectionChange(false)
    }
  }

  const createOffer = async () => {
    if (!peerConnection.current || !socket) return

    try {
      console.log("Creating offer...")
      const offer = await peerConnection.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })

      await peerConnection.current.setLocalDescription(offer)

      socket.emit("offer", {
        roomId,
        offer,
      })
    } catch (error) {
      console.error("Error creating offer:", error)
    }
  }

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnection.current || !socket) return

    try {
      console.log("Handling offer...")
      await peerConnection.current.setRemoteDescription(offer)

      const answer = await peerConnection.current.createAnswer()
      await peerConnection.current.setLocalDescription(answer)

      socket.emit("answer", {
        roomId,
        answer,
      })
    } catch (error) {
      console.error("Error handling offer:", error)
    }
  }

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnection.current) return

    try {
      console.log("Handling answer...")
      await peerConnection.current.setRemoteDescription(answer)
    } catch (error) {
      console.error("Error handling answer:", error)
    }
  }

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerConnection.current) return

    try {
      await peerConnection.current.addIceCandidate(candidate)
    } catch (error) {
      console.error("Error handling ICE candidate:", error)
    }
  }

  const cleanup = () => {
    console.log("Cleaning up WebRTC resources...")

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop()
        console.log("Stopped track:", track.kind)
      })
    }

    if (peerConnection.current) {
      peerConnection.current.close()
      peerConnection.current = null
    }

    if (socket) {
      socket.disconnect()
      setSocket(null)
    }

    setLocalStream(null)
    onConnectionChange(false)
  }

  return null
}
