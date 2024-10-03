import { z } from "zod";

export const cronjobCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Provide a valid url"),
  schedule: z.string().min(1, "Schedule is required"),
});

export type cronjobCreateSchemaType = z.infer<typeof cronjobCreateSchema>;
