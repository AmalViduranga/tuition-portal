import { pastResults } from "@/lib/content";
import { Trophy, TrendingUp, Medal, Star } from "lucide-react";

export default function ResultsPage() {
  return (
    <div className="flex flex-col gap-8 md:gap-12 pb-10">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-slate-900 p-8 text-white shadow-xl md:p-12 text-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 to-slate-900 opacity-50" />
        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-semibold text-indigo-300">
            <Trophy className="h-4 w-4" /> Achievement Highlights
          </p>
          <h1 className="mt-4 text-4xl font-extrabold md:text-5xl">Our Success Stories</h1>
          <p className="mt-4 text-lg text-indigo-100/80 mx-auto max-w-2xl">
            Consistent high performance and measurable student progress. Join the next batch of top achievers.
          </p>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-3xl border border-indigo-100 bg-white p-8 shadow-sm">
           <div className="flex items-center gap-4 mb-6">
              <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
                <Medal className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{pastResults.batch2024.title}</h2>
           </div>
           <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
             <p className="text-sm uppercase tracking-wider font-semibold text-slate-500 mb-2">Overall Results</p>
             <p className="text-3xl font-extrabold text-indigo-600">{pastResults.batch2024.results}</p>
             <p className="text-slate-600 font-medium mt-1">From a total of {pastResults.batch2024.totalStudents} students</p>
           </div>
           <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
             <Star className="h-5 w-5 text-amber-500" /> Key Highlights
           </h3>
           <ul className="space-y-4">
               {pastResults.batch2024.highlights.map((item, idx) => (
                 <li key={idx} className="flex gap-3 text-slate-700 bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                   <TrendingUp className="h-5 w-5 text-emerald-500 shrink-0" />
                   <span>{item}</span>
                 </li>
               ))}
           </ul>
        </div>
        
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-center items-center text-center">
           <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-400">
             <Trophy className="h-10 w-10" />
           </div>
           <h2 className="text-2xl font-bold text-slate-900 mb-3">{pastResults.batch2025.title}</h2>
           <p className="text-slate-500 text-lg max-w-sm">{pastResults.batch2025.status}</p>
        </div>
      </div>
    </div>
  );
}
