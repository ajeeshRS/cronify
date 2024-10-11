"use client";
import { useForm, useWatch } from "react-hook-form";
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
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { CustomSession } from "@/lib/auth";
import {
  cronjobUpdateSchema,
  cronjobUpdateSchemaType,
} from "@/lib/validators/cronjob.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { API } from "../../../config/axios";
import { roboto } from "../../../fonts/font";
import { fetchSingleCronjob } from "@/app/actions/cronActions";
import { LoaderIcon } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const session = useSession();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [cronjob, setCronjob] = useState<any>({});
  const [initialValues, setInitialValues] = useState({
    title: "",
    url: "",
    schedule: "10",
  });

  if (session.status !== "loading" && !session?.data?.user) {
    router.push("/login");
  }

  const custmSession = session.data as CustomSession;

  const form = useForm<cronjobUpdateSchemaType>({
    resolver: zodResolver(cronjobUpdateSchema),
  });

  const scheduledValueChange = useWatch({
    control: form.control,
    name: "schedule",
  });
  const urlValueChange = useWatch({
    control: form.control,
    name: "url",
  });
  const titleValueChange = useWatch({
    control: form.control,
    name: "title",
  });

  const isValuesChanged =
    scheduledValueChange !== initialValues.schedule ||
    urlValueChange !== initialValues.url ||
    titleValueChange !== initialValues.title;

  const handleSubmit = async (data: cronjobUpdateSchemaType) => {
    try {
      setLoading(true);
      const res = await API.put("/edit", {
        userId: custmSession.user.id,
        cronjobId: id,
        title: data.title,
        url: data.url,
        schedule: data.schedule,
      });
      router.push("/cronjobs");
      setLoading(false);
      toast.success(res.data.message);
    } catch (err: any) {
      setLoading(false);
      toast.success(err.response.data.message);
      console.error("Error in updating cronjob: ", err);
    }
  };

  const handleTestRun = async (url: string | undefined) => {
    try {
      setTestLoading(true);
      const res = await API.post("/test-run", { url });
      toast.success(res.data.message);
      setTestLoading(false);
      console.log(res);
    } catch (err: any) {
      setTestLoading(false);
      toast.error(err.response.data.message);
    }
  };

  useEffect(() => {
    const getCronjob = async () => {
      setFetching(true);
      const job = await fetchSingleCronjob(id);
      setCronjob(job);
      if (job) {
        form.reset({
          title: job.title,
          url: job.url,
          schedule: job.cronSchedule,
        });
        setInitialValues({
          title: job.title,
          url: job.url,
          schedule: job.cronSchedule,
        });
      }
      setFetching(false);
    };
    getCronjob();
  }, []);

  if (fetching && cronjob) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <LoaderIcon className="w-6 h-6 loader-icon" />
      </div>
    );
  }
  return (
    <div
      className={`${roboto.className} w-full h-[90vh] flex items-center flex-col justify-center px-20 py-10`}
    >
      <div className="w-3/6 border p-10 rounded-xl shadow-sm">
        <Form {...form}>
          <h3 className="w-full text-center font-bold text-2xl">
            Edit CronJob
          </h3>
          <form
            onSubmit={form.handleSubmit((data) => handleSubmit(data))}
            className="md:w-full w-5/6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="my-2">
                  <FormLabel>Title</FormLabel>
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
                  <FormLabel>URL</FormLabel>
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
                  <FormLabel>Execution Schedule</FormLabel>
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
                className="w-1/6 mt-3 rounded-3xl mx-1"
                onClick={form.handleSubmit((data) => handleTestRun(data.url))}
              >
                {testLoading ? "Testing..." : "Test run"}
              </Button>
              <Button
                className="w-1/6 mt-3 rounded-3xl"
                disabled={!isValuesChanged}
                type="submit"
              >
                {loading ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
