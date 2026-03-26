export default function ContactPage() {
  const whatsapp = "94700000000";

  return (
    <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm md:p-8">
      <p className="inline-block rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
        Get In Touch
      </p>
      <h1 className="mt-3 text-3xl font-extrabold text-slate-900">Contact Details</h1>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone / WhatsApp</p>
          <p className="mt-2 font-semibold text-slate-900">[Add your number]</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
          <p className="mt-2 font-semibold text-slate-900">[Add your email]</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</p>
          <p className="mt-2 font-semibold text-slate-900">[Add your class location]</p>
        </article>
      </div>

      <a
        href={`https://wa.me/${whatsapp}`}
        target="_blank"
        rel="noreferrer"
        className="mt-6 inline-block rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
      >
        Chat on WhatsApp
      </a>
    </section>
  );
}
