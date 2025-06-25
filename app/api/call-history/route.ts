import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import jwt from "jsonwebtoken"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as {
      userId: string
    }

    const { db } = await connectToDatabase()
    const callHistory = db.collection("call_history")

    const calls = await callHistory
      .find({ userId: new ObjectId(decoded.userId) })
      .sort({ startTime: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json(calls)
  } catch (error) {
    console.error("Call history fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as {
      userId: string
    }

    const { roomId, type, startTime, endTime, duration, participants } = await request.json()

    const { db } = await connectToDatabase()
    const callHistory = db.collection("call_history")

    const result = await callHistory.insertOne({
      userId: new ObjectId(decoded.userId),
      roomId,
      type,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      duration,
      participants: participants || [],
      createdAt: new Date(),
    })

    return NextResponse.json({ id: result.insertedId })
  } catch (error) {
    console.error("Call history save error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
