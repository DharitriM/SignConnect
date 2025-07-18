import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { roomId: string } },
) {
  const room = await prisma.room.findUnique({
    where: { id: params.roomId },
    include: { participants: true },
  });
  return NextResponse.json(room);
}
