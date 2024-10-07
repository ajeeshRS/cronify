"use client";
import { Button } from "@/components/ui/button";
import { Clock, Eye, Plus } from "lucide-react";
import { roboto } from "../fonts/font";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Page() {
  const router = useRouter();

  const session = useSession();
  if (session.status !== "loading" && !session?.data?.user) {
    router.push("/login");
  }
  return (
    <div
      className={`${roboto.className} w-full h-[90vh] flex items-start flex-col justify-start px-20 py-10`}
    >
      <h2 className="font-extrabold text-2xl">Good morning Deadpool!</h2>
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
          <p className="font-semibold text-3xl">2</p>
          <p className="text-base py-1">Enabled CronJobs</p>
        </div>
        <div className="w-1/6 h-28 rounded-xl bg-slate-50 shadow-md text-black flex items-center justify-center flex-col">
          <p className="font-semibold text-3xl">0</p>
          <p className="text-base py-1">Disabled CronJobs</p>
        </div>
        <div className="w-1/6 h-28 rounded-xl bg-slate-50 shadow-md text-black flex items-center justify-center flex-col">
          <p className="font-semibold text-3xl">1</p>
          <p className="text-base py-1"> Successful CronJobs</p>
        </div>
        <div className="w-1/6 h-28 rounded-xl bg-slate-50 shadow-md text-black flex items-center justify-center flex-col">
          <p className="font-semibold text-3xl">1</p>
          <p className="text-base py-1">Failed CronJobs</p>
        </div>
      </div>
      <div className="w-full flex items-start justify-start flex-col py-4">
        <p className="font-medium text-sm"> Recent Events</p>

        <div className="w-full flex flex-col items-start justify-center">
          <div className="w-full h-[1px] bg-gray-300 my-2"></div>

          <div className="w-full flex items-center justify-between">
            <div className="flex items-center w-3/6">
              <Clock className="w-6 h-6 rounded-full bg-green-400 text-white border-none" />
              <div className="flex flex-col items-start justify-center pl-4 text-sm">
                <p>Cronjob execution: Successful (200 OK)</p>
                <Link
                  href={"https://voxverse.onrender.com/user/get/latest-blogs"}
                  className="py-1 hover:underline"
                >
                  https://voxverse.onrender.com/user/get/latest-blogs
                </Link>
              </div>
            </div>
            <p className="w-2/6 flex items-center justify-start text-sm">
              Today at 5:50:22 PM
            </p>
            <Button size={"sm"} className="py-2 px-3">
              Show details
            </Button>
          </div>
          <div className="w-full h-[1px] bg-gray-300 my-2"></div>

          <div className="w-full flex items-center justify-between">
            <div className="flex items-center w-3/6">
              <Clock className="w-6 h-6 rounded-full bg-green-400 text-white border-none" />
              <div className="flex flex-col items-start justify-center pl-4 text-sm">
                <p>Cronjob execution: Successful (200 OK)</p>
                <p className="py-1">
                  {" "}
                  https://voxverse.onrender.com/user/get/latest-blogs
                </p>
              </div>
            </div>
            <p className="w-2/6 flex items-center justify-start text-sm">
              Today at 5:50:22 PM
            </p>
            <Button size={"sm"} className="py-2 px-3">
              Show details
            </Button>
          </div>
          <div className="w-full h-[1px] bg-gray-300 my-2"></div>

          <div className="w-full flex items-center justify-between">
            <div className="flex items-center w-3/6">
              <Clock className="w-6 h-6 rounded-full bg-red-400 text-white border-none" />
              <div className="flex flex-col items-start justify-center pl-4 text-sm">
                <p>Cronjob execution: Failed (404 NOT FOUND)</p>
                <p className="py-1">
                  {" "}
                  https://voxverse.onrender.com/user/get/latest-blogs
                </p>
              </div>
            </div>
            <p className="w-2/6 flex items-center justify-start text-sm">
              Today at 5:50:22 PM
            </p>
            <Button size={"sm"} className="py-2 px-3">
              Show details
            </Button>
          </div>
          <div className="w-full h-[1px] bg-gray-300 my-2"></div>

          <div className="w-full flex items-center justify-between">
            <div className="flex items-center w-3/6">
              <Clock className="w-6 h-6 rounded-full bg-green-400 text-white border-none" />
              <div className="flex flex-col items-start justify-center pl-4 text-sm">
                <p>Cronjob execution: Successful (200 OK)</p>
                <p className="py-1">
                  {" "}
                  https://voxverse.onrender.com/user/get/latest-blogs
                </p>
              </div>
            </div>
            <p className="w-2/6 flex items-center justify-start text-sm">
              Today at 5:50:22 PM
            </p>
            <Button size={"sm"} className="py-2 px-3">
              Show details
            </Button>
          </div>
          <div className="w-full h-[1px] bg-gray-300 my-2"></div>

          <div className="w-full flex items-center justify-between">
            <div className="flex items-center w-3/6">
              <Clock className="w-6 h-6 rounded-full bg-green-400 text-white border-none" />
              <div className="flex flex-col items-start justify-center pl-4 text-sm">
                <p>Cronjob execution: Successful (200 OK)</p>
                <p className="py-1">
                  {" "}
                  https://voxverse.onrender.com/user/get/latest-blogs
                </p>
              </div>
            </div>
            <p className="w-2/6 flex items-center justify-start text-sm">
              Today at 5:50:22 PM
            </p>
            <Button size={"sm"} className="py-2 px-3">
              Show details
            </Button>
          </div>

          <div className="w-full h-[1px] bg-gray-300 my-2"></div>
        </div>
      </div>
    </div>
  );
}
