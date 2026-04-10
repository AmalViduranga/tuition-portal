import { Skeleton, Card } from "@/components/ui";

export default function ClassesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
           <Skeleton className="h-8 w-48 mb-2" />
           <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
         {[1, 2, 3, 4, 5, 6].map((i) => (
             <Card key={i} className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-6" />
                
                <div className="flex flex-col gap-3">
                   <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                   </div>
                   <div className="flex justify-between items-center bg-slate-50 p-2 rounded">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                   </div>
                </div>
                
                <Skeleton className="h-10 w-full mt-6" />
             </Card>
         ))}
      </div>
    </div>
  );
}
