"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { onAuthChange } from "@educore/firebase";
import { getQueueCount } from "@/lib/db";
import { getCurrentTerm, getCurrentAcademicYear } from "@educore/utils/studentId";
import { AppShell } from "@/components/layout/AppShell";
import { BarChart3, Calendar, FolderOpen, Clock, RefreshCw, Wifi, WifiOff } from "lucide-react";

export default function HomePage() {
  const router         = useRouter();
  const { profile, schoolId, loading } = useAuthStore();
  const [online, setOnline]   = useState(true);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    setOnline(navigator.onLine);
    window.addEventListener("online",  () => setOnline(true));
    window.addEventListener("offline", () => setOnline(false));
    getQueueCount().then(setPending);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !profile) router.replace("/login");
  }, [loading, profile, router]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-brand-600 flex items-center justify-center">
        <div className="text-white text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p className="text-sm font-mono">Loading…</p>
        </div>
      </div>
    );
  }

  const term = getCurrentTerm();
  const year = getCurrentAcademicYear();

  const quickActions = [
    { href: "/marks",      label: "Enter marks",      sub: `Term ${term} · ${year}`,    icon: BarChart3,  color: "bg-brand-600" },
    { href: "/attendance", label: "Take attendance",   sub: "Today's class",              icon: Calendar,   color: "bg-blue-600"  },
    { href: "/files",      label: "Upload files",      sub: "Homework, tests, exercises", icon: FolderOpen, color: "bg-violet-600"},
    { href: "/timetable",  label: "View timetable",    sub: "Your weekly schedule",       icon: Clock,      color: "bg-emerald-600"},
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-brand-600 pt-12 pb-6 px-5">
          <div className="flex items-center justify-between mb-1">
            <div>
              <p className="text-white/60 text-xs font-mono uppercase tracking-wider mb-0.5">
                {online
                  ? <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> Online</span>
                  : <span className="flex items-center gap-1"><WifiOff className="w-3 h-3" /> Offline</span>
                }
              </p>
              <h1 className="text-xl font-bold text-white">
                {profile.displayName?.split(" ")[0] ? `Hello, ${profile.displayName.split(" ")[0]}` : "Welcome"}
              </h1>
              <p className="text-white/60 text-sm mt-0.5">{profile.displayName}</p>
            </div>
            <div className="w-12 h-12 bg-white/15 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {profile.displayName?.charAt(0).toUpperCase() ?? "T"}
            </div>
          </div>

          {/* Term chip */}
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-white/80 text-xs font-mono">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            Term {term} · {year}
          </div>
        </div>

        {/* Pending sync banner */}
        {pending > 0 && (
          <div className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <RefreshCw className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">{pending} changes pending sync</p>
              <p className="text-xs text-amber-600">Will sync automatically when online</p>
            </div>
          </div>
        )}

        {/* Quick actions grid */}
        <div className="px-4 mt-5 grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.href}
                href={action.href}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm active:scale-95 transition-transform"
              >
                <div className={`${action.color} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-sm text-gray-900">{action.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{action.sub}</p>
              </a>
            );
          })}
        </div>

        {/* Today notice */}
        <div className="mx-4 mt-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-2">Today</p>
          <p className="text-sm text-gray-600">
            {new Date().toLocaleDateString("en-RW", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            School: <span className="text-brand-600 font-medium">{profile.schoolId}</span>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
