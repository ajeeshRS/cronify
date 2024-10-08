"use client";
import { Button } from "@/components/ui/button";
import { roboto } from "../fonts/font";
import { useRouter } from "next/navigation";
import {
  AlarmClockCheck,
  AlarmClockOff,
  Delete,
  EllipsisVertical,
  Menu,
  Pen,
  Plus,
  Trash,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Loader from "../../components/loader";
import { fetchCronJobs } from "../actions/cronActions";
import { CustomSession } from "@/lib/auth";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      <div className="w-full flex flex-col">
        <div className="w-full h-[1px] bg-slate-100"></div>
        {cronjobs.map((job) => (
          <>
            <div className="w-full flex items-center justify-between my-4">
              <div className="flex items-center w-2/6">
                <div className="flex flex-col items-start justify-center pl-4 text-sm">
                  <p className="text-lg">{job.title}</p>
                </div>
              </div>
              <Link
                href={job.url}
                className="py-1 hover:underline w-2/6 flex items-center justify-start text-sm"
              >
                {job.url}
              </Link>

              <p className="w-2/6 flex items-center justify-center text-sm">
                {job.active ? "Enabled" : "Disabled"}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none focus:border-none hover:bg-slate-100 p-2 rounded-lg">
                  <EllipsisVertical className="w-5 h-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="cursor-pointer flex items-center">
                    {job.active ? (
                      <>
                        <AlarmClockOff className="w-3 h-3 mr-2" />
                        <p>Disable</p>
                      </>
                    ) : (
                      <>
                        <AlarmClockCheck className="w-3 h-3 mr-2" />
                        <p>Enable</p>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer flex items-center">
                    <Pen className="w-3 h-3 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer flex items-center">
                    <Trash className="w-3 h-3 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="w-full h-[1px] bg-slate-100"></div>
          </>
        ))}
      </div>
    </div>
  );
}
