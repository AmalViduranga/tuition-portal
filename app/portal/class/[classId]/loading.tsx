import { Skeleton, Card } from "@/components/ui";

export default function ClassDetailsLoading() {
  return (
    <div className="space-y-6">
      <Card>
         <Skeleton className="h-8 w-64 mb-3" />
         <div className="flex gap-4 mb-4">
             <Skeleton className="h-4 w-24" />
             <Skeleton className="h-4 w-32" />
         </div>
         <Skeleton className="h-4 w-full max-w-lg mb-6" />
         <Skeleton className="h-6 w-3/4 max-w-sm mb-4" />
         <div className="grid gap-3 sm:grid-cols-2 mt-4">
             {[1, 2].map((i) => (
                 <div key={i} className="flex gap-4 items-center">
                    <Skeleton variant="circular" className="h-10 w-10 shrink-0" />
                    <div>
                       <Skeleton className="h-4 w-32 mb-1" />
                       <Skeleton className="h-3 w-20" />
                    </div>
                 </div>
             ))}
         </div>
      </Card>

      <div className="border-b border-slate-200">
         <div className="flex space-x-8">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
         </div>
      </div>

      <div className="grid gap-4 mt-6">
         {[1, 2, 3].map((i) => (
             <Card key={i} className="flex justify-between items-center bg-slate-50">
                 <div className="flex items-start gap-4">
                     <Skeleton className="h-10 w-16 rounded mb-2" />
                     <div>
                         <Skeleton className="h-5 w-48 mb-2" />
                         <Skeleton className="h-4 w-32" />
                     </div>
                 </div>
                 <Skeleton className="h-10 w-24" />
             </Card>
         ))}
      </div>
    </div>
  );
}
