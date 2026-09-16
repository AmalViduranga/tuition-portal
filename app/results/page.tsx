import { pastResults } from "@/lib/content";
import { Trophy, TrendingUp, Medal, Star } from "lucide-react";

export default function ResultsPage() {
  return (
    <div className="flex flex-col gap-8 md:gap-12 pb-16">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-8 text-white shadow-xl md:p-12 text-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-950 via-slate-900 to-indigo-950 opacity-70" />
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/15 px-3.5 py-1 text-xs font-semibold text-blue-300">
            <Trophy className="h-3.5 w-3.5" /> Achievement Highlights
          </p>
          <h1 className="mt-4 text-3xl font-black md:text-5xl tracking-tight">Our Success Stories</h1>
          <p className="mt-3 text-base sm:text-lg text-blue-100/80 mx-auto max-w-2xl">
            Consistent high performance and measurable student progress in Combined Mathematics. Join the next batch of top achievers.
          </p>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm transition-all">
           <div className="flex items-center gap-3.5 mb-6">
              <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-2xl text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                <Medal className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{pastResults.batch2024.title}</h2>
           </div>
           <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
             <p className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1.5">Overall Results</p>
             <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{pastResults.batch2024.results}</p>
             <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">From a total of {pastResults.batch2024.totalStudents} students</p>
           </div>
           <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
             <Star className="h-4 w-4 text-amber-500" /> Key Highlights
           </h3>
           <ul className="space-y-3">
               {pastResults.batch2024.highlights.map((item, idx) => (
                 <li key={idx} className="flex gap-3 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 p-4 rounded-xl shadow-xs text-xs sm:text-sm font-medium">
                   <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                   <span>{item}</span>
                 </li>
               ))}
           </ul>
        </div>
        
        <div className="rounded-3xl border border-blue-200/80 dark:border-blue-800/60 bg-gradient-to-br from-blue-50/40 to-indigo-50/20 dark:from-blue-950/20 dark:to-indigo-950/20 p-8 shadow-md relative">
           <div className="absolute -top-3.5 right-6">
             <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/30">
               <Star className="h-3 w-3 fill-amber-300 text-amber-300" /> Latest Results
             </span>
           </div>
           <div className="flex items-center gap-3.5 mb-6">
              <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-sm">
                <Trophy className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{pastResults.batch2025.title}</h2>
           </div>
           <div className="mb-8 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-blue-100 dark:border-blue-900/50 shadow-xs">
             <p className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1.5">Overall Results</p>
             <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{pastResults.batch2025.results}</p>
             <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">From a total of {pastResults.batch2025.totalStudents} students</p>
           </div>
           {('highlights' in pastResults.batch2025) && (
             <>
               <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                 <Star className="h-4 w-4 text-amber-500" /> Key Highlights
               </h3>
               <ul className="space-y-3">
                   {(pastResults.batch2025 as { highlights: string[] }).highlights.map((item: string, idx: number) => (
                     <li key={idx} className="flex gap-3 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-xl shadow-xs text-xs sm:text-sm font-medium">
                       <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                       <span>{item}</span>
                     </li>
                   ))}
               </ul>
             </>
           )}
        </div>
      </div>
    </div>
  );
}
