"use client";

import { useState, useEffect, useCallback } from "react";
import { addRecording, updateRecording, toggleRecordingStatus } from "@/app/admin/actions";
import { Card, Button, Input, Textarea, SearchBar, Badge, DateFormat, Modal, Table } from "@/components/ui";

type Recording = {
  id: string;
  title: string;
  description: string;
  youtube_video_id: string;
  release_at: string;
  published: boolean;
  thumbnail_url?: string;
  class_groups: { name: string } | null;
};

type Class = {
  id: string;
  name: string;
};

export default function AdminRecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

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
    setFormData({
      class_id: recording.class_groups?.id || "",
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

  const getYouTubeThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const filteredRecordings = recordings.filter((rec) =>
    rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rec.class_groups?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: "preview",
      header: "Preview",
      render: (rec: Recording) => (
        <a
          href={`https://www.youtube.com/watch?v=${rec.youtube_video_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src={getYouTubeThumbnail(rec.youtube_video_id)}
            alt={rec.title}
            className="w-24 h-16 object-cover rounded-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${rec.youtube_video_id}/hqdefault.jpg`;
            }}
          />
        </a>
      ),
    },
    {
      key: "title",
      header: "Title & Description",
      render: (rec: Recording) => (
        <div className="max-w-md">
          <p className="font-medium text-slate-900">{rec.title}</p>
          {rec.description && (
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{rec.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "class",
      header: "Class",
      render: (rec: Recording) => (
        <Badge variant="info">{rec.class_groups?.name || "No class"}</Badge>
      ),
    },
    {
      key: "release_at",
      header: "Release Date",
      render: (rec: Recording) => <DateFormat date={rec.release_at} format="short" />,
    },
    {
      key: "published",
      header: "Status",
      render: (rec: Recording) => (
        <Badge variant={rec.published ? "success" : "warning"}>
          {rec.published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (rec: Recording) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            href={`https://www.youtube.com/watch?v=${rec.youtube_video_id}`}
            target="_blank"
          >
            Watch
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleEdit(rec)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant={rec.published ? "warning" : "success"}
            onClick={() => handleToggleStatus(rec)}
          >
            {rec.published ? "Unpublish" : "Publish"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recordings</h1>
          <p className="text-sm text-slate-600 mt-1">Manage class recordings and YouTube content</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          + Add Recording
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search recordings by title, class, or description..."
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : (
          <Table
            columns={columns}
            data={filteredRecordings}
            emptyMessage="No recordings found"
            className="border border-slate-200 rounded-lg overflow-hidden"
          />
        )}
      </Card>

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
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Class"
              name="class_id"
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              options={classes.map((cls) => ({ value: cls.id, label: cls.name }))}
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
          <div className="grid grid-cols-2 gap-4">
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
          <Input
            label="Thumbnail (optional)"
            name="thumbnail"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = (e.target as HTMLInputElement).files?.[0] || null;
              setFormData({ ...formData, thumbnail: file });
            }}
            helperText="Custom thumbnail image (auto-loads from YouTube if not provided)"
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
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
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Class"
              name="class_id"
              value={formData.class_id}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              options={classes.map((cls) => ({ value: cls.id, label: cls.name }))}
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
          <div className="grid grid-cols-2 gap-4">
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
          <Input
            label="New Thumbnail (optional)"
            name="thumbnail"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = (e.target as HTMLInputElement).files?.[0] || null;
              setFormData({ ...formData, thumbnail: file });
            }}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              Update Recording
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
