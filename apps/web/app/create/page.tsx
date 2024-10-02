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
import Link from "next/link";
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

export default function Page() {
  const router = useRouter();
  const { data: session } = useSession();
  if (!session?.user) {
    router.push("/login");
  }

  const form = useForm();
  const [loading, setLoading] = useState(false);
  return (
    <div
      className={`${roboto.className} w-full h-[90vh] flex items-center flex-col justify-center px-20 py-10`}
    >
      <div className="w-3/6 border p-10 rounded-xl shadow-sm">
        <Form {...form}>
          <h3 className="w-full text-center font-bold text-2xl">Add CronJob</h3>
          <form
            onSubmit={form.handleSubmit((data) => console.log(data))}
            className="md:w-full w-5/6"
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
                          <SelectValue defaultValue={10} placeholder="10" />
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
              <Button className="w-1/6 mt-3 rounded-3xl mx-1">Test run</Button>
              <Button className="w-1/6 mt-3 rounded-3xl" type="submit">
                {loading ? "Adding..." : "Add"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
