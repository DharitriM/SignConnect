import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: { roomId: string } },
) {
  await prisma.room.update({
    where: { id: params.roomId },
    data: { isLocked: false },
  });
  return NextResponse.json({ ok: true });
}
