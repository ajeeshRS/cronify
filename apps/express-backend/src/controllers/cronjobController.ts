import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import cron from "node-cron";
import {
  execute,
  getCronExpression,
  getNextTwoExecutions,
} from "../utils/utils";
import { setCache } from "../services/redisService";
import { scheduledjobs } from "..//services/cronJobService";
const prisma = new PrismaClient();

export const createCronjob = async (req: Request, res: Response) => {
  try {
    const { userId, title, url, schedule } = req.body;

    if (!userId || !title || !url || !schedule) {
      res.status(403).json("All fields are required");
      console.error("All fields are required");
      return;
    }
    const newCronJob = await prisma.cronJob.create({
      data: {
        userId,
        title,
        url,
        cronSchedule: schedule,
        active: true,
      },
    });

    await setCache(`cronjob:${newCronJob.id}`, JSON.stringify(newCronJob));
    const cronExpression = getCronExpression(schedule);

    const job = cron.schedule(cronExpression, async () => {
      const executionTime = new Date();
      try {
        const response = await execute(url);
        await prisma.event.create({
          data: {
            cronJobId: newCronJob.id,
            time: executionTime,
            status: "SUCCESS",
          },
        });
        scheduledjobs.set(newCronJob.id, job);
        console.log(
          `Cron job ${newCronJob.title} executed successfully at ${executionTime}`
        );
      } catch (err) {
        await prisma.event.create({
          data: {
            cronJobId: newCronJob.id,
            time: executionTime,
            status: "FAILURE",
          },
        });
        console.error("error in executng cron job :", err);
      }
    });

    job.start();

    const nextExecutions = getNextTwoExecutions(cronExpression);

    for (const nextTime of nextExecutions) {
      await prisma.event.create({
        data: {
          cronJobId: newCronJob.id,
          time: nextTime,
          status: "PENDING",
        },
      });
    }
    console.log("Cron job created!");
    res.status(200).json({ message: "Cron job created!!" });
  } catch (err) {
    console.error("Error in adding cronjob: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const cronTestRun = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ message: "URL is required" });
      return;
    }

    const response = await execute(url);
    if (response) {
      res.status(200).json({ message: "Test run success" });
      return;
    }
  } catch (err: any) {
    console.error("Error in test run: ", err);
    if (err.response?.status === 403) {
      res.status(err.response.status).json({
        message: "CORS error: Access denied",
      });
      return;
    } else if (err.request) {
      res.status(500).json({
        message: "No response received. Possible CORS or server issue.",
      });
      return;
    } else {
      res.status(500).json({
        message: "Test run failed.",
      });
      return;
    }
  }
};

export const enableCronjob = async (req: Request, res: Response) => {
  try {
    const { cronjobId, userId } = req.body;

    if (!userId || !cronjobId) {
      res.status(403).json("Bad request");
      throw new Error("Missing userId or cronjobId");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      res.status(401).json("unauthorized");
      return;
    }

    const job = await prisma.cronJob.findFirst({
      where: {
        id: cronjobId,
      },
    });

    if (!job) {
      res.status(404).json("Job not found");
      return;
    }

    const result = await prisma.cronJob.update({
      where: {
        id: cronjobId,
      },
      data: {
        active: true,
      },
    });

    const scheduledjob = scheduledjobs.get(job.id);
    if (scheduledjob) {
      scheduledjob.start();
      console.log("job restarted!");
    }

    res.status(200).json("Cronjob enabled successfully");
  } catch (err) {
    console.error("Couldn't enable the job");
    res.status(500).json("Internal server error");
    return;
  }
};

export const disableCronjob = async (req: Request, res: Response) => {
  try {
    const { cronjobId, userId } = req.body;

    if (!userId || !cronjobId) {
      res.status(403).json("Bad request");
      throw new Error("Missing userId or cronjobId");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      res.status(401).json("unauthorized");
      return;
    }

    const job = await prisma.cronJob.findFirst({
      where: {
        id: cronjobId,
      },
    });

    if (!job) {
      res.status(404).json("Job not found");
      return;
    }

    const result = await prisma.cronJob.update({
      where: {
        id: cronjobId,
      },
      data: {
        active: false,
      },
    });
    const scheduledjob = scheduledjobs.get(job.id);
    if (scheduledjob) {
      scheduledjob.stop();
      console.log("job stopped!");
    }
    res.status(200).json("Cronjob disabled successfully");
  } catch (err) {
    console.error("Couldn't disable the job");
    res.status(500).json("Internal server error");
    return;
  }
};

export const deleteCronjob = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const cronjobId = req.query.cronjobId as string;

    if (!userId || !cronjobId) {
      res.status(403).json("Bad request");
      throw new Error("Missing userId or cronjobId");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      res.status(401).json("Unauthorized");
      return;
    }

    const job = await prisma.cronJob.findFirst({
      where: {
        id: cronjobId,
      },
    });

    if (!job) {
      res.status(404).json("Cronjob not found");
      return;
    }

    await prisma.$transaction([
      prisma.event.deleteMany({
        where: {
          cronJobId: cronjobId,
        },
      }),
      prisma.cronJob.delete({
        where: {
          id: cronjobId,
        },
      }),
    ]);
    res.status(200).json("Cronjob deleted successfully");
  } catch (err) {
    console.error("Error in deleting cronjob : ", err);
    res.status(500).json("Internal server error");
    return;
  }
};

export const updateCronjob = async (req: Request, res: Response) => {
  try {
    const { cronjobId, userId, title, url, schedule } = req.body;

    if (!cronjobId || !userId || !title || !url || !schedule) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const cronjob = await prisma.cronJob.findFirst({
      where: {
        userId,
        id: cronjobId,
      },
    });

    if (!cronjob) {
      res.status(404).json({ message: "Cronjob not found" });
      return;
    }

    const updated = await prisma.cronJob.update({
      where: {
        userId,
        id: cronjobId,
      },
      data: {
        cronSchedule: schedule,
        title,
        url,
      },
    });
    console.log(updated);
    if (!updated) {
      res.status(400).json({ message: "Couldn't update cronjob" });
      return;
    }

    const ExistingJob = scheduledjobs.get(updated.id);
    if (ExistingJob) {
      ExistingJob.stop();
      scheduledjobs.delete(updated.id);

      const cronExpression = getCronExpression(updated.cronSchedule);

      const newScheduledJob = cron.schedule(cronExpression, async () => {
        const executionTime = new Date();
        try {
          const response = await execute(url);
          await prisma.event.create({
            data: {
              cronJobId: updated.id,
              time: executionTime,
              status: "SUCCESS",
            },
          });
          console.log(
            `Cron job ${updated.title} executed successfully at ${executionTime}`
          );
        } catch (err) {
          await prisma.event.create({
            data: {
              cronJobId: updated.id,
              time: executionTime,
              status: "FAILURE",
            },
          });
          console.error("error in executng cron job :", err);
        }
      });
      await setCache(`cronjob:${updated.id}`, JSON.stringify(updated));
      scheduledjobs.set(updated.id, newScheduledJob);
      newScheduledJob.start();

      const nextExecutions = getNextTwoExecutions(cronExpression);

      for (const nextTime of nextExecutions) {
        await prisma.event.create({
          data: {
            cronJobId: updated.id,
            time: nextTime,
            status: "PENDING",
          },
        });
      }
    }

    res.status(200).json({ message: "Cronjob updated!" });
  } catch (err) {
    console.error("Error in updating cronjob: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
