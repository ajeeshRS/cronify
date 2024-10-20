import { DefaultSession, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { CustomSessionUser } from "@/types/user.types";
import { SigninSchema } from "./validators/auth.validator";
const prisma = new PrismaClient();

export interface CustomSession extends DefaultSession {
  user: CustomSessionUser;
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        username: { label: "email", type: "text", placeholder: "" },
        password: {
          label: "password",
          type: "password",
          placeholder: "",
        },
      },
      async authorize(credentials): Promise<any> {
        const result = SigninSchema.safeParse(credentials);

        if (!result.success) {
          throw new Error("Input validation failed");
        }

        const { email, password } = result.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error("User not found");
        }

        const isValidPassword = await compare(password, user.password);
        if (!isValidPassword) throw new Error("Invalid credentials");

        return {
          id: user.id,
          email: user.email,
          name: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google") {
        console.log("GOOOOOOOOOOGLE reached");
        const existingUser = await prisma.user.findUnique({
          where: {
            email: profile?.email,
          },
        });
        if (!existingUser) {
          console.log("No existing user");
          const newUser = await prisma.user.create({
            data: {
              email: profile?.email as string,
              username: profile?.name as string,
              password: "",
            },
          });
          token.id = newUser.id;
        } else {
          console.log("existing user");
          token.id = existingUser.id;
        }
      } else if (user) {
        console.log("normal user!!");
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      const newSession: CustomSession = session as CustomSession;
      if (newSession.user) {
        newSession.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthOptions;
