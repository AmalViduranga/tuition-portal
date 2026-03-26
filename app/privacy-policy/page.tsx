export default function PrivacyPolicyPage() {
  return (
    <section className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm md:p-8">
      <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
      <p className="mt-4 text-slate-700">
        We value your privacy. Student account details and class access information are used only for managing tuition
        classes and portal access.
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-slate-700">
        <li>We collect only necessary information such as name, email, and class enrollment details.</li>
        <li>We do not sell or share your personal information with third parties for marketing.</li>
        <li>Payment verification is handled manually and stored only for access management purposes.</li>
        <li>If you need your data updated or removed, contact the class administrator.</li>
      </ul>
    </section>
  );
}
