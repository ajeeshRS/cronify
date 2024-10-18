"use client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogIn, LogOut, Menu, UserIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { DashboardIcon } from "@radix-ui/react-icons";

export default function MobileNavbar() {
  const { data: session } = useSession();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size={"icon"}>
          <Menu className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <nav className="flex flex-col space-y-2 p-4">
          {!session?.user ? (
            <Link
              href="/login"
              className="text-gray-900 w-full flex items-center hover:bg-gray-100 p-2 rounded-lg"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Link>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="text-gray-900 w-full hover:bg-gray-100 p-2 rounded-lg flex items-center"
              >
              <DashboardIcon className="w-4 h-4 mr-2"/>  Dashboard
              </Link>
              <Link
                href="/profile"
                className="text-gray-900 w-full hover:bg-gray-100 p-2 rounded-lg flex items-center"
              >
               <UserIcon className="w-4 h-4 mr-2"/> Profile
              </Link>
              <a className="text-gray-900 w-full hover:bg-gray-100 p-2 rounded-lg flex items-center">
                <LogOut className="w-4 h-4 mr-2"/> Logout
              </a>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
