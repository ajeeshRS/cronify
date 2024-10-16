"use client";
import {
  fetchCronjobWithEvents,
  fetchNextExectutions,
} from "@/app/actions/cronActions";
import { roboto } from "@/app/fonts/font";
import { Clock, LoaderIcon } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CustomSession } from "@/lib/auth";
import { API } from "@/app/config/axios";
import { toast } from "sonner";
import CronEventCard from "@/components/cronjobs/CronEventCard";
import PaginationComponent from "@/components/PaginationComponent";

export default function Page() {
  const [fetching, setFetching] = useState(false);
  const [cronjob, setCronjob] = useState<any>({});
  const [previousEvents, setPreviousEvents] = useState<any>([]);
  const [nextEvents, setNextEvents] = useState<any>([]);
  const params = useParams();
  const id = params.id as string;
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const customSession = session as CustomSession;
  const ITEMS_PER_PAGE = 4;

  const totalPages = Math.ceil(cronjob.totalEvents / ITEMS_PER_PAGE);
  const currentPage = parseInt(searchParams.get("page") ?? "1");

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`/cronjobs/${id}?${params.toString()}`);
  };

  const enableCronjob = async (cronjobId: string) => {
    if (status === "authenticated" && customSession?.user?.id) {
      const toastId = toast.loading("Enabling..");
      try {
        const res = await API.put(`/enable`, {
          cronjobId,
          userId: customSession.user.id,
        });
        toast.success("Enabled successfully", {
          id: toastId,
        });
        getCronjob();
      } catch (err) {
        toast.error("Enabling failed", {
          id: toastId,
        });
        console.error("Error in enabling job");
      }
    }
  };

  const disableCronjob = async (cronjobId: string) => {
    if (status === "authenticated" && customSession?.user?.id) {
      const toastId = toast.loading("Disabling..");
      try {
        const res = await API.put(`/disable`, {
          cronjobId,
          userId: customSession.user.id,
        });
        toast.success("Disabled successfully", {
          id: toastId,
        });
        getCronjob();
      } catch (err) {
        toast.error("Disabling failed", {
          id: toastId,
        });
        console.error("Error in disabling job");
      }
    }
  };

  const getCronjob = async () => {
    setFetching(true);
    const job = await fetchCronjobWithEvents(id, currentPage, ITEMS_PER_PAGE);
    const nxtExecutions = await fetchNextExectutions(id);
    setFetching(false);
    console.log(job);
    setNextEvents(nxtExecutions);
    setCronjob(job);
    if (job) {
      const prevEvents = job.previousEvents.filter(
        (event) => event.status !== "PENDING"
      );
      console.log("preveve:", prevEvents);
      setPreviousEvents(prevEvents);
    }
  };

  useEffect(() => {
    getCronjob();
  }, [id, currentPage]);

  if (status === "loading" || fetching) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <LoaderIcon className="w-6 h-6 loader-icon" />
      </div>
    );
  }

  return (
    <div
      className={`${roboto.className} w-full min-h-[90vh] flex items-center flex-col justify-center px-20 py-10`}
    >
      <div className="w-full rounded-2xl h-full border p-10 shadow-sm">
        <div className="w-full flex items-center justify-between">
          <h3 className="font-bold">{cronjob.title?.toUpperCase()}</h3>
          <div className="flex items-center">
            <p className="text-white p-2 rounded-2xl text-sm mr-6 bg-black">
              Every {cronjob.cronSchedule} minutes
            </p>
            {cronjob.active === true ? (
              <p className="mr-3 bg-[#DAF872] p-2 text-black text-sm rounded-2xl">
                Active
              </p>
            ) : (
              <p className="mr-3 bg-red-500 p-2 text-white text-sm rounded-2xl">
                InActive
              </p>
            )}
            {cronjob.active === true ? (
              <Button
                className="rounded-2xl"
                onClick={() => disableCronjob(cronjob.id)}
              >
                Disable
              </Button>
            ) : (
              <Button
                className="rounded-2xl"
                onClick={() => enableCronjob(cronjob.id)}
              >
                Enable
              </Button>
            )}
          </div>
        </div>
        <p className="w-full text-start py-4">{cronjob.url}</p>
        <div className="w-full flex items-start justify-start flex-col py-10">
          <p className="font-medium text-sm"> Next Executions</p>
          <div className="w-full flex flex-col items-start justify-center mt-3">
            {nextEvents.length > 0 ? (
              nextEvents.map((event: any, i: number) => (
                <CronEventCard key={i} event={event} />
              ))
            ) : (
              <p className="text-sm text-gray-400 py-3">
                No scheduled executions !
              </p>
            )}
          </div>
        </div>
        <div className="w-full flex items-start justify-start flex-col py-10">
          <p className="font-medium text-sm"> Recent Events</p>
          <div className="w-full flex flex-col items-start justify-center my-3">
            {previousEvents.map((event: any, i: number) => (
              <CronEventCard key={i} event={event} />
            ))}
            {totalPages > 0 && (
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
