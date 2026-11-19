export default function TermsAndConditionsPage() {
  return (
    <section className="max-w-[75ch] pb-16">
      <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Terms & Conditions</h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">By using this website and student portal, you agree to the following terms:</p>
      <ul className="mt-4 list-disc space-y-2 pl-6 leading-relaxed text-muted-foreground">
        <li>Portal access is granted only to approved students.</li>
        <li>Recordings and materials are for personal learning use only and must not be redistributed.</li>
        <li>Access periods are controlled by class payment approvals and portal policies.</li>
        <li>Any misuse of the portal may result in suspension of access.</li>
        <li>Class schedules and content may be updated when necessary.</li>
      </ul>
    </section>
  );
}
