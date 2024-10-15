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

export const fetchCronjobStats = async (userId: string) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    const activeJobCount = await prisma.cronJob.count({
      where: {
        userId,
        active: true,
      },
    });

    const inActiveJobCount = await prisma.cronJob.count({
      where: {
        userId,
        active: false,
      },
    });

    const failedCronjobs = await prisma.cronJob.count({
      where: {
        userId,
        isFailed: true,
      },
    });

    return {
      activeCount: activeJobCount,
      inActiveCount: inActiveJobCount,
      failedCount: failedCronjobs,
    };
  } catch (err) {
    console.error("Error in fetching cron jobs stats : ", err);
    throw new Error("Failed to get cronjobs stats");
  }
};

export const fetchAllEvents = async (
  userId: string,
  page: number,
  itemsPerPage: number
) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    const { cronJobs } = (await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        cronJobs: {
          select: {
            url: true,
            previousEvents: {
              where: {
                status: {
                  not: "PENDING",
                },
              },
              select: {
                id: true,
                time: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
      },
    })) || { cronJobs: [] };

    const allEvents = cronJobs.flatMap((cronJob) =>
      cronJob.previousEvents.map((event) => ({
        ...event,
        cronJobUrl: cronJob.url,
      }))
    );

    const sortedEvents = allEvents?.sort((a, b) => {
      return b.time < a.time ? -1 : 1; // Sort by `time` in descending order
    });

    const slicedEvents = sortedEvents?.slice(0, 25);

    if (slicedEvents) {
      const totalEvents = slicedEvents.length;
      const paginatedEvents = slicedEvents.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
      );

      return {
        events: paginatedEvents,
        totalEvents,
      };
    }
  } catch (err: any) {
    console.error("Error in fetching events : ", err);
    throw new Error("Error in fetching events : ", err.messag);
  }
};
