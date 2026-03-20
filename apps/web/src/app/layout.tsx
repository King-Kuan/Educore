import type { Metadata } from "next";
import { Barlow, DM_Mono } from "next/font/google";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"], weight: ["400","500","600","700","800"],
  variable: "--font-barlow", display: "swap",
});
const mono = DM_Mono({
  subsets: ["latin"], weight: ["400","500"],
  variable: "--font-dm-mono", display: "swap",
});

export const metadata: Metadata = {
  title: "EduCore RW — School Management Platform for Rwanda",
  description: "The complete school management system for Rwandan schools. Manage students, teachers, marks, reports and timetables — all in one platform.",
  keywords: ["school management Rwanda", "school system Rwanda", "student reports Rwanda"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${barlow.variable} ${mono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
