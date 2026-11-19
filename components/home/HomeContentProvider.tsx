"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { PublicContentResult } from "@/lib/public-content";

interface LivePublicContentState {
  content: PublicContentResult;
  refreshing: boolean;
  refreshError: string;
}

const HomeContentContext = createContext<LivePublicContentState | null>(null);

export function useLivePublicContent(
  initial: PublicContentResult,
  enabled = true
): LivePublicContentState {
  const [content, setContent] = useState<PublicContentResult>(initial);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(
    initial.status === "error" ? initial.message : ""
  );
  const inFlight = useRef(false);
  const controller = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    const request = new AbortController();
    controller.current = request;
    setRefreshing(true);
    try {
      const response = await fetch("/api/public/site-content", {
        cache: "no-store",
        signal: request.signal,
      });
      const result: PublicContentResult = await response.json();
      if (!response.ok || result.status !== "ready") {
        throw new Error("Could not refresh public content.");
      }
      if (!request.signal.aborted) {
        setContent(result);
        setRefreshError("");
      }
    } catch {
      if (!request.signal.aborted) {
        setRefreshError("Unable to check for updates right now.");
      }
    } finally {
      inFlight.current = false;
      if (!request.signal.aborted) {
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    if (initial.status === "error") {
      void refresh();
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };
    const onFocus = () => {
      void refresh();
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void refresh();
      }
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisible);
      controller.current?.abort();
    };
  }, [enabled, initial.status, refresh]);

  return { content, refreshing, refreshError };
}

export function HomeContentProvider({
  initial,
  children,
}: {
  initial: PublicContentResult;
  children: React.ReactNode;
}) {
  const state = useLivePublicContent(initial, true);
  return (
    <HomeContentContext.Provider value={state}>
      {children}
    </HomeContentContext.Provider>
  );
}

export function useSyncedPublicContent(initial: PublicContentResult): LivePublicContentState {
  const shared = useContext(HomeContentContext);
  const standalone = useLivePublicContent(initial, !shared);
  return shared ?? standalone;
}
