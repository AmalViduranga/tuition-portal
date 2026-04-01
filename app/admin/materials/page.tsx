"use client";

import { useState, useEffect, useCallback } from "react";
import { addMaterial, updateMaterial, toggleMaterialStatus } from "@/app/admin/actions";
import { Card, Button, Input, SearchBar, Badge, DateFormat, Modal, Table, Select } from "@/components/ui";

type Material = {
  id: string;
  title: string;
  file_url: string;
  file_size?: number;
  file_type?: string;
  release_at: string;
  published: boolean;
  material_type: string;
  class_groups: { name: string } | null;
};

type Class = {
  id: string;
  name: string;
};

const MATERIAL_TYPES = [
  { value: "tute", label: "Tute" },
  { value: "paper", label: "Paper" },
  { value: "revision", label: "Revision" },
  { value: "other", label: "Other" },
];

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [formData, setFormData] = useState({
    class_id: "",
    title: "",
    material_type: "other",
    release_at: "",
    published: true,
    file: null as File | null,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      const [matRes, classRes] = await Promise.all([
        fetch("/api/admin/materials"),
        fetch("/api/admin/classes"),
      ]);

      if (!matRes.ok || !classRes.ok) throw new Error("Failed to fetch data");

      const [matData, classData] = await Promise.all([matRes.json(), classRes.json()]);
      setMaterials(matData);
      setClasses(classData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      if (!formData.file) {
        throw new Error("Please select a file to upload");
      }

      const form = new FormData();
      form.append("class_id", formData.class_id);
      form.append("title", formData.title);
      form.append("material_type", formData.material_type);
      form.append("release_at", formData.release_at);
      if (formData.published) form.append("published", "on");
      form.append("file", formData.file);

      const response = await fetch("/api/admin/materials", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload material");
      }

      setIsModalOpen(false);
      setFormData({
        class_id: "",
        title: "",
        material_type: "other",
        release_at: "",
        published: true,
        file: null,
      });
      await fetchMaterials();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (material: Material) => {
    setSelectedMaterial(material);
    setFormData({
      class_id: (material.class_groups as any)?.id || "",
      title: material.title,
      material_type: material.material_type || "other",
      release_at: material.release_at,
      published: material.published,
      file: null,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    setFormError(null);
    setFormLoading(true);

    try {
      const form = new FormData();
      form.append("material_id", selectedMaterial.id);
      form.append("class_id", formData.class_id);
      form.append("title", formData.title);
      form.append("material_type", formData.material_type);
      form.append("release_at", formData.release_at);
      if (formData.published) form.append("published", "on");
      if (formData.file) form.append("file", formData.file);

      const response = await fetch("/api/admin/materials", {
        method: "PUT",
        body: form,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update material");
      }

      setIsEditModalOpen(false);
      setSelectedMaterial(null);
      setFormData({
        class_id: "",
        title: "",
        material_type: "other",
        release_at: "",
        published: true,
        file: null,
      });
      await fetchMaterials();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (material: Material) => {
    try {
      const form = new FormData();
      form.append("material_id", material.id);

      const response = await fetch("/api/admin/materials/toggle", {
        method: "POST",
        body: form,
      });

      if (!response.ok) throw new Error("Failed to toggle status");
      await fetchMaterials();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleDelete = async (material: Material) => {
    if (!confirm(`Are you sure you want to delete "${material.title}"? This will also remove the file from storage.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/materials?id=${material.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete material");
      }

      await fetchMaterials();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "-";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const getFileIcon = (fileType?: string, materialType?: string) => {
    if (fileType?.includes("pdf")) return "📕";
    if (fileType?.includes("image")) return "🖼️";
    if (fileType?.includes("video")) return "🎬";
    if (fileType?.includes("zip") || fileType?.includes("compressed")) return "📦";
    if (materialType === "paper") return "📝";
    if (materialType === "tute") return "📚";
    if (materialType === "revision") return "📖";
    return "📄";
  };

  const filteredMaterials = materials.filter((mat) =>
    mat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mat.class_groups?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: "icon",
      header: "Type",
      render: (mat: Material) => (
        <span className="text-2xl">{getFileIcon(mat.file_type, mat.material_type)}</span>
      ),
    },
    {
      key: "title",
      header: "Title & Details",
      render: (mat: Material) => (
        <div className="max-w-md">
          <p className="font-medium text-slate-900">{mat.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="info">{mat.material_type}</Badge>
            <span className="text-xs text-slate-500">{formatFileSize(mat.file_size)}</span>
          </div>
        </div>
      ),
    },
    {
      key: "class",
      header: "Class",
      render: (mat: Material) => (
        <Badge variant="info">{mat.class_groups?.name || "No class"}</Badge>
      ),
    },
    {
      key: "release_at",
      header: "Release Date",
      render: (mat: Material) => <DateFormat date={mat.release_at} format="short" />,
    },
    {
      key: "published",
      header: "Status",
      render: (mat: Material) => (
        <Badge variant={mat.published ? "success" : "warning"}>
          {mat.published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (mat: Material) => (
        <div className="flex items-center justify-end gap-2">
          <a
            href={mat.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
          >
            Open
          </a>
          <Button size="sm" variant="ghost" onClick={() => handleEdit(mat)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant={mat.published ? "secondary" : "primary"}
            onClick={() => handleToggleStatus(mat)}
          >
            {mat.published ? "Unpublish" : "Publish"}
          </Button>
          <Button
            size="sm"
            variant="danger"
            className="bg-red-50 text-red-600 hover:bg-red-100 border-none"
            onClick={() => handleDelete(mat)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Materials</h1>
          <p className="text-sm text-slate-600 mt-1">Upload and manage study materials</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          + Upload Material
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search materials by title or class..."
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
            data={filteredMaterials}
            emptyMessage="No materials uploaded yet"
            className="border border-slate-200 rounded-lg overflow-hidden"
          />
        )}
      </Card>

      {/* Upload Material Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormError(null);
          setFormData({
            class_id: "",
            title: "",
            material_type: "other",
            release_at: "",
            published: true,
            file: null,
          });
        }}
        title="Upload Material"
        size="md"
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
            <Select
              label="Material Type"
              name="material_type"
              value={formData.material_type}
              onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
              options={MATERIAL_TYPES}
            />
          </div>
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              File Upload *
            </label>
            <input
              type="file"
              name="file"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setFormData({ ...formData, file });
              }}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <p className="mt-1 text-xs text-slate-500">
              PDF, images, documents accepted. Max size: 50MB
            </p>
          </div>
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
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              Upload Material
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Material Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMaterial(null);
          setFormError(null);
        }}
        title="Edit Material"
        size="md"
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
            <Select
              label="Material Type"
              name="material_type"
              value={formData.material_type}
              onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
              options={MATERIAL_TYPES}
            />
          </div>
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Replace File (optional)
            </label>
            <input
              type="file"
              name="file"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setFormData({ ...formData, file });
              }}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <p className="mt-1 text-xs text-slate-500">
              Leave empty to keep current file
            </p>
          </div>
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
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              Update Material
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
