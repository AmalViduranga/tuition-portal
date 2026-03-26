import { classGroups } from "@/lib/content";

export default function SchedulePage() {
  return (
    <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm md:p-8">
      <p className="inline-block rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
        Weekly Plan
      </p>
      <h1 className="mt-3 text-3xl font-extrabold text-slate-900">Class Schedule</h1>
      <p className="mt-2 text-sm text-slate-600">Update exact day/time slots from admin panel content section.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {classGroups.map((group) => (
          <article key={group} className="rounded-xl border border-slate-200 p-4">
            <p className="font-semibold text-slate-900">{group}</p>
            <p className="mt-1 text-sm text-slate-600">Sunday 7:30 AM - 10:30 AM (sample)</p>
          </article>
        ))}
      </div>
    </section>
  );
}
