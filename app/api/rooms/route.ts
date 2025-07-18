import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { issueToken } from "@/lib/livekit";

export async function POST(req: Request) {
  const { roomId, userId, username } = await req.json();

  // 1️⃣  if no roomId → create
  const room = roomId
    ? await prisma.room.findUnique({ where: { id: roomId } })
    : await prisma.room.create({
        data: {
          creatorId: userId,
          participants: { connect: { id: userId } },
        },
      });

  // 2️⃣  attach participant if not present
  if (
    !(room.participants as unknown[]).find((p: any) => p.id === userId)
  ) {
    await prisma.room.update({
      where: { id: room.id },
      data: { participants: { connect: { id: userId } } },
    });
  }

  // 3️⃣ Sign LiveKit AccessToken
  const token: string = await issueToken(room.id, userId, username);

  return NextResponse.json({ token });
}
