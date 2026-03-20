"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/auth";
import { db as firestore } from "@educore/firebase";
import { collection, query, where, getDocs, getDocsFromCache } from "firebase/firestore";
import { saveMarkOffline, getOfflineMarksForClass, cacheStudents, getCachedStudents } from "@/lib/db";
import { getCurrentAcademicYear, getCurrentTerm } from "@educore/utils/studentId";
import { calculateGrade } from "@educore/utils/grading";
import toast from "react-hot-toast";
import { Save, Wifi, WifiOff, Clock } from "lucide-react";

interface Student { id: string; fullName: string; registrationNumber: string; }
interface Subject { id: string; name: string; caMax: number; examMax: number; totalMax: number; }

export default function MarksPage() {
  const { profile, schoolId } = useAuthStore();
  const [online,          setOnline]          = useState(true);
  const [selectedClass,   setSelectedClass]   = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [term,            setTerm]            = useState<1|2|3>(getCurrentTerm());
  const [year]                                = useState(getCurrentAcademicYear());
  const [students,        setStudents]        = useState<Student[]>([]);
  const [subjects,        setSubjects]        = useState<Subject[]>([]);
  const [classes,         setClasses]         = useState<{ id: string; name: string }[]>([]);
  const [scores,          setScores]          = useState<Record<string, { ca: number|""; exam: number|"" }>>({});
  const [pendingCount,    setPendingCount]    = useState(0);
  const [saving,          setSaving]          = useState(false);

  // Online/offline detection
  useEffect(() => {
    const onOnline  = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);
    setOnline(navigator.onLine);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  // Load teacher's assigned classes
  useEffect(() => {
    if (!schoolId || !profile) return;
    const loadClasses = async () => {
      try {
        const q    = query(collection(firestore, "schools", schoolId, "classes"),
                           where("teacherIds", "array-contains", profile.uid));
        const snap = await getDocs(q);
        setClasses(snap.docs.map((d) => ({ id: d.id, name: d.data()["name"] })));
      } catch {
        // Try offline
        toast("Loading from cache", { icon: "📦" });
      }
    };
    loadClasses();
  }, [schoolId, profile]);

  // Load students for selected class
  useEffect(() => {
    if (!selectedClass || !schoolId) return;
    const loadStudents = async () => {
      // Try cache first if offline
      if (!online) {
        const cached = await getCachedStudents(selectedClass);
        if (cached) { setStudents(cached as Student[]); return; }
        toast.error("No cached data. Go online to load students.");
        return;
      }

      try {
        const q    = query(collection(firestore, "schools", schoolId, "students"),
                           where("classId", "==", selectedClass),
                           where("status", "==", "active"));
        const snap = await getDocs(q);
        const list: Student[] = snap.docs.map((d) => ({
          id: d.id, fullName: d.data()["fullName"],
          registrationNumber: d.data()["registrationNumber"],
        })).sort((a, b) => a.fullName.localeCompare(b.fullName));

        setStudents(list);
        await cacheStudents(selectedClass, list); // cache for offline use
      } catch { toast.error("Failed to load students"); }
    };
    loadStudents();
  }, [selectedClass, schoolId, online]);

  // Load subjects for class level
  useEffect(() => {
    if (!selectedClass || !schoolId) return;
    const loadSubjects = async () => {
      try {
        const classSnap = await getDocs(
          query(collection(firestore, "schools", schoolId, "classes"),
                where("__name__", "==", selectedClass))
        );
        const levelId = classSnap.docs[0]?.data()["levelId"];
        if (!levelId) return;

        const q    = query(collection(firestore, "schools", schoolId, "subjects"),
                           where("levelId", "==", levelId));
        const snap = await getDocs(q);
        setSubjects(snap.docs.map((d) => ({
          id: d.id, name: d.data()["name"],
          caMax: d.data()["caMax"] ?? 30,
          examMax: d.data()["examMax"] ?? 70,
          totalMax: d.data()["totalMax"] ?? 100,
        })));
      } catch { /* ignore */ }
    };
    loadSubjects();
  }, [selectedClass, schoolId]);

  // Load existing marks + offline marks
  useEffect(() => {
    if (!selectedClass || !selectedSubject || !schoolId) return;
    const loadMarks = async () => {
      const offlineMarks = await getOfflineMarksForClass(selectedClass, selectedSubject, term, year);
      const newScores: Record<string, { ca: number|""; exam: number|"" }> = {};

      students.forEach((s) => {
        const off = offlineMarks[s.id];
        newScores[s.id] = { ca: off?.caScore ?? "", exam: off?.examScore ?? "" };
      });

      // If online, overlay with Firestore marks
      if (online) {
        try {
          const q    = query(collection(firestore, "schools", schoolId, "marks"),
                             where("classId", "==", selectedClass),
                             where("subjectId", "==", selectedSubject),
                             where("term", "==", term),
                             where("academicYear", "==", year));
          const snap = await getDocs(q);
          snap.docs.forEach((d) => {
            const m = d.data();
            newScores[m["studentId"]] = { ca: m["caScore"] ?? "", exam: m["examScore"] ?? "" };
          });
        } catch { /* use offline */ }
      }

      setScores(newScores);
    };
    loadMarks();
  }, [selectedClass, selectedSubject, term, year, students, online, schoolId]);

  const subjectData = subjects.find((s) => s.id === selectedSubject);

  const setScore = (studentId: string, field: "ca" | "exam", value: string) => {
    const num = value === "" ? "" : parseFloat(value);
    setScores((prev) => ({ ...prev, [studentId]: { ...prev[studentId]!, [field]: num } }));
  };

  const saveMarks = async () => {
    if (!selectedClass || !selectedSubject || !subjectData) return;
    setSaving(true);

    let count = 0;
    for (const [studentId, score] of Object.entries(scores)) {
      if (score.ca === "" && score.exam === "") continue;
      const caScore   = score.ca   === "" ? 0 : score.ca as number;
      const examScore = score.exam === "" ? 0 : score.exam as number;

      await saveMarkOffline({ studentId, subjectId: selectedSubject, classId: selectedClass, caScore, examScore, term, academicYear: year });
      count++;
    }

    // If online, also push to Firestore immediately
    if (online) {
      try {
        const res = await fetch("/api/marks/batch", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            schoolId, classId: selectedClass, subjectId: selectedSubject,
            term, academicYear: year, scores,
          }),
        });
        if (res.ok) {
          toast.success(`Saved ${count} marks`);
        } else {
          toast("Saved offline — will sync when reconnected", { icon: "📦" });
        }
      } catch {
        toast("Saved offline — will sync when reconnected", { icon: "📦" });
      }
    } else {
      toast("Saved offline — will sync when reconnected", { icon: "📦" });
    }

    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-brand-700 text-white px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Marks Entry</h1>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <span className="flex items-center gap-1 text-xs bg-amber-500 text-white px-2 py-1 rounded-full">
                <Clock className="w-3 h-3" /> {pendingCount} pending
              </span>
            )}
            {online
              ? <span className="flex items-center gap-1 text-xs text-green-300"><Wifi className="w-3 h-3" /> Online</span>
              : <span className="flex items-center gap-1 text-xs text-red-300"><WifiOff className="w-3 h-3" /> Offline</span>
            }
          </div>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-2 gap-2">
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30">
            <option value="" className="text-gray-900">— Class —</option>
            {classes.map((c) => <option key={c.id} value={c.id} className="text-gray-900">{c.name}</option>)}
          </select>
          <select value={String(term)} onChange={(e) => setTerm(parseInt(e.target.value) as 1|2|3)}
            className="px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none">
            <option value="1" className="text-gray-900">Term 1</option>
            <option value="2" className="text-gray-900">Term 2</option>
            <option value="3" className="text-gray-900">Term 3</option>
          </select>
          <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={!selectedClass}
            className="col-span-2 px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none disabled:opacity-50">
            <option value="" className="text-gray-900">— Subject —</option>
            {subjects.map((s) => <option key={s.id} value={s.id} className="text-gray-900">{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Subject info bar */}
      {subjectData && (
        <div className="bg-brand-50 border-b border-brand-100 px-4 py-2 flex gap-4 text-xs font-mono text-brand-700">
          <span>CA: {subjectData.caMax}</span>
          <span>Exam: {subjectData.examMax}</span>
          <span>Total: {subjectData.totalMax}</span>
        </div>
      )}

      {/* Student list */}
      {students.length > 0 && selectedSubject ? (
        <div className="divide-y divide-gray-100">
          {students.map((stu, idx) => {
            const score    = scores[stu.id] ?? { ca: "", exam: "" };
            const ca       = score.ca   === "" ? 0 : score.ca as number;
            const exam     = score.exam === "" ? 0 : score.exam as number;
            const total    = ca + exam;
            const max      = subjectData?.totalMax ?? 100;
            const pct      = max > 0 ? (total / max) * 100 : 0;
            const { grade } = calculateGrade(total, max);

            return (
              <div key={stu.id} className="px-4 py-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-sm text-gray-900">{stu.fullName}</div>
                    <div className="text-xs font-mono text-gray-400">{stu.registrationNumber}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(score.ca !== "" || score.exam !== "") && (
                      <>
                        <span className="text-xs font-mono font-bold text-gray-700">{total}/{max}</span>
                        <span className={`grade-${grade.toLowerCase()} text-xs`}>{grade}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">CA /{subjectData?.caMax}</label>
                    <input type="number" min={0} max={subjectData?.caMax} step={0.5}
                      value={score.ca}
                      onChange={(e) => setScore(stu.id, "ca", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Exam /{subjectData?.examMax}</label>
                    <input type="number" min={0} max={subjectData?.examMax} step={0.5}
                      value={score.exam}
                      onChange={(e) => setScore(stu.id, "exam", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-600 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          {!selectedClass
            ? <p className="text-sm">Select a class to begin</p>
            : !selectedSubject
            ? <p className="text-sm">Select a subject</p>
            : <p className="text-sm">No students found</p>
          }
        </div>
      )}

      {/* Save FAB */}
      {selectedSubject && students.length > 0 && (
        <div className="fixed bottom-20 right-4">
          <button
            onClick={saveMarks}
            disabled={saving}
            className="flex items-center gap-2 bg-brand-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-brand-700 disabled:opacity-50 text-sm font-semibold"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : online ? "Save" : "Save offline"}
          </button>
        </div>
      )}
    </div>
  );
}
