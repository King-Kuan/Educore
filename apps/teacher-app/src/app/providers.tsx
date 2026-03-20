"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { onAuthChange, getUserProfile, getIdToken } from "@educore/firebase";
import { useAuthStore } from "@/store/auth";
import { syncPendingItems, getQueueCount } from "@/lib/db";

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          5 * 60 * 1000,
      retry:              1,
      refetchOnWindowFocus: false,
      // Never throw on network error — teacher app must tolerate offline
      throwOnError:       false,
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={qc}>
      <AuthWatcher />
      <SyncEngine />
      {children}
    </QueryClientProvider>
  );
}

// Watches Firebase auth state — sets up profile once, persists across sessions
function AuthWatcher() {
  const { setUser, setProfile, setToken, setLoading } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthChange(async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        const [profile, token] = await Promise.all([
          getUserProfile(fbUser.uid),
          fbUser.getIdToken(),
        ]);
        setProfile(profile);
        setToken(token);

        // Refresh token every 50 minutes (Firebase tokens expire at 1 hour)
        const refreshInterval = setInterval(async () => {
          const newToken = await getIdToken();
          setToken(newToken);
        }, 50 * 60 * 1000);

        setLoading(false);
        return () => clearInterval(refreshInterval);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsub();
  }, [setUser, setProfile, setToken, setLoading]);

  return null;
}

// Background sync: flush offline queue when online
function SyncEngine() {
  const { schoolId, idToken } = useAuthStore();
  const syncingRef = useRef(false);

  useEffect(() => {
    const attemptSync = async () => {
      if (!schoolId || !idToken || syncingRef.current) return;
      if (!navigator.onLine) return;

      const pending = await getQueueCount();
      if (pending === 0) return;

      syncingRef.current = true;
      try {
        const { synced, failed } = await syncPendingItems(schoolId, idToken);
        if (synced > 0) console.log(`[Sync] ${synced} items synced`);
        if (failed > 0) console.warn(`[Sync] ${failed} items failed`);
      } finally {
        syncingRef.current = false;
      }
    };

    // Sync on: online event, tab focus, every 2 minutes
    window.addEventListener("online", attemptSync);
    window.addEventListener("focus",  attemptSync);
    const interval = setInterval(attemptSync, 2 * 60 * 1000);
    attemptSync(); // also attempt immediately on mount

    return () => {
      window.removeEventListener("online", attemptSync);
      window.removeEventListener("focus",  attemptSync);
      clearInterval(interval);
    };
  }, [schoolId, idToken]);

  return null;
}
