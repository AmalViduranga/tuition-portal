"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid, List, Video } from "lucide-react";
import { Card, SearchBar, Select } from "@/components/ui";
import { RecordingWatchModal, StudentRecordingRow, StudentRecordingCard } from "@/components/recordings";
import type { StudentRecordingsPayload } from "@/lib/recordings/student-recordings";
import { uniqueBy } from "@/lib/utils/arrays";

type Recording = StudentRecordingsPayload["recordings"][number];

function normalizeClassGroup(
  raw: Recording["class_groups"],
): { id: string; name: string } | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw;
}

export default function StudentRecordingsClient({
  initialData,
  initialClassId = "",
  highlight,
}: {
  initialData: StudentRecordingsPayload;
  initialClassId?: string;
  highlight?: string;
}) {
  const router = useRouter();
  const [recordings, setRecordings] = useState(initialData.recordings);
  const [accessibleClasses, setAccessibleClasses] = useState(() =>
    uniqueBy(initialData.accessible_classes, (c) => c.id),
  );
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const requestSeqRef = useRef(0);
  const openedHighlightRef = useRef<string | null>(null);

  // Keep client state synchronized with server-rendered props on URL / Back / Refresh navigation.
  useEffect(() => {
    requestSeqRef.current += 1;
    setRecordings(initialData.recordings);
    setAccessibleClasses(uniqueBy(initialData.accessible_classes, (c) => c.id));
    setSelectedClassId(initialClassId);
    setError(null);
    setLoading(false);
  }, [initialData, initialClassId]);

  useEffect(() => {
    const saved = localStorage.getItem("recordingViewMode");
    if (saved === "list" || saved === "grid") {
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (mode: "list" | "grid") => {
    setViewMode(mode);
    localStorage.setItem("recordingViewMode", mode);
  };

  const logRecordingView = useCallback((recordingId: string) => {
    void fetch(`/api/student/recordings/${encodeURIComponent(recordingId)}/view`, { method: "POST" })
      .then((res) => {
        if (!res.ok) return;
        setRecordings((prev) =>
          prev.map((r) =>
            r.id === recordingId
              ? { ...r, views_count: (r.views_count ?? 0) + 1 }
              : r,
          ),
        );
      })
      .catch(() => {
        /* View counting is best-effort and must never interrupt playback. */
      });
  }, []);

  const openRecording = useCallback(
    (recording: Recording) => {
      setSelectedRecording({
        ...recording,
        class_groups: normalizeClassGroup(recording.class_groups),
      });
      logRecordingView(recording.id);
    },
    [logRecordingView],
  );

  // Auto-open the exact permitted recording when arriving via dashboard or notification deep link.
  useEffect(() => {
    if (!highlight || openedHighlightRef.current === highlight) return;
    const match = recordings.find((r) => r.id === highlight);
    if (!match) return;
    openedHighlightRef.current = highlight;
    openRecording(match);
  }, [highlight, recordings, openRecording]);

  const fetchRecordings = useCallback(async (classId: string) => {
    const seq = ++requestSeqRef.current;
    try {
      setLoading(true);
      setError(null);
      const url = classId
        ? `/api/student/recordings?class_id=${encodeURIComponent(classId)}`
        : "/api/student/recordings";
      const response = await fetch(url);
      if (seq !== requestSeqRef.current) return;
      if (!response.ok) {
        if (response.status === 403) throw new Error("Access denied or account inactive.");
        throw new Error("Could not load recordings. Please try again.");
      }
      const data = await response.json();
      if (seq !== requestSeqRef.current) return;
      setRecordings(data.recordings ?? []);
      setAccessibleClasses(
        uniqueBy((data.accessible_classes ?? []) as StudentRecordingsPayload["accessible_classes"], (c) => c.id),
      );
    } catch (e) {
      if (seq !== requestSeqRef.current) return;
      setError(e instanceof Error ? e.message : "Could not load recordings. Please try again.");
    } finally {
      if (seq === requestSeqRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const handleClassFilterChange = (classId: string) => {
    setSelectedClassId(classId);
    const nextUrl = classId
      ? `/portal/recordings?class_id=${encodeURIComponent(classId)}`
      : "/portal/recordings";
    router.push(nextUrl, { scroll: false });
    void fetchRecordings(classId);
  };

  const selectedClass = useMemo(
    () => (selectedClassId ? accessibleClasses.find((c) => c.id === selectedClassId) ?? null : null),
    [accessibleClasses, selectedClassId],
  );

  const isInaccessibleClassFilter = Boolean(selectedClassId) && !selectedClass;

  const normalized = useMemo(
    () =>
      recordings.map((r) => ({
        ...r,
        class_groups: normalizeClassGroup(r.class_groups),
      })),
    [recordings],
  );

  const filtered = useMemo(() => {
    if (isInaccessibleClassFilter) return [];

    const q = searchQuery.trim().toLowerCase();
    const activeClassIds = new Set(accessibleClasses.map((c) => c.id));

    // Inactive classes disappear from recordings view and search results
    let list = normalized.filter((r) => activeClassIds.has(r.class_id));

    if (selectedClassId) {
      list = list.filter((r) => r.class_id === selectedClassId);
    }

    if (!q) return list;
    return list.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.description?.toLowerCase().includes(q) ?? false) ||
        (r.class_groups?.name.toLowerCase().includes(q) ?? false),
    );
  }, [normalized, searchQuery, selectedClassId, accessibleClasses, isInaccessibleClassFilter]);

  const sections = useMemo(() => {
    if (selectedClassId && selectedClass) {
      return [{ title: selectedClass.name, items: filtered }];
    }
    const byClass = filtered.reduce<Record<string, typeof filtered>>((acc, rec) => {
      const name = rec.class_groups?.name ?? "Other";
      if (!acc[name]) acc[name] = [];
      acc[name].push(rec);
      return acc;
    }, {});
    return Object.entries(byClass).map(([title, items]) => ({ title, items }));
  }, [filtered, selectedClassId, selectedClass]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {selectedClass ? `${selectedClass.name} Recordings` : "Class Recordings"}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {selectedClass
              ? `Recordings you can watch in ${selectedClass.name}.`
              : "Lessons you are eligible to watch, organized by class."}
          </p>
        </div>
        {accessibleClasses.length > 0 ? (
          <div className="w-full sm:max-w-xs">
            <Select
              label="Filter by class"
              value={isInaccessibleClassFilter ? "" : selectedClassId}
              onChange={(e) => handleClassFilterChange(e.target.value)}
              options={[
                { value: "", label: "All classes" },
                ...accessibleClasses.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </div>
        ) : null}
      </div>

      <Card padding="sm" className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title, description, or class…"
          />
        </div>
        <div className="hidden sm:flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => handleViewModeChange("list")}
            aria-pressed={viewMode === "list"}
            className={`p-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              viewMode === "list"
                ? "bg-card text-link border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange("grid")}
            aria-pressed={viewMode === "grid"}
            className={`p-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              viewMode === "grid"
                ? "bg-card text-link border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {error ? (
        <Card>
          <div role="alert" className="py-10 text-center">
            <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>
          </div>
        </Card>
      ) : loading ? (
        <div className="flex justify-center py-16">
          <div
            className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent"
            aria-label="Loading"
          />
        </div>
      ) : isInaccessibleClassFilter ? (
        <Card>
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Video className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold text-foreground">Class not available</h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              You do not have active access to recordings for this class, or the class could not be found.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/portal/classes"
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Back to My Classes
              </Link>
              <Link
                href="/portal/recordings"
                className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors"
              >
                View All My Recordings
              </Link>
            </div>
          </div>
        </Card>
      ) : recordings.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Video className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold text-foreground">
              {selectedClass ? `No recordings in ${selectedClass.name} yet` : "No recordings yet"}
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              {selectedClass
                ? `There are no recordings for ${selectedClass.name} that you can watch right now.`
                : "When your enrollments and payments are set up, published lessons will appear here."}
            </p>
            {selectedClass ? (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => handleClassFilterChange("")}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Show all my classes
                </button>
              </div>
            ) : null}
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <p className="text-base font-bold text-foreground">No matches found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different search query or class filter.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-10">
          {sections.map(({ title, items }) => (
            <section key={title} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2.5">
                <h2 className="text-sm font-bold text-foreground tracking-tight">{title}</h2>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {items.length}
                </span>
              </div>
              {viewMode === "list" ? (
                <ul className="space-y-3">
                  {items.map((rec) => (
                    <li key={`${title}-${rec.id}`}>
                      <StudentRecordingRow recording={rec} isHighlighted={rec.id === highlight} onOpen={() => openRecording(rec)} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((rec) => (
                    <StudentRecordingCard key={`${title}-${rec.id}`} recording={rec} isHighlighted={rec.id === highlight} onOpen={() => openRecording(rec)} />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {selectedRecording ? (
        <RecordingWatchModal
          recording={{
            id: selectedRecording.id,
            title: selectedRecording.title,
            description: selectedRecording.description,
            youtube_video_id: selectedRecording.youtube_video_id,
            release_at: selectedRecording.release_at,
            class_groups: normalizeClassGroup(selectedRecording.class_groups),
            is_manually_unlocked: selectedRecording.is_manually_unlocked,
          }}
          onClose={() => setSelectedRecording(null)}
        />
      ) : null}
    </div>
  );
}
