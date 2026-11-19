import Link from "next/link";
import type { Metadata } from "next";
import { loadPublicContent } from "@/lib/server/public-content";
import { buildClassWhatsAppUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Class Schedule | MathsLK A/L Mathematics",
  description: "Weekly online class times for active G.C.E. A/L Mathematics classes by Amal Viduranga.",
};

export default async function SchedulePage() {
  const content = await loadPublicContent();
  const classes = content.status === "ready" ? content.classes : [];

  return (
    <div className="flex flex-col gap-8 pb-16">
      <header className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Class schedule</h1>
        <p className="mt-3 max-w-[60ch] text-base text-muted-foreground">
          Weekly class times for currently active G.C.E. A/L Mathematics batches. All classes are held online.
        </p>
      </header>

      {content.status === "error" && (
        <div role="status" className="rounded-lg border border-border bg-muted p-5 text-sm text-foreground">
          Class schedule could not be loaded right now. Please{" "}
          <Link href="/contact" className="font-semibold text-link underline underline-offset-4">
            contact us
          </Link>{" "}
          for the latest times.
        </div>
      )}

      {content.status === "ready" && classes.length === 0 && (
        <div role="status" className="rounded-lg border border-border bg-muted p-5 text-sm text-foreground">
          No active classes are open right now.{" "}
          <Link href="/contact" className="font-semibold text-link underline underline-offset-4">
            Contact us
          </Link>{" "}
          for upcoming intake dates.
        </div>
      )}

      {content.status === "ready" && classes.length > 0 && (
        <>
          {/* Table from tablet width up */}
          <div className="hidden overflow-hidden rounded-lg border border-border bg-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Class</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Day</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Time</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Format</th>
                  <th scope="col" className="px-5 py-3.5 text-right font-semibold">Enquiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {classes.map((group) => (
                  <tr key={group.id}>
                    <th scope="row" className="px-5 py-4 align-top font-semibold text-foreground">
                      <span className="block">{group.name}</span>
                      {group.description && (
                        <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                          {group.description}
                        </span>
                      )}
                    </th>
                    <td className="px-5 py-4 align-top text-foreground">
                      {group.day || "Schedule on enquiry"}
                    </td>
                    <td className="px-5 py-4 align-top text-foreground tabular-nums">
                      {group.time || "Shared on WhatsApp"}
                    </td>
                    <td className="px-5 py-4 align-top text-muted-foreground">
                      {group.mode || "Online"}
                    </td>
                    <td className="px-5 py-4 text-right align-top">
                      <a
                        href={buildClassWhatsAppUrl(group.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Ask about ${group.name} on WhatsApp`}
                        className="inline-flex min-h-10 items-center font-semibold text-link underline decoration-link/60 underline-offset-4 transition-colors hover:decoration-link"
                      >
                        Ask about this class ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stacked rows on phones */}
          <ul className="divide-y divide-border rounded-lg border border-border bg-card md:hidden">
            {classes.map((group) => (
              <li key={group.id} className="px-4 py-4">
                <h2 className="text-base font-semibold text-foreground">{group.name}</h2>
                {group.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{group.description}</p>
                )}
                <p className="mt-1.5 text-sm text-foreground tabular-nums">
                  {group.day && group.time
                    ? `${group.day} · ${group.time}`
                    : group.day || group.time || "Schedule shared on WhatsApp"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">{group.mode || "Online"}</p>
                <a
                  href={buildClassWhatsAppUrl(group.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Ask about ${group.name} on WhatsApp`}
                  className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-link underline decoration-link/60 underline-offset-4 hover:decoration-link"
                >
                  Ask about this class ↗
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="text-sm text-muted-foreground">
        Not sure which class is right for you?{" "}
        <Link href="/contact" className="font-semibold text-link underline decoration-link/60 underline-offset-4 hover:decoration-link">
          Contact us
        </Link>{" "}
        and we will help you choose.
      </p>
    </div>
  );
}
