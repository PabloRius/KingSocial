import prisma from "@/prisma";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
// import MicrosoftEntraIDProvider from "next-auth/providers/microsoft-entra-id";

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
  callbacks: {
    async session({ session, user }) {
      const userData = await prisma.user.findUnique({ where: { id: user.id } });
      if (!userData) return session;

      const customUserInfo = {
        ...session.user,
        image: userData.image,
      };
      return { ...session, user: customUserInfo };
    },
  },
  pages: {
    signIn: "/",
  },
});
