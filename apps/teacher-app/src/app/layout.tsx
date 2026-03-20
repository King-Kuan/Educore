import type { Metadata, Viewport } from "next";
import { Barlow, DM_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";
import { Toaster } from "react-hot-toast";

const barlow = Barlow({
  subsets:  ["latin"],
  weight:   ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display:  "swap",
});

const dmMono = DM_Mono({
  subsets:  ["latin"],
  weight:   ["300", "400", "500"],
  variable: "--font-dm-mono",
  display:  "swap",
});

export const metadata: Metadata = {
  title:           "EduCore RW — Teacher App",
  description:     "Teacher portal for EduCore RW",
  manifest:        "/manifest.json",
  appleWebApp: {
    capable:       true,
    statusBarStyle: "default",
    title:         "EduCore",
  },
};

export const viewport: Viewport = {
  themeColor:    "#1a3a2a",
  width:         "device-width",
  initialScale:  1,
  maximumScale:  1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${barlow.variable} ${dmMono.variable} font-sans antialiased bg-gray-50`}>
        <AppProviders>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              duration: 3000,
              style: { fontFamily: "var(--font-barlow)", fontSize: "14px", borderRadius: "8px" },
            }}
          />
        </AppProviders>
      </body>
    </html>
  );
}
