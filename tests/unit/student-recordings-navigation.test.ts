import { describe, expect, it, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const PAPER_2027 = { id: "paper-2027-id", name: "Paper Class 2027 A/L", is_active: true };
const REV_2027 = { id: "rev-2027-id", name: "2027 A/L Revision", is_active: true };
const EMPTY_2027 = { id: "empty-2027-id", name: "2027 A/L", is_active: true };
const OTHER_2028 = { id: "other-2028-id", name: "2028 A/L", is_active: true };

const REC_PAPER = {
  id: "rec-paper-1",
  title: "Paper 01 Discussion",
  description: "Full paper discussion",
  youtube_video_id: "dQw4w9WgXcQ",
  release_at: "2026-10-20",
  published: true,
  thumbnail_url: null,
  class_id: PAPER_2027.id,
  class_groups: PAPER_2027,
  views_count: 5,
};

const REC_REV = {
  id: "rec-rev-1",
  title: "Revision Integration",
  description: "Revision lesson",
  youtube_video_id: "M7lc1UVf-VE",
  release_at: "2026-10-21",
  published: true,
  thumbnail_url: null,
  class_id: REV_2027.id,
  class_groups: REV_2027,
  views_count: 3,
};

const REC_UNLOCKED = {
  id: "rec-paper-unlocked",
  title: "Bonus Past Paper (Unlocked)",
  description: "Manually unlocked",
  youtube_video_id: "aqz-KE-bpKQ",
  release_at: "2025-05-01",
  published: true,
  thumbnail_url: null,
  class_id: PAPER_2027.id,
  class_groups: PAPER_2027,
  views_count: 1,
};

const REC_OTHER = {
  id: "rec-other-1",
  title: "Private 2028 Recording",
  description: "Should not leak",
  youtube_video_id: "ScMzIvxBSi4",
  release_at: "2026-10-20",
  published: true,
  thumbnail_url: null,
  class_id: OTHER_2028.id,
  class_groups: OTHER_2028,
  views_count: 0,
};

type EnrollmentFixture = {
  id?: string;
  student_id?: string;
  class_id: string;
  access_mode: string;
  start_access_date: string;
  access_end_date: string | null;
  revoked_at?: string | null;
  class_groups: { id: string; name: string; is_active: boolean };
};

let adminRecordingsPool: Array<typeof REC_PAPER> = [];
let mockRequireUserResult: { supabase: SupabaseClient; user: { id: string; email: string } } | null = null;

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table !== "recordings") throw new Error(`Unexpected admin table: ${table}`);
      const filters: { classIds?: string[]; eqClassId?: string; published?: boolean; lteRelease?: string } = {};
      const chain = {
        select: () => chain,
        eq: (col: string, val: unknown) => {
          if (col === "published") filters.published = Boolean(val);
          if (col === "class_id") filters.eqClassId = String(val);
          return chain;
        },
        lte: (col: string, val: unknown) => {
          if (col === "release_at") filters.lteRelease = String(val);
          return chain;
        },
        in: (col: string, vals: unknown[]) => {
          if (col === "class_id") filters.classIds = vals.map(String);
          return chain;
        },
        order: () => chain,
        then: (resolve: (val: { data: typeof adminRecordingsPool; error: null }) => unknown) => {
          const rows = adminRecordingsPool.filter((rec) => {
            if (filters.published !== undefined && rec.published !== filters.published) return false;
            if (filters.lteRelease && rec.release_at > filters.lteRelease) return false;
            if (filters.classIds && !filters.classIds.includes(rec.class_id)) return false;
            if (filters.eqClassId && rec.class_id !== filters.eqClassId) return false;
            return true;
          });
          return Promise.resolve({ data: rows, error: null }).then(resolve);
        },
      };
      return chain;
    },
  }),
}));

vi.mock("@/lib/auth", () => ({
  requireUser: vi.fn(async () => {
    if (!mockRequireUserResult) throw new Error("Unauthenticated");
    return mockRequireUserResult;
  }),
}));

