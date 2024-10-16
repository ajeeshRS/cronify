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

export default function Page() {
  const router = useRouter();
  const session = useSession();
  const params = useParams();
  const id = params.id as string;

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

  const form = useForm<cronjobUpdateSchemaType>({
    resolver: zodResolver(cronjobUpdateSchema),
  });

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
        <EditForm id={id} initialValue={initialValues} form={form} />
      </div>
    </div>
  );
}
