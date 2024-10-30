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
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { useState } from "react";
import { Msg } from "@/types/common";
import Image from "next/image";
import googleIcon from "../../public/google.svg";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
export default function Page() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SignupSchemaType>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignupSchemaType) {
    try {
      setLoading(true);
      const res = await axios.post("/api/auth/signup", values);
      form.reset();
      router.push("/login");
      toast.success(res.data.message);
    } catch (err: unknown) {
      const error = err as AxiosError<Msg>;

      if (error.response?.status === 409) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Couldn't signup");
      }

      console.error("Signup Failed:", error.response?.data.message);
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    signIn("google", { redirect: false })
      .then(() => {
        router.push("/dashboard");
      })
      .catch(() => {
        toast.error("Failed up signup");
      });
  };

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
            <Button className="w-full mt-3 h-10 rounded-3xl" type="submit">
              {loading ? "Creating..." : "Signup"}
            </Button>
          </form>
        </Form>
        <Button
          className="bg-white h-10 hover:bg-gray-50 text-black md:w-full w-5/6 mt-3 rounded-3xl "
          onClick={handleGoogleLogin}
        >
          <Image className="w-5 h-5 mr-2" src={googleIcon} alt="google-icon" />
          <span className={`font-medium`}>Signup with Google</span>
        </Button>
      </div>
    </div>
  );
}
