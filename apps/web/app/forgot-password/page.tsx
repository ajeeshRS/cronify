"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { sendResetPasswordMail } from "../actions/actions";

export default function Page() {
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendLink = async () => {
    try {
      setLoading(true);
      await sendResetPasswordMail(emailInput);
      toast.success("Reset mail sent!");
    } catch (err) {
      console.log(err);
      toast.error("Failed to send reset mail.Please try again");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center">
      <div className="md:w-2/6 w-5/6 py-10 md:px-10 px-5 rounded-3xl flex flex-col items-center justify-center shadow-md">
        <h3 className="text-3xl font-bold py-4">Forgot Password ?</h3>
        <Input
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          className="my-3"
          placeholder="Enter your registered email"
        />
        <Button onClick={handleSendLink} className="my-4">
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </div>
    </div>
  );
}
