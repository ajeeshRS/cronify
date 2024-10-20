"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
import { useState } from "react";
import { deleteUserAccount } from "@/app/actions/cronActions";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserInfo } from "@/types/user.types";

interface Props {
  user: UserInfo;
}

export default function DeleteAccountDialog({ user }: Props) {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const router = useRouter();
  const handleDeleteAccount = async () => {
    try {
      if (user.username !== userInput) {
        return toast.error("Wrong input!");
      }
      setDeleteLoading(true);

      await deleteUserAccount();
      toast.success("Account deleted !");

      await signOut();
      router.push("/");
    } catch (err) {
      const error = err as Error;
      toast.error("An error occured while deleting account. Please try again");
      console.error(
        `Error in deleting user Acccount ${user.email} :`,
        error.message
      );
    } finally {
      setDeleteLoading(false);
    }
  };
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger
        className="flex items-center"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Button variant={"destructive"} className="mr-3">
          <Trash className="mr-2 w-4 h-4" /> Delete Account
        </Button>
      </DialogTrigger>
      {confirmed ? (
        <DialogContent>
          <DialogHeader className="font-sans">
            <DialogTitle className="font-normal py-3">
              To confirm, type
              <span className="font-bold underline px-2">{user.username}</span>
              in the box below
            </DialogTitle>
            <Input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
          </DialogHeader>
          <DialogFooter>
            <Button
              variant={"destructive"}
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
            >
              {deleteLoading ? "Deleting.." : "Delete this account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader className="font-sans">
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription className="py-2">
              This action cannot be undone. This will permanently delete your
              account and related cronjob datas from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant={"destructive"}
              onClick={(e) => {
                e.preventDefault();
                setConfirmed(true);
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  );
}
