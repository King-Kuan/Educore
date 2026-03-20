"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { db as firestore } from "@educore/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getCurrentTerm, getCurrentAcademicYear } from "@educore/utils/studentId";
import { AppShell } from "@/components/layout/AppShell";
import { Clock } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const FULL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

interface Slot {
  id:        string;
  classId:   string;
  subjectId: string;
  dayOfWeek: number;
  startTime: string;
  endTime:   string;
  room:      string | null;
  subjectName?: string;
  className?:  string;
}

export default function TimetablePage() {
  const { profile, schoolId } = useAuthStore();
  const [slots,     setSlots]     = useState<Slot[]>([]);
  const [subjects,  setSubjects]  = useState<Map<string, string>>(new Map());
  const [classes,   setClasses]   = useState<Map<string, string>>(new Map());
  const [loading,   setLoading]   = useState(true);
  const [activeDay, setActiveDay] = useState(() => {
    const d = new Date().getDay(); // 0=Sun, 1=Mon…
    return d === 0 || d === 6 ? 1 : d; // weekend → Monday
  });

  useEffect(() => {
    if (!schoolId || !profile) return;

    const load = async () => {
      setLoading(true);
      try {
        const [ttSnap, subSnap, clsSnap] = await Promise.all([
          getDocs(query(
            collection(firestore, "schools", schoolId, "timetable"),
            where("teacherId", "==", profile.uid),
            where("term", "==", getCurrentTerm()),
            where("academicYear", "==", getCurrentAcademicYear())
          )),
          getDocs(collection(firestore, "schools", schoolId, "subjects")),
          getDocs(collection(firestore, "schools", schoolId, "classes")),
        ]);

        const subMap = new Map(subSnap.docs.map((d) => [d.id, d.data()["name"] as string]));
        const clsMap = new Map(clsSnap.docs.map((d) => [d.id, d.data()["name"] as string]));
        setSubjects(subMap);
        setClasses(clsMap);

        const list: Slot[] = ttSnap.docs.map((d) => ({
          id:          d.id,
          classId:     d.data()["classId"],
          subjectId:   d.data()["subjectId"],
          dayOfWeek:   d.data()["dayOfWeek"],
          startTime:   d.data()["startTime"],
          endTime:     d.data()["endTime"],
          room:        d.data()["room"] ?? null,
          subjectName: subMap.get(d.data()["subjectId"]),
          className:   clsMap.get(d.data()["classId"]),
        })).sort((a, b) => a.startTime.localeCompare(b.startTime));

        setSlots(list);
      } catch { /* offline */ } finally {
        setLoading(false);
      }
    };

    load();
  }, [schoolId, profile]);

  const slotsForDay = slots.filter((s) => s.dayOfWeek === activeDay);

  // Color per class
  const classColors = ["bg-brand-50 border-brand-200 text-brand-700",
    "bg-blue-50 border-blue-200 text-blue-700",
    "bg-violet-50 border-violet-200 text-violet-700",
    "bg-amber-50 border-amber-200 text-amber-700",
    "bg-emerald-50 border-emerald-200 text-emerald-700"];
  const classColorMap = new Map<string, string>();
  let colorIdx = 0;
  slots.forEach((s) => {
    if (!classColorMap.has(s.classId)) {
      classColorMap.set(s.classId, classColors[colorIdx % classColors.length]!);
      colorIdx++;
    }
  });

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-emerald-600 text-white px-4 pt-12 pb-5">
          <h1 className="text-xl font-bold mb-1">Timetable</h1>
          <p className="text-white/60 text-sm font-mono">
            Term {getCurrentTerm()} · {getCurrentAcademicYear()}
          </p>
        </div>

        {/* Day tabs */}
        <div className="bg-white border-b border-gray-100 flex">
          {DAYS.map((day, i) => {
            const dayNum   = i + 1;
            const count    = slots.filter((s) => s.dayOfWeek === dayNum).length;
            const isToday  = new Date().getDay() === dayNum;
            const isActive = activeDay === dayNum;
            return (
              <button
                key={day}
                onClick={() => setActiveDay(dayNum)}
                className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                  isActive ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500"
                }`}
              >
                <p className={`text-xs font-medium ${isToday ? "text-emerald-600" : ""}`}>{day}</p>
                {count > 0 && (
                  <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${isActive ? "bg-emerald-600" : "bg-gray-300"}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Slots */}
        <div className="px-4 py-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-500">{FULL_DAYS[activeDay - 1]}</h2>

          {loading ? (
            <div className="text-center py-12 text-gray-400 text-sm">Loading timetable…</div>
          ) : slotsForDay.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Clock className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No classes scheduled</p>
            </div>
          ) : (
            slotsForDay.map((slot) => (
              <div
                key={slot.id}
                className={`rounded-2xl border p-4 ${classColorMap.get(slot.classId) ?? "bg-gray-50 border-gray-200 text-gray-700"}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm">{slot.subjectName ?? slot.subjectId}</p>
                    <p className="text-xs opacity-70 mt-0.5">{slot.className ?? slot.classId}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold">{slot.startTime}</p>
                    <p className="font-mono text-xs opacity-60">{slot.endTime}</p>
                  </div>
                </div>
                {slot.room && (
                  <p className="text-xs opacity-60 mt-2 font-mono">Room: {slot.room}</p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Weekly summary */}
        {slots.length > 0 && (
          <div className="mx-4 mt-2 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Week summary</p>
            <div className="grid grid-cols-5 gap-1">
              {DAYS.map((day, i) => {
                const dayNum = i + 1;
                const count  = slots.filter((s) => s.dayOfWeek === dayNum).length;
                return (
                  <div key={day} className="text-center">
                    <div className={`text-lg font-bold ${count > 0 ? "text-brand-600" : "text-gray-200"}`}>{count}</div>
                    <div className="text-xs text-gray-400">{day}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
