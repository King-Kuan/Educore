"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "firebase/auth";
import type { AppUser } from "@educore/types";

interface TeacherAuthState {
  user:       User | null;
  profile:    AppUser | null;
  schoolId:   string | null;
  loading:    boolean;
  idToken:    string | null;
  setUser:    (user: User | null) => void;
  setProfile: (profile: AppUser | null) => void;
  setToken:   (token: string | null) => void;
  setLoading: (v: boolean) => void;
  clear:      () => void;
}

export const useAuthStore = create<TeacherAuthState>()(
  persist(
    (set) => ({
      user:     null,
      profile:  null,
      schoolId: null,
      loading:  true,
      idToken:  null,

      setUser:    (user)    => set({ user }),
      setProfile: (profile) => set({ profile, schoolId: profile?.schoolId ?? null }),
      setToken:   (idToken) => set({ idToken }),
      setLoading: (loading) => set({ loading }),
      clear:      ()        => set({ user: null, profile: null, schoolId: null, idToken: null }),
    }),
    {
      name:    "educore-teacher-auth",
      // Only persist non-sensitive profile data, not the Firebase user object
      partialize: (s) => ({
        profile:  s.profile,
        schoolId: s.schoolId,
      }),
    }
  )
);
