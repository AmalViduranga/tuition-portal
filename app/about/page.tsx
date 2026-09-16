import Image from "next/image";
import { Metadata } from "next";
import { teacher as defaultTeacher } from "@/lib/content";
import { BookOpen, GraduationCap, Award, Briefcase, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "About Amal Viduranga | MathsLK Educator Profile",
  description: "Learn about Amal Viduranga, the educator behind MathsLK. Specializing in A/L Mathematics with proven results and structured teaching methodologies.",
};

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("key, value");

  const siteSettings = settings?.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>) || {};

  const name = siteSettings.teacher_name || defaultTeacher.name;
  const qualification = siteSettings.teacher_qualification || defaultTeacher.qualification;
  
  const descriptionRaw = siteSettings.teacher_description
    ? siteSettings.teacher_description.split("\n").map((s: string) => s.trim()).filter(Boolean)
    : defaultTeacher.description;
    
  // Ensure description is always an array
  const description = Array.isArray(descriptionRaw) ? descriptionRaw : [descriptionRaw];
  const imageUrl = siteSettings.teacher_image_url || "/AV maths photo 01.png";

  return (
    <div className="flex flex-col gap-8 md:gap-12 pb-16">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm md:p-12 transition-all">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative text-center md:text-left">
          <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 px-3.5 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <BookOpen className="h-3.5 w-3.5" /> Educator Profile
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-5xl">About the Teacher</h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto md:mx-0">
            Passionate about simplifying difficult concepts and guiding students toward academic excellence in Combined Mathematics.
          </p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 rounded-3xl p-8 flex flex-col items-center text-center justify-center transition-all">
          {imageUrl ? (
            <Image 
              src={imageUrl} 
              alt={name}
              width={128}
              height={128}
              className="h-32 w-32 object-cover rounded-full mb-6 shadow-lg ring-4 ring-blue-500/20"
            />
          ) : (
            <div className="h-32 w-32 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 shadow-inner">
               <GraduationCap className="h-16 w-16" />
            </div>
          )}
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{name}</h2>
          <p className="mt-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">{qualification}</p>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-6 flex items-center gap-3">
            <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" /> 
            <span>Teaching Experience & Background</span>
          </h3>
          <ul className="grid gap-4 sm:grid-cols-2 text-left">
            {description.map((item, idx) => (
              <li key={idx} className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex gap-4 hover:border-blue-500/30 dark:hover:border-blue-500/40 hover:shadow-md transition-all shadow-xs">
                <Briefcase className="h-5 w-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

