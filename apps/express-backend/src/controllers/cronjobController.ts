import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createCronjob = async (req: Request, res: Response) => {
  try {
    const { userId, title, url, schedule } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    res.status(200).json("Check done");
  } catch (err) {
    console.error("Error in adding cronjob: ", err);
  }
};
