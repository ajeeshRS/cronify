"use client";
import { Button } from "@/components/ui/button";
import { roboto } from "../fonts/font";
import { LoaderIcon, LogOut } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { fetchUserInfo } from "../actions/actions";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import EditUsernameDialog from "@/components/profile/EditUsernameDialog";
import DeleteAccountDialog from "@/components/profile/DeleteAccountDialog";
import { UserInfo } from "@/types/user.types";
import ChangePasswordDialog from "@/components/profile/ChangePasswordDialog";

export default function Page() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const session = useSession();
  const router = useRouter();

  if (session.status === "loading" || !session.data) {
    router.push("/login");
  }

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

  const handleSignout = async (e: any) => {
    e.preventDefault();
    await signOut({ redirect: false });
    router.push("/");
  };

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
      className={`${roboto.className} w-full min-h-[90vh] flex items-start flex-col justify-start md:px-20 px-5 py-10`}
    >
      <div className="w-full h-full flex flex-col items-start justify-start">
        <h3 className="font-bold text-2xl">Profile</h3>
        <div className="w-full md:min-h-[50vh] min-h-[40vh] border shadow-md rounded-xl md:p-10 p-5 my-5">
          <div className="flex items-center">
            <p className="rounded-full md:w-20 md:h-20 w-14 h-14 outline-none p-4 border-none flex items-center justify-center bg-black text-white">
              {user.username.charAt(0).toUpperCase()}
            </p>
            <div className="flex md:w-full w-5/6 items-center justify-between">
              <div className="flex flex-col items-start mx-4">
                <p className="text-lg font-medium">
                  {user.username.toUpperCase()}
                </p>
              </div>
              <EditUsernameDialog user={user} getUser={getUser} />
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
          <div className="w-full flex md:flex-row flex-col items-center md:justify-end justify-center md:py-0 py-10">
            <DeleteAccountDialog user={user} />
            <ChangePasswordDialog  />
            <Button onClick={handleSignout} className="md:my-0 my-3 md:w-fit w-full">
              <LogOut className="mr-2 w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
