import { teacher } from "@/lib/content";

export default function AboutPage() {
  return (
    <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Educator Profile
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">About the Teacher</h1>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-5">
        <p className="text-xl font-bold text-slate-900">{teacher.name}</p>
        <p className="mt-1 text-sm text-slate-600">{teacher.qualification}</p>
      </div>

      <ul className="mt-6 grid gap-3 text-slate-700 md:grid-cols-2">
        {teacher.description.map((item) => (
          <li key={item} className="rounded-xl border border-slate-200 bg-white p-4">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
