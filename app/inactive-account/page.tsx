import { contactData } from "@/lib/content";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";

export default function InactiveAccountPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
      <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Your account is inactive</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Access to the student portal is paused for this account. This usually means a class payment
          needs to be confirmed, or the account was paused by your teacher.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Message us and we will sort it out with you.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <WhatsAppButton
            phone={contactData.whatsapp}
            message="Hi, my MathsLK student account is inactive and I need assistance."
            className="w-full"
          />
          <a
            href={`mailto:${contactData.email}`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            {contactData.email}
          </a>
        </div>
      </div>
    </div>
  );
}
