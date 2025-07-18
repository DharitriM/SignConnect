import { AccessToken } from "livekit-server-sdk";

const LK_API_KEY = process.env.LIVEKIT_API_KEY!;
const LK_API_SECRET = process.env.LIVEKIT_API_SECRET!;
export const LK_URL = process.env.LIVEKIT_URL!;   // wss://…:7800

export async function issueToken(
  roomId: string,
  userId: string,
  name: string,
): Promise<string> {
  const at = new AccessToken(LK_API_KEY, LK_API_SECRET, {
    identity: userId,
    name,
  });
  at.addGrant({ roomJoin: true, room: roomId });
  return at.toJwt();
}
