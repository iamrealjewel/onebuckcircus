import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

const funnyLoginErrors = [
  "Even the clowns know that's the wrong password.",
  "Did you type that with clown shoes on? Invalid credentials.",
  "The Oracle rejects your reality. (Wrong email or password)",
  "You couldn't juggle your way into this account. Try again.",
  "Access denied. The lions are looking at you funny.",
  "Nice try, but you're not on the Ringmaster's guest list.",
  "Oops! Did you drop a juggling pin on your keyboard?",
  "The magic trick failed. Incorrect credentials!"
];

const getRandomError = () => funnyLoginErrors[Math.floor(Math.random() * funnyLoginErrors.length)];

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
        isAdminLogin: { label: "Admin Login", type: "text" }
      },
      async authorize(credentials) {
        console.log("AUTHORIZE CREDENTIALS:", {
          email: credentials?.email,
          isAdminLogin: credentials?.isAdminLogin,
          hasPassword: !!credentials?.password
        });
        const email = credentials?.email?.toLowerCase().trim();
        if (!email) throw new Error("An email is required, joker.");

        const user = await prisma.user.findUnique({
          where: { email },
          include: { 
            subscription: true,
            userSelections: true,
          }
        });

        // Use a funny error if the user doesn't exist
        if (!user) throw new Error(getRandomError());

        if (user?.password) {
          if (!credentials?.password) throw new Error("A password is required, joker.");
          
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) throw new Error(getRandomError());

          const pendingChange = await prisma.verificationToken.findFirst({
            where: {
              OR: [
                { identifier: { startsWith: `email-change:${user.id}` } },
                { identifier: { startsWith: `confirm-new-email:${user.id}:` } }
              ],
              expires: { gt: new Date() }
            }
          });

          if (pendingChange) {
            throw new Error("Account locked: Pending email change. Please check your emails to complete the process.");
          }

          if (!user.emailVerified && user.role !== "ADMIN") {
            throw new Error("Your clown scroll is not yet verified.");
          }

          if (credentials?.isAdminLogin && user.role !== "ADMIN") {
            throw new Error("Access Denied: You are not the Ringmaster.");
          }

          if (!credentials?.isAdminLogin && user.role === "ADMIN") {
            throw new Error("Admins must login through the Control Center.");
          }

          return user;
        }

        // Only allow magic login for existing users without passwords (legacy)
        if (user && !user.password) {
           if (!user.emailVerified && user.role !== "ADMIN") {
            throw new Error("Your clown scroll is not yet verified.");
          }

          const pendingChange = await prisma.verificationToken.findFirst({
            where: {
              OR: [
                { identifier: { startsWith: `email-change:${user.id}` } },
                { identifier: { startsWith: `confirm-new-email:${user.id}:` } }
              ],
              expires: { gt: new Date() }
            }
          });

          if (pendingChange) {
            throw new Error("Account locked: Pending email change. Please check your emails to complete the process.");
          }

          return user;
        }

        throw new Error(getRandomError());
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user && token.sub) {
        (session.user as any).id = token.sub;
        
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub as string },
            include: { 
              subscription: true,
              userSelections: {
                include: { act: true }
              }
            }
          });
          
            if (dbUser) {
            (session.user as any).role = dbUser.role;
            (session.user as any).subscriptionType = dbUser.subscription?.tier || "NONE";
            (session.user as any).maxActs = dbUser.subscription?.maxActs || 0;
            (session.user as any).selectedApps = dbUser.userSelections.map(s => s.actId);
            (session.user as any).subscribedAt = dbUser.subscribedAt;
            (session.user as any).subscriptionEnd = dbUser.subscriptionEnd;
            (session.user as any).preferredAvatar = dbUser.preferredAvatar;
          }
        } catch (error) {
          console.error("Session fetch error:", error);
        }
      }
      return session;
    },
     async jwt({ token, user, trigger, session }) {
      // Check for account locks on every JWT evaluation
      if (token.sub) {
        const pendingChange = await prisma.verificationToken.findFirst({
          where: {
            OR: [
              { identifier: { startsWith: `email-change:${token.sub}` } },
              { identifier: { startsWith: `confirm-new-email:${token.sub}:` } }
            ],
            expires: { gt: new Date() }
          }
        });

        if (pendingChange) {
          return {}; // Invalidates the active JWT session immediately
        }
      }

      // If we are updating the session manually via update()
      if ((trigger === "update" || !token.subscriptionType) && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          include: { 
            subscription: true,
            userSelections: true,
          }
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.subscriptionType = dbUser.subscription?.tier || "NONE";
          token.subscriptionEnd = dbUser.subscriptionEnd;
          token.maxActs = dbUser.subscription?.maxActs || 0;
          token.selectedApps = dbUser.userSelections.map(s => s.actId);
          token.preferredAvatar = dbUser.preferredAvatar;
        }
      } else if (user) {
        // Initial sign in
        const u = user as any;
        token.role = u.role;
        token.subscriptionType = u.subscription?.tier || "NONE";
        token.maxActs = u.subscription?.maxActs || 0;
        token.selectedApps = u.userSelections?.map((s: any) => s.actId) || [];
        token.preferredAvatar = u.preferredAvatar;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth",
  },
};
