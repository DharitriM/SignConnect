import type { NextRequest } from "next/server"

// This will be handled by the socket.io server
export async function GET(req: NextRequest) {
  return new Response("Socket.io endpoint", { status: 200 })
}
