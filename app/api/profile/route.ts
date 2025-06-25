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
    const users = db.collection("users")
    const callHistory = db.collection("call_history")

    const user = await users.findOne({ _id: new ObjectId(decoded.userId) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get call statistics
    const calls = await callHistory.find({ userId: new ObjectId(decoded.userId) }).toArray()
    const totalCalls = calls.length
    const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0)

    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone || "",
      bio: user.bio || "",
      location: user.location || "",
      joinedAt: user.createdAt,
      totalCalls,
      totalDuration,
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as {
      userId: string
    }

    const { name, phone, bio, location } = await request.json()

    const { db } = await connectToDatabase()
    const users = db.collection("users")

    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(decoded.userId) },
      {
        $set: {
          name,
          phone,
          bio,
          location,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get call statistics
    const callHistory = db.collection("call_history")
    const calls = await callHistory.find({ userId: new ObjectId(decoded.userId) }).toArray()
    const totalCalls = calls.length
    const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0)

    return NextResponse.json({
      id: result._id,
      name: result.name,
      email: result.email,
      avatar: result.avatar,
      phone: result.phone || "",
      bio: result.bio || "",
      location: result.location || "",
      joinedAt: result.createdAt,
      totalCalls,
      totalDuration,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
