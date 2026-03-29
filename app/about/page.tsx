import { Metadata } from "next";
import { teacher as defaultTeacher } from "@/lib/content";
import { BookOpen, GraduationCap, Award, Briefcase } from "lucide-react";
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
  const imageUrl = siteSettings.teacher_image_url || null;

  return (
    <div className="flex flex-col gap-8 md:gap-12 pb-10">
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white p-8 shadow-sm md:p-12">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-50 blur-3xl" />
        <div className="relative text-center md:text-left">
          <p className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
            <BookOpen className="h-4 w-4" /> Educator Profile
          </p>
          <h1 className="mt-4 text-4xl font-extrabold text-slate-900 md:text-5xl">About the Teacher</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto md:mx-0">
            Passionate about simplifying difficult concepts and guiding students toward academic excellence.
          </p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 border border-slate-100 bg-slate-50 rounded-3xl p-8 flex flex-col items-center text-center justify-center">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={name} 
                className="h-32 w-32 object-cover rounded-full mb-6 shadow-md ring-4 ring-indigo-50"
              />
            ) : (
              <div className="h-32 w-32 bg-indigo-100 rounded-full flex items-center justify-center mb-6 text-indigo-500 shadow-inner">
                 <GraduationCap className="h-16 w-16" />
              </div>
            )}
            <h2 className="text-2xl font-bold text-slate-900">{name}</h2>
            <p className="mt-2 text-indigo-600 font-medium">{qualification}</p>
        </div>

        <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Award className="h-6 w-6 text-indigo-500" /> Teaching Experience & Background
            </h3>
            <ul className="grid gap-4 sm:grid-cols-2 text-left">
              {description.map((item, idx) => (
                <li key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 flex gap-4 hover:border-indigo-300 transition-colors shadow-sm">
                  <Briefcase className="h-6 w-6 text-slate-400 shrink-0" />
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
        </div>
      </div>
    </div>
  );
}