vi.mock("@/lib/audit/audit-log", () => ({
  createAuditLog: vi.fn(async () => undefined),
}));

function buildStudentSupabase(opts: {
  enrollments: EnrollmentFixture[];
  recordingUnlocks?: Array<{ recording_id: string; revoked_at?: string | null }>;
  materialUnlocks?: Array<{ material_id: string; revoked_at?: string | null }>;
  paymentPeriods?: Array<{ class_id: string; start_date: string; end_date: string; status: string }>;
  recordings?: Array<typeof REC_PAPER>;
  throwOnRecordingsQuery?: boolean;
}) {
  const insertedLogs: unknown[] = [];
  const rpcCalls: Array<{ fn: string; args: unknown }> = [];

  const supabase = {
    from: (table: string) => {
      const state: { eqs: Record<string, unknown>; isNull: string[] } = { eqs: {}, isNull: [] };
      const resolveRows = () => {
        if (table === "student_class_enrollments") {
          return opts.enrollments.filter((e) => {
            if (state.isNull.includes("revoked_at") && e.revoked_at) return false;
            if (state.eqs.class_id && e.class_id !== state.eqs.class_id) return false;
            return true;
          });
        }
        if (table === "recording_manual_unlocks") {
          return (opts.recordingUnlocks ?? []).filter(
            (u) => !(state.isNull.includes("revoked_at") && u.revoked_at),
          );
        }
        if (table === "material_manual_unlocks") {
          return (opts.materialUnlocks ?? []).filter(
            (u) => !(state.isNull.includes("revoked_at") && u.revoked_at),
          );
        }
        if (table === "student_class_payment_periods") {
          return opts.paymentPeriods ?? [];
        }
        if (table === "recordings") {
          return (opts.recordings ?? adminRecordingsPool).filter((r) => {
            if (state.eqs.id && r.id !== state.eqs.id) return false;
            return true;
          });
        }
        return [];
      };

      const chain = {
        select: () => chain,
        eq: (col: string, val: unknown) => {
          state.eqs[col] = val;
          return chain;
        },
        is: (col: string, val: unknown) => {
          if (val === null) state.isNull.push(col);
          return chain;
        },
        order: () => chain,
        insert: (payload: unknown) => {
          insertedLogs.push(payload);
          return Promise.resolve({ data: payload, error: null });
        },
        maybeSingle: async () => {
          if (table === "recordings" && opts.throwOnRecordingsQuery) {
            return { data: null, error: new Error("sensitive postgres connection string error") };
          }
          const rows = resolveRows();
          return { data: rows[0] ?? null, error: null };
        },
        then: (resolve: (val: { data: unknown[]; error: null }) => unknown) =>
          Promise.resolve({ data: resolveRows(), error: null }).then(resolve),
      };
      return chain;
    },
    rpc: vi.fn(async (fn: string, args: unknown) => {
      rpcCalls.push({ fn, args });
      return { data: null, error: null };
    }),
  } as unknown as SupabaseClient;

  return { supabase, insertedLogs, rpcCalls };
}

