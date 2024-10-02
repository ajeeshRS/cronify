import { Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import prisma from "db/src/db";

export interface session extends Session {
  user: {
    id: string;
    jwtToken: string;
    role: string;
    email: string;
    name: string;
  };
}

interface user {
  id: string;
  name: string;
  email: string;
  token: string;
}

export const authOptions = {
  providers: [
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
      async authorize(credentials: any) {
        const { email, password } = credentials;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error("User not found");
        }

        const isValidPassword = await compare(password, user.password);
        if (!isValidPassword) throw new Error("Invalid credentials");

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      const newSession: session = session as session;
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
