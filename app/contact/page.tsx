import { Metadata } from "next";
import { Phone } from "lucide-react";
import { contactData } from "@/lib/content";
import { buildTelUrl, formatPhoneDisplay } from "@/lib/whatsapp";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export const metadata: Metadata = {
  title: "Contact MathsLK | A/L Mathematics Classes Sri Lanka",
  description: "Get in touch with MathsLK for A/L Mathematics classes. Contact Amal Viduranga via WhatsApp, phone, or email to join theory or revision classes.",
};

export default function ContactPage() {
  const linkClass = "inline-flex min-h-9 items-center font-semibold text-link underline decoration-link/60 underline-offset-4 transition-colors hover:decoration-link";
  const displayPhone = formatPhoneDisplay(contactData.phone);

  return (
    <div className="flex flex-col gap-10 pb-16">
      <header className="border-b border-border pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Contact</h1>
        <p className="mt-3 max-w-[60ch] text-base text-muted-foreground">
          Questions about a class, or ready to join? WhatsApp is the fastest way to reach us. We usually reply within a few hours.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <WhatsAppButton
            phone={contactData.whatsapp}
            message="Hi, I would like to enquire about A/L Mathematics classes."
          />
          <a
            href={buildTelUrl(contactData.phone)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Call {displayPhone}</span>
          </a>
        </div>
      </header>

      <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <dt className="text-sm text-muted-foreground">Phone / WhatsApp</dt>
          <dd className="mt-1 text-base font-semibold text-foreground">
            <a href={buildTelUrl(contactData.phone)} className={linkClass}>{displayPhone}</a>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-sm text-muted-foreground">Email</dt>
          <dd className="mt-1 break-words text-base font-semibold text-foreground">
            <a href={`mailto:${contactData.email}`} className={linkClass}>{contactData.email}</a>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Where classes happen</dt>
          <dd className="mt-1 text-base text-foreground">{contactData.location}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Follow</dt>
          <dd className="mt-1 flex flex-col gap-1 text-base">
            <a href="https://www.youtube.com/@amalvidu" target="_blank" rel="noopener noreferrer" className={linkClass}>
              YouTube channel
            </a>
            <a href="https://www.facebook.com/share/1FadraTpVk/" target="_blank" rel="noopener noreferrer" className={linkClass}>
              Facebook page
            </a>
          </dd>
        </div>
      </dl>

      <section className="rounded-lg border border-border bg-muted p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-foreground">Joining a class</h2>
        <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
          Registration is open for the new intake. Send a message with your A/L year and we will share the class
          details and set up your student portal account.
        </p>
      </section>
    </div>
  );
}
