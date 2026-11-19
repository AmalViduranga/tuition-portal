import Image from "next/image";
import { Metadata } from "next";
import { teacher as defaultTeacher } from "@/lib/content";
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
    <div className="flex flex-col gap-10 pb-16">
      <header className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-center sm:gap-8">
        <Image
          src={imageUrl}
          alt={name}
          width={160}
          height={160}
          priority
          className="h-32 w-32 shrink-0 rounded-lg bg-muted object-cover object-top sm:h-40 sm:w-40"
        />
        <div>
          <p className="text-sm text-muted-foreground">About the teacher</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground md:text-4xl">{name}</h1>
          <p className="mt-3 max-w-[60ch] text-base text-muted-foreground">{qualification}</p>
        </div>
      </header>

      <section aria-labelledby="background-heading" className="max-w-[75ch]">
        <h2 id="background-heading" className="text-xl font-semibold text-foreground">Background and teaching</h2>
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {description.map((item, idx) => (
            <li key={idx} className="py-3.5 text-base leading-relaxed text-foreground">{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
