"use client";

import { useCallback, useMemo, useState } from "react";
import { 
  FileText, 
  Download, 
  ExternalLink, 
  FileArchive, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  BookOpen, 
  Calendar
} from "lucide-react";
import { Card, SearchBar, Select, Badge } from "@/components/ui";
import type { StudentMaterialsPayload } from "@/lib/materials/student-materials";
import { uniqueBy } from "@/lib/utils/arrays";

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
  highlight,
}: {
  initialData: StudentMaterialsPayload;
  highlight?: string;
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

  const renderFileIcon = (fileType?: string | null, materialType?: string) => {
    if (fileType?.includes("pdf")) {
      return <FileText className="w-5 h-5 text-rose-500 dark:text-rose-400" />;
    }
    if (fileType?.includes("image")) {
      return <ImageIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
    }
    if (fileType?.includes("video")) {
      return <VideoIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />;
    }
    if (fileType?.includes("zip") || fileType?.includes("compressed")) {
      return <FileArchive className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />;
    }
    if (materialType === "paper" || materialType === "tute") {
      return <BookOpen className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
    }
    return <FileText className="w-5 h-5 text-slate-500 dark:text-slate-400" />;
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Class Materials</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tutes, papers, and lecture notes you can access for your classes.
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
                ...uniqueBy(accessibleClasses, (c) => c.id).map((c) => ({ value: c.id, label: c.name })),
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
          <div className="p-6 text-center text-red-600 dark:text-red-400">
            <p>{error}</p>
          </div>
        </Card>
      ) : loading ? (
        <div className="flex justify-center py-16">
          <div
            className="h-9 w-9 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
            aria-label="Loading"
          />
        </div>
      ) : materials.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <BookOpen className="w-7 h-7" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">No materials yet</h2>
            <p className="mx-auto mt-1.5 max-w-md text-xs text-slate-500 dark:text-slate-400">
              {selectedClassId
                ? "There are no materials for this class that you can access right now."
                : "When your enrollments and payments are set up, uploaded tutes and papers will appear here."}
            </p>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <p className="text-base font-bold text-slate-900 dark:text-white">No matches found</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Try a different search or class filter.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-10">
          {sections.map(({ title, items }) => (
            <section key={title} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {items.length}
                </span>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((mat) => (
                  <li key={mat.id} id={mat.id}>
                    <Card
                      className={`group flex flex-col justify-between overflow-hidden transition-all duration-200 hover:border-blue-500/30 dark:hover:border-blue-500/40 ${
                        mat.id === highlight ? "border-blue-500 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-md ring-1 ring-blue-500" : ""
                      }`}
                      padding="none"
                    >
                      <div className="p-5 flex flex-col h-full relative">
                        {mat.is_manually_unlocked && (
                          <div className="absolute top-3 right-3">
                            <Badge variant="info" className="flex items-center gap-1 font-semibold text-xs">
                              Unlocked
                            </Badge>
                          </div>
                        )}
                        <div className="flex items-start gap-3.5">
                          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
                            {renderFileIcon(mat.file_type, mat.material_type)}
                          </div>
                          <div className="flex-1 min-w-0 pr-6">
                            <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white" title={mat.title}>
                              {mat.title}
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                              <span className="capitalize">{mat.material_type}</span>
                              {mat.file_size && (
                                <>
                                  <span>&middot;</span>
                                  <span>{formatFileSize(mat.file_size)}</span>
                                </>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                              <Calendar className="w-3 h-3" />
                              <span>Released {new Date(mat.release_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 w-full">
                          <a
                            href={`/api/student/materials/${mat.id}/download?action=view`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open
                          </a>
                          <a
                            href={`/api/student/materials/${mat.id}/download?action=download`}
                            download
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/50"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
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

