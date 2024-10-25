"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChangePasswordSchema,
  ChangePasswordSchemaType,
} from "@/lib/validators/auth.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Lock } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { changeCurrentPassword } from "@/app/actions/actions";
import { toast } from "sonner";
export default function ChangePasswordDialog() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handlePasswordUpdate = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      setLoading(true);
      await changeCurrentPassword(currentPassword, newPassword);
      form.reset();
      toast.success("Password updated Successfully");
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger
        className="flex items-center mx-3 md:w-fit w-full"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Button size={"default"} className=" flex items-center md:w-fit w-full">
          <Lock className="w-4 h-4 mr-1" />
          <span>Change Password</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader className="font-sans">
          <DialogTitle className="font-normal py-3">
            Change Password
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) =>
              handlePasswordUpdate(data.currentPassword, data.newPassword)
            )}
            className="w-full flex flex-col items-end"
          >
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem className="my-2 w-full">
                  <FormLabel>
                    Current password <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem className="my-2 w-full">
                  <FormLabel>
                    New password <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="my-2 w-full">
                  <FormLabel>
                    Confirm password <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="my-1" type="submit">
              {loading ? "Updating.." : "Update"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
