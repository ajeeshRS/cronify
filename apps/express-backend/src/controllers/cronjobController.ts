import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import cron from "node-cron";
import {
  execute,
  getCronExpression,
  getNextTwoExecutions,
} from "../utils/utils";
import { deleteOlderEvents, scheduledjobs } from "..//services/cronJobService";
import { sendServiceFailMail } from "../services/mailService";
import {
  CronJobActionSchema,
  CronJobCreateSchema,
  CronJobTestRunSchema,
  CronjobUpdateSchema,
} from "../validators/cronjob.validator";
const prisma = new PrismaClient();

export const createCronjob = async (req: Request, res: Response) => {
  try {
    const result = CronJobCreateSchema.safeParse(req.body);

    if (!result.success) {
      console.error("Error validating CronJobCreate schema : ", result.error);
      res.status(400).json("Validation failed");
      return;
    }

    const { userId, title, url, schedule } = result.data;

    const newCronJob = await prisma.cronJob.create({
      data: {
        userId,
        title,
        url,
        cronSchedule: schedule,
        active: true,
      },
    });

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
        const user = await prisma.user.findUnique({
          where: {
            id: userId,
          },
        });
        await sendServiceFailMail(user?.email as string, newCronJob.title);
        console.error("error in executng cron job :", err);
      }
    });

    job.start();

    const nextExecutions = getNextTwoExecutions(cronExpression);
    for (const nextTime of nextExecutions) {
      const now = new Date();
      if (nextTime <= now) {
        res.status(400).json("Invalid schedule");
        return;
      }
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
    const result = CronJobTestRunSchema.safeParse(req.body);
    if (!result.success) {
      console.error("Error validating url : ", result.error);
      res.status(400).json("Validation failed");
      return;
    }

    const { url } = result.data;

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
    const result = CronJobActionSchema.safeParse(req.body);
    if (!result.success) {
      console.error("Error validating CronJobAction schema : ", result.error);
      res.status(400).json("Validation failed");
      return;
    }

    const { cronjobId, userId } = result.data;

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

    const updatedCronjob = await prisma.cronJob.update({
      where: {
        id: cronjobId,
      },
      data: {
        active: true,
      },
    });

    const cronExpression = getCronExpression(updatedCronjob.cronSchedule);
    const nextExecutions = getNextTwoExecutions(cronExpression);

    for (const nextTime of nextExecutions) {
      await prisma.event.create({
        data: {
          cronJobId: updatedCronjob.id,
          time: nextTime,
          status: "PENDING",
        },
      });
    }
    const scheduledjob = scheduledjobs.get(job.id);
    if (scheduledjob) {
      scheduledjob.start();
      console.log("job restarted!");
    }

    await deleteOlderEvents(cronjobId);
    res.status(200).json("Cronjob enabled successfully");
  } catch (err) {
    console.error("Couldn't enable the job");
    res.status(500).json("Internal server error");
    return;
  }
};

export const disableCronjob = async (req: Request, res: Response) => {
  try {
    const result = CronJobActionSchema.safeParse(req.body);
    if (!result.success) {
      console.error("Error validating CronJobAction schema : ", result.error);
      res.status(400).json("Validation failed");
      return;
    }

    const { cronjobId, userId } = result.data;

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

    const updatdCronjob = await prisma.cronJob.update({
      where: {
        id: cronjobId,
      },
      data: {
        active: false,
      },
    });
    await prisma.event.deleteMany({
      where: {
        cronJobId: cronjobId,
        status: "PENDING",
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
    const result = CronJobActionSchema.safeParse(req.query);

    if (!result.success) {
      console.error("Error validating CronJobActionSchema  : ", result.error);
      res.status(400).json("Validation failed");
      return;
    }

    const { userId, cronjobId } = result.data;

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
    const result = CronjobUpdateSchema.safeParse(req.body);

    if (!result.success) {
      console.error("Error validating CronjobUpdateSchema : ", result.error);

      res.status(400).json("Validation failed");
      return;
    }

    const { cronjobId, userId, title, url, schedule } = result.data;

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
          const response = await execute(url as string);
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
          const user = await prisma.user.findUnique({
            where: {
              id: userId,
            },
          });

          await sendServiceFailMail(user?.email as string, cronjob.title);
          console.error("error in executng cron job :", err);
        }
      });
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
      await deleteOlderEvents(cronjobId);
    }

    res.status(200).json({ message: "Cronjob updated!" });
  } catch (err) {
    console.error("Error in updating cronjob: ", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