describe("loadStudentRecordings class filtering and access preservation", () => {
  beforeEach(() => {
    adminRecordingsPool = [REC_PAPER, REC_REV, REC_UNLOCKED, REC_OTHER];
    mockRequireUserResult = null;
  });

  it("shows distinct recordings for Paper Class 2027 A/L vs 2027 A/L Revision when enrolled in both", async () => {
    const { loadStudentRecordings } = await import("@/lib/recordings/student-recordings");
    const { supabase } = buildStudentSupabase({
      enrollments: [
        {
          class_id: PAPER_2027.id,
          access_mode: "paid",
          start_access_date: "2026-10-19",
          access_end_date: "2026-11-30",
          class_groups: PAPER_2027,
        },
        {
          class_id: REV_2027.id,
          access_mode: "paid",
          start_access_date: "2026-10-19",
          access_end_date: "2026-11-30",
          class_groups: REV_2027,
        },
      ],
    });

    const paperResult = await loadStudentRecordings(supabase, "student-1", PAPER_2027.id);
    expect(paperResult.recordings.map((r) => r.id)).toEqual([REC_PAPER.id]);
    expect(paperResult.accessible_classes.map((c) => c.id)).toEqual([PAPER_2027.id, REV_2027.id]);

    const revResult = await loadStudentRecordings(supabase, "student-1", REV_2027.id);
    expect(revResult.recordings.map((r) => r.id)).toEqual([REC_REV.id]);

    const allResult = await loadStudentRecordings(supabase, "student-1", null);
    expect(allResult.recordings.map((r) => r.id).sort()).toEqual([REC_PAPER.id, REC_REV.id].sort());
  });

  it("never falls back to all recordings when a student enrolled in only one class requests another class_id", async () => {
    const { loadStudentRecordings } = await import("@/lib/recordings/student-recordings");
    const { supabase } = buildStudentSupabase({
      enrollments: [
        {
          class_id: PAPER_2027.id,
          access_mode: "paid",
          start_access_date: "2026-10-19",
          access_end_date: "2026-11-30",
          class_groups: PAPER_2027,
        },
      ],
    });

    const denied = await loadStudentRecordings(supabase, "student-1", REV_2027.id);
    expect(denied.recordings).toEqual([]);
    expect(denied.accessible_classes).toEqual([{ id: PAPER_2027.id, name: PAPER_2027.name }]);

    const invalid = await loadStudentRecordings(supabase, "student-1", "non-existent-class-id");
    expect(invalid.recordings).toEqual([]);
  });

  it("returns empty recordings while preserving class name for an enrolled class with zero recordings", async () => {
    const { loadStudentRecordings } = await import("@/lib/recordings/student-recordings");
    const { supabase } = buildStudentSupabase({
      enrollments: [
        {
          class_id: EMPTY_2027.id,
          access_mode: "free_card",
          start_access_date: "2026-10-19",
          access_end_date: "2026-12-31",
          class_groups: EMPTY_2027,
        },
      ],
    });

    const res = await loadStudentRecordings(supabase, "student-1", EMPTY_2027.id);
    expect(res.recordings).toEqual([]);
    expect(res.accessible_classes).toEqual([{ id: EMPTY_2027.id, name: EMPTY_2027.name }]);
  });

  it("deduplicates accessible_classes for renewals + older revoked rows while keeping manual unlocks", async () => {
    const { loadStudentRecordings } = await import("@/lib/recordings/student-recordings");
    const { supabase } = buildStudentSupabase({
      enrollments: [
        // Older revoked enrollment row
        {
          class_id: PAPER_2027.id,
          access_mode: "paid",
          start_access_date: "2026-08-01",
          access_end_date: "2026-09-10",
          revoked_at: "2026-08-15T00:00:00Z",
          class_groups: PAPER_2027,
        },
        // Older expired non-revoked enrollment row
        {
          class_id: PAPER_2027.id,
          access_mode: "paid",
          start_access_date: "2026-09-01",
          access_end_date: "2026-10-10",
          revoked_at: null,
          class_groups: PAPER_2027,
        },
        // Renewed active enrollment row
        {
          class_id: PAPER_2027.id,
          access_mode: "paid",
          start_access_date: "2026-10-19",
          access_end_date: "2026-11-30",
          revoked_at: null,
          class_groups: PAPER_2027,
        },
      ],
      recordingUnlocks: [{ recording_id: REC_UNLOCKED.id, revoked_at: null }],
    });

    const res = await loadStudentRecordings(supabase, "student-1", PAPER_2027.id);
    expect(res.accessible_classes).toEqual([{ id: PAPER_2027.id, name: PAPER_2027.name }]);
    expect(res.recordings.map((r) => r.id).sort()).toEqual([REC_PAPER.id, REC_UNLOCKED.id].sort());
    expect(res.recordings.find((r) => r.id === REC_UNLOCKED.id)?.is_manually_unlocked).toBe(true);
  });
});

