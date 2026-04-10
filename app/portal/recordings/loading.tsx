import { Skeleton, Card } from "@/components/ui";

export default function RecordingsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
           <Skeleton className="h-8 w-48 mb-2" />
           <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-64" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-1 border-r border-slate-200 pr-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-2">
               {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
               ))}
            </div>
         </div>
         <div className="lg:col-span-3">
             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                 {[1, 2, 3, 4, 5, 6].map((i) => (
                     <Card key={i} className="overflow-hidden p-0">
                        <Skeleton className="aspect-video w-full" />
                        <div className="p-4">
                           <Skeleton className="h-5 w-full mb-2" />
                           <Skeleton className="h-4 w-2/3 mb-4" />
                           <div className="flex justify-between items-center">
                              <Skeleton className="h-4 w-16" />
                              <Skeleton className="h-8 w-24 rounded-full" />
                           </div>
                        </div>
                     </Card>
                 ))}
             </div>
         </div>
      </div>
    </div>
  );
}
