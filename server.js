const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const { initializeSocketServer } = require("./lib/socket-server")

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = process.env.PORT || 3000

console.log(`🚀 Starting server in ${dev ? "development" : "production"} mode`)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  console.log("📦 Next.js app prepared")

  const httpServer = createServer(async (req, res) => {
    try {
      // Add CORS headers for socket.io
      if (req.url?.startsWith("/api/socket")) {
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        res.setHeader("Access-Control-Allow-Headers", "Content-Type")

        if (req.method === "OPTIONS") {
          res.writeHead(200)
          res.end()
          return
        }
      }

      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error("❌ Error occurred handling", req.url, err)
      res.statusCode = 500
      res.end("internal server error")
    }
  })

  // Initialize Socket.io
  const io = initializeSocketServer(httpServer)

  httpServer.listen(port, (err) => {
    if (err) throw err
    console.log(`✅ Server ready on http://${hostname}:${port}`)
    console.log(`🔌 Socket.io server running on path: /api/socket`)
    console.log(`📡 WebRTC signaling server active`)
  })

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("🛑 SIGTERM received, shutting down gracefully")
    httpServer.close(() => {
      console.log("✅ Server closed")
      process.exit(0)
    })
  })

  process.on("SIGINT", () => {
    console.log("🛑 SIGINT received, shutting down gracefully")
    httpServer.close(() => {
      console.log("✅ Server closed")
      process.exit(0)
    })
  })
})
