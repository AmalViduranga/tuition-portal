import Link from "next/link";
import { classGroups, results, subject, teacher } from "@/lib/content";

export default function Home() {
  return (
    <div className="space-y-8 md:space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(79,70,229,0.45)] md:p-10">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-indigo-100 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-1/3 h-36 w-36 rounded-full bg-cyan-100 blur-2xl" />
        <p className="relative inline-block rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
          Subject Code: {subject.code}
        </p>
        <h1 className="relative mt-3 text-3xl font-extrabold leading-tight text-slate-900 md:text-5xl">
          {subject.name}
        </h1>
        <p className="relative mt-4 max-w-4xl text-base text-slate-600 md:text-lg">
          Conducted by {teacher.name} ({teacher.qualification})
        </p>
        <div className="relative mt-7 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-700"
          >
            Join the Class
          </Link>
          <Link
            href="/results"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
          >
            View Previous Results
          </Link>
          <a
            href="https://wa.me/94700000000"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            WhatsApp Direct
          </a>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Course Highlights</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
            {subject.description.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Available Class Groups</h2>
          <ul className="mt-4 space-y-2 text-slate-700">
            {classGroups.map((group) => (
              <li
                key={group}
                className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 font-medium text-slate-700"
              >
                {group}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Proven Results</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
          {results.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
