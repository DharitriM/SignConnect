// import { Server as IOServer } from "socket.io";
// import type { Server as HTTPServer } from "http";


// export function initSocket(httpServer: HTTPServer) {
//   const io = new IOServer(httpServer, {
//     path: "/api/socket/io",
//     cors: { origin: "*" },
//   });

//   io.on("connection", (socket) => {
//     socket.on("join-lobby", ({ roomId, user }) => {
//       socket.join(`lobby:${roomId}`);
//       io.to(`creator:${roomId}`).emit("pending-user", {
//         socketId: socket.id,
//         user,
//       });
//     });

//     socket.on("creator-response", ({ socketId, allowed }) => {
//       io.to(socketId).emit(allowed ? "lobby-approved" : "lobby-denied");
//     });

//     socket.on("register-creator", ({ roomId }) => {
//       socket.join(`creator:${roomId}`);
//     });
//   });

//   return io;
// }

// server/socket.ts


import { Server } from "socket.io";
import { Server as HTTPServer } from "http";

let io: Server | null = null;

export function initSocket(server: HTTPServer) {
  if (!io) {
    io = new Server(server, {
      path: "/api/socket",
      cors: {
        origin: "*", // or specify your frontend origin
        methods: ["GET", "POST"],
      },
      transports: ["websocket"],
    });

    io.on("connection", (socket) => {
      console.log("🔌 New socket connection", socket.id);

      socket.on("join-room", (data) => {
        socket.join(data.roomId);
        socket.broadcast.to(data.roomId).emit("user-joined", data.userInfo);
      });

      socket.on("send-message", (data) => {
        io?.to(data.roomId).emit("receive-message", data.message);
      });

      socket.on("disconnect", () => {
        console.log("🔌 Disconnected", socket.id);
      });
    });
  }

  return io;
}
