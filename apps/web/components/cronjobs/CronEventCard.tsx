import { formatDate, isSameDay } from "@/lib/utils";
import { PreviousEventType } from "@/types/cronjob.types";
import { Clock } from "lucide-react";

interface Props {
  event: PreviousEventType;
}

export default function CronEventCard({ event }: Props) {
  return (
    <div className="w-full flex md:flex-row flex-col items-center justify-between border rounded-xl py-5 px-3 md:pr-10 my-1">
      <div className="w-full flex items-center justify-start">
        <Clock
          className={`w-6 h-6 rounded-full ${event.status === "PENDING" ? "bg-orange-400" : event.status === "SUCCESS" ? "bg-green-400" : "bg-red-400"}  text-white border-none`}
        />
        <div className="flex flex-col items-start justify-center pl-4 text-sm">
          <p>{`Cronjob execution: ${event.status} (${event.status === "PENDING" ? "SCHEDULED" : event.status === "SUCCESS" ? "200 OK" : "NOT OK"} )`}</p>
        </div>
      </div>
      {isSameDay(new Date(), new Date(event.time)) ? (
        event.status === "PENDING" ? (
          <p className="md:text-sm text-xs py-2 md:w-3/6 w-full text-end">
            Scheduled Today at{" "}
            {new Date(event.time).toLocaleTimeString("en-US", {
              hour12: true,
            })}
          </p>
        ) : (
          <p className="md:text-sm text-xs py-2 md:w-3/6 w-full text-end">
            Executed Today at{" "}
            {new Date(event.time).toLocaleTimeString("en-US", {
              hour12: true,
            })}
          </p>
        )
      ) : (
        <p className="md:text-sm text-xs py-2 md:w-3/6 w-full text-end">
          Executed on {formatDate(event.time)}
        </p>
      )}
    </div>
  );
}
