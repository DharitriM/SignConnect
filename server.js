// /* eslint-disable @typescript-eslint/no-var-requires */
// import next from "next";
// import { createServer } from "http";
// import { parse } from "url";
// import { initSocket } from "./lib/socketServer";

// const port = parseInt(process.env.PORT || "3000", 10);
// const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
// const handle = app.getRequestHandler();

// (async () => {
//   await app.prepare();
//   const server = createServer((req, res) => {
//     const parsedUrl = parse(req.url || "/", true);
//     handle(req, res, parsedUrl);
//   });

//   // hook Socket.IO
//   initSocket(server);

//   server.listen(port, () =>
//     console.log(`> Ready on http://localhost:${port}`),
//   );
// })();


const express = require("express");
const next = require("next");
const { createServer } = require("http");
const { Server } = require("socket.io");

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const server = createServer(expressApp);

  const io = new Server(server, {
    path: "/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    socket.on("message", (msg) => {
      console.log("📩 Received message:", msg);
      socket.broadcast.emit("message", msg);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  // 🔁 Next.js handles all unmatched routes
  expressApp.use((req, res) => handle(req, res));

  server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
});
