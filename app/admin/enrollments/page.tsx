import {
  addEnrollment,
  addManualMaterialUnlock,
  addManualRecordingUnlock,
  addPaymentPeriod,
} from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";

export default async function AdminEnrollmentPage() {
  const { supabase } = await requireAdmin();
  const [{ data: students }, { data: classes }, { data: recordings }, { data: materials }] = await Promise.all([
    supabase.from("profiles").select("id, full_name").eq("role", "student"),
    supabase.from("class_groups").select("id, name").eq("is_active", true),
    supabase.from("recordings").select("id, title").order("created_at", { ascending: false }).limit(100),
    supabase.from("materials").select("id, title").order("created_at", { ascending: false }).limit(100),
  ]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Enroll Student to Class</h2>
        <form action={addEnrollment} className="mt-4 space-y-3">
          <select name="student_id" required>
            <option value="">Student</option>
            {(students ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.full_name}
              </option>
            ))}
          </select>
          <select name="class_id" required>
            <option value="">Class</option>
            {(classes ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <input name="start_access_date" type="date" required />
          <button type="submit">Save Enrollment</button>
        </form>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Approve Payment Period</h2>
        <form action={addPaymentPeriod} className="mt-4 space-y-3">
          <select name="student_id" required>
            <option value="">Student</option>
            {(students ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.full_name}
              </option>
            ))}
          </select>
          <select name="class_id" required>
            <option value="">Class</option>
            {(classes ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <input name="start_date" type="date" required />
          <input name="end_date" type="date" required />
          <button type="submit">Save Period</button>
        </form>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Manual Recording Unlock</h2>
        <form action={addManualRecordingUnlock} className="mt-4 space-y-3">
          <select name="student_id" required>
            <option value="">Student</option>
            {(students ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.full_name}
              </option>
            ))}
          </select>
          <select name="recording_id" required>
            <option value="">Recording</option>
            {(recordings ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <button type="submit">Unlock Recording</button>
        </form>
      </section>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Manual Material Unlock</h2>
        <form action={addManualMaterialUnlock} className="mt-4 space-y-3">
          <select name="student_id" required>
            <option value="">Student</option>
            {(students ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.full_name}
              </option>
            ))}
          </select>
          <select name="material_id" required>
            <option value="">Material</option>
            {(materials ?? []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          <button type="submit">Unlock Material</button>
        </form>
      </section>
    </div>
  );
}
