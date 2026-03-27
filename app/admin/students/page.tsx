"use client";

import { useState, useEffect, useCallback } from "react";
import { createStudent, toggleStudentStatus, deleteStudent } from "@/app/admin/actions";
import { Card, Button, Input, SearchBar, Badge, DateFormat, Modal, Table } from "@/components/ui";

type Student = {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  role: string;
};

type Class = {
  id: string;
  name: string;
  is_active: boolean;
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    class_ids: [] as string[],
    start_access_date: "",
    must_change_password: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/students");
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/classes?active=true");
      if (!response.ok) throw new Error("Failed to fetch classes");
      const data = await response.json();
      setClasses(data);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, [fetchStudents, fetchClasses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const form = new FormData();
      form.append("full_name", formData.full_name);
      form.append("email", formData.email);
      form.append("phone", formData.phone);
      form.append("password", formData.password);
      form.append("start_access_date", formData.start_access_date);
      if (formData.must_change_password) {
        form.append("must_change_password", "on");
      }

      // Append all selected class IDs (can be multiple)
      formData.class_ids.forEach((classId) => {
        form.append("class_ids", classId);
      });

      const response = await fetch("/api/admin/students", {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create student");
      }

      setFormData({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        class_ids: [],
        start_access_date: "",
        must_change_password: true,
      });
      setIsModalOpen(false);
      await fetchStudents();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleClass = (classId: string) => {
    setFormData((prev) => {
      const isSelected = prev.class_ids.includes(classId);
      return {
        ...prev,
        class_ids: isSelected
          ? prev.class_ids.filter((id) => id !== classId)
          : [...prev.class_ids, classId],
      };
    });
  };

  const handleToggleStatus = async (student: Student) => {
    if (!confirm(`Are you sure you want to ${student.is_active ? "deactivate" : "activate"} ${student.full_name}?`)) {
      return;
    }

    try {
      const form = new FormData();
      form.append("student_id", student.id);
      form.append("is_active", String(student.is_active));

      const response = await fetch("/api/admin/students/toggle", {
        method: "POST",
        body: form,
      });

      if (!response.ok) throw new Error("Failed to update status");
      await fetchStudents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleDelete = async (student: Student) => {
    if (!confirm(`Are you sure you want to deactivate ${student.full_name}? This can be reversed later.`)) {
      return;
    }

    try {
      const form = new FormData();
      form.append("student_id", student.id);

      const response = await fetch("/api/admin/students/delete", {
        method: "POST",
        body: form,
      });

      if (!response.ok) throw new Error("Failed to deactivate student");
      await fetchStudents();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (student: Student) => (
        <div>
          <p className="font-medium text-slate-900">{student.full_name}</p>
          <p className="text-xs text-slate-500">{student.id.slice(0, 8)}...</p>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (student: Student) => student.email || "-",
    },
    {
      key: "phone",
      header: "Phone",
      render: (student: Student) => student.phone || "-",
    },
    {
      key: "status",
      header: "Status",
      render: (student: Student) => (
        <Badge variant={student.is_active ? "success" : "danger"}>
          {student.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Joined",
      render: (student: Student) => <DateFormat date={student.created_at} format="short" />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (student: Student) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleToggleStatus(student)}
          >
            {student.is_active ? "Deactivate" : "Activate"}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(student)}
          >
            Deactivate
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-sm text-slate-600 mt-1">Manage student accounts and access</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          + Add Student
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search students by name, email, phone, or ID..."
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
            data={filteredStudents}
            emptyMessage="No students found"
            className="border border-slate-200 rounded-lg overflow-hidden"
          />
        )}
      </Card>

      {/* Create Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormError(null);
          setFormData({
            full_name: "",
            email: "",
            phone: "",
            password: "",
            class_ids: [],
            start_access_date: "",
            must_change_password: true,
          });
        }}
        title="Create Student Account"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              name="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Optional"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email Address *"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Temporary Password *"
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              helperText="Minimum 6 characters"
            />
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-2">Class Assignments (Optional)</h3>
              <p className="text-xs text-slate-500 mb-3">Select one or more classes for this student</p>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3 space-y-2">
                {classes.length === 0 ? (
                  <p className="text-sm text-slate-500">No active classes available</p>
                ) : (
                  classes.map((cls) => (
                    <label key={cls.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                      <input
                        type="checkbox"
                        checked={formData.class_ids.includes(cls.id)}
                        onChange={() => handleToggleClass(cls.id)}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      <span className="text-sm text-slate-700">{cls.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {formData.class_ids.length > 0 && (
              <div>
                <Input
                  label="Start Access Date"
                  name="start_access_date"
                  type="date"
                  value={formData.start_access_date}
                  onChange={(e) => setFormData({ ...formData, start_access_date: e.target.value })}
                  helperText="Date when student can access selected classes"
                />
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="must_change_password"
                checked={formData.must_change_password}
                onChange={(e) => setFormData({ ...formData, must_change_password: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600"
              />
              <span className="text-sm font-medium text-slate-700">
                Require password change on first login
              </span>
            </label>
            <p className="text-xs text-slate-500 mt-1">
              Recommended for security. Student will be prompted to set a new password on first login.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              Create Student Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
