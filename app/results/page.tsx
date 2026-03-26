import { results } from "@/lib/content";

export default function ResultsPage() {
  return (
    <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm md:p-8">
      <p className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        Achievement Highlights
      </p>
      <h1 className="mt-3 text-3xl font-extrabold text-slate-900">Previous Batch Results</h1>
      <p className="mt-2 text-slate-600">Consistent high performance and measurable student progress.</p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {results.map((item) => (
          <article key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-medium text-slate-800">{item}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
