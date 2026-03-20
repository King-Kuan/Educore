"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth";
import { db as firestore } from "@educore/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { AppShell } from "@/components/layout/AppShell";
import toast from "react-hot-toast";
import {
  Upload, FolderOpen, FileText, Trash2, Plus,
  BookOpen, ClipboardList, Dumbbell, Folder,
} from "lucide-react";

type FileType = "homework" | "test" | "exercise" | "resource";

const TYPE_CONFIG: Record<FileType, { label: string; icon: React.ReactNode; color: string }> = {
  homework: { label: "Homework",  icon: <BookOpen className="w-4 h-4" />,      color: "text-blue-600 bg-blue-50"   },
  test:     { label: "Test",      icon: <ClipboardList className="w-4 h-4" />, color: "text-red-600 bg-red-50"     },
  exercise: { label: "Exercise",  icon: <Dumbbell className="w-4 h-4" />,      color: "text-green-600 bg-green-50" },
  resource: { label: "Resource",  icon: <FolderOpen className="w-4 h-4" />,    color: "text-violet-600 bg-violet-50"},
};

interface UploadedFile {
  id:          string;
  title:       string;
  type:        FileType;
  fileSize:    number;
  uploadedAt:  { toDate: () => Date };
  expiresAt:   { toDate: () => Date };
  mimeType:    string;
  r2Key:       string;
}

export default function FilesPage() {
  const { profile, schoolId } = useAuthStore();
  const [classes,       setClasses]       = useState<{ id: string; name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [files,         setFiles]         = useState<UploadedFile[]>([]);
  const [uploading,     setUploading]     = useState(false);
  const [activeType,    setActiveType]    = useState<FileType>("homework");
  const [showUpload,    setShowUpload]    = useState(false);
  const [title,         setTitle]         = useState("");
  const fileRef         = useRef<HTMLInputElement>(null);

  // Load classes
  useEffect(() => {
    if (!schoolId || !profile) return;
    getDocs(query(
      collection(firestore, "schools", schoolId, "classes"),
      where("teacherIds", "array-contains", profile.uid)
    )).then((snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, name: d.data()["name"] as string }));
      setClasses(list);
      if (list[0]) setSelectedClass(list[0].id);
    });
  }, [schoolId, profile]);

  // Load files for selected class
  useEffect(() => {
    if (!selectedClass || !schoolId) return;
    getDocs(query(
      collection(firestore, "schools", schoolId, "files"),
      where("classId", "==", selectedClass),
      where("uploadedBy", "==", profile?.uid ?? ""),
      where("isDeleted", "==", false)
    )).then((snap) => {
      setFiles(snap.docs.map((d) => ({ id: d.id, ...d.data() } as UploadedFile))
        .sort((a, b) => b.uploadedAt.toDate().getTime() - a.uploadedAt.toDate().getTime()));
    }).catch(() => {});
  }, [selectedClass, schoolId, profile]);

  const handleUpload = async (file: File) => {
    if (!title.trim()) { toast.error("Enter a title for the file"); return; }
    if (!selectedClass) { toast.error("Select a class"); return; }
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file",    file);
      formData.append("title",   title);
      formData.append("type",    activeType);
      formData.append("classId", selectedClass);
      formData.append("schoolId", schoolId!);

      const res = await fetch("/api/files/upload", { method: "POST", body: formData });
      const json = await res.json();

      if (res.ok) {
        toast.success("File uploaded successfully");
        setTitle("");
        setShowUpload(false);
        // Refresh files
        const snap = await getDocs(query(
          collection(firestore, "schools", schoolId!, "files"),
          where("classId", "==", selectedClass),
          where("uploadedBy", "==", profile?.uid ?? ""),
          where("isDeleted", "==", false)
        ));
        setFiles(snap.docs.map((d) => ({ id: d.id, ...d.data() } as UploadedFile)));
      } else {
        toast.error(json.error ?? "Upload failed");
      }
    } catch {
      toast.error("Upload failed. Check your connection.");
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024)       return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const daysUntilExpiry = (expiresAt: { toDate: () => Date }) => {
    const diff = expiresAt.toDate().getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const filteredFiles = files.filter((f) => f.type === activeType);

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-violet-600 text-white px-4 pt-12 pb-5">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Files</h1>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 bg-white/15 border border-white/25 rounded-xl px-3 py-2 text-sm"
            >
              <Plus className="w-4 h-4" /> Upload
            </button>
          </div>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none"
          >
            {classes.map((c) => <option key={c.id} value={c.id} className="text-gray-900">{c.name}</option>)}
          </select>
        </div>

        {/* Type tabs */}
        <div className="bg-white border-b border-gray-100 px-4 flex gap-0 overflow-x-auto">
          {(Object.entries(TYPE_CONFIG) as [FileType, typeof TYPE_CONFIG[FileType]][]).map(([type, cfg]) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeType === type ? "border-violet-600 text-violet-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {cfg.icon} {cfg.label}
              <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-1.5">
                {files.filter((f) => f.type === type).length}
              </span>
            </button>
          ))}
        </div>

        {/* Files list */}
        <div className="px-4 pt-4 space-y-3">
          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FolderOpen className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No {TYPE_CONFIG[activeType].label.toLowerCase()} files yet</p>
              <button
                onClick={() => setShowUpload(true)}
                className="mt-3 text-sm text-violet-600 font-medium"
              >
                Upload one →
              </button>
            </div>
          ) : (
            filteredFiles.map((file) => {
              const days = daysUntilExpiry(file.expiresAt);
              return (
                <div key={file.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_CONFIG[file.type].color}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{file.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatSize(file.fileSize)} ·
                        {file.uploadedAt.toDate().toLocaleDateString("en-RW")}
                      </p>
                      <p className={`text-xs mt-1 font-mono ${days < 14 ? "text-red-500" : "text-gray-400"}`}>
                        Expires in {days} days
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-end z-50">
            <div className="bg-white w-full rounded-t-3xl p-6 pb-10">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
              <h3 className="font-semibold text-gray-900 mb-4">Upload file</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">File type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(TYPE_CONFIG) as [FileType, typeof TYPE_CONFIG[FileType]][]).map(([type, cfg]) => (
                      <button
                        key={type}
                        onClick={() => setActiveType(type)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                          activeType === type ? "border-violet-400 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-600"
                        }`}
                      >
                        {cfg.icon} {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Week 5 Math Homework"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-violet-400 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Tap to select PDF</p>
                  <p className="text-xs text-gray-400 mt-1">Max 10 MB · Auto-deleted after 4 months</p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
                  />
                </div>

                <button
                  onClick={() => setShowUpload(false)}
                  className="w-full py-3 border border-gray-300 rounded-xl text-sm text-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
