import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import cron from "node-cron";
import {
  execute,
  getCronExpression,
  getNextTwoExecutions,
} from "../utils/utils";
import { setCache } from "../services/redisService";
const prisma = new PrismaClient();

export const createCronjob = async (req: Request, res: Response) => {
  try {
    const { userId, title, url, schedule } = req.body;

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
      return res.status(200).json({ message: "Test run success" });
    }
  } catch (err: any) {
    console.error("Error in test run: ", err.response);
    if (err.response.status === 403) {
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
      console.log(err);
      res.status(500).json({
        message: "Test run failed.",
      });
      return;
    }
  }
};
