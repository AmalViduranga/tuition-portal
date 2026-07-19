import Link from "next/link";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { classGroups, pastResults, subject, teacher, contactData } from "@/lib/content";
import { ArrowRight, BookOpen, CheckCircle, Clock, GraduationCap, MapPin, Phone, Star, TrendingUp, Users, Calculator, FileText, PlayCircle } from "lucide-react";
import ExamCountdown from "@/components/home/ExamCountdown";

export const metadata: Metadata = {
  title: "A/L Maths Sri Lanka | Best Mathematics Tuition | MathsLK",
  description: "Looking for A/L Maths Sri Lanka? Join MathsLK for top-tier online and physical mathematics classes. Proven results, individual attention, and structured lessons by Amal Viduranga.",
};

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
    <div className="flex flex-col pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-[#0B0F19] pt-12 pb-24 lg:pt-16 lg:pb-32 rounded-3xl sm:rounded-[2.5rem] shadow-2xl max-w-[96rem] mx-auto -mt-6 sm:-mt-4 lg:-mt-4 mx-2 sm:mx-4 lg:mx-8 border border-slate-800">
        {/* Abstract Math Background Patterns */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19] via-[#0B0F19]/90 to-[#0B0F19]"></div>
        
        {/* Glow Effects */}
        <div className="absolute -left-[10%] top-[20%] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]"></div>
        <div className="absolute -right-[10%] bottom-[10%] h-[400px] w-[400px] rounded-full bg-emerald-500/20 blur-[100px]"></div>

        {/* Floating Mathematical Symbols */}
        <div className="absolute left-[10%] top-[15%] text-4xl text-white/5 font-serif select-none hidden md:block">∫</div>
        <div className="absolute right-[15%] top-[20%] text-5xl text-white/5 font-serif select-none hidden md:block">∑</div>
        <div className="absolute left-[20%] bottom-[20%] text-6xl text-white/5 font-serif select-none hidden md:block">π</div>
        <div className="absolute right-[25%] bottom-[15%] text-4xl text-white/5 font-serif select-none hidden md:block">∞</div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Content */}
            <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs sm:text-sm font-medium text-blue-200 backdrop-blur-md">
                  <span className="flex h-2 w-2 rounded-full bg-blue-400"></span>
                  #1 A/L Maths Sri Lanka
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs sm:text-sm font-medium text-emerald-200 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  2028 Intake Now Open
                </div>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
                Master A/L Mathematics (07) with <br className="hidden lg:block" /><span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-slate-400 bg-clip-text text-transparent drop-shadow-sm">Confidence</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-[600px] font-light leading-relaxed">
                Join the most comprehensive structured lesson delivery with <strong className="text-white font-medium">{teacher.name}</strong>. Clear concepts, proven results, and individual guidance.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Link
                  href="/contact"
                  className="group relative flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_40px_-10px_rgba(99,102,241,0.6)] transition-all hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.8)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  <span className="relative z-10 flex items-center gap-2">Join the Class <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></span>
                </Link>
                <a
                  href={`https://wa.me/${contactData.whatsapp.replace('+', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 backdrop-blur-md px-8 py-4 text-base font-semibold text-white transition-all hover:bg-slate-700/80 hover:border-slate-600"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-green-400 group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                  WhatsApp Us
                </a>
              </div>
            </div>

            {/* Right Column: Decorative Visual Dashboard */}
            <div className="lg:col-span-6 relative hidden sm:flex flex-col h-full items-center justify-center perspective-[1000px]">
              <div className="relative z-20 w-full rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 shadow-2xl p-6 transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out max-w-md mx-auto">
                {/* Mock header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-gradient-to-br from-blue-500 to-slate-600 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">Learning System</div>
                      <div className="text-xs text-slate-400">Everything you need</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-slate-700"></div>
                    <div className="h-3 w-3 rounded-full bg-slate-700"></div>
                    <div className="h-3 w-3 rounded-full bg-slate-700"></div>
                  </div>
                </div>
                
                {/* Mock content grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-800/50 p-4 border border-slate-700/30">
                    <div className="flex items-center gap-3 mb-2 text-emerald-400">
                      <PlayCircle className="h-5 w-5" />
                      <span className="text-sm font-semibold text-white">Recordings</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Watch lessons anytime</div>
                  </div>
                  
                  <div className="rounded-xl bg-slate-800/50 p-4 border border-slate-700/30">
                    <div className="flex items-center gap-3 mb-2 text-blue-400">
                      <FileText className="h-5 w-5" />
                      <span className="text-sm font-semibold text-white">Materials</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Tutes, papers & notes</div>
                  </div>
                  
                  <div className="rounded-xl bg-slate-800/50 p-4 border border-slate-700/30">
                    <div className="flex items-center gap-3 mb-2 text-slate-400">
                      <Clock className="h-5 w-5" />
                      <span className="text-sm font-semibold text-white">Schedule</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Plan your study week</div>
                  </div>

                  <div className="rounded-xl bg-slate-800/50 p-4 border border-slate-700/30">
                    <div className="flex items-center gap-3 mb-2 text-blue-400">
                      <Users className="h-5 w-5" />
                      <span className="text-sm font-semibold text-white">Guidance</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Individual support</div>
                  </div>
                </div>
              </div>
              
              <ExamCountdown />

              {/* Floating decorative elements behind the card */}
              <div className="absolute -top-6 -right-6 z-10 h-24 w-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-600 opacity-20 blur-xl"></div>
              <div className="absolute -bottom-10 -left-10 z-10 h-32 w-32 rounded-full bg-gradient-to-tr from-blue-500 to-slate-500 opacity-20 blur-2xl"></div>
            </div>

            {/* Mobile/Tablet Exam Countdown (shown under left column on small screens, under right column on large screens) */}
            <div className="lg:col-span-12 block sm:hidden w-full mt-4">
              <ExamCountdown />
            </div>
            
          </div>
        </div>
      </section>

      {/* 2. Stats Section (Overlapping the hero) */}
      <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 relative z-30 -mt-16 sm:-mt-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          <div className="group flex flex-col items-center justify-center rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">Highest</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Z-Score (2.80+)</p>
          </div>
          <div className="group flex flex-col items-center justify-center rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">100%</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Pass Rate in 2024</p>
          </div>
          <div className="group flex flex-col items-center justify-center rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <Users className="h-6 w-6 text-slate-600" />
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900">Individual</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">Student Attention</p>
          </div>
        </div>
      </section>

      {/* 3. Why Choose This Class */}
      <section className="scroll-mt-24 mt-20 sm:mt-32 px-4 sm:px-6 mx-auto max-w-7xl" id="why-choose-us">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">Why Choose This Class?</h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">A structured approach to mastering A/L Mathematics with clarity and confidence.</p>
        </div>
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {subject.description.map((item, idx) => (
            <div key={idx} className="group relative flex flex-col gap-4 rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:border-blue-200">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Calculator className="h-16 w-16" />
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <CheckCircle className="h-6 w-6" />
              </div>
              <p className="text-slate-700 leading-relaxed font-medium relative z-10">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. About Teacher */}
      <section className="mt-20 sm:mt-32 px-4 sm:px-6 mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col lg:flex-row">
          <div className="lg:w-1/2 p-10 sm:p-16 flex flex-col justify-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-600 w-fit">
              <BookOpen className="h-4 w-4" /> About the Teacher
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">{teacher.name}</h2>
            <div className="h-1 w-12 bg-blue-500 rounded-full mb-6"></div>
            <p className="text-blue-600 font-bold mb-6 text-lg">{teacher.qualification}</p>
            <p className="text-slate-600 mb-8 leading-relaxed text-lg">
              Achieved 3A passes for Mathematics, Engineering Technology, and Science for Technology. Highest Z-Score: 2.8075. Colombo District 2nd and All Island 30th.
            </p>
            <Link href="/about" className="inline-flex w-fit items-center gap-2 font-bold text-blue-600 hover:text-blue-800 transition-colors group">
              Read Full Profile <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="lg:w-1/2 bg-[#0A1128] p-10 sm:p-16 text-white flex flex-col justify-center relative overflow-hidden">
             {/* Abstract math decor */}
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent bg-[length:20px_20px]"></div>
             <div className="absolute -bottom-20 -right-20 opacity-20">
               <svg width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="2" x2="12" y2="22"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
             </div>
             
             <h3 className="text-2xl font-bold mb-8 relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">Teaching Philosophy</h3>
             <ul className="space-y-6 relative z-10">
                <li className="flex gap-4 items-start group">
                  <div className="mt-1 bg-blue-500/20 p-2 rounded-lg group-hover:bg-blue-500/40 transition-colors">
                    <Star className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span className="text-slate-300 text-lg leading-relaxed">Simplify difficult concepts to build strong foundations</span>
                </li>
                <li className="flex gap-4 items-start group">
                  <div className="mt-1 bg-blue-500/20 p-2 rounded-lg group-hover:bg-blue-500/40 transition-colors">
                    <Star className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span className="text-slate-300 text-lg leading-relaxed">Use modern, interactive teaching methods</span>
                </li>
                <li className="flex gap-4 items-start group">
                  <div className="mt-1 bg-blue-500/20 p-2 rounded-lg group-hover:bg-blue-500/40 transition-colors">
                    <Star className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span className="text-slate-300 text-lg leading-relaxed">Provide continuous support and doubt-clearing sessions</span>
                </li>
             </ul>
          </div>
        </div>
      </section>

      {/* 5. Results */}
      <section className="scroll-mt-24 mt-20 sm:mt-32 px-4 sm:px-6 mx-auto max-w-7xl" id="results">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">Proven Results</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-xl">Our students consistently achieve excellence and secure top university placements.</p>
          </div>
          <Link href="/results" className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md mx-auto md:mx-0">
            View All Results
          </Link>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          {/* 2024 Batch */}
          <div className="group rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
              <h3 className="text-2xl font-bold text-slate-900">{pastResults.batch2024.title}</h3>
              <span className="inline-flex rounded-full bg-slate-100 px-4 py-1.5 text-sm font-bold text-slate-700 whitespace-nowrap w-fit">
                {pastResults.batch2024.totalStudents} Students
              </span>
            </div>
            <div className="mb-8">
              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-slate-600">{pastResults.batch2024.results}</p>
            </div>
            {pastResults.batch2024.highlights && (
              <ul className="space-y-4">
                {pastResults.batch2024.highlights.slice(0, 3).map((hl, i) => (
                  <li key={i} className="flex gap-4 items-start text-slate-700">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
                    <span className="text-base font-medium">{hl}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* 2025 Batch */}
          <div className="group relative rounded-3xl border-2 border-blue-100 bg-gradient-to-b from-blue-50/50 to-white p-8 sm:p-10 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="absolute -top-4 right-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-emerald-500 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white shadow-lg">
                <Star className="h-3.5 w-3.5 fill-white" /> Latest
              </span>
            </div>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between border-b border-blue-100/50 pb-6 gap-4">
              <h3 className="text-2xl font-bold text-slate-900">{pastResults.batch2025.title}</h3>
              <span className="inline-flex rounded-full bg-blue-100 px-4 py-1.5 text-sm font-bold text-blue-700 whitespace-nowrap w-fit">
                {pastResults.batch2025.totalStudents} Students
              </span>
            </div>
            <div className="mb-8">
              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">{pastResults.batch2025.results}</p>
            </div>
            {('highlights' in pastResults.batch2025) && (
              <ul className="space-y-4">
                {(pastResults.batch2025 as { highlights: string[] }).highlights.slice(0, 3).map((hl: string, i: number) => (
                  <li key={i} className="flex gap-4 items-start text-slate-700">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                    <span className="text-base font-medium">{hl}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* 6. Schedule */}
      <section className="scroll-mt-24 mt-20 sm:mt-32 px-4 sm:px-6 mx-auto max-w-7xl">
        <div className="rounded-[2.5rem] bg-slate-50 p-8 sm:p-16 border border-slate-200/60 shadow-sm relative overflow-hidden">
          {/* Subtle grid pattern for background */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          
          <div className="mb-12 text-center relative z-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">Class Schedule</h2>
            <p className="mt-4 text-lg text-slate-600">Join the class that perfectly fits your schedule.</p>
          </div>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 relative z-10">
            {classGroups.map((group, idx) => (
              <div key={idx} className="group rounded-2xl bg-white p-8 shadow-sm border border-slate-200 transition-all hover:shadow-lg hover:border-blue-300 hover:-translate-y-1">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6">{group.name}</h3>
                <div className="space-y-4 text-slate-600 font-medium">
                  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl">
                    <Clock className="h-5 w-5 text-blue-500 shrink-0" />
                    <span>{group.day}, {group.time}</span>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl">
                    <MapPin className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span>{group.mode}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center relative z-10">
             <Link href="/schedule" className="inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-800 underline underline-offset-4 decoration-2 decoration-blue-200 hover:decoration-blue-500 transition-all">
               See detailed schedule options <ArrowRight className="h-4 w-4" />
             </Link>
          </div>
        </div>
      </section>

      {/* 7. Quick Contact CTA */}
      <section className="mt-20 sm:mt-32 px-4 sm:px-6 mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 via-blue-700 to-slate-800 px-8 py-16 text-center shadow-2xl md:px-16 md:py-20">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white opacity-10 blur-3xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-white sm:text-5xl leading-tight mb-6">Ready to secure your A pass?</h2>
            <p className="mx-auto max-w-2xl text-blue-100 text-lg sm:text-xl font-light mb-10">
              Registration is open for the new intake. Get in touch with us to reserve your spot and begin your journey.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`tel:${contactData.phone.replace('+', '')}`}
                className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-blue-700 shadow-lg transition-all hover:bg-slate-50 hover:scale-105"
              >
                <Phone className="h-5 w-5 transition-transform group-hover:rotate-12" /> Call Now
              </a>
              <Link
                href="/contact"
                className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-blue-300/30 bg-blue-800/40 backdrop-blur-sm px-8 py-4 text-base font-bold text-white transition-all hover:bg-blue-800/60"
              >
                Contact Methods <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
