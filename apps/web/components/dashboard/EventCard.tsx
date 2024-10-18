import { formatDate, isSameDay } from "@/lib/utils";
import { Clock } from "lucide-react";

export default function EventCard({ event }: any) {
  return (
    <div className="w-full md:flex flex-col items-center justify-between border rounded-xl py-5 px-5 my-1">
      <div className="w-full flex items-center  pr-10 ">
        <Clock
          className={`w-6 h-6 rounded-full ${event.status === "SUCCESS" ? "bg-green-400" : "bg-red-400"} text-white border-none`}
        />

        <div className="w-5/6 flex flex-col items-start justify-center pl-4 text-sm">
          <p className="text-nowrap">{`Cronjob execution: ${event.status} (${event.status === "SUCCESS" ? "200 OK" : "500 NOT OK"} )`}</p>
          <p className="text-wrap md:text-sm text-xs py-2">{event.cronJobUrl}</p>
        </div>
      </div>
      {isSameDay(new Date(), new Date(event.time)) ? (
        <p className="text-sm w-full text-end">
          Executed Today at{" "}
          {new Date(event.time).toLocaleTimeString("en-US", {
            hour12: true,
          })}
        </p>
      ) : (
        <p className="text-xs w-full text-end py-2">Executed on {formatDate(event.time)}</p>
      )}
    </div>
  );
}
