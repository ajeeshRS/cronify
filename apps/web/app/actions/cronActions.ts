"use server";
import { authOptions, CustomSession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

export const fetchCronJobs = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      throw new Error("Not authenticated");
    }
    const customSession = session as CustomSession;

    const cronJobs = await prisma.cronJob.findMany({
      where: { userId: customSession.user.id },
    });
    return cronJobs;
  } catch (error) {
    console.error("Error fetching cron jobs:", error);
    throw new Error("Failed to fetch cron jobs");
  }
};

export const fetchSingleCronjob = async (cronjobId: string) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      throw new Error("Not authenticated");
    }

    const cronjob = await prisma.cronJob.findFirst({
      where: { id: cronjobId },
    });
    return cronjob;
  } catch (error) {
    console.error("Error fetching cron job:", error);
    throw new Error("Failed to fetch cron job");
  }
};
