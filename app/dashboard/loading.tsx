import { Skeleton, Card } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 pb-12">
      {/* 1. Welcome Section Skeleton */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-100 px-6 py-10 shadow-sm sm:px-12 sm:py-16">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-full max-w-xl" />
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left + Center Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <Skeleton variant="circular" className="h-12 w-12" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>

          {/* Recordings Preview Skeleton */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-4">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Materials Preview Skeleton */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="grid gap-3 sm:grid-cols-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-4 w-full">
                    <Skeleton variant="rectangular" className="h-10 w-10 shrink-0" />
                    <div className="w-full">
                      <Skeleton className="h-4 w-1/3 mb-1" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column Skeleton */}
        <div className="space-y-6">
          <Card className="bg-slate-800 border-0 h-40">
             <Skeleton className="h-6 w-32 bg-slate-700 mb-4" />
             <div className="space-y-3">
               <Skeleton className="h-4 w-full bg-slate-700" />
               <Skeleton className="h-4 w-2/3 bg-slate-700" />
             </div>
          </Card>
          <Card className="h-64">
             <Skeleton className="h-6 w-48 mb-6" />
             {[1, 2, 3].map((i) => (
               <div key={i} className="mb-4 last:mb-0">
                 <div className="flex justify-between mb-2">
                   <Skeleton className="h-4 w-32" />
                   <Skeleton className="h-4 w-16" />
                 </div>
                 <Skeleton className="h-3 w-24" />
               </div>
             ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
