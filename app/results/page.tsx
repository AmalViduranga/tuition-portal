import { pastResults } from "@/lib/content";

type Batch = { title: string; totalStudents: number; results: string; highlights?: string[] };

export default function ResultsPage() {
  // Newest batch first.
  const batches: Batch[] = [pastResults.batch2025, pastResults.batch2024];

  return (
    <div className="flex flex-col gap-10 pb-16">
      <header className="border-b border-border pb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Results</h1>
        <p className="mt-3 max-w-[60ch] text-base text-muted-foreground">
          A/L Mathematics results from each batch taught so far.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {batches.map(batch => (
          <section key={batch.title} className="rounded-lg border border-border bg-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground">{batch.title}</h2>
            <p className="mt-4 text-2xl font-bold leading-snug text-foreground sm:text-3xl">{batch.results}</p>
            <p className="mt-2 text-sm text-muted-foreground">{batch.totalStudents} students in the batch</p>

            {batch.highlights && batch.highlights.length > 0 && (
              <>
                <h3 className="mt-8 text-sm font-semibold text-foreground">Highlights</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {batch.highlights.map(item => <li key={item}>{item}</li>)}
                </ul>
              </>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
