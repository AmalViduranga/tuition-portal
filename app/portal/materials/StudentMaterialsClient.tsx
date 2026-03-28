"use client";

import { useCallback, useMemo, useState } from "react";
import { Button, Card, SearchBar, Select, Badge } from "@/components/ui";
import type { StudentMaterialsPayload } from "@/lib/materials/student-materials";

type Material = StudentMaterialsPayload["materials"][number];

function normalizeClassGroup(
  raw: Material["class_groups"],
): { id: string; name: string } | null {
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw;
}

export default function StudentMaterialsClient({
  initialData,
}: {
  initialData: StudentMaterialsPayload;
}) {
  const [materials, setMaterials] = useState(initialData.materials);
  const [accessibleClasses, setAccessibleClasses] = useState(initialData.accessible_classes);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterials = useCallback(async (classId: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = classId
        ? `/api/student/materials?class_id=${encodeURIComponent(classId)}`
        : "/api/student/materials";
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 403) throw new Error("Access denied or account inactive");
        throw new Error("Failed to load materials");
      }
      const data = await response.json();
      setMaterials(data.materials ?? []);
      setAccessibleClasses(data.accessible_classes ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClassFilterChange = (classId: string) => {
    setSelectedClassId(classId);
    void fetchMaterials(classId);
  };

  const normalized = useMemo(
    () =>
      materials.map((m) => ({
        ...m,
        class_groups: normalizeClassGroup(m.class_groups),
      })),
    [materials],
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return normalized;
    return normalized.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.class_groups?.name.toLowerCase().includes(q) ?? false),
    );
  }, [normalized, searchQuery]);

  const sections = useMemo(() => {
    if (selectedClassId) {
      const title =
        accessibleClasses.find((c) => c.id === selectedClassId)?.name ?? "Selected class";
      return [{ title, items: filtered }];
    }
    const byClass = filtered.reduce<Record<string, typeof filtered>>((acc, mat) => {
      const name = mat.class_groups?.name ?? "Other";
      if (!acc[name]) acc[name] = [];
      acc[name].push(mat);
      return acc;
    }, {});
    return Object.entries(byClass).map(([title, items]) => ({ title, items }));
  }, [filtered, selectedClassId, accessibleClasses]);

  const getFileIcon = (fileType?: string | null, materialType?: string) => {
    if (fileType?.includes("pdf")) return "📕";
    if (fileType?.includes("image")) return "🖼️";
    if (fileType?.includes("video")) return "🎬";
    if (fileType?.includes("zip") || fileType?.includes("compressed")) return "📦";
    if (materialType === "paper") return "📝";
    if (materialType === "tute") return "📚";
    if (materialType === "revision") return "📖";
    return "📄";
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Class Materials</h1>
          <p className="mt-1 text-sm text-slate-600">
            Tutes, papers, and notes you can access for your classes.
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
          placeholder="Search by title or class…"
        />
      </Card>

      {error ? (
        <Card>
          <div className="p-6 text-center text-red-600">
            <p>{error}</p>
          </div>
        </Card>
      ) : loading ? (
        <div className="flex justify-center py-16">
          <div
            className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"
            aria-label="Loading"
          />
        </div>
      ) : materials.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
              📚
            </div>
            <h2 className="text-lg font-semibold text-slate-900">No materials yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              {selectedClassId
                ? "There are no materials for this class that you can access right now."
                : "When your enrollments and payments are set up, uploaded tutes and papers will appear here."}
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
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((mat) => (
                  <li key={mat.id}>
                    <Card
                      className="group flex flex-col justify-between overflow-hidden transition-all hover:border-indigo-200 hover:shadow-md"
                      padding="none"
                    >
                      <div className="p-4 flex flex-col h-full relative">
                        {mat.is_manually_unlocked && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="info">Unlocked</Badge>
                          </div>
                        )}
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 text-2xl shadow-sm ring-1 ring-slate-100">
                            {getFileIcon(mat.file_type, mat.material_type)}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h3 className="truncate text-base font-medium text-slate-900" title={mat.title}>
                              {mat.title}
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                              <span className="capitalize">{mat.material_type}</span>
                              {mat.file_size && (
                                <>
                                  <span>&middot;</span>
                                  <span>{formatFileSize(mat.file_size)}</span>
                                </>
                              )}
                            </div>
                            <div className="mt-1 text-xs text-slate-400">
                              Released: {new Date(mat.release_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="mt-5 w-full">
                          <a
                            href={mat.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full min-h-[44px] items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-700"
                          >
                            Open Material
                          </a>
                        </div>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
