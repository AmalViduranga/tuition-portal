import { classGroups } from "@/lib/content";
import { CalendarDays, Clock, MapPin, MonitorPlay } from "lucide-react";

export default function SchedulePage() {
  return (
    <div className="flex flex-col gap-8 md:gap-12 pb-10">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white p-8 text-center shadow-sm md:p-12">
         <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-500" />
        <p className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700">
          <CalendarDays className="h-4 w-4" /> Weekly Plan
        </p>
        <h1 className="mt-4 text-4xl font-extrabold text-slate-900 md:text-5xl">Class Schedule</h1>
        <p className="mt-4 text-lg text-slate-600 max-w-xl mx-auto">
          Find the timeline that fits you best and join our sessions. We offer various classes to cater to different batches.
        </p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classGroups.map((group, idx) => (
          <article key={idx} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
               <MonitorPlay className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">{group.name}</h2>
            <div className="space-y-4">
               <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                 <CalendarDays className="h-5 w-5 text-indigo-500" />
                 <span className="font-medium">{group.day}</span>
               </div>
               <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                 <Clock className="h-5 w-5 text-indigo-500" />
                 <span className="font-medium">{group.time}</span>
               </div>
               <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl">
                 <MapPin className="h-5 w-5 text-indigo-500" />
                 <span className="font-medium">{group.mode}</span>
               </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
