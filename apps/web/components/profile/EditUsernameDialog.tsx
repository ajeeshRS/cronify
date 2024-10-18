"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Pen } from "lucide-react";
import { Input } from "../ui/input";
import { useState } from "react";
import { updateUsername } from "@/app/actions/cronActions";
import { toast } from "sonner";

export default function EditUsernameDialog({ user, getUser }: any) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleUpdateUsername = async () => {
    try {
      setLoading(true);
      await updateUsername(username);
      toast.success("Username updated");
      getUser()
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Error updating username");
      toast.error("Unable to update.Please try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <DialogTrigger
        className="flex items-center"
        onClick={(e) => {
          e.stopPropagation();
          setUsername(user.username);
        }}
      >
        <Button variant={"outline"} size={"icon"} className="bg-[#DAF872]">
          <Pen className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader className="font-sans">
          <DialogTitle className="font-normal py-3">Edit Username</DialogTitle>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleUpdateUsername();
            }}
          >
            {loading ? "updating.." : "update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
