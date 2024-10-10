"use client";
import { Button } from "@/components/ui/button";
import { roboto } from "../fonts/font";
import { useRouter } from "next/navigation";
import {
  AlarmClockCheck,
  AlarmClockOff,
  EllipsisVertical,
  LoaderIcon,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { API } from "../config/axios";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [cronjobs, setCronjobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown open/close

  const customSession = session as CustomSession;

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
        getCronJobs();
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
        getCronJobs();
      } catch (err) {
        toast.error("Disabling failed", {
          id: toastId,
        });
        console.error("Error in disabling job");
      }
    }
  };

  const handleDelete = async (cronjobId: string) => {
    try {
      setDeleteLoading(true);
      const res = await API.delete("/delete", {
        params: {
          cronjobId,
          userId: customSession.user.id,
        },
      });
      console.log(res.data);
      setDeleteLoading(false);
      setDialogOpen(false);
      getCronJobs();
      toast.success("Cron job deleted succesfully");
    } catch (err) {
      setDialogOpen(false);
      setDeleteLoading(false);
      console.error("Error in deleting cronjob : ", err);
    }
  };

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

  useEffect(() => {
    getCronJobs();
  }, [session, status]);

  if (loading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <LoaderIcon className="w-6 h-6 loader-icon" />
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
        {cronjobs.length === 0 && (
          <div className="w-full h-[50vh] flex items-center justify-center">
            <p className="text-sm text-gray-400">
              It looks like you don&apos;t have any cron jobs yet. Create one to
              see it displayed here!
            </p>
          </div>
        )}
        {cronjobs.map((job) => (
          <>
            <div
              key={job.id}
              className="w-full flex items-center justify-between my-4"
            >
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
                  {job.active ? (
                    <DropdownMenuItem
                      className="cursor-pointer flex items-center"
                      onClick={() => disableCronjob(job.id)}
                    >
                      <>
                        <AlarmClockOff className="w-3 h-3 mr-2" />
                        <p>Disable</p>
                      </>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      className="cursor-pointer flex items-center"
                      onClick={() => enableCronjob(job.id)}
                    >
                      <>
                        <AlarmClockCheck className="w-3 h-3 mr-2" />
                        <p>Enable</p>
                      </>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="cursor-pointer flex items-center">
                    <Pen className="w-3 h-3 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer flex items-center">
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger
                        className="flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Trash className="w-3 h-3 mr-2" /> Delete
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader className="font-sans">
                          <DialogTitle>Are you sure?</DialogTitle>
                          <DialogDescription className="py-2">
                            This action cannot be undone. This will permanently
                            delete your cronjob and remove cronjob data from our
                            servers.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button
                            variant={"destructive"}
                            onClick={(e) => {
                              e.preventDefault();
                              handleDelete(job.id);
                            }}
                          >
                            {deleteLoading ? (
                              <>
                                Deleting
                                <LoaderIcon className="w-4 h-4 loader-icon ml-2" />
                              </>
                            ) : (
                              "Confirm"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
