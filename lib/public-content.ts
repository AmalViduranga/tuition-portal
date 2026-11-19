export const PUBLIC_SETTING_KEYS = [
  "site_name", "teacher_name", "teacher_qualification", "teacher_description",
  "teacher_image_url", "subject_name", "subject_code", "subject_description",
  "current_lesson_2027_theory", "current_lesson_2027_revision", "current_lesson_2028_theory",
] as const;

export type PublicSettingKey = typeof PUBLIC_SETTING_KEYS[number];
export type PublicSettings = Record<PublicSettingKey, string | null>;

export const PUBLIC_LESSONS = [
  { key: "current_lesson_2027_theory", label: "2027 Theory" },
  { key: "current_lesson_2027_revision", label: "2027 Revision" },
  { key: "current_lesson_2028_theory", label: "2028 Theory" },
] as const;

export type PublicLessonKey = typeof PUBLIC_LESSONS[number]["key"];

export interface PublicClassGroupRow {
  id: string;
  name: string;
  description?: string | null;
  is_active?: boolean | null;
}

export interface PublicClassOffer {
  id: string;
  name: string;
  description: string | null;
  day: string | null;
  time: string | null;
  mode: string | null;
  filterTags: string[];
  lessonKey: PublicLessonKey | null;
}

export interface PublicLessonItem {
  key: PublicLessonKey;
  label: string;
  topic: string | null;
  classId: string;
  className: string;
}

export type PublicContentResult =
  | {
      status: "ready";
      settings: PublicSettings;
      classes: PublicClassOffer[];
      lessons: PublicLessonItem[];
    }
  | { status: "error"; message: string };

interface ScheduleMetadata {
  day: string | null;
  time: string | null;
  mode: string | null;
  lessonKey: PublicLessonKey | null;
}

/**
 * Optional timetable display metadata keyed by stable class_groups.id when configured.
 * Falls back to unambiguous normalized class name matching when no ID override exists.
 * Note: 2026 A/L classes are retired from the public timetable.
 */
const CLASS_SCHEDULE_BY_ID: Readonly<Record<string, ScheduleMetadata>> = {};

// Never pass raw database rows through to a public response, even if the query changes.
export function pickPublicSettings(rows: ReadonlyArray<{ key: string; value: unknown }>): PublicSettings {
  const values = new Map(rows.map(row => [row.key, row.value]));
  return Object.fromEntries(PUBLIC_SETTING_KEYS.map(key => {
    const value = values.get(key);
    return [key, typeof value === "string" && value.trim() ? value.trim() : null];
  })) as PublicSettings;
}

export function isRetiredPublicClassName(name: string): boolean {
  return /\b2026\b/.test(name);
}

export function matchClassScheduleMetadata(row: Pick<PublicClassGroupRow, "id" | "name">): ScheduleMetadata {
  if (row.id && CLASS_SCHEDULE_BY_ID[row.id]) {
    return CLASS_SCHEDULE_BY_ID[row.id];
  }

  const normalized = row.name.trim().toLowerCase();
  const isPaper = /\bpaper\b/.test(normalized);
  const isRevision = /\brevision\b/.test(normalized);
  const has2027 = /\b2027\b/.test(normalized);
  const has2028 = /\b2028\b/.test(normalized);

  if (isPaper) {
    return {
      day: "Flexible",
      time: "Paper discussions given as recordings",
      mode: "Online via Website",
      lessonKey: null,
    };
  }

  if (has2027 && isRevision) {
    return {
      day: "Saturday",
      time: "6:00 PM - 10:00 PM",
      mode: "Online via Zoom",
      lessonKey: "current_lesson_2027_revision",
    };
  }

  if (has2027) {
    return {
      day: "Sunday",
      time: "7:00 PM - 10:00 PM",
      mode: "Online via Zoom",
      lessonKey: "current_lesson_2027_theory",
    };
  }

  if (has2028 && !isRevision) {
    return {
      day: "Monday",
      time: "7:00 PM - 9:30 PM",
      mode: "Online via Zoom",
      lessonKey: "current_lesson_2028_theory",
    };
  }

  return {
    day: null,
    time: null,
    mode: "Online via Zoom",
    lessonKey: null,
  };
}

export function extractClassFilterTags(name: string): string[] {
  const tags: string[] = [];
  const yearMatches = name.match(/\b20\d{2}\b/g) ?? [];
  for (const year of yearMatches) {
    if (year !== "2026" && !tags.includes(year)) {
      tags.push(year);
    }
  }
  if (/\bpaper\b/i.test(name)) {
    tags.push("Paper Class");
  }
  return tags;
}

export function buildPublicClassOffers(
  rows: ReadonlyArray<PublicClassGroupRow>
): PublicClassOffer[] {
  const offers: PublicClassOffer[] = [];
  const seenIds = new Set<string>();

  for (const row of rows) {
    if (row.is_active === false) continue;
    const id = typeof row.id === "string" ? row.id.trim() : "";
    const name = typeof row.name === "string" ? row.name.trim() : "";
    if (!id || !name || seenIds.has(id)) continue;
    if (isRetiredPublicClassName(name)) continue;

    seenIds.add(id);
    const meta = matchClassScheduleMetadata({ id, name });
    const description =
      typeof row.description === "string" && row.description.trim()
        ? row.description.trim()
        : null;

    offers.push({
      id,
      name,
      description,
      day: meta.day,
      time: meta.time,
      mode: meta.mode,
      filterTags: extractClassFilterTags(name),
      lessonKey: meta.lessonKey,
    });
  }

  return offers;
}

export function deriveClassFilters(classes: ReadonlyArray<PublicClassOffer>): string[] {
  if (classes.length === 0) return [];
  const years = new Set<string>();
  let hasPaper = false;

  for (const item of classes) {
    for (const tag of item.filterTags) {
      if (tag === "Paper Class") {
        hasPaper = true;
      } else {
        years.add(tag);
      }
    }
  }

  const sortedYears = Array.from(years).sort((a, b) => a.localeCompare(b));
  const specific = [...sortedYears, ...(hasPaper ? ["Paper Class"] : [])];
  if (specific.length <= 1) {
    return specific.length === 0 ? [] : ["All classes", ...specific];
  }
  return ["All classes", ...specific];
}

export function buildPublicLessons(
  settings: PublicSettings,
  activeClasses: ReadonlyArray<PublicClassOffer>
): PublicLessonItem[] {
  const activeByLessonKey = new Map<PublicLessonKey, PublicClassOffer>();
  for (const offer of activeClasses) {
    if (offer.lessonKey && !activeByLessonKey.has(offer.lessonKey)) {
      activeByLessonKey.set(offer.lessonKey, offer);
    }
  }

  const lessons: PublicLessonItem[] = [];
  for (const slot of PUBLIC_LESSONS) {
    const matchedClass = activeByLessonKey.get(slot.key);
    if (!matchedClass) continue;
    lessons.push({
      key: slot.key,
      label: slot.label,
      topic: settings[slot.key],
      classId: matchedClass.id,
      className: matchedClass.name,
    });
  }

  return lessons;
}
