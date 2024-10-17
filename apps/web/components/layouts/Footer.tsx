"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SocialIcon } from "react-social-icons";
export default function Footer() {
  const pathname = usePathname();
  const paths = ["/dashboard", "/profile"];
  
  return (
    <footer
      id="footer"
      className={`${
        paths.includes(pathname) && "hidden"
      } w-full relative bottom-0 h-[35vh] mt-20 flex flex-col items-center py-5 bg-[#DAF872] rounded-t-[350px]`}
    >
      <div className="w-full text-center">
        <h3 className="text-[#252525] font-bold text-3xl">Cronify.</h3>

        <p className="text-base font-medium py-2">
          Cronify helps keep your free-tier backends alive effortlessly with
          scheduled pings. Say goodbye to downtime!
        </p>
      </div>
      <div className="py-2">
        <SocialIcon
          network="x"
          className="mx-2 cursor-pointer"
          href="/"
          style={{ height: "30px", width: "30px" }}
        />
        <SocialIcon
          network="instagram"
          className="mx-2 cursor-pointer"
          href="/"
          style={{ height: "30px", width: "30px" }}
        />
        <SocialIcon
          network="discord"
          className="mx-2 cursor-pointer"
          href="/"
          style={{ height: "30px", width: "30px" }}
        />
      </div>
      <div className="flex w-full items-center justify-around absolute bottom-5 text-[#252525] font-medium text-sm py-2">
        <p>© 2024 Cronify. All right reserved.</p>
        <div className="flex items-center">
          <p className="mx-3">
            <Link href={"/"}>Terms of services</Link>
          </p>
          <p className="mx-3">
            <Link href={"/"}>Privacy Policy</Link>
          </p>
          <p className="mx-3">
            <Link href={"/"}>Contact us</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
