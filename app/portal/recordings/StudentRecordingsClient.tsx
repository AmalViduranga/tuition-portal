"use client";

import { useCallback, useMemo, useState } from "react";
import { Button, Card, SearchBar, Select } from "@/components/ui";
import { RecordingWatchModal, StudentRecordingRow } from "@/components/recordings";
import type { StudentRecordingsPayload } from "@/lib/recordings/student-recordings";

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
}: {
  initialData: StudentRecordingsPayload;
}) {
  const [recordings, setRecordings] = useState(initialData.recordings);
  const [accessibleClasses, setAccessibleClasses] = useState(initialData.accessible_classes);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);

  const fetchRecordings = useCallback(async (classId: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = classId
        ? `/api/student/recordings?class_id=${encodeURIComponent(classId)}`
        : "/api/student/recordings";
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 403) throw new Error("Access denied or account inactive");
        throw new Error("Failed to load recordings");
      }
      const data = await response.json();
      setRecordings(data.recordings ?? []);
      setAccessibleClasses(data.accessible_classes ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClassFilterChange = (classId: string) => {
    setSelectedClassId(classId);
    void fetchRecordings(classId);
  };

  const normalized = useMemo(
    () =>
      recordings.map((r) => ({
        ...r,
        class_groups: normalizeClassGroup(r.class_groups),
      })),
    [recordings],
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return normalized;
    return normalized.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.description?.toLowerCase().includes(q) ?? false) ||
        (r.class_groups?.name.toLowerCase().includes(q) ?? false),
    );
  }, [normalized, searchQuery]);

  const sections = useMemo(() => {
    if (selectedClassId) {
      const title =
        accessibleClasses.find((c) => c.id === selectedClassId)?.name ?? "Selected class";
      return [{ title, items: filtered }];
    }
    const byClass = filtered.reduce<Record<string, typeof filtered>>((acc, rec) => {
      const name = rec.class_groups?.name ?? "Other";
      if (!acc[name]) acc[name] = [];
      acc[name].push(rec);
      return acc;
    }, {});
    return Object.entries(byClass).map(([title, items]) => ({ title, items }));
  }, [filtered, selectedClassId, accessibleClasses]);

  const openRecording = async (recording: (typeof normalized)[number]) => {
    try {
      await fetch(`/api/student/recordings/${recording.id}/view`, { method: "POST" });
      setRecordings((prev) =>
        prev.map((r) =>
          r.id === recording.id
            ? { ...r, views_count: (r.views_count ?? 0) + 1 }
            : r,
        ),
      );
    } catch {
      /* view logging is best-effort */
    }
    const raw = recordings.find((r) => r.id === recording.id) ?? recording;
    setSelectedRecording({ ...raw, class_groups: recording.class_groups });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Class recordings</h1>
          <p className="mt-1 text-sm text-slate-600">
            Lessons you are eligible to watch, organized by class.
          </p>
        </div>
        {accessibleClasses.length > 0 ? (
          <div className="w-full sm:max-w-xs">
            <Select
              label="Filter by class"
              value={selectedClassId}
              onChange={(e) => handleClassFilterChange(e.target.value)}
              options={[
                { value: "", label: "All classes" },
                ...accessibleClasses.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </div>
        ) : null}
      </div>

      <Card padding="sm">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by title, description, or class…"
        />
      </Card>

      {loading ? (
        <div className="flex justify-center py-16">
          <div
            className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"
            aria-label="Loading"
          />
        </div>
      ) : recordings.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
              🎬
            </div>
            <h2 className="text-lg font-semibold text-slate-900">No recordings yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              {selectedClassId
                ? "There are no recordings for this class that you can access right now."
                : "When your enrollments and payments are set up, published lessons will appear here."}
            </p>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <p className="text-lg font-medium text-slate-900">No matches</p>
            <p className="mt-2 text-sm text-slate-600">Try a different search or class filter.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-10">
          {sections.map(({ title, items }) => (
            <section key={title} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {items.length}
                </span>
              </div>
              <ul className="space-y-3">
                {items.map((rec) => (
                  <li key={rec.id}>
                    <StudentRecordingRow recording={rec} onOpen={() => void openRecording(rec)} />
                  </li>
                ))}
              </ul>
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
