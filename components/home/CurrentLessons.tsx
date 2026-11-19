"use client";

import type { PublicContentResult } from "@/lib/public-content";
import { useSyncedPublicContent } from "./HomeContentProvider";
import styles from "@/app/home.module.css";

export default function CurrentLessons({ initial }: { initial: PublicContentResult }) {
  const { content, refreshing, refreshError } = useSyncedPublicContent(initial);
  const hasLoadedReady = content.status === "ready";
  const lessons = hasLoadedReady ? content.lessons : [];

  return (
    <section
      id="current-lessons"
      className={styles.lessons}
      aria-labelledby="lessons-heading"
      aria-busy={refreshing}
    >
      <div className={styles.lessonsHeader}>
        <h2 id="lessons-heading">Current lessons</h2>
        <p className={styles.lessonsSubtitle}>Topics currently being taught in each active class.</p>
      </div>

      <div aria-live="polite">
        {!hasLoadedReady && refreshing ? (
          <p className={styles.lessonEmpty}>Loading current lessons…</p>
        ) : !hasLoadedReady ? (
          <p className={styles.notice} role="status">
            {refreshError || content.message || "Current lessons are temporarily unavailable."}
          </p>
        ) : null}

        {hasLoadedReady && refreshError ? (
          <p className={styles.notice} role="status">
            {refreshError} Showing the last loaded lessons.
          </p>
        ) : null}
      </div>

      {hasLoadedReady && lessons.length === 0 ? (
        <p className={styles.lessonEmpty}>No active class lessons are published right now.</p>
      ) : null}

      {hasLoadedReady && lessons.length > 0 ? (
        <dl className={styles.lessonList}>
          {lessons.map((lesson) => {
            const topicText = lesson.topic;
            const isSinhala = Boolean(topicText && /[\u0D80-\u0DFF]/.test(topicText));
            return (
              <div key={lesson.key} className={styles.lessonRow}>
                <dt>{lesson.label}</dt>
                <dd lang={isSinhala ? "si" : undefined}>
                  {topicText || <span className={styles.muted}>Topic to be announced</span>}
                </dd>
              </div>
            );
          })}
        </dl>
      ) : null}

      <div className={styles.lessonsFooter}>
        <a href="#classes" className={styles.textLink}>
          View class timetable →
        </a>
      </div>
    </section>
  );
}
