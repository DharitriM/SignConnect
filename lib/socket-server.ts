import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"

interface Room {
  id: string
  participants: Map<string, { id: string; name?: string; joinedAt: Date; isInitiator: boolean }>
  createdAt: Date
}

const rooms = new Map<string, Room>()

// Clean up empty rooms periodically
setInterval(() => {
  const now = new Date()
  rooms.forEach((room, roomId) => {
    if (room.participants.size === 0 && now.getTime() - room.createdAt.getTime() > 300000) {
      // 5 minutes
      rooms.delete(roomId)
      console.log(`Cleaned up empty room: ${roomId}`)
    }
  })
}, 60000) // Check every minute

export function initializeSocketServer(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    cors: {
      origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
  })

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id)

    socket.on("join-room", (roomId: string) => {
      console.log(`User ${socket.id} joining room ${roomId}`)

      // Leave any existing rooms
      Array.from(socket.rooms).forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room)
          const existingRoom = rooms.get(room)
          if (existingRoom) {
            existingRoom.participants.delete(socket.id)
            // Notify others in the old room
            socket.to(room).emit("user-left", {
              userId: socket.id,
              participants: Array.from(existingRoom.participants.keys()),
            })
          }
        }
      })

      // Join the new room
      socket.join(roomId)

      // Initialize room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          participants: new Map(),
          createdAt: new Date(),
        })
      }

      const room = rooms.get(roomId)!
      const isInitiator = room.participants.size === 0

      room.participants.set(socket.id, {
        id: socket.id,
        joinedAt: new Date(),
        isInitiator,
      })

      console.log(`Room ${roomId} now has ${room.participants.size} participants`)

      // Notify user they joined
      socket.emit("room-joined", {
        roomId,
        isInitiator,
        participants: Array.from(room.participants.keys()),
      })

      // Notify others in the room
      socket.to(roomId).emit("user-joined", {
        userId: socket.id,
        participants: Array.from(room.participants.keys()),
      })
    })

    socket.on("offer", (data) => {
      console.log(`Relaying offer from ${socket.id} to room ${data.roomId}`)
      socket.to(data.roomId).emit("offer", {
        offer: data.offer,
        from: socket.id,
      })
    })

    socket.on("answer", (data) => {
      console.log(`Relaying answer from ${socket.id} to room ${data.roomId}`)
      socket.to(data.roomId).emit("answer", {
        answer: data.answer,
        from: socket.id,
      })
    })

    socket.on("ice-candidate", (data) => {
      console.log(`Relaying ICE candidate from ${socket.id} to room ${data.roomId}`)
      socket.to(data.roomId).emit("ice-candidate", {
        candidate: data.candidate,
        from: socket.id,
      })
    })

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${socket.id}, reason: ${reason}`)

      // Remove user from all rooms
      rooms.forEach((room, roomId) => {
        if (room.participants.has(socket.id)) {
          room.participants.delete(socket.id)

          console.log(`Removed ${socket.id} from room ${roomId}, ${room.participants.size} participants remaining`)

          // Notify others in the room
          socket.to(roomId).emit("user-left", {
            userId: socket.id,
            participants: Array.from(room.participants.keys()),
          })

          // Clean up empty rooms immediately
          if (room.participants.size === 0) {
            rooms.delete(roomId)
            console.log(`Deleted empty room: ${roomId}`)
          }
        }
      })
    })

    // Handle connection errors
    socket.on("error", (error) => {
      console.error(`Socket error for ${socket.id}:`, error)
    })
  })

  // Log server stats periodically
  setInterval(() => {
    const totalRooms = rooms.size
    const totalParticipants = Array.from(rooms.values()).reduce((sum, room) => sum + room.participants.size, 0)
    console.log(`Server stats - Rooms: ${totalRooms}, Total participants: ${totalParticipants}`)
  }, 300000) // Every 5 minutes

  return io
}
