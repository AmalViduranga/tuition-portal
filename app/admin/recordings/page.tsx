"use client";

import { useState, useEffect, useCallback } from "react";
import { addRecording, updateRecording, toggleRecordingStatus, deleteRecording } from "@/app/admin/actions";
import { Card, Button, Input, Textarea, SearchBar, Badge, DateFormat, Modal, Select } from "@/components/ui";
import { youtubeThumbnailFallbackUrl, youtubeThumbnailUrl } from "@/lib/recordings/youtube";

type Recording = {
  id: string;
  title: string;
  description: string;
  youtube_video_id: string;
  release_at: string;
  published: boolean;
  thumbnail_url?: string;
  class_groups: { id: string; name: string } | { id: string; name: string }[] | null;
  created_at: string;
  views_count?: number;
};

function recordingClassLabel(rec: Recording): string {
  const g = rec.class_groups;
  if (!g) return "Unassigned";
  const row = Array.isArray(g) ? g[0] : g;
  return row?.name ?? "Unassigned";
}

type Class = {
  id: string;
  name: string;
  is_active: boolean;
};

type FilterState = {
  search: string;
  classFilter: string;
  publishedFilter: "all" | "published" | "draft";
};

export default function AdminRecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [formData, setFormData] = useState({
    class_id: "",
    title: "",
    description: "",
    youtube_video_id: "",
    release_at: "",
    published: true,
    thumbnail: null as File | null,
  });
  const [bulkFormData, setBulkFormData] = useState({
    class_id: "",
    urls: "",
    default_published: true,
    default_release_date: new Date().toISOString().split("T")[0],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    classFilter: "",
    publishedFilter: "all",
  });

  const fetchRecordings = useCallback(async () => {
    try {
      setLoading(true);
      const [recRes, classRes] = await Promise.all([
        fetch("/api/admin/recordings"),
        fetch("/api/admin/classes"),
      ]);

      if (!recRes.ok || !classRes.ok) throw new Error("Failed to fetch data");

      const [recData, classData] = await Promise.all([recRes.json(), classRes.json()]);
      setRecordings(recData);
      setClasses(classData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const form = new FormData();
      form.append("class_id", formData.class_id);
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("youtube_video_id", formData.youtube_video_id);
      form.append("release_at", formData.release_at);
      if (formData.published) form.append("published", "on");
      if (formData.thumbnail) form.append("thumbnail", formData.thumbnail);

      const response = await fetch("/api/admin/recordings", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create recording");
      }

      setIsModalOpen(false);
      setFormData({
        class_id: "",
        title: "",
        description: "",
        youtube_video_id: "",
        release_at: "",
        published: true,
        thumbnail: null,
      });
      await fetchRecordings();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (recording: Recording) => {
    setSelectedRecording(recording);
    const cg = recording.class_groups;
    const classId = Array.isArray(cg) ? cg[0]?.id : cg?.id;
    setFormData({
      class_id: classId || "",
      title: recording.title,
      description: recording.description || "",
      youtube_video_id: recording.youtube_video_id,
      release_at: recording.release_at,
      published: recording.published,
      thumbnail: null,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecording) return;

    setFormError(null);
    setFormLoading(true);

    try {
      const form = new FormData();
      form.append("recording_id", selectedRecording.id);
      form.append("class_id", formData.class_id);
      form.append("title", formData.title);
      form.append("description", formData.description);
      form.append("youtube_video_id", formData.youtube_video_id);
      form.append("release_at", formData.release_at);
      if (formData.published) form.append("published", "on");
      if (formData.thumbnail) form.append("thumbnail", formData.thumbnail);

      const response = await fetch("/api/admin/recordings", {
        method: "PUT",
        body: form,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update recording");
      }

      setIsEditModalOpen(false);
      setSelectedRecording(null);
      setFormData({
        class_id: "",
        title: "",
        description: "",
        youtube_video_id: "",
        release_at: "",
        published: true,
        thumbnail: null,
      });
      await fetchRecordings();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setFormLoading(false);
    }
  };

  const extractVideoIds = (text: string) => {
    const ids: string[] = [];
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (!ids.includes(match[1])) ids.push(match[1]);
    }
    return ids;
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    const ids = extractVideoIds(bulkFormData.urls);
    if (ids.length === 0) {
      setFormError("No valid YouTube URLs found.");
      return;
    }

    setFormLoading(true);

    try {
      const recordings = ids.map((id, index) => {
        const releaseDate = new Date(bulkFormData.default_release_date);
        releaseDate.setDate(releaseDate.getDate() + index); // Auto-increment date by 1 day per video
        return {
          youtube_video_id: id,
          title: `Video ${id}`, 
          release_at: releaseDate.toISOString(),
        };
      });

      const response = await fetch("/api/admin/recordings/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: bulkFormData.class_id,
          default_published: bulkFormData.default_published,
          recordings,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to bulk create recordings");
      }

      setIsBulkModalOpen(false);
      setBulkFormData({
        class_id: "",
        urls: "",
        default_published: true,
        default_release_date: new Date().toISOString().split("T")[0],
      });
      await fetchRecordings();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (recording: Recording) => {
    if (!confirm(`Are you sure you want to delete "${recording.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const form = new FormData();
      form.append("recording_id", recording.id);

      const response = await fetch("/api/admin/recordings/delete", {
        method: "POST",
        body: form,
      });

      if (!response.ok) throw new Error("Failed to delete recording");
      await fetchRecordings();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleToggleStatus = async (recording: Recording) => {
    try {
      const form = new FormData();
      form.append("recording_id", recording.id);

      const response = await fetch("/api/admin/recordings/toggle", {
        method: "POST",
        body: form,
      });

      if (!response.ok) throw new Error("Failed to toggle status");
      await fetchRecordings();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const filteredRecordings = recordings.filter((rec) => {
    const classId = Array.isArray(rec.class_groups) ? rec.class_groups[0]?.id : rec.class_groups?.id;
    const className = recordingClassLabel(rec);
    const matchesSearch =
      rec.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      (rec.description || "").toLowerCase().includes(filters.search.toLowerCase()) ||
      className.toLowerCase().includes(filters.search.toLowerCase());

    const matchesClass = !filters.classFilter || classId === filters.classFilter;
    const matchesPublished =
      filters.publishedFilter === "all" ||
      (filters.publishedFilter === "published" && rec.published) ||
      (filters.publishedFilter === "draft" && !rec.published);

    return matchesSearch && matchesClass && matchesPublished;
  });

  const recordingsByClass = filteredRecordings.reduce<Record<string, Recording[]>>((acc, rec) => {
    const label = recordingClassLabel(rec);
    if (!acc[label]) acc[label] = [];
    acc[label].push(rec);
    return acc;
  }, {});

  const recordingSections = Object.entries(recordingsByClass).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recordings</h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage class videos and YouTube content
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsBulkModalOpen(true)} size="sm" variant="outline">
            Bulk Add
          </Button>
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            + Add Recording
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchBar
            value={filters.search}
            onChange={(search) => setFilters((prev) => ({ ...prev, search }))}
            placeholder="Search recordings..."
          />
          <Select
            value={filters.classFilter}
            onChange={(e) => setFilters((prev) => ({ ...prev, classFilter: e.target.value }))}
            options={[
              { value: "", label: "All Classes" },
              ...classes.filter((c) => c.is_active).map((cls) => ({
                value: cls.id,
                label: cls.name,
              })),
            ]}
          />
          <Select
            value={filters.publishedFilter}
            onChange={(e) => setFilters((prev) => ({ ...prev, publishedFilter: e.target.value as "all" | "published" | "draft" }))}
            options={[
              { value: "all", label: "All Status" },
              { value: "published", label: "Published" },
              { value: "draft", label: "Draft" },
            ]}
          />
        </div>
      </Card>

      <div className="space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : error ? (
          <Card>
            <div className="py-12 text-center text-red-600">{error}</div>
          </Card>
        ) : filteredRecordings.length === 0 ? (
          <Card>
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                🎥
              </div>
              <h2 className="text-lg font-semibold text-slate-900">No recordings</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                {filters.search || filters.classFilter || filters.publishedFilter !== "all"
                  ? "Nothing matches your filters. Try adjusting search or class."
                  : "Add a recording to attach a YouTube lesson to a class."}
              </p>
            </div>
          </Card>
        ) : (
          recordingSections.map(([className, recs]) => (
            <section key={className} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <h2 className="text-base font-semibold text-slate-900">{className}</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {recs.length}
                </span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {recs.map((rec) => (
                  <article
                    key={rec.id}
                    className="flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm"
                  >
                    <a
                      href={`https://www.youtube.com/watch?v=${rec.youtube_video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative block aspect-video bg-slate-100"
                    >
                      <img
                        src={rec.thumbnail_url || youtubeThumbnailUrl(rec.youtube_video_id)}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement;
                          el.src = rec.thumbnail_url
                            ? youtubeThumbnailFallbackUrl(rec.youtube_video_id)
                            : youtubeThumbnailFallbackUrl(rec.youtube_video_id);
                        }}
                      />
                    </a>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="font-semibold text-slate-900 line-clamp-2">{rec.title}</h3>
                      {rec.description ? (
                        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{rec.description}</p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <DateFormat date={rec.release_at} format="short" />
                        <Badge variant={rec.published ? "success" : "warning"}>
                          {rec.published ? "Published" : "Draft"}
                        </Badge>
                        {typeof rec.views_count === "number" ? (
                          <span className="text-slate-500">{rec.views_count} views</span>
                        ) : null}
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                        <a
                          href={`https://www.youtube.com/watch?v=${rec.youtube_video_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:flex-none"
                        >
                          Watch
                        </a>
                        <Button size="sm" variant="ghost" type="button" onClick={() => handleEdit(rec)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant={rec.published ? "outline" : "primary"}
                          type="button"
                          onClick={() => handleToggleStatus(rec)}
                        >
                          {rec.published ? "Unpublish" : "Publish"}
                        </Button>
                        <Button size="sm" variant="danger" type="button" onClick={() => handleDelete(rec)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Create Recording Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormError(null);
          setFormData({
            class_id: "",
            title: "",
            description: "",
            youtube_video_id: "",
            release_at: "",
            published: true,
            thumbnail: null,
          });
        }}
        title="Add Recording"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Class"
              name="class_id"
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              options={classes.filter((c) => c.is_active).map((cls) => ({ value: cls.id, label: cls.name }))}
              placeholder="Select class"
              required
            />
            <Input
              label="YouTube Video ID"
              name="youtube_video_id"
              value={formData.youtube_video_id}
              onChange={(e) => setFormData({ ...formData, youtube_video_id: e.target.value })}
              placeholder="e.g., dQw4w9WgXcQ"
              required
              helperText="The ID from YouTube URL"
            />
          </div>
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Release Date"
              name="release_at"
              type="date"
              value={formData.release_at}
              onChange={(e) => setFormData({ ...formData, release_at: e.target.value })}
              required
            />
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <span className="text-sm text-slate-700">Published (visible to students)</span>
              </label>
            </div>
          </div>
          <Input
            label="Custom Thumbnail (optional)"
            name="thumbnail"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = (e.target as HTMLInputElement).files?.[0] || null;
              setFormData({ ...formData, thumbnail: file });
            }}
            helperText="Upload custom thumbnail (otherwise auto-loaded from YouTube)"
          />
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" loading={formLoading} className="w-full sm:w-auto">
              Add Recording
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Recording Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRecording(null);
          setFormError(null);
        }}
        title="Edit Recording"
        size="lg"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Class"
              name="class_id"
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              options={classes.filter((c) => c.is_active).map((cls) => ({ value: cls.id, label: cls.name }))}
              required
            />
            <Input
              label="YouTube Video ID"
              name="youtube_video_id"
              value={formData.youtube_video_id}
              onChange={(e) => setFormData({ ...formData, youtube_video_id: e.target.value })}
              required
            />
          </div>
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Release Date"
              name="release_at"
              type="date"
              value={formData.release_at}
              onChange={(e) => setFormData({ ...formData, release_at: e.target.value })}
              required
            />
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <span className="text-sm text-slate-700">Published</span>
              </label>
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" loading={formLoading} className="w-full sm:w-auto">
              Update Recording
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Add Recording Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => {
          setIsBulkModalOpen(false);
          setFormError(null);
          setBulkFormData({
            class_id: "",
            urls: "",
            default_published: true,
            default_release_date: new Date().toISOString().split("T")[0],
          });
        }}
        title="Bulk Add Recordings"
        size="lg"
      >
        <form onSubmit={handleBulkSubmit} className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-600 leading-relaxed">
            <p className="font-medium text-slate-700">How it works</p>
            <p className="mt-1">
              Paste multiple YouTube links (comma-separated or one per line). We will extract the Video IDs and create a recording for each, automatically incrementing the release date by 1 day for each subsequent video.
            </p>
          </div>
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {formError}
            </div>
          )}
          
          <Select
            label="Target Class"
            name="class_id"
            value={bulkFormData.class_id}
            onChange={(e) => setBulkFormData({ ...bulkFormData, class_id: e.target.value })}
            options={classes.filter((c) => c.is_active).map((cls) => ({ value: cls.id, label: cls.name }))}
            required
          />

          <Textarea
            label="YouTube URLs"
            name="urls"
            value={bulkFormData.urls}
            onChange={(e) => setBulkFormData({ ...bulkFormData, urls: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=...&#10;https://youtu.be/..."
            rows={5}
            required
          />
          <div className="text-xs text-slate-500">
            Detected Videos: <span className="font-medium text-slate-800">{extractVideoIds(bulkFormData.urls).length}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Starting Release Date"
              name="default_release_date"
              type="date"
              value={bulkFormData.default_release_date}
              onChange={(e) => setBulkFormData({ ...bulkFormData, default_release_date: e.target.value })}
              required
            />
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer mt-7">
                <input
                  type="checkbox"
                  name="default_published"
                  checked={bulkFormData.default_published}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, default_published: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <span className="text-sm text-slate-700">Publish all automatically</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsBulkModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" loading={formLoading} className="w-full sm:w-auto">
              Save {extractVideoIds(bulkFormData.urls).length} Recordings
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
