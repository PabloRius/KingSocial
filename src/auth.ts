import prisma from "@/prisma";
import type { AdapterUser } from "@auth/core/adapters";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
// import MicrosoftEntraIDProvider from "next-auth/providers/microsoft-entra-id";

function CustomPrismaAdapter(p: typeof prisma) {
  return {
    ...PrismaAdapter(p),
    createUser: async ({
      id,
      ...data
    }: Omit<AdapterUser, "id"> & { id?: string }) => {
      console.log(id);
      const user = await p.user.create({
        data,
      });
      return {
        id: user.id,
        email: user.email ?? "",
        emailVerified: user.emailVerified ?? null,
        name: user.name ?? "",
        image: user.image ?? "",
      };
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
        image: userData.image,
      };
      return { ...session, user: customUserInfo };
    },
  },
  pages: {
    signIn: "/",
  },
});
