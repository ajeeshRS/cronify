"use client";
import { Button } from "@/components/ui/button";
import { roboto } from "../fonts/font";
import { LoaderIcon, LogOut, Pen, Trash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { fetchUserInfo } from "../actions/cronActions";
import { useSession } from "next-auth/react";

export default function Page() {
  const session = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getUser = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await fetchUserInfo();
      setUser(userData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session.status === "authenticated" && session?.data.user) {
      getUser();
    }
  }, [session, getUser]);

  if (session.status === "loading" || loading || !session.data?.user || !user) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <LoaderIcon className="w-6 h-6 loader-icon" />
      </div>
    );
  }

  return (
    <div
      className={`${roboto.className} w-full min-h-[90vh] flex items-start flex-col justify-start px-20 py-10`}
    >
      <div className="w-full h-full flex flex-col items-start justify-start">
        <h3 className="font-bold text-2xl">Profile</h3>
        <div className="w-full min-h-[50vh] border shadow-md rounded-xl p-10 my-5">
          <div className="flex items-center">
            <p className="rounded-full w-20 h-20 outline-none p-3 border-none flex items-center justify-center bg-black text-white">
              {user.username.charAt(0).toUpperCase()}
            </p>
            <div className="flex  w-full items-center justify-between">
              <div className="flex flex-col items-start mx-4">
                <p className="text-lg">{user.username}</p>
              </div>
              <Button
                variant={"outline"}
                size={"icon"}
                className="bg-[#DAF872]"
              >
                <Pen className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="mt-10">
            <div className="flex flex-col items-start mx-4">
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-lg">{user.email}</p>
            </div>
            <div className="flex flex-col items-start mx-4 mt-5">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="text-lg">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="w-full flex items-center justify-end">
            <Button variant={"destructive"} className="mr-3">
              <Trash className="mr-2 w-4 h-4" /> Delete Account
            </Button>
            <Button>
              <LogOut className="mr-2 w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
