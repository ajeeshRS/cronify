import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const loadCronJobs = async () => {
  try {
    const cronJobs = await prisma.cronJob.findMany({
      where: { active: true },
    });
    
  } catch (err) {
    console.error("Error in loading cronjobs fron DB : ", err);
  }
};
