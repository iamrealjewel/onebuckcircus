import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "circus@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        if (!email) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { 
            subscription: true,
            selectedApps: true,
          }
        });

        if (user?.password) {
          if (!credentials?.password) return null;
          
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;

          if (!user.emailVerified && user.role !== "ADMIN") {
            throw new Error("Your clown scroll is not yet verified.");
          }

          return user;
        }

        // Only allow magic login for existing users without passwords (legacy)
        if (user && !user.password) {
           if (!user.emailVerified && user.role !== "ADMIN") {
            throw new Error("Your clown scroll is not yet verified.");
          }
          return user;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub;
        
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub as string },
          include: { 
            subscription: true,
            selectedApps: {
              include: { act: true }
            }
          }
        });
        
        if (dbUser) {
          (session.user as any).role = dbUser.role;
          (session.user as any).subscriptionType = dbUser.subscription?.tier || "NONE";
          (session.user as any).maxActs = dbUser.subscription?.maxActs || 0;
          (session.user as any).selectedApps = dbUser.selectedApps.map(s => s.actId);
        }
      }
      return session;
    },
     async jwt({ token, user, trigger, session }) {
      // If we are updating the session manually via update()
      if (trigger === "update" || !token.subscriptionType) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          include: { 
            subscription: true,
            selectedApps: true,
          }
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.subscriptionType = dbUser.subscription?.tier || "NONE";
          token.maxActs = dbUser.subscription?.maxActs || 0;
          token.selectedApps = dbUser.selectedApps.map(s => s.actId);
        }
      } else if (user) {
        // Initial sign in
        const u = user as any;
        token.role = u.role;
        token.subscriptionType = u.subscription?.tier || "NONE";
        token.maxActs = u.subscription?.maxActs || 0;
        token.selectedApps = u.selectedApps?.map((s: any) => s.actId) || [];
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth",
  },
};
