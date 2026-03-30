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
      setError(null);

      // Separate fetches into two groups: Critical and Optional
      // We use individual await/fetch to prevent Promise.all from failing everything if one fails
      const fetchJson = async (url: string) => {
        const res = await fetch(url);
        if (!res.ok) {
           console.warn(`Fetch to ${url} failed with status ${res.status}`);
           return null;
        }
        return res.json();
      };

      // 1. Mandatory Data
      const [enrData, studentsData, classesData] = await Promise.all([
        fetchJson("/api/admin/enrollments"),
        fetchJson("/api/admin/students?simple=true"),
        fetchJson("/api/admin/classes?active=true"),
      ]);

      if (!enrData) throw new Error("Could not load enrollments");
      if (!studentsData || !classesData) throw new Error("Could not load student or class lists");

      setEnrollments(enrData);
      setStudents(studentsData);
      setClasses(classesData);

      // 2. Optional Data (Don't throw if these fail)
      const [payData, plansData, recData, matData, recUnlockData, matUnlockData] = await Promise.all([
        fetchJson("/api/admin/payments"),
        fetchJson("/api/admin/plans"),
        fetchJson("/api/admin/recordings?limit=true"),
        fetchJson("/api/admin/materials?limit=true"),
        fetchJson("/api/admin/unlocks/recording"),
        fetchJson("/api/admin/unlocks/material"),
      ]);

      if (payData) setPayments(payData);
      if (plansData) setPlans(plansData);
      if (recData) setRecordings(recData);
      if (matData) setMaterials(matData);
      if (recUnlockData) setRecordingUnlocks(recUnlockData);
      if (matUnlockData) setMaterialUnlocks(matUnlockData);

    } catch (err) {
      console.error("Admin Enrollments Fetch Error:", err);
      setError(err instanceof Error ? err.message : "Failed to load management dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  const [plans, setPlans] = useState<any[]>([]);

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

  const filteredPayments = payments.filter((pay: any) =>
    pay.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pay.class_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderEnrollments = () => (
    <Card>
      <div className="mb-4">
        <p className="text-sm text-slate-600 mb-3">
          Enrolled students represent their current class memberships. Use Payment Periods for access control.
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
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-600">
             Log payments, grant manual access, or manage free-card periods. 1.5 months access is default.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.location.href = "/admin/reports/monthly-payments"}>
          Monthly Report
        </Button>
      </div>

      <div className="mb-6">
        <PaymentForm
          students={students}
          classes={classes}
          plans={plans}
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
              render: (pay: any) => (
                <div>
                  <p className="font-medium">{pay.student_name || "Unknown"}</p>
                  <p className="text-xs text-slate-500">{pay.student_phone || pay.student_id.slice(0, 8)}</p>
                </div>
              ),
            },
            {
              key: "class",
              header: "Class/Plan",
              render: (pay: any) => pay.class_name || "-",
            },
            {
              key: "amount",
              header: "Amount",
              render: (pay: any) => pay.access_mode === 'paid' ? `Rs. ${pay.amount_paid}` : <span className="text-slate-400">{pay.access_mode}</span>,
            },
            {
              key: "period",
              header: "Period",
              render: (pay: any) => (
                <div className="text-sm">
                  <DateFormat date={pay.start_date} format="short" /> - <DateFormat date={pay.end_date} format="short" />
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (pay: any) => (
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
              render: (pay: any) => (
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Access Management</h1>
          <p className="text-sm text-slate-600 mt-1">Manage enrollments, payments, and manual unlocks</p>
        </div>
        <div className="w-64">
           <SearchBar placeholder="Search by student or class..." value={searchQuery} onChange={(v) => setSearchQuery(v)} />
        </div>
      </div>

      <div className="border-b border-slate-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
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
    start_access_date: new Date().toISOString().split('T')[0],
    access_mode: "paid" as const,
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
      setFormData({ student_id: "", class_id: "", start_access_date: new Date().toISOString().split('T')[0], access_mode: "paid", access_end_date: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-lg space-y-4 border border-slate-200">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <Select
          label="Access Mode"
          value={formData.access_mode}
          onChange={(e) => setFormData({ ...formData, access_mode: e.target.value as any })}
          options={[
            { value: "paid", label: "Paid" },
            { value: "free_card", label: "Free Card" },
            { value: "manual", label: "Manual" },
          ]}
        />
      </div>
      <div className="flex flex-wrap items-end gap-4">
         <Input
            label="Enrollment Date"
            type="date"
            value={formData.start_access_date}
            onChange={(e) => setFormData({ ...formData, start_access_date: e.target.value })}
          />
          <Button type="submit" loading={loading} className="px-8">
            Add Enrollment
          </Button>
      </div>
    </form>
  );
}

interface PaymentFormProps {
  students: Student[];
  classes: Class[];
  plans: any[];
  onSubmit: (formData: FormData) => Promise<void>;
}

function PaymentForm({ students, classes, plans, onSubmit }: PaymentFormProps) {
  const [formData, setFormData] = useState({ 
    student_id: "", 
    class_id: "", 
    payment_plan_id: "",
    amount_paid: "",
    access_mode: "paid",
    start_date: new Date().toISOString().split('T')[0], 
    end_date: "",
    admin_note: "",
    quick_approve: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-calculate end date (1.5 months) and amount when plan selected
  const handlePlanChange = (val: string) => {
    const plan = plans.find(p => p.id === val);
    const updates: any = { payment_plan_id: val, class_id: "" };
    
    if (plan) {
      updates.amount_paid = plan.fee;
      
      // Auto set 1.5 months if not set
      if (!formData.end_date) {
        const start = formData.start_date ? new Date(formData.start_date) : new Date();
        const end = new Date(start);
        end.setDate(end.getDate() + 45); // 1.5 months appx
        updates.end_date = end.toISOString().split('T')[0];
      }
    }
    
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const form = new FormData();
      form.append("student_id", formData.student_id);
      if (formData.class_id) form.append("class_id", formData.class_id);
      if (formData.payment_plan_id) form.append("payment_plan_id", formData.payment_plan_id);
      form.append("amount_paid", formData.amount_paid || "0");
      form.append("access_mode", formData.access_mode);
      form.append("start_date", formData.start_date);
      form.append("end_date", formData.end_date);
      form.append("admin_note", formData.admin_note);
      if (formData.quick_approve) form.append("quick_approve", "true");

      await onSubmit(form);
      setFormData({ 
        student_id: "", 
        class_id: "", 
        payment_plan_id: "", 
        amount_paid: "", 
        access_mode: "paid",
        start_date: new Date().toISOString().split('T')[0], 
        end_date: "",
        admin_note: "",
        quick_approve: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
         <h3 className="text-lg font-semibold text-slate-900">Add New Payment / Period</h3>
         <div className="flex items-center gap-2">
           <input 
             type="checkbox" 
             id="quick_approve" 
             checked={formData.quick_approve} 
             onChange={(e) => setFormData({...formData, quick_approve: e.target.checked})}
             className="rounded text-indigo-600 focus:ring-indigo-500"
            />
           <label htmlFor="quick_approve" className="text-sm font-medium text-slate-700">Quick Approve (1.5mo from today)</label>
         </div>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Select
          label="Student"
          value={formData.student_id}
          onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
          options={students.map((s) => ({ value: s.id, label: s.full_name }))}
          placeholder="Select student"
          required
        />
        
        <div className="grid grid-cols-1 gap-2">
          <label className="text-sm font-medium text-slate-700">Target (Select Class OR Plan)</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                value={formData.payment_plan_id}
                onChange={(e) => handlePlanChange(e.target.value)}
                options={plans.map((p) => ({ value: p.id, label: p.name }))}
                placeholder="Choose Plan (Theory/Revision/Both)"
              />
            </div>
            <div className="flex-1">
              <Select
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value, payment_plan_id: "" })}
                options={classes.map((c) => ({ value: c.id, label: c.name }))}
                placeholder="Choose Class"
              />
            </div>
          </div>
        </div>

        <Select
          label="Access Mode"
          value={formData.access_mode}
          onChange={(e) => setFormData({ ...formData, access_mode: e.target.value })}
          options={[
            { value: "paid", label: "Paid Student" },
            { value: "free_card", label: "Free Card" },
            { value: "manual", label: "Manual Override" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Input
          label="Amount (Rs.)"
          type="number"
          value={formData.amount_paid}
          onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
          disabled={formData.access_mode !== 'paid'}
          placeholder="0.00"
        />
        <Input
          label="Payment/Start Date"
          type="date"
          value={formData.start_date}
          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          required
        />
        <Input
          label="Expiry/End Date"
          type="date"
          value={formData.end_date}
          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          required={!formData.quick_approve}
        />
        <Input
          label="Admin Note"
          value={formData.admin_note}
          onChange={(e) => setFormData({ ...formData, admin_note: e.target.value })}
          placeholder="E.g. Bank proof #123"
        />
      </div>

      <div className="flex justify-end border-t pt-6">
        <Button type="submit" loading={loading} className="px-10">
          Save Record
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
