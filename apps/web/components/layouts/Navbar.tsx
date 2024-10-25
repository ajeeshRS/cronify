"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, LogOut, MoveLeft, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import MobileNavbar from "../mobileNavbar";
import { toast } from "sonner";
import {
  container,
  navContainer,
  navItem,
  navList,
  navListContainer,
} from "@/lib/constants/framer.constants";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // console.log(session?.user)
  const router = useRouter();
  const homePaths = ["/", "/dashboard"];

  const handleSignout = async (e: any) => {
    e.preventDefault();
    await signOut({ redirect: false });
    toast.success("Logged out!");
    router.push("/");
  };
  return (
    <motion.nav
      variants={navContainer}
      initial={"hidden"}
      animate={"visible"}
      className={`w-full h-[10vh] py-10 sticky top-0 z-50 bg-[#fff] flex items-center ${
        pathname === "/login" ? "justify-start" : "justify-between"
      } md:px-20 px-5`}
    >
      <motion.div variants={navItem} className="flex items-center">
        {!homePaths.includes(pathname) && (
          <button onClick={() => router.back()}>
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <h3 className="font-extrabold text-4xl text-[#1B201C] mx-5">
          <Link href={"/"}>Cronify.</Link>
        </h3>
      </motion.div>
      <motion.div
        variants={navItem}
        className={`${
          pathname !== "/" ? "hidden" : "md:flex hidden items-center"
        } `}
      >
        <motion.ul
          variants={navListContainer}
          initial={"hidden"}
          animate={"visible"}
          className={`flex items-center text-[#1B201C] mx-4`}
        >
          <motion.li
            variants={navList}
            className="md:mr-10 cursor-pointer group flex items-center text-[#061014] text-xl"
          >
            <span className="inline-block transition-transform group-hover:-translate-x-2 duration-200 ease-in-out">
              <Link href={"#features"}>Features</Link>
            </span>
            <MoveLeft className="ml-1 w-5 h-5 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200 ease-in-out " />
          </motion.li>
          <motion.li
            variants={navList}
            className="md:mr-10 cursor-pointer group flex items-center text-[#061014] text-xl"
          >
            <span className="inline-block transition-transform group-hover:-translate-x-2 duration-200 ease-in-out">
              <Link href={"#faqs"}>FAQs</Link>
            </span>
            <MoveLeft className="ml-1 w-5 h-5 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200 ease-in-out " />
          </motion.li>
          <motion.li
            variants={navList}
            className="md:mr-10 cursor-pointer group flex items-center text-[#061014] text-xl"
          >
            <span className="inline-block transition-transform group-hover:-translate-x-2 duration-200 ease-in-out">
              <Link href={"#footer"}>Contact us</Link>
            </span>
            <MoveLeft className="ml-1 w-5 h-5 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-200 ease-in-out " />
          </motion.li>
        </motion.ul>
      </motion.div>
      {!session?.user && pathname === "/" && (
        <motion.div variants={navItem}>
          <Button
            size={"lg"}
            className={`bg-[#DAF872] md:flex hidden font-medium rounded-full text-xl py-5 px-6 shadow-none text-inherit hover:bg-white border-[#DAF872] border hover:border-[#000] hover:text-[#000]`}
          >
            <Link href={"/login"}>Log in</Link>
          </Button>
        </motion.div>
      )}
      {status !== "loading" && session?.user && pathname !== "/profile" && (
        <motion.div variants={navItem}>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`focus:outline-none focus:border-none md:block ${pathname === "/" && "hidden"} `}
            >
              <p className="rounded-full w-12 h-12 outline-none p-3 border-none flex items-center justify-center bg-black text-white">
                {session.user.name?.charAt(0).toUpperCase()}
              </p>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className="font-medium text-base cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                <User className="w-4 h-4 mr-1" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="font-medium text-base cursor-pointer"
                onClick={handleSignout}
              >
                <LogOut className="w-4 h-4 mr-1" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      )}
      {pathname === "/" && (
        <div className="md:hidden block">
          <MobileNavbar />
        </div>
      )}
    </motion.nav>
  );
}
