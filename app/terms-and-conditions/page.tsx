export default function TermsAndConditionsPage() {
  return (
    <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm md:p-8">
      <h1 className="text-3xl font-extrabold text-slate-900">Terms & Conditions</h1>
      <p className="mt-4 text-slate-700">By using this website and student portal, you agree to the following terms:</p>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
        <li>Portal access is granted only to approved students.</li>
        <li>Recordings and materials are for personal learning use only and must not be redistributed.</li>
        <li>Access periods are controlled by class payment approvals and portal policies.</li>
        <li>Any misuse of the portal may result in suspension of access.</li>
        <li>Class schedules and content may be updated when necessary.</li>
      </ul>
    </section>
  );
}
