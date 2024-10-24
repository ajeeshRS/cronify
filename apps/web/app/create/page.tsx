"use client";
import { useForm } from "react-hook-form";
import { roboto } from "../fonts/font";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { API } from "../config/axios";
import { CustomSession } from "@/lib/auth";
import {
  cronjobCreateSchema,
  cronjobCreateSchemaType,
} from "@/lib/validators/cronjob.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AxiosError, AxiosResponse } from "axios";
import { Msg } from "@/types/common";

export default function Page() {
  const router = useRouter();
  const session = useSession();
  if (session.status !== "loading" && !session?.data?.user) {
    router.push("/login");
  }

  const custmSession = session.data as CustomSession;

  const form = useForm<cronjobCreateSchemaType>({
    resolver: zodResolver(cronjobCreateSchema),
    defaultValues: {
      title: "",
      url: "",
      schedule: "10",
    },
  });

  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  const handleSubmit = async (data: cronjobCreateSchemaType) => {
    try {
      setLoading(true);
      const res: AxiosResponse<Msg> = await API.post("/create", {
        userId: custmSession.user.id,
        title: data.title,
        url: data.url,
        schedule: data.schedule,
      });
      toast.success(res.data.message);
      form.reset();
    } catch (err: unknown) {
      const error = err as AxiosError<Msg>;
      toast.error("Failed to create cronjob!");
      console.error("Error creating cronjob: ", error.response?.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestRun = async (url: string) => {
    try {
      setTestLoading(true);
      const res: AxiosResponse = await API.post("/test-run", { url });
      toast.success(res.data.message);
      console.log(res);
    } catch (err: unknown) {
      const error = err as AxiosError<Msg>;
      toast.error(error.response?.data.message);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div
      className={`${roboto.className} w-full h-[90vh] flex items-center flex-col justify-center md:px-20 px-5 py-10`}
    >
      <div className="md:w-3/6 w-full border p-10 rounded-3xl shadow-sm">
        <Form {...form}>
          <h3 className="w-full text-center font-bold text-2xl">Add CronJob</h3>
          <form
            onSubmit={form.handleSubmit((data) => handleSubmit(data))}
            className="w-full"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="my-2">
                  <FormLabel>
                    Title <span className="text-red-500">*</span>
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
              name="url"
              render={({ field }) => (
                <FormItem className="my-2">
                  <FormLabel>
                    URL <span className="text-red-500">*</span>
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
              name="schedule"
              render={({ field }) => (
                <FormItem className="my-4">
                  <FormLabel>
                    Execution Schedule <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center py-2">
                      <span>Every</span>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-16 mx-2">
                          <SelectValue defaultValue="10" placeholder="10" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                          <SelectItem value="30">30</SelectItem>
                          <SelectItem value="60">60</SelectItem>
                        </SelectContent>
                      </Select>
                      <span>Minutes</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex items-center justify-end">
              <Button
                className="md:w-1/6 w-2/6 mt-3 rounded-3xl mx-1"
                onClick={form.handleSubmit((data) => handleTestRun(data.url))}
              >
                {testLoading ? "Testing..." : "Test run"}
              </Button>
              <Button className="md:w-1/6 w-2/6 mt-3 rounded-3xl" type="submit">
                {loading ? "Adding..." : "Add"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
