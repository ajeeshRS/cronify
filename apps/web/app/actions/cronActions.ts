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
      orderBy: {
        createdAt: "desc",
      },
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

export const fetchCronjobWithEvents = async (
  cronjobId: string,
  page: number,
  itemsPerPage: number
) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      throw new Error("Not authenticated");
    }

    const cronjob = await prisma.cronJob.findFirst({
      where: { id: cronjobId },
      include: {
        previousEvents: true,
      },
    });
    if (!cronjob) {
      throw new Error("Cronjob not found");
    }

    const allEvents = cronjob?.previousEvents
      .filter((event) => event.status !== "PENDING")
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    const totalEvents = allEvents.length;
    const paginatedEvents = allEvents.slice(
      (page - 1) * itemsPerPage,
      page * itemsPerPage
    );

    return {
      ...cronjob,
      previousEvents: paginatedEvents,
      totalEvents,
    };
  } catch (error) {
    console.error("Error fetching cron job:", error);
    throw new Error("Failed to fetch cron job");
  }
};

export const fetchNextExectutions = async (cronJobId: string) => {
  try {
    const allEvents = await prisma.event.findMany({
      where: {
        cronJobId,
      },
    });
    const nextExecutions = allEvents
      .filter((event) => event.status === "PENDING")
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return nextExecutions;
  } catch (err) {
    console.error("Error in fetching next executions: ", err);
  }
};
