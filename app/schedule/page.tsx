import { classGroups } from "@/lib/content";
import { CalendarDays, Clock, MapPin, MonitorPlay, Sparkles } from "lucide-react";

export default function SchedulePage() {
  return (
    <div className="flex flex-col gap-8 md:gap-12 pb-16">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm md:p-12 transition-all">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
        <div className="flex flex-col items-center justify-center gap-2.5 sm:flex-row">
          <p className="inline-flex items-center gap-2 rounded-full bg-violet-50 dark:bg-violet-950/50 border border-violet-200/60 dark:border-violet-800/60 px-3.5 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
            <CalendarDays className="h-3.5 w-3.5" /> Weekly Plan
          </p>
          <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            2028 A/L Intake Now Open
          </p>
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">Class Schedule</h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Find the timeline that fits you best and join our sessions. We offer various classes to cater to different batches.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classGroups.map((group, idx) => (
          <article key={idx} className="group rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 shadow-sm hover:border-blue-500/30 dark:hover:border-blue-500/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 dark:group-hover:text-white transition-colors">
               <MonitorPlay className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{group.name}</h2>
            <div className="space-y-3">
               <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
                 <CalendarDays className="h-4 w-4 text-blue-500 shrink-0" />
                 <span className="font-semibold">{group.day}</span>
               </div>
               <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
                 <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                 <span className="font-semibold">{group.time}</span>
               </div>
               <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
                 <MapPin className="h-4 w-4 text-blue-500 shrink-0" />
                 <span className="font-semibold">{group.mode}</span>
               </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

