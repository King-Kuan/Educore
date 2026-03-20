"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Calendar, FolderOpen, Clock, Home, WifiOff, Wifi } from "lucide-react";
import { useEffect, useState } from "react";
import { getQueueCount } from "@/lib/db";

const NAV = [
  { href: "/",           label: "Home",       icon: Home },
  { href: "/marks",      label: "Marks",      icon: BarChart3 },
  { href: "/attendance", label: "Attendance", icon: Calendar },
  { href: "/files",      label: "Files",      icon: FolderOpen },
  { href: "/timetable",  label: "Timetable",  icon: Clock },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname       = usePathname();
  const [online, setOnline]       = useState(true);
  const [pending, setPending]     = useState(0);

  useEffect(() => {
    setOnline(navigator.onLine);
    window.addEventListener("online",  () => setOnline(true));
    window.addEventListener("offline", () => setOnline(false));

    const checkPending = async () => setPending(await getQueueCount());
    checkPending();
    const iv = setInterval(checkPending, 30_000);
    return () => clearInterval(iv);
  }, []);

  // Hide shell on login page
  if (pathname === "/login") return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Offline banner */}
      {!online && (
        <div className="bg-amber-500 text-white text-center text-xs py-1.5 font-mono flex items-center justify-center gap-2">
          <WifiOff className="w-3 h-3" />
          Offline mode — changes saved locally
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex safe-bottom z-40">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors ${
                active ? "text-brand-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-brand-600" : ""}`} />
              <span className={`font-medium ${active ? "text-brand-600" : ""}`}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
