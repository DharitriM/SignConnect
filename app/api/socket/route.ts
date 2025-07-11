import { NextResponse } from "next/server"

// This endpoint helps with socket.io connection
export async function GET() {
  return NextResponse.json({
    message: "Socket.io endpoint active",
    path: "/api/socket",
    transports: ["polling", "websocket"],
  })
}

export async function POST() {
  return NextResponse.json({
    message: "Socket.io endpoint active",
    path: "/api/socket",
    transports: ["polling", "websocket"],
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
