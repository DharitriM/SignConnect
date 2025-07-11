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
  const [socketConnected, setSocketConnected] = useState(false)

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
    debugger
    try {
      console.log("Initializing WebRTC...")

      // Get user media first
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

      console.log("Got user media")
      setLocalStream(stream)

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Initialize Socket.io with better configuration
      const socketUrl = window.location.origin
      console.log("Connecting to socket at:", socketUrl)

      const newSocket = io(socketUrl, {
        path: "/api/socket",
        transports: ["polling", "websocket"], // Try polling first, then websocket
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: 10,
        forceNew: false,
      })

      setSocket(newSocket)

      // Socket event handlers
      newSocket.on("connect", () => {
        console.log("Socket connected successfully:", newSocket.id)
        setSocketConnected(true)
        // Join room after successful connection
        setTimeout(() => {
          console.log("Joining room:", roomId)
          newSocket.emit("join-room", roomId)
        }, 100)
      })

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error)
        setSocketConnected(false)
      })

      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason)
        setSocketConnected(false)
        onConnectionChange(false)
      })

      newSocket.on("reconnect", (attemptNumber) => {
        console.log("Socket reconnected after", attemptNumber, "attempts")
        setSocketConnected(true)
        newSocket.emit("join-room", roomId)
      })

      // Initialize peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
        ],
      })

      peerConnection.current = pc

      // Add event listeners
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState
        console.log("Peer connection state:", state)
        onConnectionChange(state === "connected")
      }

      pc.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", pc.iceConnectionState)
      }

      pc.ontrack = (event) => {
        console.log("Received remote track")
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0]
          onConnectionChange(true)
        }
      }

      pc.onicecandidate = (event) => {
        if (event.candidate && socketConnected) {
          console.log("Sending ICE candidate")
          newSocket.emit("ice-candidate", {
            roomId,
            candidate: event.candidate,
          })
        }
      }

      // Add local stream to peer connection
      stream.getTracks().forEach((track) => {
        console.log("Adding track to peer connection:", track.kind)
        pc.addTrack(track, stream)
      })

      // Room and signaling event handlers
      newSocket.on("room-joined", (data) => {
        console.log("Room joined successfully:", data)
        setIsInitiator(data.isInitiator)
        onParticipantsChange(
          data.participants.filter((p: string) => p !== newSocket.id),
          data.isInitiator,
        )
      })

      newSocket.on("user-joined", async (data) => {
        console.log("User joined room, participants:", data.participants)
        onParticipantsChange(
          data.participants.filter((p: string) => p !== newSocket.id),
          isInitiator,
        )

        if (isInitiator) {
          console.log("Creating offer as initiator")
          setTimeout(() => createOffer(), 1000)
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
        console.log("User left room")
        onParticipantsChange(
          data.participants.filter((p: string) => p !== newSocket.id),
          isInitiator,
        )
        onConnectionChange(false)
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null
        }
      })
    } catch (error) {
      console.error("Error initializing WebRTC:", error)
      onConnectionChange(false)
    }
  }

  const createOffer = async () => {
    if (!peerConnection.current || !socket || !socketConnected) {
      console.log("Cannot create offer - peer connection or socket not ready")
      return
    }

    try {
      console.log("Creating offer...")
      const offer = await peerConnection.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
      await peerConnection.current.setLocalDescription(offer)

      socket.emit("offer", { roomId, offer })
      console.log("Offer sent")
    } catch (error) {
      console.error("Error creating offer:", error)
    }
  }

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    if (!peerConnection.current || !socket || !socketConnected) {
      console.log("Cannot handle offer - peer connection or socket not ready")
      return
    }

    try {
      console.log("Handling offer...")
      await peerConnection.current.setRemoteDescription(offer)
      const answer = await peerConnection.current.createAnswer()
      await peerConnection.current.setLocalDescription(answer)

      socket.emit("answer", { roomId, answer })
      console.log("Answer sent")
    } catch (error) {
      console.error("Error handling offer:", error)
    }
  }

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerConnection.current) {
      console.log("Cannot handle answer - peer connection not ready")
      return
    }

    try {
      console.log("Handling answer...")
      await peerConnection.current.setRemoteDescription(answer)
      console.log("Answer handled successfully")
    } catch (error) {
      console.error("Error handling answer:", error)
    }
  }

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!peerConnection.current) {
      console.log("Cannot handle ICE candidate - peer connection not ready")
      return
    }

    try {
      await peerConnection.current.addIceCandidate(candidate)
      console.log("ICE candidate added successfully")
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
    setSocketConnected(false)
    onConnectionChange(false)
  }

  return null
}
