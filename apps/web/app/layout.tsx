import type { Metadata } from "next";
import "./globals.css";
import SessionWrapper from "../components/SessionWrapper";
import { raleway } from "./fonts/font";
import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { LoaderIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Cronify",
  description: "A cronjob scheduler",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${raleway.className} antialiased`}>
        <SessionWrapper>
          <Navbar />
          <Suspense
            fallback={
              <div className="w-full h-[80vh] flex items-center justify-center">
                <LoaderIcon className="w-6 h-6 loader-icon" />
              </div>
            }
          >
            {children}
          </Suspense>
          <Footer />
          <Toaster />
        </SessionWrapper>
      </body>
    </html>
  );
}
