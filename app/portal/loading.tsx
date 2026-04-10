import { Skeleton, Card } from "@/components/ui";

export default function PortalLoading() {
  return (
    <div className="space-y-6">
      {/* Welcome Section Skeleton */}
      <Card>
        <div className="flex items-center gap-4">
           <Skeleton variant="circular" className="h-16 w-16" />
           <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
           </div>
        </div>
      </Card>

      {/* Quick Actions Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
         {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-white p-6 shadow-sm">
               <Skeleton variant="circular" className="h-10 w-10 mb-3" />
               <Skeleton className="h-6 w-32 mb-2" />
               <Skeleton className="h-4 w-48" />
            </div>
         ))}
      </div>

      {/* Your Classes Skeleton */}
      <Card>
         <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-16" />
         </div>
         <div className="grid gap-3 md:grid-cols-2">
            {[1, 2].map((i) => (
                <div key={i} className="rounded-lg border border-slate-200 p-4">
                   <Skeleton className="h-5 w-48 mb-2" />
                   <Skeleton className="h-4 w-32 mb-4" />
                   <Skeleton className="h-4 w-24" />
                </div>
            ))}
         </div>
      </Card>

      {/* Recent Recordings Skeleton */}
      <Card>
         <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-16" />
         </div>
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {[1, 2, 3].map((i) => (
                 <div key={i} className="rounded-lg border border-slate-200 overflow-hidden">
                    <Skeleton className="h-32 w-full" />
                    <div className="p-3">
                       <Skeleton className="h-4 w-full mb-2" />
                       <Skeleton className="h-3 w-1/2" />
                    </div>
                 </div>
             ))}
         </div>
      </Card>
    </div>
  );
}
