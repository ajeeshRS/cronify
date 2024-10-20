import { z } from "zod";

export const CronJobCreateSchema = z.object({
  userId: z.string().min(1, "User id is required"),
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Provide a valid url"),
  schedule: z.string().min(1, "Schedule is required"),
});

export const CronjobUpdateSchema = z
  .object({
    cronjobId: z.string().min(1, "cronjob id is required"),
    userId: z.string().min(1, "User id is required"),
    title: z.string().min(1, "Title is required").optional(),
    url: z.string().url("Provide a valid url").optional(),
    schedule: z.string().min(1, "Schedule is required").optional(),
  })
  .refine((data) => data.title || data.url || data.schedule, {
    message: "At least one of 'title', 'url', or 'schedule' must be provided",
  });

export const CronJobActionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  cronjobId: z.string().min(1, "Cronjob ID is required"),
});

export const CronJobTestRunSchema = z.object({
  url: z.string().url("Provide a valid url"),
});
