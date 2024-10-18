"use client";
import { Button } from "@/components/ui/button";
import { Eye, Plus } from "lucide-react";
import { roboto } from "../fonts/font";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { GreetingMessage } from "@/components/dashboard/Greetings";
import { useEffect, useState } from "react";
import { CustomSession } from "@/lib/auth";
import { fetchAllEvents, fetchCronjobStats } from "../actions/cronActions";
import DashboardStats from "@/components/dashboard/DashboardStats";
import EventCard from "@/components/dashboard/EventCard";
import PaginationComponent from "@/components/PaginationComponent";

export default function Page() {
  const router = useRouter();
  const [enabledJobCount, setEnabledJobCount] = useState(0);
  const [disabledJobCount, setDisabledJobCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [events, setEvents] = useState<any>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const searchParams = useSearchParams();

  const { data: session, status } = useSession();
  const customSession = session as CustomSession;

  if (status !== "loading" && !session?.user) {
    router.push("/");
  }

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(totalEvents / ITEMS_PER_PAGE);
  const currentPage = parseInt(searchParams.get("page") ?? "1");

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`/dashboard?${params.toString()}`);
  };

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

  const getEvents = async () => {
    if (session) {
      const result = await fetchAllEvents(
        customSession.user.id,
        currentPage,
        ITEMS_PER_PAGE
      );
      if (result) {
        setEvents(result.events);
        setTotalEvents(result.totalEvents);
      }
    }
  };

  useEffect(() => {
    getCronjobStats();
  }, []);

  useEffect(() => {
    getEvents();
  }, [currentPage, session]);

  return (
    <div
      className={`${roboto.className} w-full min-h-[90vh] flex items-start flex-col justify-start md:px-20 px-5 py-10`}
    >
      <h2 className="font-extrabold text-2xl">
        <GreetingMessage username={session?.user?.name || "User"} />
      </h2>
      <div className="w-full h-[1px] bg-gray-300 my-2"></div>
      <div className="py-4 w-full flex justify-between">
        <h3 className="font-semibold text-xl">Dashboard</h3>
        <div className="flex items-center">
          <Button
            onClick={() => router.push("/cronjobs")}
            className={`bg-[#DAF872] font-normal text-sm py-2 px-3 rounded-lg shadow-none text-inherit hover:bg-white border-[#DAF872] border hover:border-[#000] hover:text-[#000] flex items-center mr-2`}
          >
            <Eye className="w-5 h-5 pr-1" />
            <p className="md:block hidden"> View cronjobs</p>
            <p className="md:hidden block">View</p>
          </Button>
          <Button
            onClick={() => router.push("/create")}
            className={`bg-[#DAF872] font-normal md:text-sm text-xs py-2 px-3 rounded-lg shadow-none text-inherit hover:bg-white border-[#DAF872] border hover:border-[#000] hover:text-[#000] flex items-center`}
          >
            <Plus className="w-5 h-5 pr-1" />
            <p className="md:block hidden">Create cronjob</p>
            <p className="md:hidden block">Create</p>
          </Button>
        </div>
      </div>
      <DashboardStats
        enabledJobCount={enabledJobCount}
        disabledJobCount={disabledJobCount}
        failedCount={failedCount}
      />
      <div className="w-full h-fit flex items-start justify-start flex-col py-10">
        <p className="font-medium text-sm"> Recent Events</p>
        <div className="w-full flex flex-col items-start justify-center my-3">
          {events.length > 0 ? (
            events.map((event: any, i: number) => (
              <EventCard key={i} event={event} />
            ))
          ) : (
            <p className="text-sm text-gray-500 flex items-center my-10">
              Recent events will show here.
            </p>
          )}

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
  );
}
