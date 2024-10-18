"use server";
import { authOptions, CustomSession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

export const fetchCronJobs = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      throw new Error("Not authenticated");
    }
    const customSession = session as CustomSession;

    const cronJobs = await prisma.cronJob.findMany({
      where: { userId: customSession.user.id },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!cronJobs) {
      throw new Error("Error in fetching cronJobs");
    }
    return cronJobs;
  } catch (err) {
    console.error("Error fetching cron jobs:", err);
    throw new Error("Failed to fetch cron jobs");
  }
};

export const fetchSingleCronjob = async (cronjobId: string) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    const cronjob = await prisma.cronJob.findFirst({
      where: { id: cronjobId },
    });

    if (!cronjob) {
      throw new Error(`Cronjob with ID ${cronjobId} not found`);
    }

    return cronjob;
  } catch (err) {
    console.error(`Error fetching cron job with id ${cronjobId} :`, err);
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

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    const cronjob = await prisma.cronJob.findFirst({
      where: { id: cronjobId },
      include: {
        previousEvents: true,
      },
    });
    if (!cronjob) {
      throw new Error(`Cronjob with id ${cronjobId} not found`);
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
  } catch (err) {
    console.error("Error fetching cron job:", err);
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

    const cronJobStats = await prisma.cronJob.groupBy({
      by: ["active", "isFailed"],
      where: { userId },
      _count: true,
    });

    let activeCount = 0;
    let inActiveCount = 0;
    let failedCount = 0;

    cronJobStats.forEach((stat) => {
      if (stat.active) {
        activeCount += stat._count;
      } else {
        inActiveCount += stat._count;
      }
      if (stat.isFailed) {
        failedCount += stat._count;
      }
    });

    return {
      activeCount,
      inActiveCount,
      failedCount,
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
    throw new Error("Error in fetching events : ", err.message);
  }
};

export const fetchUserInfo = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    const customSession = session as CustomSession;

    const user = await prisma.user.findUnique({
      where: {
        id: customSession.user.id,
      },
      select: {
        username: true,
        createdAt: true,
        email: true,
      },
    });

    return user;
  } catch (err: any) {
    console.error("Error in fetching user Info : ", err);
    throw new Error("Couldn't fetch user : ", err.message);
  }
};

export const deleteUserAccount = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      throw new Error("Not authenticated");
    }
    const { id } = session.user as CustomSession["user"];

    const result = await prisma.$transaction([
      prisma.event.deleteMany({
        where: {
          cronJob: {
            userId: id,
          },
        },
      }),

      prisma.cronJob.deleteMany({
        where: {
          userId: id,
        },
      }),

      prisma.user.delete({
        where: {
          id,
        },
      }),
    ]);

    console.log("User account and related data deleted successfully");
  } catch (err) {
    console.error("Error deleting user account : ", err);
    throw new Error("Unable to delete user account. Please try again later.");
  }
};
