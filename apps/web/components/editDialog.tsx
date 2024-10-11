"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoaderIcon, Pen } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import {
  cronjobUpdateSchema,
  cronjobUpdateSchemaType,
} from "@/lib/validators/cronjob.validator";
import { zodResolver } from "@hookform/resolvers/zod";

export default function EditDialog({ job }: any) {
  const [editLoading, setEditLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  const form = useForm<cronjobUpdateSchemaType>({
    resolver: zodResolver(cronjobUpdateSchema),
    defaultValues: {
      title: job.title,
      url: job.url,
      schedule: job.schedule,
    },
  });
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger
        className="flex items-center"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Pen className="w-3 h-3 mr-2" /> Edit
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader className="font-sans">
          <DialogTitle>Edit Cronjob</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => console.log(data))}
            className="md:w-full w-5/6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="my-2">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="my-2">
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="schedule"
              render={({ field }) => (
                <FormItem className="my-4">
                  <FormLabel>Execution Schedule</FormLabel>
                  <FormControl>
                    <div className="flex items-center py-2">
                      <span>Every</span>
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="w-16 mx-2">
                          <SelectValue defaultValue="10" placeholder="10" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="15">15</SelectItem>
                          <SelectItem value="30">30</SelectItem>
                          <SelectItem value="60">60</SelectItem>
                        </SelectContent>
                      </Select>
                      <span>Minutes</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex items-center justify-end">
              <Button
                className="w-1/6 mt-3 rounded-3xl mx-1"
                onClick={form.handleSubmit((data) => console.log(data.url))}
              >
                {testLoading ? "Testing..." : "Test run"}
              </Button>
              <Button
                className="w-1/6 mt-3 rounded-3xl mx-1"
                onClick={(e) => {
                  e.preventDefault();
                  // handleEdit(job.id);
                }}
              >
                {editLoading ? (
                  <>
                    Updating
                    <LoaderIcon className="w-4 h-4 loader-icon ml-2" />
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
