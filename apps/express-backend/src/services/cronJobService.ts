import { PrismaClient } from "@prisma/client";
import { setCache } from "./redisService";
import cron from "node-cron";
import { execute, getCronExpression } from "../utils/utils";
const prisma = new PrismaClient();

export const scheduledjobs = new Map<string, cron.ScheduledTask>();

export const loadCronJobs = async () => {
  try {
    const cronJobs = await prisma.cronJob.findMany({
      where: { active: true },
    });
    for (const job of cronJobs) {
      const { cronSchedule, title, id, url } = job;

      await setCache(`cronjob:${id}`, JSON.stringify(job));

      const cronExpression = getCronExpression(cronSchedule);

      const scheduledJob = cron.schedule(cronExpression, async () => {
        const executionTime = new Date();
        try {
          const res = await execute(url);
          await prisma.event.create({
            data: {
              cronJobId: id,
              time: executionTime,
              status: "SUCCESS",
            },
          });
          console.log(
            `Cron job ${title} executed successfully at ${executionTime}`
          );
        } catch (err) {
          await prisma.event.create({
            data: {
              cronJobId: id,
              time: executionTime,
              status: "FAILURE",
            },
          });
          console.error(`Error in executing ${title} job: `, err);
        }
      });
      scheduledjobs.set(id, scheduledJob);
      scheduledJob.start();
    }
    console.log("Cronjobs loaded ✅");
  } catch (err) {
    console.error("Error in loading cronjobs fron DB : ", err);
  }
};
