"use client";
import { Button } from "@/components/ui/button";
import { roboto } from "../fonts/font";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Loader from "../../components/loader";
import { fetchCronJobs } from "../actions/cronActions";
import { CustomSession } from "@/lib/auth";

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [cronjobs, setCronjobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const customSession = session as CustomSession;

  useEffect(() => {
    const getCronJobs = async () => {
      if (status === "authenticated" && customSession?.user?.id) {
        try {
          setLoading(true);
          const data = await fetchCronJobs(); // Action fetches cron jobs for the logged-in user
          setCronjobs(data);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching cron jobs:", error);
          setLoading(false);
        } finally {
          setLoading(false);
        }
      }
    };

    getCronJobs();
  }, [session, status]);

  if (loading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div
      className={`${roboto.className} w-full h-[90vh] flex items-start flex-col justify-start px-20 py-10`}
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
      <div className="w-full flex flex-col"></div>
    </div>
  );
}
