"use client";

import { useState, useEffect, useCallback } from "react";
import { createClass, updateClass, toggleClassStatus } from "@/app/admin/actions";
import { Card, Button, Input, Textarea, SearchBar, Badge, DateFormat, Modal, Table } from "@/components/ui";

type Class = {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
};

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/classes");
      if (!response.ok) throw new Error("Failed to fetch classes");
      const data = await response.json();
      setClasses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("description", formData.description);

      const response = await fetch("/api/admin/classes", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create class");
      }

      setFormData({ name: "", description: "" });
      setIsModalOpen(false);
      await fetchClasses();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (cls: Class) => {
    setSelectedClass(cls);
    setFormData({ name: cls.name, description: cls.description || "" });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    setFormError(null);
    setFormLoading(true);

    try {
      const form = new FormData();
      form.append("class_id", selectedClass.id);
      form.append("name", formData.name);
      form.append("description", formData.description);

      const response = await fetch("/api/admin/classes", {
        method: "PUT",
        body: form,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update class");
      }

      setIsEditModalOpen(false);
      setSelectedClass(null);
      setFormData({ name: "", description: "" });
      await fetchClasses();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (cls: Class) => {
    if (!confirm(`Are you sure you want to ${cls.is_active ? "deactivate" : "activate"} this class?`)) {
      return;
    }

    try {
      const form = new FormData();
      form.append("class_id", cls.id);

      const response = await fetch("/api/admin/classes/toggle", {
        method: "POST",
        body: form,
      });

      if (!response.ok) throw new Error("Failed to update status");
      await fetchClasses();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const filteredClasses = classes.filter((cls) =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: "name",
      header: "Class Name",
      render: (cls: Class) => (
        <div>
          <p className="font-medium text-slate-900">{cls.name}</p>
          <p className="text-xs text-slate-500">{cls.id.slice(0, 8)}...</p>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (cls: Class) => (
        <p className="text-sm text-slate-600 truncate max-w-xs">{cls.description || "-"}</p>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (cls: Class) => (
        <Badge variant={cls.is_active ? "success" : "warning"}>
          {cls.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (cls: Class) => <DateFormat date={cls.created_at} format="short" />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (cls: Class) => (
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(cls)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant={cls.is_active ? "danger" : "primary"}
            onClick={() => handleToggleStatus(cls)}
          >
            {cls.is_active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Classes</h1>
          <p className="text-sm text-slate-600 mt-1">Manage class groups and batches</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          + Create Class
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search classes by name or description..."
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
            data={filteredClasses}
            emptyMessage="No classes found"
            className="border border-slate-200 rounded-lg overflow-hidden"
          />
        )}
      </Card>

      {/* Create Class Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormError(null);
          setFormData({ name: "", description: "" });
        }}
        title="Create Class Group"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {formError}
            </div>
          )}
          <Input
            label="Class Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., 2026 A/L Theory"
            required
          />
          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional class description"
            rows={3}
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
              Create Class
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Class Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClass(null);
          setFormError(null);
          setFormData({ name: "", description: "" });
        }}
        title="Edit Class"
        size="md"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {formError}
            </div>
          )}
          <Input
            label="Class Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
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
              Update Class
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
