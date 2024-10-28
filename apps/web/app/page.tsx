"use client";
import Link from "next/link";
import { BellRing, CalendarCheck, Timer, Vote } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { container, item } from "@/lib/constants/framer.constants";
import { useInView } from "react-intersection-observer";
import Faq from "@/components/faqComponent";

export default function Home() {
  const { data: session } = useSession();
  const { ref: ref1, inView: inView1 } = useInView({
    threshold: 0.3, 
    triggerOnce: true, 
  });
  const { ref: ref2, inView: inView2 } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });
  const { ref: ref3, inView: inView3 } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });
  const { ref: ref4, inView: inView4 } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });
  const { ref: ref5, inView: inView5 } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const { ref: ref6, inView: inView6 } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });
  return (
    <main
      id="#"
      className="w-full h-fit  bg-inherit flex flex-col justify-center items-center"
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="w-full min-h-[90vh] max-h-[100vh] flex flex-col items-center justify-start pt-24 mt-10 md:p-20 p-10"
      >
        <motion.h2
          variants={item}
          className="font-extrabold md:text-8xl text-6xl pb-3 text-[#1B201C] text-center px-5"
        >
          Automate Your Uptime, Effortlessly!
        </motion.h2>
        <motion.p
          variants={item}
          className="py-6 md:text-xl text-base font-medium text-center"
        >
          Say goodbye to downtime with <br /> our simple, effective solution for
          keeping your free-tier backends alive.
        </motion.p>
        <motion.button
          variants={item}
          className="group relative overflow-hidden overflow-x-hidden font-medium rounded-full text-xl py-5 px-6 bg-[#DAF872] text-black hover:border-black border border-[#DAF872]"
        >
          <span className="relative z-10">
            {session?.user ? (
              <Link href={"/dashboard"}>Go to Dashboard</Link>
            ) : (
              <Link href={"/signup"}>Get Started</Link>
            )}
          </span>
          <span className="absolute inset-0 overflow-hidden rounded-md">
            <span className="absolute left-0 aspect-square w-full origin-center -translate-x-full rounded-full bg-white transition-all duration-500 group-hover:-translate-x-0 group-hover:scale-150"></span>
          </span>
        </motion.button>
      </motion.div>
      <motion.div
        id="features"
        ref={ref5}
        initial={{ opacity: 0, y: 20 }}
        animate={inView5 ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4 }}
        className="w-full flex flex-col items-center justify-around bg-[#DAF872] min-h-[90vh] md:rounded-[350px] rounded-[100px]"
      >
        <div className="w-full text-center py-10">
          <motion.p
            ref={ref6}
            className="font-bold text-4xl"
            initial={{ opacity: 0, y: 50 }}
            animate={inView6 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            Features
          </motion.p>
        </div>

        <motion.div
          ref={ref1}
          className="w-full h-fit py-20 flex items-center justify-around md:px-10 px-5"
          initial={{ opacity: 0, x: -100 }}
          animate={inView1 ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div>
            <p className="md:text-5xl text-3xl font-bold text-[#1B201C]">
              Simple Scheduling
            </p>
            <p className="text-black py-3 w-5/6">
              Easily set up cron job in just a few clicks
            </p>
          </div>
          <div>
            <CalendarCheck className="md:w-44 md:h-44 w-28 h-28" />
          </div>
        </motion.div>
        <motion.div
          ref={ref2}
          className="w-full h-fit py-20 flex flex-row-reverse items-center justify-around md:px-10 px-5"
          initial={{ opacity: 0, x: 100 }}
          animate={inView2 ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="text-end">
            <p className="md:text-5xl text-3xl font-bold text-[#1B201C]">
              Reliable Pings
            </p>
            <p className="text-black py-3">
              Automated pings to ensure your free-tier services are always live.
            </p>
          </div>
          <div>
            <Vote className="md:w-44 md:h-44 w-28 h-28" />
          </div>
        </motion.div>
        <motion.div
          ref={ref3}
          className="w-full h-fit py-20 flex items-center justify-around md:px-10 px-5"
          initial={{ opacity: 0, x: -100 }}
          animate={inView3 ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div>
            <p className="md:text-5xl text-3xl font-bold text-[#1B201C]">
              Customizable Interval
            </p>
            <p className="text-black py-3 w-5/6">
              Set ping intervals that match your needs—choose from multiple
              frequencies.
            </p>
          </div>
          <div>
            <Timer className="md:w-44 md:h-44 w-28 h-28" />
          </div>
        </motion.div>
        <motion.div
          ref={ref4}
          className="w-full h-fit py-20 flex flex-row-reverse items-center justify-around md:px-10 px-5"
          initial={{ opacity: 0, x: 100 }}
          animate={inView4 ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="text-end">
            <p className="md:text-5xl text-3xl font-bold text-[#1B201C]">
              Notifications
            </p>
            <p className="text-black py-3">
              Get alerts via email if any of your services go down.
            </p>
          </div>
          <div>
            <BellRing className="md:w-44 md:h-44 w-28 h-28" />
          </div>
        </motion.div>
      </motion.div>
      <Faq />
    </main>
  );
}
