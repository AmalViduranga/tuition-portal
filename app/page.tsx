import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, BookOpen, FileText, Phone, PlayCircle } from "lucide-react";
import { contactData, pastResults, subject, teacher } from "@/lib/content";
import { loadPublicContent } from "@/lib/server/public-content";
import { createClient } from "@/lib/supabase/server";
import { buildTelUrl, buildWhatsAppUrl, formatPhoneDisplay } from "@/lib/whatsapp";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { HomeContentProvider } from "@/components/home/HomeContentProvider";
import CurrentLessons from "@/components/home/CurrentLessons";
import ClassSchedule from "@/components/home/ClassSchedule";
import ExamCountdown from "@/components/home/ExamCountdown";
import { safeNextPath } from "@/lib/utils/safe-redirect";
import styles from "./home.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MathsLK | G.C.E. A/L Mathematics Classes",
  description:
    "Online G.C.E. A/L Mathematics theory, revision, and paper classes by Amal Viduranga, with recordings and notes in the student portal.",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

async function getSignedInDestination(): Promise<{ href: string; label: string } | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      return { href: "/admin", label: "Open Admin Dashboard" };
    }
    return { href: "/portal", label: "Open Student Portal" };
  } catch {
    return null;
  }
}

export default async function Home(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  // Retain the existing auth-callback handoff without changing authentication behavior.
  if (typeof searchParams?.code === "string" && searchParams.code) {
    const query = new URLSearchParams({
      code: searchParams.code,
      next: safeNextPath(searchParams.next, "/reset-password"),
    });
    redirect(`/auth/callback?${query}`);
  }

  const [content, signedInDestination] = await Promise.all([
    loadPublicContent(),
    getSignedInDestination(),
  ]);

  const settings = content.status === "ready" ? content.settings : null;
  const teacherName = settings?.teacher_name || teacher.name;
  const qualification = settings?.teacher_qualification || teacher.qualification;
  const subjectName = settings?.subject_name || subject.name;
  const teachingPoints = settings?.subject_description
    ? settings.subject_description.split("\n").map((line) => line.trim()).filter(Boolean)
    : subject.description;
  const biography = settings?.teacher_description
    ? settings.teacher_description.split("\n").map((line) => line.trim()).filter(Boolean)
    : teacher.description;

  const displayPhone = formatPhoneDisplay(contactData.phone);
  const primaryHeroHref = signedInDestination ? signedInDestination.href : "/login";
  const primaryHeroLabel = signedInDestination ? signedInDestination.label : "Student Login";

  return (
    <HomeContentProvider initial={content}>
      <div className={styles.home}>
        <section className={styles.hero} aria-labelledby="home-heading">
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>
              {subjectName} ({settings?.subject_code || subject.code}) · Online classes
            </p>
            <h1 id="home-heading">A/L Mathematics, explained step by step.</h1>
            <p className={styles.intro}>
              Theory, revision and paper classes with {teacherName}. Every lesson works through past-paper
              questions, and recordings and notes stay available in the student portal.
            </p>
            <div className={styles.actions}>
              <Link href={primaryHeroHref} className={styles.primaryLink}>
                {primaryHeroLabel} <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <a href="#classes" className={styles.secondaryLink}>
                Find your class
              </a>
            </div>
            <a
              className={styles.quietLink}
              href={buildWhatsAppUrl({
                phone: contactData.whatsapp,
                message: "Hi, I have a question about A/L Mathematics classes.",
              })}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ask a question on WhatsApp ↗
            </a>
            <div className={styles.teacherByline}>
              <Image
                src={settings?.teacher_image_url || "/AV maths photo 01.png"}
                alt={teacherName}
                width={72}
                height={80}
                priority
              />
              <div>
                <strong>{teacherName}</strong>
                <p>{qualification}</p>
              </div>
            </div>
          </div>
          <CurrentLessons initial={content} />
        </section>

        <nav className={styles.resources} aria-label="Student portal">
          <Link href="/portal/recordings">
            <PlayCircle aria-hidden="true" />
            <span>
              <strong>Class recordings</strong>
              <small>Student portal · sign-in required</small>
            </span>
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link href="/portal/materials">
            <FileText aria-hidden="true" />
            <span>
              <strong>Notes and materials</strong>
              <small>Student portal · sign-in required</small>
            </span>
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <a href="#classes">
            <BookOpen aria-hidden="true" />
            <span>
              <strong>Class timetable</strong>
              <small>Days and times for active batches</small>
            </span>
            <ArrowRight size={17} aria-hidden="true" />
          </a>
        </nav>

        <ClassSchedule initial={content} />

        <section className={`${styles.section} ${styles.approach}`} aria-labelledby="approach-heading">
          <div>
            <h2 id="approach-heading">How the classes work</h2>
            <p className={styles.bodyCopy}>
              Each topic is taught from the basics, then practised with past-paper and model-paper questions.
            </p>
          </div>
          <ol className={styles.teachingPoints}>
            {teachingPoints.map((point, index) => (
              <li key={`${index}-${point}`}>
                <span aria-hidden="true">{index + 1}.</span>
                <p>{point}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={`${styles.section} ${styles.teacherSection}`} aria-labelledby="teacher-heading">
          <div>
            <h2 id="teacher-heading">About {teacherName}</h2>
            <p className={styles.bodyCopy}>{qualification}</p>
            <Link href="/about" className={styles.textLink}>
              Full profile →
            </Link>
          </div>
          <ul className={styles.teacherList}>
            {biography.slice(0, 4).map((line, index) => (
              <li key={`${index}-${line}`}>{line}</li>
            ))}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="results-heading">
          <div className={styles.sectionHeading}>
            <h2 id="results-heading">Past results</h2>
            <Link href="/results" className={styles.textLink}>
              All results →
            </Link>
          </div>
          <div className={styles.results}>
            {[pastResults.batch2025, pastResults.batch2024].map((batch) => (
              <article key={batch.title} className={styles.resultBlock}>
                <h3>{batch.title}</h3>
                <p>{batch.results}</p>
                <span>{batch.totalStudents} students</span>
              </article>
            ))}
          </div>
        </section>

        <ExamCountdown />

        <section className={styles.contact} aria-labelledby="contact-heading">
          <div>
            <h2 id="contact-heading">Want to join a class?</h2>
            <p>
              Message us with your A/L year. We&apos;ll share class times and set up your student portal
              account.
            </p>
          </div>
          <div className={styles.actions}>
            <WhatsAppButton
              phone={contactData.whatsapp}
              message="Hi, I would like to join an A/L Mathematics class."
            />
            <a href={buildTelUrl(contactData.phone)} className={styles.secondaryLink}>
              <Phone size={16} aria-hidden="true" />
              <span>Call {displayPhone}</span>
            </a>
          </div>
        </section>
      </div>
    </HomeContentProvider>
  );
}
