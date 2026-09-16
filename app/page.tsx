import Link from "next/link";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { classGroups, pastResults, subject, teacher, contactData } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  GraduationCap,
  MapPin,
  Phone,
  Star,
  TrendingUp,
  Users,
  FileText,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Award,
} from "lucide-react";
import ExamCountdown from "@/components/home/ExamCountdown";

export const metadata: Metadata = {
  title: "A/L Maths Sri Lanka | Best Mathematics Tuition | MathsLK",
  description:
    "Looking for A/L Maths Sri Lanka? Join MathsLK for top-tier online mathematics classes. Proven results, individual attention, and structured lessons by Amal Viduranga.",
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

  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("key, value");
  const siteSettings = settings?.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>) || {};

  const currentLesson2027Theory = siteSettings.current_lesson_2027_theory?.trim();
  const currentLesson2027Revision = siteSettings.current_lesson_2027_revision?.trim();
  const currentLesson2028Theory = siteSettings.current_lesson_2028_theory?.trim();

  return (
    <div className="flex flex-col pb-24">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl sm:rounded-[2rem] border border-slate-800/80 bg-gradient-to-b from-[#0B0F19] via-[#0D1527] to-[#0B0F19] text-white shadow-2xl mx-auto w-full max-w-[96rem] px-4 pt-12 pb-20 sm:px-8 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-32 -mt-4">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 items-center">
            {/* Left Column: Heading, Value Prop, CTAs */}
            <div className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left z-10">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mb-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300 backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  #1 A/L Mathematics Program
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  2027 Theory, Revision & 2028 Admissions Open
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15] mb-6">
                Master A/L Mathematics with{" "}
                <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                  Absolute Clarity
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl mb-8">
                Structured lesson delivery, deep conceptual theories, and comprehensive past paper discussions guided by{" "}
                <strong className="text-white font-semibold">{teacher.name}</strong> (Colombo District 2nd, Highest Z-Score 2.8075).
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-8">
                <Link
                  href="/contact"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Join the Class</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href={`https://wa.me/${contactData.whatsapp.replace("+", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-sm font-semibold text-slate-200 shadow-sm transition-all duration-200 hover:bg-slate-700/80 hover:text-white active:scale-[0.98]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 fill-current text-emerald-400"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                  </svg>
                  <span>WhatsApp Us</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-medium text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>100% Pass Rate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Verified 2.80+ Z-Score</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>100% Online Learning</span>
                </div>
              </div>
            </div>

            {/* Right Column: Professional LMS Hub Preview */}
            <div className="lg:col-span-5 relative flex flex-col items-center">
              <div className="w-full max-w-md rounded-2xl border border-slate-700/70 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl">
                {/* Mock Card Header */}
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/20">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white tracking-wide">MathsLK Student Portal</p>
                      <p className="text-[11px] text-slate-400">Active Learning Environment</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live
                  </span>
                </div>

                {/* Dynamic Current Lessons / Topics From Admin Panel */}
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 mb-3.5 text-left">
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="font-bold text-blue-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Current Lessons & Topics</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Active</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                      <span className="font-bold text-slate-300 shrink-0">2027 Theory:</span>
                      <span className="text-right text-slate-100 font-medium truncate">
                        {currentLesson2027Theory || "Limits and Continuity"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                      <span className="font-bold text-slate-300 shrink-0">2027 Revision:</span>
                      <span className="text-right text-slate-100 font-medium truncate">
                        {currentLesson2027Revision || "Past Paper Discussion - 2025"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                      <span className="font-bold text-slate-300 shrink-0">2028 Theory:</span>
                      <span className="text-right text-slate-100 font-medium truncate">
                        {currentLesson2028Theory || "Functions Introduction"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resource Links Grid */}
                <div className="grid grid-cols-2 gap-2.5 mb-4 text-left">
                  <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3 hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-2 text-emerald-400 mb-1">
                      <PlayCircle className="h-4 w-4" />
                      <span className="text-xs font-semibold text-slate-200">Recordings</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">Full HD class replays on demand</p>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-3 hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                      <FileText className="h-4 w-4" />
                      <span className="text-xs font-semibold text-slate-200">Materials</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">Online lesson resources and class materials</p>
                  </div>
                </div>

                {/* Live Exam Countdown embed */}
                <div className="pt-2 border-t border-slate-800/80">
                  <ExamCountdown />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Stats Bar */}

      <section className="relative z-20 -mt-10 sm:-mt-14 mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 sm:gap-4">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">2.8075</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Highest Z-Score Achieved
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">100%</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                2024 Batch Pass Rate
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-5 shadow-lg shadow-slate-900/5 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">Individual</p>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Attention & Paper Marking
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Why Choose This Class */}
      <section className="mt-20 sm:mt-28 mx-auto max-w-6xl px-4 sm:px-6" id="why-choose-us">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <span className="inline-block rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
            Academic Excellence
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Why Students Excel in Our Classes
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400">
            A comprehensive, battle-tested system specifically structured to turn mathematics from an intimidating subject into your strongest A pass.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {subject.description.map((item, idx) => (
            <div
              key={idx}
              className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md hover:-translate-y-1"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mb-4 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <CheckCircle className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Teacher Profile */}
      <section className="mt-20 sm:mt-28 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl grid lg:grid-cols-12">
          {/* Left: Credentials */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
            <div className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <BookOpen className="h-4 w-4" /> Instructor Profile
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
              {teacher.name}
            </h2>
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-5">
              {teacher.qualification}
            </p>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 mb-6">
              Achieved 3A passes for Combined Mathematics, Engineering Technology, and Science for Technology with a record Highest Z-Score of 2.8075. Ranked Colombo District 2nd and All Island 30th.
            </p>
            <div>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Read Full Biography <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right: Teaching Principles */}
          <div className="lg:col-span-5 bg-slate-950 p-8 sm:p-12 text-white flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-slate-800">
            <h3 className="text-lg font-bold tracking-tight text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              Core Teaching Principles
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-500/20 text-emerald-400 mt-0.5">
                  <Star className="h-3.5 w-3.5 fill-current" />
                </span>
                <span className="text-xs leading-relaxed text-slate-300">
                  Build fundamental concepts from the ground up so complex problems feel natural.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-500/20 text-emerald-400 mt-0.5">
                  <Star className="h-3.5 w-3.5 fill-current" />
                </span>
                <span className="text-xs leading-relaxed text-slate-300">
                  Step-by-step model derivations and time-saving mathematical shortcuts.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-500/20 text-emerald-400 mt-0.5">
                  <Star className="h-3.5 w-3.5 fill-current" />
                </span>
                <span className="text-xs leading-relaxed text-slate-300">
                  Dedicated 1-on-1 doubt clearing and thorough marking feedback on every paper.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Results Section */}
      <section className="mt-20 sm:mt-28 mx-auto max-w-6xl px-4 sm:px-6" id="results">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              Proven Track Record
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Student Achievements
            </h2>
          </div>
          <Link
            href="/results"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            <span>View all batch details</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* 2024 Batch */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{pastResults.batch2024.title}</h3>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {pastResults.batch2024.totalStudents} Candidates
              </span>
            </div>
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mb-5">{pastResults.batch2024.results}</p>
            {pastResults.batch2024.highlights && (
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                {pastResults.batch2024.highlights.slice(0, 3).map((hl, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 2025 Batch */}
          <div className="rounded-2xl border-2 border-blue-500/20 dark:border-blue-500/30 bg-blue-50/20 dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm relative">
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-4 mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{pastResults.batch2025.title}</h3>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-3 py-1 text-xs font-bold">
                {pastResults.batch2025.totalStudents} Candidates
              </span>
            </div>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-5">{pastResults.batch2025.results}</p>
            {"highlights" in pastResults.batch2025 && (
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                {(pastResults.batch2025 as { highlights: string[] }).highlights.slice(0, 3).map((hl: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* 6. Schedule Overview */}
      <section className="mt-20 sm:mt-28 mx-auto max-w-6xl px-4 sm:px-6" id="schedule">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-8 sm:p-12">
          <div className="mb-8 text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Class Schedule</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Choose the batch and session format that best fits your school schedule.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classGroups.map((group, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-all hover:border-blue-300 dark:hover:border-blue-700"
              >
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">{group.name}</h3>
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 p-2">
                    <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                    <span>
                      {group.day}, {group.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 p-2">
                    <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{group.mode}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/schedule"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              View complete timetable and locations <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Call To Action Banner */}
      <section className="mt-20 sm:mt-28 mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 px-8 py-14 text-center shadow-xl sm:px-14 sm:py-16 text-white">
          <h2 className="text-2xl sm:text-4xl font-black mb-4 leading-tight">
            Ready to secure your A pass in Mathematics?
          </h2>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-blue-100 font-light mb-8 leading-relaxed">
            Registration is currently open. Contact our team directly to confirm class availability and receive course materials.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href={`tel:${contactData.phone.replace("+", "")}`}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-700 shadow-md transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Phone className="h-4 w-4" />
              <span>Call: {contactData.phone}</span>
            </a>
            <Link
              href="/contact"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <span>Contact Options</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
