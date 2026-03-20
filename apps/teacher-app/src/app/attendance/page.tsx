"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { db as firestore } from "@educore/firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { addToSyncQueue } from "@/lib/db";
import { getCurrentAcademicYear, getCurrentTerm } from "@educore/utils/studentId";
import { formatAttendanceDate } from "@educore/utils/attendance";
import { AppShell } from "@/components/layout/AppShell";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Clock, AlertCircle, Save, ChevronLeft, ChevronRight } from "lucide-react";

type AttStatus = "present" | "absent" | "late" | "excused";

const STATUS_CONFIG: Record<AttStatus, { label: string; color: string; icon: React.ReactNode }> = {
  present: { label: "P",  color: "bg-green-100 text-green-700 border-green-300", icon: <CheckCircle className="w-3 h-3" /> },
  absent:  { label: "A",  color: "bg-red-100 text-red-700 border-red-300",       icon: <XCircle className="w-3 h-3" /> },
  late:    { label: "L",  color: "bg-amber-100 text-amber-700 border-amber-300",  icon: <Clock className="w-3 h-3" /> },
  excused: { label: "E",  color: "bg-blue-100 text-blue-700 border-blue-300",     icon: <AlertCircle className="w-3 h-3" /> },
};

export default function AttendancePage() {
  const { profile, schoolId } = useAuthStore();
  const [selectedClass, setSelectedClass] = useState("");
  const [classes,       setClasses]       = useState<{ id: string; name: string }[]>([]);
  const [students,      setStudents]      = useState<{ id: string; fullName: string; registrationNumber: string }[]>([]);
  const [attendance,    setAttendance]    = useState<Record<string, AttStatus>>({});
  const [date,          setDate]          = useState(formatAttendanceDate(new Date()));
  const [saving,        setSaving]        = useState(false);
  const [online,        setOnline]        = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    window.addEventListener("online",  () => setOnline(true));
    window.addEventListener("offline", () => setOnline(false));
  }, []);

  // Load teacher's classes
  useEffect(() => {
    if (!schoolId || !profile) return;
    getDocs(query(
      collection(firestore, "schools", schoolId, "classes"),
      where("teacherIds", "array-contains", profile.uid)
    )).then((snap) => {
      setClasses(snap.docs.map((d) => ({ id: d.id, name: d.data()["name"] as string })));
    }).catch(() => {});
  }, [schoolId, profile]);

  // Load students + existing attendance for selected class + date
  useEffect(() => {
    if (!selectedClass || !schoolId) return;

    const load = async () => {
      // Students
      const stuSnap = await getDocs(query(
        collection(firestore, "schools", schoolId, "students"),
        where("classId", "==", selectedClass),
        where("status", "==", "active")
      ));
      const list = stuSnap.docs
        .map((d) => ({ id: d.id, fullName: d.data()["fullName"] as string, registrationNumber: d.data()["registrationNumber"] as string }))
        .sort((a, b) => a.fullName.localeCompare(b.fullName));
      setStudents(list);

      // Default all to present
      const init: Record<string, AttStatus> = {};
      list.forEach((s) => { init[s.id] = "present"; });

      // Check existing attendance for this date
      try {
        const attSnap = await getDocs(query(
          collection(firestore, "schools", schoolId, "attendance"),
          where("classId", "==", selectedClass),
          where("date", "==", date)
        ));
        attSnap.docs.forEach((d) => {
          const a = d.data();
          init[a["studentId"] as string] = a["status"] as AttStatus;
        });
      } catch { /* offline — use defaults */ }

      setAttendance(init);
    };

    load().catch(() => {});
  }, [selectedClass, schoolId, date]);

  const cycleStatus = (studentId: string) => {
    const order: AttStatus[] = ["present", "absent", "late", "excused"];
    const current = attendance[studentId] ?? "present";
    const next    = order[(order.indexOf(current) + 1) % order.length]!;
    setAttendance((prev) => ({ ...prev, [studentId]: next }));
  };

  const markAll = (status: AttStatus) => {
    const all: Record<string, AttStatus> = {};
    students.forEach((s) => { all[s.id] = status; });
    setAttendance(all);
  };

  const saveAttendance = async () => {
    if (!selectedClass || !schoolId || !profile) return;
    setSaving(true);

    const term = getCurrentTerm();
    const year = getCurrentAcademicYear();
    const entries = Object.entries(attendance);

    if (online) {
      try {
        // Check existing records
        const existing = await getDocs(query(
          collection(firestore, "schools", schoolId, "attendance"),
          where("classId", "==", selectedClass),
          where("date", "==", date)
        ));
        const existingMap = new Map(existing.docs.map((d) => [d.data()["studentId"] as string, d.ref]));

        await Promise.all(entries.map(async ([studentId, status]) => {
          const existingRef = existingMap.get(studentId);
          const data = {
            schoolId, classId: selectedClass, studentId,
            teacherId: profile.uid, date, status,
            term, academicYear: year,
          };

          if (existingRef) {
            await updateDoc(existingRef, { status });
          } else {
            await addDoc(collection(firestore, "schools", schoolId, "attendance"), {
              ...data, createdAt: serverTimestamp(),
            });
          }
        }));

        toast.success(`Saved attendance for ${entries.length} students`);
      } catch {
        await queueAttendance(entries, selectedClass, schoolId, profile.uid, date, term, year);
        toast("Saved offline — will sync later", { icon: "📦" });
      }
    } else {
      await queueAttendance(entries, selectedClass, schoolId, profile.uid, date, term, year);
      toast("Saved offline — will sync later", { icon: "📦" });
    }

    setSaving(false);
  };

  const present = Object.values(attendance).filter((s) => s === "present").length;
  const absent  = Object.values(attendance).filter((s) => s === "absent").length;

  const changeDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(formatAttendanceDate(d));
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-blue-600 text-white px-4 pt-12 pb-5">
          <h1 className="text-xl font-bold mb-4">Attendance</h1>

          {/* Date picker */}
          <div className="flex items-center justify-between bg-white/15 rounded-xl px-4 py-2.5 mb-3">
            <button onClick={() => changeDate(-1)} className="p-1 rounded-lg hover:bg-white/10">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={formatAttendanceDate(new Date())}
              className="bg-transparent text-white text-center text-sm font-medium focus:outline-none"
            />
            <button onClick={() => changeDate(1)} className="p-1 rounded-lg hover:bg-white/10"
              disabled={date === formatAttendanceDate(new Date())}>
              <ChevronRight className="w-5 h-5 disabled:opacity-30" />
            </button>
          </div>

          {/* Class selector */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none"
          >
            <option value="" className="text-gray-900">— Select class —</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id} className="text-gray-900">{c.name}</option>
            ))}
          </select>
        </div>

        {/* Stats + bulk actions */}
        {students.length > 0 && (
          <div className="px-4 py-3 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-3 text-sm">
                <span className="text-green-600 font-medium">{present} present</span>
                <span className="text-red-600 font-medium">{absent} absent</span>
                <span className="text-gray-400">{students.length} total</span>
              </div>
            </div>
            <div className="flex gap-2">
              {(["present", "absent", "late"] as AttStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => markAll(s)}
                  className={`flex-1 py-1.5 text-xs font-medium border rounded-lg capitalize transition-colors ${STATUS_CONFIG[s].color}`}
                >
                  All {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Student list */}
        {students.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {students.map((stu, i) => {
              const status = attendance[stu.id] ?? "present";
              const cfg    = STATUS_CONFIG[status];
              return (
                <div key={stu.id} className="bg-white px-4 py-3 flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{stu.fullName}</p>
                    <p className="text-xs font-mono text-gray-400">{stu.registrationNumber}</p>
                  </div>
                  <button
                    onClick={() => cycleStatus(stu.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all active:scale-95 ${cfg.color}`}
                  >
                    {cfg.icon}
                    {cfg.label}
                  </button>
                </div>
              );
            })}
          </div>
        ) : selectedClass ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">Loading students…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Calendar className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">Select a class to take attendance</p>
          </div>
        )}

        {/* Save FAB */}
        {selectedClass && students.length > 0 && (
          <div className="fixed bottom-20 right-4">
            <button
              onClick={saveAttendance}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save attendance"}
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

// Helper: queue attendance for offline sync
async function queueAttendance(
  entries: [string, AttStatus][],
  classId: string, schoolId: string, teacherId: string,
  date: string, term: number, academicYear: string
) {
  for (const [studentId, status] of entries) {
    await addToSyncQueue({
      operation:  "create",
      collection: `schools/${schoolId}/attendance`,
      docId:      `${studentId}_${date}`,
      data:       { schoolId, classId, studentId, teacherId, date, status, term, academicYear },
    });
  }
}
