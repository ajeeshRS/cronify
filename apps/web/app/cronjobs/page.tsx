"use client";
import { Button } from "@/components/ui/button";
import { roboto } from "../fonts/font";
import { useRouter } from "next/navigation";
import { LoaderIcon, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchCronJobs } from "../actions/cronActions";
import { CustomSession } from "@/lib/auth";
import CronjobCard from "@/components/cronjobs/CronjobCard";
import { CronJobOnly } from "@/types/cronjob.types";

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [cronjobs, setCronjobs] = useState<CronJobOnly[]>([]);
  const [loading, setLoading] = useState(false);

  const customSession = session as CustomSession;

  const getCronJobs = async () => {
    if (status === "authenticated" && customSession?.user?.id) {
      try {
        setLoading(true);
        const data = await fetchCronJobs();
        setCronjobs(data);
        setLoading(false);
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Error fetching cron jobs:", error.message);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    getCronJobs();
  }, [session, status]);

  if (loading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <LoaderIcon className="w-6 h-6 loader-icon" />
      </div>
    );
  }

  return (
    <div
      className={`${roboto.className} w-full h-[90vh] flex items-start flex-col justify-start md:px-20 px-5 py-10`}
    >
      <div className="py-4 w-full flex justify-between">
        <h3 className="font-semibold text-xl">Cronjobs</h3>
        <div className="flex items-center">
          <Button
            onClick={() => router.push("/create")}
            className={`bg-[#DAF872] font-normal text-sm py-2 px-3 rounded-lg shadow-none text-inherit hover:bg-white border-[#DAF872] border hover:border-[#000] hover:text-[#000] flex items-center`}
          >
            <Plus className="w-5 h-5 pr-1" /> Create cronjob
          </Button>
        </div>
      </div>
      <div className="w-full flex flex-col">
        {cronjobs.length === 0 && (
          <div className="w-full h-[50vh] flex items-center justify-center">
            <p className="text-sm text-gray-400">
              It looks like you don&apos;t have any cron jobs yet. Create one to
              see it displayed here!
            </p>
          </div>
        )}
        {cronjobs.map((job) => (
          <>
            <CronjobCard job={job} getCronJobs={getCronJobs} />
          </>
        ))}
      </div>
    </div>
  );
}
