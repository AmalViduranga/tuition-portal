"use client";

import { useState, useEffect, useCallback } from "react";
import { createStudent } from "@/app/admin/actions";
import { Card, Button, Input, SearchBar, Badge, DateFormat, Modal, Table, Select } from "@/components/ui";

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createSuccess, setCreateSuccess] = useState<{
    temporaryPassword?: string;
    mustChangePassword?: boolean;
  } | null>(null);
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

  // Enrollments Modal State
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [selectedStudentForEnrollments, setSelectedStudentForEnrollments] = useState<Student | null>(null);
  const [studentEnrollments, setStudentEnrollments] = useState<any[]>([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentFormData, setEnrollmentFormData] = useState({
    class_id: "",
    start_access_date: "",
    access_mode: "paid",
    access_end_date: "",
  });

  const fetchStudentEnrollments = async (studentId: string) => {
    try {
      setEnrollmentLoading(true);
      const res = await fetch(`/api/admin/enrollments?student_id=${studentId}`);
      if (!res.ok) throw new Error("Failed to fetch enrollments");
      const data = await res.json();
      setStudentEnrollments(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error fetching enrollments");
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const openEnrollmentsModal = (student: Student) => {
    setSelectedStudentForEnrollments(student);
    setIsEnrollmentModalOpen(true);
    fetchStudentEnrollments(student.id);
  };

  const handleAddEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForEnrollments) return;
    setEnrollmentLoading(true);
    try {
      const form = new FormData();
      form.append("student_id", selectedStudentForEnrollments.id);
      form.append("class_id", enrollmentFormData.class_id);
      form.append("start_access_date", enrollmentFormData.start_access_date);
      form.append("access_mode", enrollmentFormData.access_mode);
      if (enrollmentFormData.access_end_date) {
        form.append("access_end_date", enrollmentFormData.access_end_date);
      }

      const res = await fetch("/api/admin/enrollments", { method: "POST", body: form });
      if (!res.ok) throw new Error("Failed to add enrollment");
      
      setEnrollmentFormData({ class_id: "", start_access_date: "", access_mode: "paid", access_end_date: "" });
      await fetchStudentEnrollments(selectedStudentForEnrollments.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving enrollment");
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleDeleteEnrollment = async (enrollmentId: string) => {
    if (!confirm("Are you sure you want to delete this enrollment?")) return;
    if (!selectedStudentForEnrollments) return;
    setEnrollmentLoading(true);
    try {
      const form = new FormData();
      form.append("enrollment_id", enrollmentId);
      const res = await fetch("/api/admin/enrollments/delete", { method: "POST", body: form });
      if (!res.ok) throw new Error("Failed to delete enrollment");
      await fetchStudentEnrollments(selectedStudentForEnrollments.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting enrollment");
    } finally {
      setEnrollmentLoading(false);
    }
  };

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
    setCreateSuccess(null);

    const trimmedName = formData.full_name.trim();
    const trimmedEmail = formData.email.trim();
    if (trimmedName.length < 2) {
      setFormError("Please enter the student’s full name (at least 2 characters).");
      return;
    }
    if (!trimmedEmail || !EMAIL_RE.test(trimmedEmail)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (formData.class_ids.length > 0 && !formData.start_access_date.trim()) {
      setFormError("Choose a start access date when assigning one or more classes.");
      return;
    }
    if (formData.password.trim().length > 0 && formData.password.trim().length < 6) {
      setFormError("Password must be at least 6 characters, or leave blank to auto-generate.");
      return;
    }

    setFormLoading(true);

    try {
      const form = new FormData();
      form.append("full_name", trimmedName);
      form.append("email", trimmedEmail);
      form.append("phone", formData.phone.trim());
      form.append("password", formData.password.trim());
      form.append("start_access_date", formData.start_access_date.trim());
      if (formData.must_change_password) {
        form.append("must_change_password", "on");
      }

      formData.class_ids.forEach((classId) => {
        form.append("class_ids", classId);
      });

      const result = await createStudent(form);

      if (!result.ok) {
        setFormError(result.error);
        return;
      }

      const mustChange = formData.must_change_password;
      setCreateSuccess(
        result.temporaryPassword
          ? { temporaryPassword: result.temporaryPassword, mustChangePassword: mustChange }
          : { mustChangePassword: mustChange },
      );
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
            variant="outline"
            onClick={() => openEnrollmentsModal(student)}
          >
            Enrollments
          </Button>
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
        <Button
          onClick={() => {
            setCreateSuccess(null);
            setIsModalOpen(true);
          }}
          size="sm"
        >
          + Add Student
        </Button>
      </div>

      {createSuccess && (
        <div
          className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950 shadow-sm"
          role="status"
        >
          <p className="font-medium">Student account created successfully.</p>
          {createSuccess.temporaryPassword ? (
            <div className="mt-2 space-y-1">
              <p>
                A temporary password was generated. Share it with the student securely (this message is
                not shown again):
              </p>
              <code className="block rounded-md bg-white/80 px-3 py-2 font-mono text-xs text-slate-800 ring-1 ring-emerald-100">
                {createSuccess.temporaryPassword}
              </code>
            </div>
          ) : (
            <p className="mt-1 text-emerald-900/90">
              They can sign in with the password you entered.
              {createSuccess.mustChangePassword
                ? " They will be prompted to set a new password on first login."
                : ""}
            </p>
          )}
          <button
            type="button"
            onClick={() => setCreateSuccess(null)}
            className="mt-3 text-xs font-medium text-emerald-800 underline underline-offset-2 hover:text-emerald-950"
          >
            Dismiss
          </button>
        </div>
      )}

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
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-600 leading-relaxed">
            <p className="font-medium text-slate-700">How this works</p>
            <p className="mt-1">
              Only admins can add students; there is no public signup. Submitting this form runs on the
              server: a Supabase Auth user is created, a row is written to{" "}
              <code className="rounded bg-white px-1 py-0.5 text-[11px]">profiles</code> with role{" "}
              <code className="rounded bg-white px-1 py-0.5 text-[11px]">student</code>, and
              enrollments are added if you pick classes. Secrets never leave the server.
            </p>
          </div>
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address *"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              autoComplete="new-password"
              minLength={6}
              helperText="Optional: min. 6 characters. Leave blank to generate a secure temporary password (shown once after creation)."
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

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" loading={formLoading} className="w-full sm:w-auto">
              Create Student Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Enrollments Modal */}
      <Modal
        isOpen={isEnrollmentModalOpen}
        onClose={() => {
          setIsEnrollmentModalOpen(false);
          setSelectedStudentForEnrollments(null);
        }}
        title={`Manage Enrollments - ${selectedStudentForEnrollments?.full_name}`}
        size="lg"
      >
        <div className="space-y-6">
          {/* List existing enrollments */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Current Enrollments</h3>
            {enrollmentLoading && studentEnrollments.length === 0 ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : studentEnrollments.length === 0 ? (
              <p className="text-sm text-slate-500">No active enrollments for this student.</p>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <Table
                  columns={[
                    { key: "class", header: "Class", render: (e: any) => e.class_name || "-" },
                    { key: "mode", header: "Mode", render: (e: any) => <Badge variant={e.access_mode === "free_card" ? "success" : "default"}>{e.access_mode}</Badge> },
                    { key: "start_date", header: "Start", render: (e: any) => <DateFormat date={e.start_access_date} format="short" /> },
                    { key: "end_date", header: "End", render: (e: any) => e.access_end_date ? <DateFormat date={e.access_end_date} format="short" /> : <span className="text-slate-400">Indefinite</span> },
                    { 
                      key: "actions", 
                      header: "", 
                      className: "text-right",
                      render: (e: any) => (
                        <Button size="sm" variant="danger" onClick={() => handleDeleteEnrollment(e.id)} loading={enrollmentLoading}>
                          Remove
                        </Button>
                      )
                    }
                  ]}
                  data={studentEnrollments}
                  emptyMessage=""
                />
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Add / Update Enrollment</h3>
            <form onSubmit={handleAddEnrollment} className="space-y-4 bg-slate-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Class"
                  value={enrollmentFormData.class_id}
                  onChange={(e) => setEnrollmentFormData({ ...enrollmentFormData, class_id: e.target.value })}
                  options={classes.map((c) => ({ value: c.id, label: c.name }))}
                  placeholder="Select class"
                  required
                />
                <Select
                  label="Access Mode"
                  value={enrollmentFormData.access_mode}
                  onChange={(e) => setEnrollmentFormData({ ...enrollmentFormData, access_mode: e.target.value })}
                  options={[
                    { value: "paid", label: "Paid" },
                    { value: "free_card", label: "Free Card" },
                    { value: "manual", label: "Manual Override" },
                  ]}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Start Access Date"
                  type="date"
                  value={enrollmentFormData.start_access_date}
                  onChange={(e) => setEnrollmentFormData({ ...enrollmentFormData, start_access_date: e.target.value })}
                  required
                />
                <Input
                  label="Access End Date (Optional)"
                  type="date"
                  value={enrollmentFormData.access_end_date}
                  onChange={(e) => setEnrollmentFormData({ ...enrollmentFormData, access_end_date: e.target.value })}
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" loading={enrollmentLoading}>
                  Save Enrollment
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
}
