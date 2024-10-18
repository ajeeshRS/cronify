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
  SignupSchema,
  SignupSchemaType,
} from "@/lib/validators/auth.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import { useState } from "react";
export default function Page() {
  const form = useForm<SignupSchemaType>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });
  const [loading, setLoading] = useState(false);

  async function onSubmit(values: SignupSchemaType) {
    try {
      setLoading(true);
      const res = await axios.post("/api/auth/signup", values);

      if (!res) {
        throw new Error("Network response was not ok");
      }
      setLoading(false);
      toast.success("Account created");
    } catch (error) {
      setLoading(false);
      console.error("Registration Failed:", error);
      toast.error("Couldn't signup");
    }
  }
  return (
    <div className="w-full h-[90vh] flex items-start justify-center pt-10">
      <div className="md:w-2/6 w-5/6 py-10 md:px-10 px-5 rounded-3xl flex flex-col items-center justify-center shadow-md">
        <h3 className="text-3xl font-bold py-4">Signup</h3>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="md:w-full w-5/6"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="my-2">
                  <FormLabel>
                    Username <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="my-2">
                  <FormLabel>
                    Email <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="my-2">
                  <FormLabel>
                    Password <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-sm font-medium w-full text-center py-3">
              Already have an account ?{" "}
              <span className="font-semibold text-black hover:underline">
                <Link href={"/login"}>Login</Link>
              </span>
            </p>
            <Button className="w-full mt-3 rounded-3xl" type="submit">
              {loading ? "Creating..." : "Signup"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
