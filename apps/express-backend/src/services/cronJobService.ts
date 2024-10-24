import { PrismaClient } from "@prisma/client";
import cron from "node-cron";
import {
  execute,
  getCronExpression,
  getNextTwoExecutions,
} from "../utils/utils";
import { sendServiceFailMail } from "./mailService";

const prisma = new PrismaClient();

export const MAX_RETRIES = 3;
export const RETRY_DELAY_MS = 5000;
export const scheduledjobs = new Map<string, cron.ScheduledTask>();

export const loadCronJobs = async () => {
  try {
    // gets existing cronjobs from DB
    const cronJobs = await prisma.cronJob.findMany({
      where: { active: true },
    });

    // Iterate through each cronjob and restart
    for (const job of cronJobs) {
      const { cronSchedule, title, id, url } = job;

      const cronExpression = getCronExpression(cronSchedule);

      // schedule the cronjob
      const scheduledJob = cron.schedule(cronExpression, async () => {
        const executionTime = new Date();
        let retriesLeft = MAX_RETRIES;
        await executeJobWithRetry(url, id, executionTime, title, retriesLeft);

        // checks for the scheduled events
        const scheduledEvents = await prisma.event.findMany({
          where: {
            cronJobId: id,
            status: "PENDING",
          },
        });

        // if scheduled events length is 1 then create one
        if (scheduledEvents.length === 1) {
          const nextExecutions = getNextTwoExecutions(cronExpression);

          await prisma.event.create({
            data: {
              cronJobId: id,
              time: nextExecutions[1],
              status: "PENDING",
            },
          });
        }

        // clear up older events
        await deleteOlderEvents(id);
      });
      // save the job in-memory and starts
      scheduledjobs.set(id, scheduledJob);
      scheduledJob.start();
    }
    console.log("Cronjobs loaded ✅");
  } catch (err) {
    console.error("Error in loading cronjobs fron DB : ", err);
  }
};

export const deleteOlderEvents = async (cronJobId: string) => {
  try {
    const eventCount = await prisma.event.count({
      where: {
        cronJobId,
      },
    });

    if (eventCount > 50) {
      const olderEvents = await prisma.event.findMany({
        where: {
          cronJobId,
          status: {
            in: ["FAILURE", "SUCCESS"],
          },
        },
        orderBy: {
          time: "desc",
        },
        skip: 50,
      });
      const olderEventIds = olderEvents.map((event) => event.id);
      console.log("older events : ", olderEvents);

      const result = await prisma.event.deleteMany({
        where: {
          id: {
            in: olderEventIds,
          },
        },
      });
      console.log(
        `Deleted ${olderEventIds.length} older events for cronjob : ${cronJobId}`
      );
    }
  } catch (err) {
    console.error("Error in deleting older events : ", err);
  }
};

export const executeJobWithRetry = async (
  url: string,
  jobId: string,
  executionTime: Date,
  title: string,
  retriesLeft: number
) => {
  try {
    await execute(url);
    const existingEvent = await prisma.event.findFirst({
      where: {
        cronJobId: jobId,
        status: "PENDING",
      },
      orderBy: {
        time: "asc",
      },
    });
    console.log("existing event:", existingEvent);

    if (existingEvent) {
      console.log("event updating...");
      await prisma.event.update({
        where: {
          id: existingEvent.id,
        },
        data: {
          status: "SUCCESS",
        },
      });
    } else {
      console.log("creating event...");
      await prisma.event.create({
        data: {
          cronJobId: jobId,
          time: executionTime,
          status: "SUCCESS",
        },
      });
    }
    await prisma.cronJob.update({
      where: {
        id: jobId,
      },
      data: {
        isFailed: false,
      },
    });
    console.log(`cronjob ${title} executed successfully at ${executionTime}`);
  } catch (err) {
    if (retriesLeft > 0) {
      retriesLeft--;
      console.warn(
        `cronjob ${title} execution failed. Retrying... (${MAX_RETRIES - retriesLeft}/${MAX_RETRIES})`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      await executeJobWithRetry(url, jobId, executionTime, title, retriesLeft);
    } else {
      const existingEvent = await prisma.event.findFirst({
        where: {
          cronJobId: jobId,
          status: "PENDING",
        },
        orderBy: {
          time: "asc",
        },
      });
      // if the event exist update status with FAILURE else create one
      if (existingEvent) {
        console.log("event exist : ",existingEvent)
        await prisma.event.update({
          where: {
            id: existingEvent.id,
          },
          data: {
            status: "FAILURE",
          },
        });
      } else {
        await prisma.event.create({
          data: {
            cronJobId: jobId,
            time: executionTime,
            status: "FAILURE",
          },
        });
      }
      await prisma.cronJob.update({
        where: { id: jobId },
        data: { isFailed: true },
      });
      const result = await prisma.cronJob.findFirst({
        where: {
          id: jobId,
        },
        select: {
          user: {
            select: {
              email: true,
            },
          },
        },
      }); // sends cronjob failed mail
      await sendServiceFailMail(result?.user.email as string, title);
      console.error(`cronjob ${title} failed after ${MAX_RETRIES} attempts:`, err);
    }
  }
};
