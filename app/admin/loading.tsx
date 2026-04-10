import { Skeleton, Card } from "@/components/ui";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
           <Skeleton className="h-8 w-48 mb-2" />
           <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} padding="sm">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-8">
         <Card className="h-96">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="space-y-4">
               {[1, 2, 3, 4, 5].map((i) => (
                 <Skeleton key={i} className="h-12 w-full" />
               ))}
            </div>
         </Card>
         <Card className="h-96">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="space-y-4">
               {[1, 2, 3, 4, 5].map((i) => (
                 <Skeleton key={i} className="h-12 w-full" />
               ))}
            </div>
         </Card>
      </div>
    </div>
  );
}
