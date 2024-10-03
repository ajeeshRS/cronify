import { DefaultSession, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// export interface session extends Session {
//   user: {
//     id: string;
//     jwtToken: string;
//     role: string;
//     email: string;
//     name: string;
//   };
// }

interface User {
  id: string;
  name: string;
  email: string;
}

export interface CustomSession extends DefaultSession {
  user: User;
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
          id: user.id,
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
