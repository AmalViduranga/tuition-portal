export default function AdminSiteContentPage() {
  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Public Website Content</h2>
      <p className="mt-2 text-sm text-slate-600">
        This scaffold keeps content in `lib/content.ts`. You can move this into a `site_settings` table and add CRUD
        forms here when needed.
      </p>
    </section>
  );
}
