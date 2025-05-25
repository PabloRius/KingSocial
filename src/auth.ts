import prisma from "@/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

function CustomPrismaAdapter(p: typeof prisma) {
  return {
    ...PrismaAdapter(p),
    createUser: ({ id, ...data }) => {
      const username =
        data.email?.split("@")[0] ||
        data.name?.replace(/\s+/g, "").toLowerCase() ||
        `user${Math.random().toString(36).slice(2, 8)}`;
      return p.user.create({ data: { ...data, username: username } });
    },
  };
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  adapter: CustomPrismaAdapter(prisma),
  callbacks: {
    async session({ session, user }) {
      const userData = await prisma.user.findUnique({ where: { id: user.id } });
      if (!userData) return session;

      const customUserInfo = {
        ...session.user,
        username: userData.username,
        image: userData.image,
      };
      return { ...session, user: customUserInfo };
    },
  },
  pages: {
    signIn: "/",
  },
});
