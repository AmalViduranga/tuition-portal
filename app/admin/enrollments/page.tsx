"use client";

import { useState, useEffect, useCallback } from "react";
import {
  addEnrollment,
  addPaymentPeriod,
  addManualRecordingUnlock,
  addManualMaterialUnlock,
  updatePaymentPeriodStatus,
} from "@/app/admin/actions";
import { Card, Button, Input, SearchBar, Badge, DateFormat, Modal, Select, Table } from "@/components/ui";

type Enrollment = {
  id: string;
  student_id: string;
  student_name?: string;
  class_id: string;
  class_name?: string;
  start_access_date: string;
  access_end_date?: string | null;
  access_mode: "paid" | "free_card" | "manual";
  student_class_enrollments: { created_at: string };
};

type PaymentPeriod = {
  id: string;
  student_id: string;
  student_name?: string;
  class_id: string;
  class_name?: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
};

type Student = {
  id: string;
  full_name: string;
};

type Class = {
  id: string;
  name: string;
};

type Recording = {
  id: string;
  title: string;
};

type Material = {
  id: string;
  title: string;
};

type Unlock = {
  id: string;
  student_id: string;
  student_name: string;
  created_at: string;
  recording_id?: string;
  recording_title?: string;
  material_id?: string;
  material_title?: string;
};

type TabType = "enrollments" | "payments" | "recording-unlocks" | "material-unlocks";

