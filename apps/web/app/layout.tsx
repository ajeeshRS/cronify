import type { Metadata } from "next";
import "./globals.css";
import SessionWrapper from "../components/SessionWrapper";
import { raleway } from "./fonts/font";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Toaster } from "sonner";

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
          {children}
          <Footer />
          <Toaster />
        </SessionWrapper>
      </body>
    </html>
  );
}
