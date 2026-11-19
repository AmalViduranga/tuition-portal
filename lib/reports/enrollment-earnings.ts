export type EnrollmentRecord = {
  id: string;
  student_name: string;
  class_name: string;
  amount_paid: number;
  access_mode: string;
  start_access_date: string;
  access_end_date: string | null;
  created_at: string;
  updated_at: string | null;
  revoked_at?: string | null;
};

const colomboFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Colombo", year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
});

export function colomboDateTime(timestamp: string | null | undefined) {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) return null;
  const parts = Object.fromEntries(colomboFormatter.formatToParts(date).map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

export function enrollmentIncome(records: readonly EnrollmentRecord[]) {
  return records.reduce((total, record) => {
    const amount = Number(record.amount_paid) || 0;
    return record.access_mode === "paid" && amount > 0 ? total + amount : total;
  }, 0);
}

export function buildEnrollmentEarnings(records: readonly EnrollmentRecord[], month: number, year: number) {
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const previousKey = month === 0 ? `${year - 1}-12` : `${year}-${String(month).padStart(2, "0")}`;
  const dated = records.map(record => ({ record, date: colomboDateTime(record.updated_at) }));
  const filtered = dated.filter(row => row.date?.startsWith(monthKey)).map(row => row.record)
    .sort((a, b) => Date.parse(b.updated_at!) - Date.parse(a.updated_at!) || a.id.localeCompare(b.id));
  const previous = dated.filter(row => row.date?.startsWith(previousKey)).map(row => row.record);
  const classMap = new Map<string, { income: number; students: number }>();
  for (const record of filtered) {
    const entry = classMap.get(record.class_name) ?? { income: 0, students: 0 };
    entry.income += enrollmentIncome([record]);
    if (record.access_mode === "paid") entry.students++;
    classMap.set(record.class_name, entry);
  }
  return {
    filteredRecords: filtered,
    currentIncome: enrollmentIncome(filtered),
    prevIncome: enrollmentIncome(previous),
    paidStudents: new Set(filtered.filter(row => row.access_mode === "paid" && Number(row.amount_paid) > 0).map(row => row.id)).size,
    totalEnrollments: filtered.length,
    classBreakdown: [...classMap].map(([name, values]) => ({ name, ...values })),
    missingDates: dated.filter(row => !row.date).length,
    allTimeIncome: enrollmentIncome(records),
  };
}

export function enrollmentEarningsCsv(records: readonly EnrollmentRecord[]) {
  const headers = ["Student", "Class", "Mode", "Amount (Rs.)", "Enrollment updated (Asia/Colombo)", "Access start", "Access end", "Enrolled at"];
  const rows = records.map(row => [row.student_name, row.class_name, row.access_mode, row.amount_paid,
    colomboDateTime(row.updated_at) ? `${colomboDateTime(row.updated_at)} +05:30` : "Unavailable",
    row.start_access_date, row.access_end_date ?? "", row.created_at]);
  const cell = (value: string | number) => {
    const text = typeof value === "string" && /^[=+\-@\t\r]/.test(value) ? `'${value}` : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };
  return "\uFEFF" + [headers, ...rows].map(row => row.map(cell).join(",")).join("\r\n");
}
