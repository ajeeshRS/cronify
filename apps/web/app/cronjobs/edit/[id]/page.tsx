"use client";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import {
  cronjobUpdateSchema,
  cronjobUpdateSchemaType,
} from "@/lib/validators/cronjob.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { roboto } from "../../../fonts/font";
import { fetchSingleCronjob } from "@/app/actions/cronActions";
import { LoaderIcon } from "lucide-react";
import EditForm from "@/components/cronjobs/EditForm";
import { CronJobOnly } from "@/types/cronjob.types";

export default function Page() {
  const router = useRouter();
  const session = useSession();
  const params = useParams();
  const id = params.id as string;

  const [fetching, setFetching] = useState(false);
  const [cronjob, setCronjob] = useState<CronJobOnly | undefined>();
  const [initialValues, setInitialValues] = useState({
    title: "",
    url: "",
    schedule: "10",
  });

  if (session.status !== "loading" && !session?.data?.user) {
    router.push("/login");
  }

  const form = useForm<cronjobUpdateSchemaType>({
    resolver: zodResolver(cronjobUpdateSchema),
  });

  const getCronjob = async () => {
    try {
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
    } catch (err) {
      const error = err as Error;
      console.error("Error fetching cronjob : ", error.message);
    } finally {
      setFetching(false);
    }
  };
  useEffect(() => {
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
      className={`${roboto.className} w-full h-[90vh] flex items-center flex-col justify-center md:px-20 px-5 py-10`}
    >
      <div className="md:w-3/6 w-full border p-10 rounded-3xl shadow-sm">
        <EditForm id={id} initialValue={initialValues} form={form} />
      </div>
    </div>
  );
}
