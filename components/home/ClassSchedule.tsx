"use client";

import Link from "next/link";
import { useState } from "react";
import { deriveClassFilters, type PublicContentResult } from "@/lib/public-content";
import { buildClassWhatsAppUrl } from "@/lib/whatsapp";
import { useSyncedPublicContent } from "./HomeContentProvider";
import styles from "@/app/home.module.css";

export default function ClassSchedule({ initial }: { initial: PublicContentResult }) {
  const { content, refreshing } = useSyncedPublicContent(initial);
  const [selectedBatch, setSelectedBatch] = useState("All classes");

  const classes = content.status === "ready" ? content.classes : [];
  const filters = deriveClassFilters(classes);
  const activeBatch =
    selectedBatch === "All classes" || filters.includes(selectedBatch)
      ? selectedBatch
      : "All classes";

  const visibleClasses = classes.filter(
    (group) => activeBatch === "All classes" || group.filterTags.includes(activeBatch)
  );

  return (
    <section id="classes" className={styles.section} aria-labelledby="classes-heading" aria-busy={refreshing}>
      <div className={styles.sectionHeading}>
        <h2 id="classes-heading">Classes and times</h2>
        <Link href="/schedule" className={styles.textLink}>Full schedule →</Link>
      </div>

      {content.status === "error" && (
        <div className={styles.notice} role="status">
          Class times are temporarily unavailable. Please{" "}
          <Link href="/contact" className={styles.inlineLink}>contact us</Link>{" "}
          for the current timetable.
        </div>
      )}

      {content.status === "ready" && classes.length === 0 && (
        <div className={styles.notice} role="status">
          No active classes are listed right now.{" "}
          <Link href="/contact" className={styles.inlineLink}>Contact us</Link>{" "}
          for upcoming intake details.
        </div>
      )}

      {content.status === "ready" && classes.length > 0 && (
        <>
          {filters.length > 1 && (
            <div className={styles.filters} role="group" aria-label="Filter classes by batch">
              {filters.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={activeBatch === value}
                  onClick={() => setSelectedBatch(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          )}

          {/* Aligned timetable table on tablet/desktop */}
          <div className={styles.scheduleTableWrap}>
            <table className={styles.scheduleTable}>
              <thead>
                <tr>
                  <th scope="col">Class</th>
                  <th scope="col">Day</th>
                  <th scope="col">Time</th>
                  <th scope="col">Format</th>
                  <th scope="col" className={styles.scheduleActionCol}>Enquiry</th>
                </tr>
              </thead>
              <tbody>
                {visibleClasses.map((group) => (
                  <tr key={group.id}>
                    <th scope="row">
                      <span className={styles.scheduleClassName}>{group.name}</span>
                      {group.description && (
                        <span className={styles.scheduleClassDesc}>{group.description}</span>
                      )}
                    </th>
                    <td>{group.day || "Schedule on enquiry"}</td>
                    <td className={styles.tabular}>{group.time || "Shared on WhatsApp"}</td>
                    <td className={styles.scheduleMode}>{group.mode || "Online"}</td>
                    <td className={styles.scheduleActionCol}>
                      <a
                        href={buildClassWhatsAppUrl(group.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.scheduleEnquiryLink}
                        aria-label={`Ask about ${group.name} on WhatsApp`}
                      >
                        Ask about this class ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Stacked rows on phones */}
          <ul className={styles.scheduleMobileList}>
            {visibleClasses.map((group) => (
              <li key={group.id} className={styles.scheduleMobileRow}>
                <h3>{group.name}</h3>
                {group.description && (
                  <p className={styles.scheduleClassDesc}>{group.description}</p>
                )}
                <p className={styles.scheduleMobileTime}>
                  {group.day && group.time
                    ? `${group.day} · ${group.time}`
                    : group.day || group.time || "Schedule shared on WhatsApp"}
                </p>
                <span className={styles.scheduleMode}>{group.mode || "Online"}</span>
                <a
                  href={buildClassWhatsAppUrl(group.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.scheduleEnquiryLink}
                  aria-label={`Ask about ${group.name} on WhatsApp`}
                >
                  Ask about this class ↗
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