export default function AdminEnrollmentsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("enrollments");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<PaymentPeriod[]>([]);
  const [recordingUnlocks, setRecordingUnlocks] = useState<Unlock[]>([]);
  const [materialUnlocks, setMaterialUnlocks] = useState<Unlock[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [enrRes, payRes, studentsRes, classesRes, recRes, matRes, recUnlockRes, matUnlockRes] = await Promise.all([
        fetch("/api/admin/enrollments"),
        fetch("/api/admin/payments"),
        fetch("/api/admin/students?simple=true"),
        fetch("/api/admin/classes?active=true"),
        fetch("/api/admin/recordings?limit=true"),
        fetch("/api/admin/materials?limit=true"),
        fetch("/api/admin/unlocks/recording"),
        fetch("/api/admin/unlocks/material"),
      ]);

      if (!enrRes.ok || !payRes.ok) throw new Error("Failed to fetch data");

      const [enrData, payData] = await Promise.all([enrRes.json(), payRes.json()]);

      // Only fetch other data if needed for forms
      if (studentsRes.ok) setStudents(await studentsRes.json());
      if (classesRes.ok) setClasses(await classesRes.json());
      if (recRes.ok) setRecordings(await recRes.json());
      if (matRes.ok) setMaterials(await matRes.json());
      if (recUnlockRes.ok) setRecordingUnlocks(await recUnlockRes.json());
      if (matUnlockRes.ok) setMaterialUnlocks(await matUnlockRes.json());

      setEnrollments(enrData);
      setPayments(payData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tabs = [
    { id: "enrollments" as TabType, label: "Enrollments" },
    { id: "payments" as TabType, label: "Payment Periods" },
    { id: "recording-unlocks" as TabType, label: "Recording Unlocks" },
    { id: "material-unlocks" as TabType, label: "Material Unlocks" },
  ];

  const filteredEnrollments = enrollments.filter((enr) =>
    enr.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    enr.class_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPayments = payments.filter((pay) =>
    pay.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pay.class_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderEnrollments = () => (
    <Card>
      <div className="mb-4">
        <p className="text-sm text-slate-600 mb-3">
          Grant students access to classes with a start date. Access ends when the next payment period is approved.
        </p>
        <EnrollmentForm
          students={students}
          classes={classes}
          onSubmit={async (formData) => {
            await fetch("/api/admin/enrollments", {
              method: "POST",
              body: formData,
            });
            await fetchData();
          }}
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
          columns={[
            {
              key: "student",
              header: "Student",
              render: (enr: Enrollment) => (
                <div>
                  <p className="font-medium">{enr.student_name || "Unknown"}</p>
                  <p className="text-xs text-slate-500">{enr.student_id.slice(0, 8)}...</p>
                </div>
              ),
            },
            {
              key: "class",
              header: "Class",
              render: (enr: Enrollment) => enr.class_name || "-",
            },
            {
              key: "mode",
              header: "Mode",
              render: (enr: Enrollment) => (
                <Badge variant={enr.access_mode === "free_card" ? "success" : "default"}>
                  {enr.access_mode}
                </Badge>
              ),
            },
            {
              key: "start_date",
              header: "Access Start",
              render: (enr: Enrollment) => <DateFormat date={enr.start_access_date} format="short" />,
            },
            {
              key: "end_date",
              header: "Access End",
              render: (enr: Enrollment) => enr.access_end_date ? <DateFormat date={enr.access_end_date} format="short" /> : <span className="text-slate-400">Indefinite</span>,
            },
            {
              key: "granted",
              header: "Enrolled",
              render: (enr: Enrollment) => <DateFormat date={enr.student_class_enrollments.created_at} format="short" />,
            },
          ]}
          data={filteredEnrollments}
          emptyMessage="No enrollments yet"
          className="border border-slate-200 rounded-lg overflow-hidden"
        />
      )}
    </Card>
  );

  const renderPayments = () => (
    <Card>
      <div className="mb-4">
        <p className="text-sm text-slate-600 mb-3">
          Approve payment periods to grant students continued access to class content.
        </p>
        <PaymentForm
          students={students}
          classes={classes}
          onSubmit={async (formData) => {
            await fetch("/api/admin/payments", {
              method: "POST",
              body: formData,
            });
            await fetchData();
          }}
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
          columns={[
            {
              key: "student",
              header: "Student",
              render: (pay: PaymentPeriod) => (
                <div>
                  <p className="font-medium">{pay.student_name || "Unknown"}</p>
                  <p className="text-xs text-slate-500">{pay.student_id.slice(0, 8)}...</p>
                </div>
              ),
            },
            {
              key: "class",
              header: "Class",
              render: (pay: PaymentPeriod) => pay.class_name || "-",
            },
            {
              key: "period",
              header: "Period",
              render: (pay: PaymentPeriod) => (
                <div>
                  <p className="text-sm"><DateFormat date={pay.start_date} format="short" /> - <DateFormat date={pay.end_date} format="short" /></p>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (pay: PaymentPeriod) => (
                <Badge variant={
                  pay.status === "approved" ? "success" :
                  pay.status === "rejected" ? "danger" :
                  pay.status === "expired" ? "warning" : "default"
                }>
                  {pay.status}
                </Badge>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              className: "text-right",
              render: (pay: PaymentPeriod) => (
                <div className="flex items-center justify-end gap-2">
                  {pay.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={async () => {
                          if (!confirm("Approve this payment period?")) return;
                          const form = new FormData();
                          form.append("period_id", pay.id);
                          form.append("status", "approved");
                          await fetch("/api/admin/payments/status", { method: "POST", body: form });
                          await fetchData();
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={async () => {
                          if (!confirm("Reject this payment period?")) return;
                          const form = new FormData();
                          form.append("period_id", pay.id);
                          form.append("status", "rejected");
                          await fetch("/api/admin/payments/status", { method: "POST", body: form });
                          await fetchData();
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              ),
            },
          ]}
          data={filteredPayments}
          emptyMessage="No payment periods yet"
          className="border border-slate-200 rounded-lg overflow-hidden"
        />
      )}
    </Card>
  );

  const renderUnlocks = (type: "recording" | "material") => {
    const items = type === "recording" ? recordings : materials;
    const title = type === "recording" ? "Recording" : "Material";
    const endpoint = type === "recording" ? "/api/admin/unlocks/recording" : "/api/admin/unlocks/material";
    const unlocksData = type === "recording" ? recordingUnlocks : materialUnlocks;

    const filteredUnlocks = unlocksData.filter((u) => 
      u.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (type === "recording" ? u.recording_title : u.material_title)?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <Card>
        <div className="mb-8">
          <p className="text-sm text-slate-600 mb-3">
            Manually unlock {title.toLowerCase()}s for specific students (overrides restrictions).
          </p>
          <UnlockForm
            students={students}
            items={items}
            itemLabel={title}
            onSubmit={async (formData) => {
              await fetch(endpoint, { method: "POST", body: formData });
              await fetchData();
            }}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Active {title} Unlocks</h3>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <Table
              columns={[
                {
                  key: "student",
                  header: "Student",
                  render: (u: Unlock) => (
                    <div>
                      <p className="font-medium">{u.student_name}</p>
                    </div>
                  ),
                },
                {
                  key: "item",
                  header: title,
                  render: (u: Unlock) => type === "recording" ? u.recording_title || "-" : u.material_title || "-",
                },
                {
                  key: "granted",
                  header: "Granted",
                  render: (u: Unlock) => <DateFormat date={u.created_at} format="short" />,
                },
                {
                  key: "actions",
                  header: "Actions",
                  className: "text-right",
                  render: (u: Unlock) => (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={async () => {
                        if (!confirm(`Revoke access to this ${title.toLowerCase()}?`)) return;
                        const form = new FormData();
                        form.append("unlock_id", u.id);
                        await fetch(endpoint, { method: "DELETE", body: form });
                        await fetchData();
                      }}
                    >
                      Revoke
                    </Button>
                  ),
                },
              ]}
              data={filteredUnlocks}
              emptyMessage={`No ${title.toLowerCase()} manually unlocked yet`}
              className="border border-slate-200 rounded-lg overflow-hidden"
            />
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Enrollments & Payments</h1>
        <p className="text-sm text-slate-600 mt-1">Manage student access and payment approvals</p>
      </div>

      <div className="border-b border-slate-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "enrollments" && renderEnrollments()}
      {activeTab === "payments" && renderPayments()}
      {activeTab === "recording-unlocks" && renderUnlocks("recording")}
      {activeTab === "material-unlocks" && renderUnlocks("material")}
    </div>
  );
}

interface EnrollmentFormProps {
  students: Student[];
  classes: Class[];
  onSubmit: (formData: FormData) => Promise<void>;
}

function EnrollmentForm({ students, classes, onSubmit }: EnrollmentFormProps) {
  const [formData, setFormData] = useState({ 
    student_id: "", 
    class_id: "", 
    start_access_date: "",
    access_mode: "paid",
    access_end_date: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const form = new FormData();
      form.append("student_id", formData.student_id);
      form.append("class_id", formData.class_id);
      form.append("start_access_date", formData.start_access_date);
      form.append("access_mode", formData.access_mode);
      if (formData.access_end_date) {
        form.append("access_end_date", formData.access_end_date);
      }

      await onSubmit(form);
      setFormData({ student_id: "", class_id: "", start_access_date: "", access_mode: "paid", access_end_date: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg space-y-3">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          label="Student"
          value={formData.student_id}
          onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
          options={students.map((s) => ({ value: s.id, label: s.full_name }))}
          placeholder="Select student"
          required
        />
        <Select
          label="Class"
          value={formData.class_id}
          onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
          options={classes.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="Select class"
          required
        />
          <Input
            label="Access Start Date"
            type="date"
            value={formData.start_access_date}
            onChange={(e) => setFormData({ ...formData, start_access_date: e.target.value })}
            required
          />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Access Mode"
          value={formData.access_mode}
          onChange={(e) => setFormData({ ...formData, access_mode: e.target.value })}
          options={[
            { value: "paid", label: "Paid" },
            { value: "free_card", label: "Free Card" },
            { value: "manual", label: "Manual Override" },
          ]}
          required
        />
        <Input
          label="Access End Date (Optional)"
          type="date"
          value={formData.access_end_date}
          onChange={(e) => setFormData({ ...formData, access_end_date: e.target.value })}
        />
      </div>
      <Button type="submit" loading={loading} size="sm" className="w-full sm:w-auto">
        Add Enrollment
      </Button>
    </form>
  );
}

interface PaymentFormProps {
  students: Student[];
  classes: Class[];
  onSubmit: (formData: FormData) => Promise<void>;
}

function PaymentForm({ students, classes, onSubmit }: PaymentFormProps) {
  const [formData, setFormData] = useState({ student_id: "", class_id: "", start_date: "", end_date: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const form = new FormData();
      form.append("student_id", formData.student_id);
      form.append("class_id", formData.class_id);
      form.append("start_date", formData.start_date);
      form.append("end_date", formData.end_date);

      await onSubmit(form);
      setFormData({ student_id: "", class_id: "", start_date: "", end_date: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg space-y-3">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Select
          label="Student"
          value={formData.student_id}
          onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
          options={students.map((s) => ({ value: s.id, label: s.full_name }))}
          placeholder="Select student"
          required
        />
        <Select
          label="Class"
          value={formData.class_id}
          onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
          options={classes.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="Select class"
          required
        />
        <Input
          label="Start Date"
          type="date"
          value={formData.start_date}
          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          required
        />
        <Input
          label="End Date"
          type="date"
          value={formData.end_date}
          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          required
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={loading} size="sm">
          Add Payment Period
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          loading={loading} 
          size="sm"
          onClick={() => {
             const start = new Date();
             const end = new Date();
             end.setMonth(end.getMonth() + 1);
             end.setDate(end.getDate() + 15);
             
             setFormData(prev => ({
               ...prev,
               start_date: start.toISOString().split("T")[0],
               end_date: end.toISOString().split("T")[0]
             }));
          }}
        >
          Approve 1.5 months from today
        </Button>
      </div>
    </form>
  );
}

interface UnlockFormProps {
  students: Student[];
  items: Array<{ id: string; title: string }>;
  itemLabel: string;
  onSubmit: (formData: FormData) => Promise<void>;
}

function UnlockForm({ students, items, itemLabel, onSubmit }: UnlockFormProps) {
  const [formData, setFormData] = useState({ student_id: "", [itemLabel.toLowerCase()]: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData();
    form.append("student_id", formData.student_id);
    form.append(`${itemLabel.toLowerCase()}_id`, formData[itemLabel.toLowerCase()] as string);

    await onSubmit(form);
    setFormData({ student_id: "", [itemLabel.toLowerCase()]: "" });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          label="Student"
          value={formData.student_id}
          onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
          options={students.map((s) => ({ value: s.id, label: s.full_name }))}
          placeholder="Select student"
          required
        />
        <Select
          label={itemLabel}
          value={formData[itemLabel.toLowerCase()] as string}
          onChange={(e) => setFormData({ ...formData, [itemLabel.toLowerCase()]: e.target.value })}
          options={items.map((item) => ({ value: item.id, label: item.title }))}
          placeholder={`Select ${itemLabel.toLowerCase()}`}
          required
        />
      </div>
      <Button type="submit" loading={loading} size="sm" className="w-full sm:w-auto">
        Unlock {itemLabel}
      </Button>
    </form>
  );
}
