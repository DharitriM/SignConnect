import { MongoClient, type Db } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/signconnect"

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

interface MongoConnection {
  client: MongoClient
  db: Db
}

let cachedConnection: MongoConnection | null = null

export async function connectToDatabase(): Promise<MongoConnection> {
  if (cachedConnection) {
    return cachedConnection
  }

  try {
    const client = new MongoClient(MONGODB_URI)
    await client.connect()

    const db = client.db()

    cachedConnection = { client, db }

    console.log("Connected to MongoDB")
    return cachedConnection
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw error
  }
}
