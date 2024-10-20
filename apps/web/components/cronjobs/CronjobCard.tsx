"use client";
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
import Link from "next/link";
import {
  AlarmClockCheck,
  AlarmClockOff,
  EllipsisVertical,
  LoaderIcon,
  Pen,
  Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useState } from "react";
import { API } from "@/app/config/axios";
import { useSession } from "next-auth/react";
import { CustomSession } from "@/lib/auth";
import { toast } from "sonner";
import { CronJobOnly } from "@/types/cronjob.types";

interface Props {
  job: CronJobOnly;
  getCronJobs: () => void;
}

export default function CronjobCard({ job, getCronJobs }: Props) {
  const { data: session, status } = useSession();
  const customSession = session as CustomSession;

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const router = useRouter();

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
  return (
    <div
      key={job.id}
      className="w-full flex items-center justify-between my-4 border md:p-5 p-2 rounded-lg"
    >
      <div className="flex items-center md:w-2/6 w-5/6">
        <div className="flex flex-col items-start justify-center md:pl-4 pl-2 text-sm">
          <Link
            href={`/cronjobs/${job.id}`}
            className="text-lg hover:underline"
          >
            {job.title?.toUpperCase()}
          </Link>
          <Link
            href={job.url}
            className="py-1 hover:underline w-5/6  flex items-center justify-start text-xs md:hidden text-wrap"
          >
            {job.url}
          </Link>
        </div>
      </div>
      <Link
        href={job.url}
        className="py-1 hover:underline w-2/6 md:flex items-center justify-start text-sm  hidden"
      >
        {job.url}
      </Link>

      <p className="w-2/6 md:flex hidden items-center justify-center text-sm">
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
          <DropdownMenuItem
            className="cursor-pointer flex items-center"
            onClick={() => router.push(`/cronjobs/edit/${job.id}`)}
          >
            <>
              <Pen className="w-3 h-3 mr-2" />
              <p>Edit</p>
            </>
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer flex items-center hover:!text-white hover:!bg-red-500 ">
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
                    This action cannot be undone. This will permanently delete
                    your cronjob and remove cronjob data from our servers.
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
  );
}
