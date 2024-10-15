"use client";
import { Button } from "@/components/ui/button";
import { Clock, Eye, Plus } from "lucide-react";
import { roboto } from "../fonts/font";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { GreetingMessage } from "@/components/Greetings";
import { useEffect, useState } from "react";
import { CustomSession } from "@/lib/auth";
import { fetchAllEvents, fetchCronjobStats } from "../actions/cronActions";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Page() {
  const router = useRouter();
  const [enabledJobCount, setEnabledJobCount] = useState(0);
  const [disabledJobCount, setDisabledJobCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [events, setEvents] = useState<any>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  const customSession = session as CustomSession;

  if (status !== "loading" && !session?.user) {
    router.push("/login");
  }

  useEffect(() => {
    const getCronjobStats = async () => {
      try {
        const result = await fetchCronjobStats(customSession.user.id);
        setEnabledJobCount(result.activeCount);
        setDisabledJobCount(result.inActiveCount);
        setFailedCount(result.failedCount);
      } catch (err) {
        console.log("Error in getting cronjob Stats : ", err);
      }
    };
    getCronjobStats();
  }, []);

  const ITEMS_PER_PAGE = 5;

  const totalPages = Math.ceil(totalEvents / ITEMS_PER_PAGE);
  const currentPage = parseInt(searchParams.get("page") ?? "1");

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`/dashboard?${params.toString()}`);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    if (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    ) {
      return true;
    } else {
      return false;
    }
  };

  const getDate = (date: Date) => {
    const dateStr = new Date(date).toDateString();
    const timeStr = new Date(date).toLocaleTimeString("en-US", {
      hour12: true,
    });
    return `${dateStr} - ${timeStr}`;
  };

  const getEvents = async () => {
    // setFetching(true);
    if (customSession) {
      const result = await fetchAllEvents(
        customSession.user.id,
        currentPage,
        ITEMS_PER_PAGE
      );
      if (result) {
        setEvents(result.events);
        setTotalEvents(result.totalEvents)
      }
    }
  };

  useEffect(() => {
    getEvents();
  }, [currentPage, customSession]);

  return (
    <div
      className={`${roboto.className} w-full min-h-[90vh] flex items-start flex-col justify-start px-20 py-10`}
    >
      <h2 className="font-extrabold text-2xl">
        <GreetingMessage username={session?.user?.name as string} />
      </h2>
      <div className="w-full h-[1px] bg-gray-300 my-2"></div>
      <div className="py-4 w-full flex justify-between">
        <h3 className="font-semibold text-xl">Dashboard</h3>
        <div className="flex items-center">
          <Button
            onClick={() => router.push("/cronjobs")}
            className={`bg-[#DAF872] font-normal text-sm py-2 px-3 rounded-lg shadow-none text-inherit hover:bg-white border-[#DAF872] border hover:border-[#000] hover:text-[#000] flex items-center mr-2`}
          >
            <Eye className="w-5 h-5 pr-1" /> View cronjobs
          </Button>
          <Button
            onClick={() => router.push("/create")}
            className={`bg-[#DAF872] font-normal text-sm py-2 px-3 rounded-lg shadow-none text-inherit hover:bg-white border-[#DAF872] border hover:border-[#000] hover:text-[#000] flex items-center`}
          >
            <Plus className="w-5 h-5 pr-1" /> Create cronjob
          </Button>
        </div>
      </div>
      <div className="w-full flex items-center justify-between py-4">
        <div className="w-1/6 min-h-28 rounded-xl bg-slate-50 shadow-md text-black flex items-center justify-center flex-col">
          <p className="font-semibold text-3xl">{enabledJobCount}</p>
          <p className="text-base py-1">Enabled CronJobs</p>
        </div>
        <div className="w-1/6 h-28 rounded-xl bg-slate-50 shadow-md text-black flex items-center justify-center flex-col">
          <p className="font-semibold text-3xl">{disabledJobCount}</p>
          <p className="text-base py-1">Disabled CronJobs</p>
        </div>
        <div className="w-1/6 h-28 rounded-xl bg-slate-50 shadow-md text-black flex items-center justify-center flex-col">
          <p className="font-semibold text-3xl">
            {enabledJobCount - failedCount}
          </p>
          <p className="text-base py-1"> Successful CronJobs</p>
        </div>
        <div className="w-1/6 h-28 rounded-xl bg-slate-50 shadow-md text-black flex items-center justify-center flex-col">
          <p className="font-semibold text-3xl">{failedCount}</p>
          <p className="text-base py-1">Failed CronJobs</p>
        </div>
      </div>
      <div className="w-full h-fit flex items-start justify-start flex-col py-10">
        <p className="font-medium text-sm"> Recent Events</p>
        <div className="w-full flex flex-col items-start justify-center my-3">
          {events.map((event: any) => (
            <div className="w-full flex items-center justify-between border rounded-xl py-5 px-5 pr-10 my-1">
              <div className="flex items-center">
                {event.status === "SUCCESS" ? (
                  <Clock className="w-6 h-6 rounded-full bg-green-400 text-white border-none" />
                ) : (
                  <Clock className="w-6 h-6 rounded-full bg-red-400 text-white border-none" />
                )}
                <div className="flex flex-col items-start justify-center pl-4 text-sm">
                  <p>{`Cronjob execution: ${event.status} (${event.status === "SUCCESS" ? "200 OK" : "500 NOT OK"} )`}</p>
                  <p>{event.cronJobUrl}</p>
                </div>
              </div>
              {isSameDay(new Date(), new Date(event.time)) ? (
                <p className="text-sm">
                  Executed Today at{" "}
                  {new Date(event.time).toLocaleTimeString("en-US", {
                    hour12: true,
                  })}
                </p>
              ) : (
                <p className="text-sm">Executed on {getDate(event.time)}</p>
              )}
            </div>
          ))}
          {totalPages > 0 && (
            <Pagination className="mt-10">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={() =>
                      handlePageChange(Math.max(currentPage - 1, 1))
                    }
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === index + 1}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {/* {totalPages > 3 && <PaginationEllipsis />} */}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={() =>
                      handlePageChange(Math.min(currentPage + 1, totalPages))
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
}
