import { NextRequest, NextResponse } from "next/server";
import brcypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();
    const salt = await brcypt.genSalt(10);
    const hashedPassword = await brcypt.hash(password, salt);

    const res = await prisma.user.create({
      data: {
        email: email,
        username: username,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "Register success" });
  } catch (error) {
    console.error(error);
  }
}
