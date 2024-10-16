import { formatDate, isSameDay } from "@/lib/utils";
import { Clock } from "lucide-react";

export default function EventCard({ event }: any) {
  return (
    <div className="w-full flex items-center justify-between border rounded-xl py-5 px-5 pr-10 my-1">
      <div className="flex items-center">
        <Clock
          className={`w-6 h-6 rounded-full ${event.status === "SUCCESS" ? "bg-green-400" : "bg-red-400"} text-white border-none`}
        />

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
        <p className="text-sm">Executed on {formatDate(event.time)}</p>
      )}
    </div>
  );
}
