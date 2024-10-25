"use server";
import { authOptions, CustomSession } from "@/lib/auth";
import { CronJobStatus, NextExecutionType } from "@/types/cronjob.types";
import { UserInfo } from "@/types/user.types";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { generateToken } from "@/lib/utils";
import jwt from "jsonwebtoken";
const prisma = new PrismaClient();

interface JwtPayloadWithEmail extends jwt.JwtPayload {
  email: string;
}

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

export const fetchNextExectutions = async (
  cronJobId: string
): Promise<NextExecutionType[] | undefined> => {
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

export const fetchCronjobStats = async (
  userId: string
): Promise<CronJobStatus> => {
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
    console.error("Error fetching cron jobs stats : ", err);
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

export const fetchUserInfo = async (): Promise<UserInfo | null> => {
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

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (err: any) {
    console.error("Error fetching user Info : ", err);
    throw new Error("Unable to retrieve user info");
  }
};

export const deleteUserAccount = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      throw new Error("Not authenticated");
    }
    const { id } = session.user as CustomSession["user"];

    const ExistingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!ExistingUser) {
      throw new Error("User not found");
    }

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

export const updateUsername = async (username: string) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    const customSession = session as CustomSession;

    const existingUser = await prisma.user.findUnique({
      where: {
        id: customSession.user.id,
      },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    await prisma.user.update({
      where: {
        id: customSession.user.id,
      },
      data: {
        username,
      },
    });

    console.log("Username updated!");
  } catch (err) {
    console.error("Error updating username : ", err);
    throw new Error("Unable to update username");
  }
};

export const changeCurrentPassword = async (
  currentPassword: string,
  newPassword: string
) => {
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
    });

    if (!user) {
      throw new Error("No user found");
    }

    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordMatch) {
      throw new Error("Incorrect password");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (!hashedPassword) {
      throw new Error("Internal server error");
    }

    await prisma.user.update({
      where: {
        id: customSession.user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    console.log("Password updated successfully");
  } catch (err) {
    const error = err as Error;
    console.error("Error updating password : ", err);
    throw new Error(error.message);
  }
};

export const sendResetPasswordMail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error("No user found");
    }

    const token = generateToken(email);

    if (!token) {
      throw new Error("Internal server error");
    }

    await prisma.resetToken.create({
      data: {
        userId: user.id,
        email,
        token,
        expiresAt: new Date(Date.now() + 3600 * 1000),
      },
    });

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_SECRET,
      },
      secure: false,
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Password",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <p>Hello,</p>
    
          <p>We received a request to reset the password for your account. Please click the link below to reset your password:</p>
    
          <p>
            <a href="${process.env.NEXTAUTH_URL}/reset-password?token=${token}" 
               style="background-color: #007bff; color: #ffffff; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
              Reset Your Password
            </a>
          </p>
    
          <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
    
          <p style="color: #888;">This link will expire in 1 hour.</p>
    
          <p style="font-style: italic; color: #888;">This is an automatically generated email. Please do not reply.</p>
          
          <p>Best regards,<br>Cronify</p>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error(`Error sending mail to ${email}`, err);
        throw new Error("Failed to send mail");
      } else {
        console.log(`Reset Password mail sent to ${email}`, info.response);
      }
    });
  } catch (err) {
    console.error("Error in sending reset mail : ", err);
    throw new Error("Failed to send reset mail.Please try again");
  }
};

export const resetPassword = async (newPassword: string, token: string) => {
  try {
    const { email } = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayloadWithEmail;

    const resetToken = await prisma.resetToken.findFirst({
      where: {
        token,
        email,
      },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new Error("session expired");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (!hashedPassword) {
      throw new Error("Internal server Error");
    }

    await prisma.user.update({
      where: {
        id: resetToken.userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    await prisma.resetToken.delete({
      where: {
        id: resetToken.id,
      },
    });
    console.log("Password reset successfully");
  } catch (err) {
    const error = err as Error;
    console.log("Error resetting password : ", err);
    throw new Error(error.message);
  }
};
