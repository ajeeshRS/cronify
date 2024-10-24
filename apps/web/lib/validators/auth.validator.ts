import { z } from "zod";

export const SignupSchema = z.object({
  email: z.string().email("Invalid Email").min(1, "Email is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type SignupSchemaType = z.infer<typeof SignupSchema>;

export const SigninSchema = z.object({
  email: z.string().email("Invalid Email").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export type SigninSchemaType = z.infer<typeof SigninSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "current password is required"),
    newPassword: z.string().min(1, "current password is required"),
    confirmPassword: z.string().min(1, "current password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords doesn't match",
    path: ["confirmPassword"],
  });
export type ChangePasswordSchemaType = z.infer<typeof ChangePasswordSchema>;
