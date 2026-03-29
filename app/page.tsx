import Link from "next/link";
import { redirect } from "next/navigation";
import { classGroups, pastResults, subject, teacher, contactData } from "@/lib/content";
import { ArrowRight, BookOpen, CheckCircle, Clock, GraduationCap, MapPin, Phone, Star, TrendingUp, Users } from "lucide-react";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Home(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  
  // Fallback interceptor: If Supabase stripped the `redirectTo` parameter because of dashboard settings
  // and sent the user to the Site URL root with a `code` instead, we catch it here.
  if (searchParams?.code) {
    const nextUrl = typeof searchParams.next === "string" ? searchParams.next : "/reset-password";
    redirect(`/auth/callback?code=${searchParams.code}&next=${nextUrl}`);
  }

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-6 py-20 text-center shadow-2xl md:px-12 md:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        
        <div className="relative mx-auto max-w-4xl text-white">
          <div className="mb-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-300 backdrop-blur-sm text-center">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400"></span>
            2026 A/L Theory & Revision and 2027 A/L Theory classes are now open for enrollment.
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl lg:leading-[1.1]">
            Master A/L Mathematics with <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Confidence</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 md:text-xl">
            Join the most comprehensive structured lesson delivery with {teacher.name}. Clear concepts, proven results, and individual guidance.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-indigo-500 px-8 py-4 text-base font-semibold text-white shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-all hover:bg-indigo-600 sm:w-auto"
            >
              Join the Class
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href={`https://wa.me/${contactData.whatsapp.replace('+', '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-slate-700 sm:w-auto"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* Stats/Highlight Strip */}
      <section className="mx-auto w-full max-w-5xl">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm text-center">
            <GraduationCap className="mb-3 h-8 w-8 text-indigo-500" />
            <h3 className="text-3xl font-bold text-slate-900">Highest</h3>
            <p className="text-sm font-medium text-slate-500 uppercase mt-1">Z-Score (2.80+)</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm text-center">
            <TrendingUp className="mb-3 h-8 w-8 text-indigo-500" />
            <h3 className="text-3xl font-bold text-slate-900">100%</h3>
            <p className="text-sm font-medium text-slate-500 uppercase mt-1">Pass Rate in 2024</p>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm text-center">
            <Users className="mb-3 h-8 w-8 text-indigo-500" />
            <h3 className="text-3xl font-bold text-slate-900">Individual</h3>
            <p className="text-sm font-medium text-slate-500 uppercase mt-1">Student Attention</p>
          </div>
        </div>
      </section>

      {/* Why Choose This Class / Subject Detail */}
      <section className="scroll-mt-24" id="why-choose-us">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Why Choose This Class?</h2>
          <p className="mt-4 text-lg text-slate-600">A structured approach to mastering A/L Mathematics.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {subject.description.map((item, idx) => (
            <div key={idx} className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <p className="text-slate-700 leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Teacher Summary */}
      <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-lg">
        <div className="grid md:grid-cols-2">
          <div className="bg-indigo-50 p-8 md:p-12 flex flex-col justify-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-800">
              <BookOpen className="h-4 w-4" /> About the Teacher
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{teacher.name}</h2>
            <p className="text-indigo-600 font-medium mb-6">{teacher.qualification}</p>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Achieved 3A passes for Mathematics, Engineering Technology, and Science for Technology. Highest Z-Score: 2.8075. Colombo District 2nd and All Island 30th.
            </p>
            <Link href="/about" className="inline-flex w-fit items-center gap-2 font-semibold text-indigo-600 hover:text-indigo-700">
              Read Full Profile <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="bg-slate-900 p-8 md:p-12 text-white flex flex-col justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-10 opacity-10">
               <GraduationCap className="h-40 w-40" />
             </div>
             <h3 className="text-xl font-bold mb-6 relative z-10">Teaching Philosophy</h3>
             <ul className="space-y-4 relative z-10">
                <li className="flex gap-3 text-slate-300">
                  <Star className="h-6 w-6 shrink-0 text-cyan-400" />
                  <span>Simplify difficult concepts to build strong foundations</span>
                </li>
                <li className="flex gap-3 text-slate-300">
                  <Star className="h-6 w-6 shrink-0 text-cyan-400" />
                  <span>Use modern, interactive teaching methods</span>
                </li>
                <li className="flex gap-3 text-slate-300">
                  <Star className="h-6 w-6 shrink-0 text-cyan-400" />
                  <span>Provide continuous support and doubt-clearing sessions</span>
                </li>
             </ul>
          </div>
        </div>
      </section>

      {/* Results Summary */}
      <section className="scroll-mt-24" id="results">
        <div className="mb-12 flex flex-col items-center justify-between gap-4 md:flex-row text-center md:text-left">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Proven Results</h2>
            <p className="mt-2 text-lg text-slate-600">Our students consistently achieve excellence.</p>
          </div>
          <Link href="/results" className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            View All Results
          </Link>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          {/* 2024 Batch */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between border-b border-indigo-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">{pastResults.batch2024.title}</h3>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">11 Students</span>
            </div>
            <div className="mb-6">
              <p className="text-2xl font-extrabold text-indigo-600">{pastResults.batch2024.results}</p>
            </div>
            <ul className="space-y-3">
              {pastResults.batch2024.highlights.slice(0, 3).map((hl, i) => (
                <li key={i} className="flex gap-3 text-slate-700">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500"></div>
                  <span className="text-sm">{hl}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* 2025 Batch */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col justify-center items-center text-center">
             <div className="rounded-full bg-slate-100 p-4 mb-4">
               <Clock className="h-8 w-8 text-slate-400" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">{pastResults.batch2025.title}</h3>
             <p className="text-slate-500 max-w-xs">{pastResults.batch2025.status}</p>
          </div>
        </div>
      </section>

      {/* Class Schedule */}
      <section className="scroll-mt-24 rounded-3xl bg-slate-50 p-8 md:p-12 border border-slate-100">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Class Schedule</h2>
          <p className="mt-4 text-lg text-slate-600">Join the class that fits your schedule.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classGroups.map((group, idx) => (
            <div key={idx} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors">
              <h3 className="text-lg font-bold text-slate-900 mb-4">{group.name}</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  <span>{group.day}, {group.time}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-indigo-500" />
                  <span>{group.mode}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
           <Link href="/schedule" className="font-medium text-indigo-600 hover:text-indigo-700 underline underline-offset-4">
             See detailed schedule options
           </Link>
        </div>
      </section>

      {/* Quick Contact CTA */}
      <section className="rounded-3xl bg-indigo-600 px-6 py-12 text-center text-white md:py-16">
        <h2 className="text-3xl font-bold sm:text-4xl">Ready to secure your A pass?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-indigo-100 text-lg">
          Registration is open for the new intake. Get in touch with us to reserve your spot.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={`tel:${contactData.phone.replace('+', '')}`}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-indigo-600 shadow-md hover:bg-slate-50 sm:w-auto"
          >
            <Phone className="h-5 w-5" /> Call Now
          </a>
          <Link
            href="/contact"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-indigo-400 bg-indigo-700/50 px-8 py-4 text-base font-bold hover:bg-indigo-700 sm:w-auto"
          >
            Contact Methods
          </Link>
        </div>
      </section>
    </div>
  );
}
