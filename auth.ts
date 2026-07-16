import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, stringifyPermissions } from "@/lib/permissions";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  session: { strategy: "jwt" },
  pages: {
    error: "/admin",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount === 0) return true; // bootstrap: first ever sign-in becomes the owner

      const existing = await prisma.user.findUnique({
        where: { email: user.email },
        select: { role: true },
      });
      if (existing?.role === "ADMIN") return true; // returning admin

      const invite = await prisma.adminInvite.findUnique({
        where: { email: user.email },
      });
      return Boolean(invite); // only invited emails may sign in
    },
    async jwt({ token, user }) {
      if (user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, permissions: true },
        });
        token.role = dbUser?.role ?? "USER";
        token.permissions = dbUser?.permissions ?? "";
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as "USER" | "ADMIN";
        session.user.permissions = token.permissions ?? "";
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id || !user.email) return;

      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount === 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: "ADMIN",
            permissions: stringifyPermissions([...PERMISSIONS]),
          },
        });
        return;
      }

      const invite = await prisma.adminInvite.findUnique({
        where: { email: user.email },
      });
      if (invite) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN", permissions: invite.permissions },
        });
        await prisma.adminInvite.delete({ where: { email: user.email } });
      }
    },
  },
});
