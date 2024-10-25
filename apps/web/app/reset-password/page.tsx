"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  ResetPasswordSchema,
  ResetPasswordSchemaType,
} from "@/lib/validators/auth.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { resetPassword } from "../actions/actions";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") as string;

  const form = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleResetPassword = async (newPassword: string) => {
    try {
      setLoading(true);
      await resetPassword(newPassword, token);
      toast.success("Password reset succesfully");
      router.push("/login");
    } catch (err) {
      console.error("Error resetting password");
      toast.error("Error resetting password.Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center">
      <div className="md:w-2/6 w-5/6 py-10 md:px-10 px-5 rounded-3xl flex flex-col items-center justify-center shadow-md">
        <h3 className="text-3xl font-bold py-4">Reset Password</h3>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) =>
              handleResetPassword(data.newPassword)
            )}
            className="md:w-full w-5/6 flex flex-col items-end"
          >
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="my-2 w-full">
                  <FormLabel>
                    New Password <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="my-2 w-full">
                  <FormLabel>
                    Confirm Password <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="my-4">
              {loading ? "Resetting.." : "Reset"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
