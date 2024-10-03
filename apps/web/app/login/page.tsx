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
  SigninSchema,
  SigninSchemaType,
} from "@/lib/validators/auth.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
export default function Page() {
  const router = useRouter();
  const form = useForm<SigninSchemaType>({
    resolver: zodResolver(SigninSchema),
  });
  const [loading, setLoading] = useState(false);
  const session = useSession();
  if (session.status !== "loading" && session?.data?.user) {
    router.push("/dashboard");
  }

  async function onSubmit(values: SigninSchemaType) {
    const { email, password } = values;
    setLoading(true);
    try {
      const response: any = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      // console.log({ response });

      if (!response?.error) {
        router.push("/");
        router.refresh();
      }

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      setLoading(false);
      // Process response here
      console.log("Login Successful", response);
      toast.success("Logged in");
    } catch (error: any) {
      console.error("Login Failed:", error);
      toast.error("Login Failed");
      setLoading(false);
    }
  }
  return (
    <div className="w-full h-[90vh] flex items-start justify-center pt-10">
      <div className="md:w-2/6 w-5/6 p-10 rounded-3xl flex flex-col items-center justify-center shadow-md">
        <h3 className="text-3xl font-bold py-4">Login</h3>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="md:w-full w-5/6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="my-2">
                  <FormLabel>Email</FormLabel>
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="font-medium text-xs">Forgot password ?</p>
            <p className="text-sm font-medium w-full text-center py-3">
              Don&apos;t have an account ?{" "}
              <span className="font-semibold text-black underline">
                <Link href={"/signup"}>Signup</Link>
              </span>
            </p>
            <Button className="w-full mt-3 rounded-3xl" type="submit">
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