describe("POST /api/student/recordings/[id]/view eligibility and error hygiene", () => {
  beforeEach(() => {
    adminRecordingsPool = [REC_PAPER, REC_REV, REC_UNLOCKED, REC_OTHER];
  });

  it("allows view logging with renewal + older revoked enrollment rows", async () => {
    const { supabase, insertedLogs, rpcCalls } = buildStudentSupabase({
      enrollments: [
        {
          class_id: PAPER_2027.id,
          access_mode: "paid",
          start_access_date: "2026-08-01",
          access_end_date: "2026-09-10",
          revoked_at: "2026-08-15T00:00:00Z",
          class_groups: PAPER_2027,
        },
        {
          class_id: PAPER_2027.id,
          access_mode: "paid",
          start_access_date: "2026-10-19",
          access_end_date: "2026-11-30",
          revoked_at: null,
          class_groups: PAPER_2027,
        },
      ],
    });
    mockRequireUserResult = { supabase, user: { id: "student-1", email: "student@example.com" } };

    const { POST } = await import("@/app/api/student/recordings/[id]/view/route");
    const response = await POST(
      new NextRequest("http://localhost:3000/api/student/recordings/rec-paper-1/view", { method: "POST" }),
      { params: Promise.resolve({ id: REC_PAPER.id }) },
    );

    expect(response.status).toBe(200);
    expect(insertedLogs).toHaveLength(1);
    expect(rpcCalls).toEqual([{ fn: "increment_recording_views", args: { recording_id: REC_PAPER.id } }]);
  });

  it("allows view logging via existing manual unlock even outside active enrollment window", async () => {
    const { supabase } = buildStudentSupabase({
      enrollments: [],
      recordingUnlocks: [{ recording_id: REC_UNLOCKED.id, revoked_at: null }],
    });
    mockRequireUserResult = { supabase, user: { id: "student-1", email: "student@example.com" } };

    const { POST } = await import("@/app/api/student/recordings/[id]/view/route");
    const response = await POST(
      new NextRequest("http://localhost:3000/api/student/recordings/rec-paper-unlocked/view", { method: "POST" }),
      { params: Promise.resolve({ id: REC_UNLOCKED.id }) },
    );

    expect(response.status).toBe(200);
  });

  it("denies view logging for a class the student is not enrolled in", async () => {
    const { supabase } = buildStudentSupabase({
      enrollments: [
        {
          class_id: PAPER_2027.id,
          access_mode: "paid",
          start_access_date: "2026-10-19",
          access_end_date: "2026-11-30",
          class_groups: PAPER_2027,
        },
      ],
    });
    mockRequireUserResult = { supabase, user: { id: "student-1", email: "student@example.com" } };

    const { POST } = await import("@/app/api/student/recordings/[id]/view/route");
    const response = await POST(
      new NextRequest("http://localhost:3000/api/student/recordings/rec-rev-1/view", { method: "POST" }),
      { params: Promise.resolve({ id: REC_REV.id }) },
    );

    expect(response.status).toBe(403);
  });

  it("returns a generic 500 error without leaking raw database errors", async () => {
    const { supabase } = buildStudentSupabase({
      enrollments: [],
      throwOnRecordingsQuery: true,
    });
    mockRequireUserResult = { supabase, user: { id: "student-1", email: "student@example.com" } };

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { POST } = await import("@/app/api/student/recordings/[id]/view/route");
    const response = await POST(
      new NextRequest("http://localhost:3000/api/student/recordings/rec-paper-1/view", { method: "POST" }),
      { params: Promise.resolve({ id: REC_PAPER.id }) },
    );
    const body = await response.json();
    consoleSpy.mockRestore();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Could not record view right now.");
    expect(body.error).not.toContain("postgres");
  });
});
