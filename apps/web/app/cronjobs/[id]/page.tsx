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

  const ITEMS_PER_PAGE = 4;

  const totalPages = Math.ceil(cronjob.totalEvents / ITEMS_PER_PAGE);
  const currentPage = parseInt(searchParams.get("page") ?? "1");

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`/cronjobs/${id}?${params.toString()}`);
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

  useEffect(() => {
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
          </div>
        </div>
        <p className="w-full text-start py-4">{cronjob.url}</p>
        <div className="w-full flex items-start justify-start flex-col py-10">
          <p className="font-medium text-sm"> Next Executions</p>
          <div className="w-full flex flex-col items-start justify-center mt-3">
            {nextEvents.length > 0 ? (
              nextEvents.map((event: any) => (
                <div className="w-full flex items-center justify-between border rounded-xl py-5 px-5 pr-10 my-1">
                  <div className="flex items-center">
                    <Clock className="w-6 h-6 rounded-full bg-orange-400 text-white border-none" />

                    <div className="flex flex-col items-start justify-center pl-4 text-sm">
                      <p>{`Cronjob execution: SCHEDULED`}</p>
                    </div>
                  </div>
                  {isSameDay(new Date(), new Date(event.time)) ? (
                    <p className="text-sm">
                      Scheduled Today at{" "}
                      {new Date(event.time).toLocaleTimeString("en-US", {
                        hour12: true,
                      })}
                    </p>
                  ) : (
                    <p className="text-sm">
                      Scheduled on {getDate(event.time)}
                    </p>
                  )}
                </div>
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
            {previousEvents.map((event: any) => (
              <div className="w-full flex items-center justify-between border rounded-xl py-5 px-5 pr-10 my-1">
                <div className="flex items-center">
                  {event.status === "SUCCESS" ? (
                    <Clock className="w-6 h-6 rounded-full bg-green-400 text-white border-none" />
                  ) : (
                    <Clock className="w-6 h-6 rounded-full bg-red-400 text-white border-none" />
                  )}
                  <div className="flex flex-col items-start justify-center pl-4 text-sm">
                    <p>{`Cronjob execution: ${event.status} (${event.status === "SUCCESS" ? "200 OK" : "500 NOT OK"} )`}</p>
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
                  {totalPages > 3 && <PaginationEllipsis />}
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
    </div>
  );
}
