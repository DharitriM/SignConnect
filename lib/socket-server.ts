import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"

interface Room {
  id: string
  participants: Set<string>
  createdAt: Date
}

const rooms = new Map<string, Room>()

// Clean up empty rooms every 5 minutes
setInterval(() => {
  const now = new Date()
  rooms.forEach((room, roomId) => {
    if (room.participants.size === 0 && now.getTime() - room.createdAt.getTime() > 300000) {
      rooms.delete(roomId)
      console.log(`Cleaned up empty room: ${roomId}`)
    }
  })
}, 300000)

export function initializeSocketServer(httpServer: HTTPServer) {
  console.log("Initializing Socket.IO server...")

  const io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: false,
    },
    allowEIO3: true,
    transports: ["polling", "websocket"],
    upgradeTimeout: 30000,
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000,
    serveClient: false,
  })

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`)

    socket.on("join-room", (roomId: string) => {
      console.log(`📞 User ${socket.id} joining room: ${roomId}`)

      // Leave any existing rooms first
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room)
          const existingRoom = rooms.get(room)
          if (existingRoom) {
            existingRoom.participants.delete(socket.id)
            console.log(`👋 User ${socket.id} left room ${room}`)
            socket.to(room).emit("user-left", {
              participants: Array.from(existingRoom.participants),
            })
          }
        }
      })

      // Join the new room
      socket.join(roomId)

      // Create room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          participants: new Set(),
          createdAt: new Date(),
        })
        console.log(`🏠 Created new room: ${roomId}`)
      }

      const room = rooms.get(roomId)!
      const isInitiator = room.participants.size === 0

      room.participants.add(socket.id)

      console.log(`🎯 Room ${roomId}: ${room.participants.size} participants, initiator: ${isInitiator}`)

      // Notify the user they joined
      socket.emit("room-joined", {
        roomId,
        isInitiator,
        participants: Array.from(room.participants),
      })

      // Notify others in the room
      socket.to(roomId).emit("user-joined", {
        participants: Array.from(room.participants),
      })
    })

    socket.on("offer", (data) => {
      console.log(`📤 Relaying offer from ${socket.id} to room ${data.roomId}`)
      socket.to(data.roomId).emit("offer", { offer: data.offer })
    })

    socket.on("answer", (data) => {
      console.log(`📥 Relaying answer from ${socket.id} to room ${data.roomId}`)
      socket.to(data.roomId).emit("answer", { answer: data.answer })
    })

    socket.on("ice-candidate", (data) => {
      console.log(`🧊 Relaying ICE candidate from ${socket.id} to room ${data.roomId}`)
      socket.to(data.roomId).emit("ice-candidate", { candidate: data.candidate })
    })

    socket.on("disconnect", (reason) => {
      console.log(`❌ User disconnected: ${socket.id}, reason: ${reason}`)

      // Remove from all rooms
      rooms.forEach((room, roomId) => {
        if (room.participants.has(socket.id)) {
          room.participants.delete(socket.id)
          console.log(`👋 Removed ${socket.id} from room ${roomId}`)

          socket.to(roomId).emit("user-left", {
            participants: Array.from(room.participants),
          })

          // Delete empty rooms immediately
          if (room.participants.size === 0) {
            rooms.delete(roomId)
            console.log(`🗑️ Deleted empty room: ${roomId}`)
          }
        }
      })
    })

    socket.on("error", (error) => {
      console.error(`🚨 Socket error for ${socket.id}:`, error)
    })
  })

  // Log server stats every 5 minutes
  setInterval(() => {
    const totalRooms = rooms.size
    const totalParticipants = Array.from(rooms.values()).reduce((sum, room) => sum + room.participants.size, 0)
    console.log(`📊 Server stats - Active rooms: ${totalRooms}, Total participants: ${totalParticipants}`)
  }, 300000)

  console.log("✅ Socket.IO server initialized successfully")
  return io
}
