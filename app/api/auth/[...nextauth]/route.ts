import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
  providers: [
    Credentials({
      name: "Magic",
      credentials: {
        email: { type: "email", label: "Email" },
        username: { type: "text", label: "Username" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        let user =
          (await prisma.user.findUnique({
            where: { email: credentials.email },
          })) ||
          (await prisma.user.create({
            data: {
              email: credentials.email,
              username: credentials.username,
            },
          }));
        return user;
      },
    }),
  ],
  session: { strategy: "jwt" },
});
export { handler as GET, handler as POST };
