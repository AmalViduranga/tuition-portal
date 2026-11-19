import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import StudentRecordingsClient from "@/app/portal/recordings/StudentRecordingsClient";
import type { StudentRecordingsPayload } from "@/lib/recordings/student-recordings";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/components/videos/YouTubeEmbed", () => ({
  default: ({ videoId, title }: { videoId: string; title: string }) => (
    <div data-testid="youtube-embed" data-video-id={videoId}>
      {title}
    </div>
  ),
}));

const PAPER_2027 = { id: "paper-2027-id", name: "Paper Class 2027 A/L" };
const REV_2027 = { id: "rev-2027-id", name: "2027 A/L Revision" };
const CLASS_2028 = { id: "class-2028-id", name: "2028 A/L" };

const REC_PAPER = {
  id: "rec-paper-1",
  title: "Paper 01 Mechanics",
  description: "Mechanics paper review",
  youtube_video_id: "dQw4w9WgXcQ",
  release_at: "2026-10-20",
  published: true,
  thumbnail_url: null,
  class_id: PAPER_2027.id,
  class_groups: PAPER_2027,
  views_count: 10,
  is_manually_unlocked: false,
};

const REC_REV = {
  id: "rec-rev-1",
  title: "Revision Differentiation",
  description: "Differentiation drill",
  youtube_video_id: "M7lc1UVf-VE",
  release_at: "2026-10-21",
  published: true,
  thumbnail_url: null,
  class_id: REV_2027.id,
  class_groups: REV_2027,
  views_count: 4,
  is_manually_unlocked: false,
};

const REC_2028 = {
  id: "rec-2028-1",
  title: "2028 Functions Intro",
  description: "Outside 2027 batch",
  youtube_video_id: "aqz-KE-bpKQ",
  release_at: "2026-10-22",
  published: true,
  thumbnail_url: null,
  class_id: CLASS_2028.id,
  class_groups: CLASS_2028,
  views_count: 2,
  is_manually_unlocked: false,
};

describe("StudentRecordingsClient URL-backed class filtering and playback", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    pushMock.mockReset();
    localStorage.clear();
    global.fetch = vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 200 }));
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("shows all permitted classes by default without hardcoded 2027 selection", () => {
    const payload: StudentRecordingsPayload = {
      recordings: [REC_PAPER, REC_REV, REC_2028],
      accessible_classes: [PAPER_2027, REV_2027, CLASS_2028],
    };

    render(<StudentRecordingsClient initialData={payload} initialClassId="" />);

    expect(screen.getByRole("heading", { name: "Class Recordings" })).toBeInTheDocument();
    expect(screen.getByText("Paper 01 Mechanics")).toBeInTheDocument();
    expect(screen.getByText("Revision Differentiation")).toBeInTheDocument();
    expect(screen.getByText("2028 Functions Intro")).toBeInTheDocument();
    expect((screen.getByLabelText("Filter by class") as HTMLSelectElement).value).toBe("");
  });

  it("filters by initialClassId, updates URL when switching classes, and syncs on Back navigation", async () => {
    const paperPayload: StudentRecordingsPayload = {
      recordings: [REC_PAPER],
      accessible_classes: [PAPER_2027, REV_2027],
    };
    const revPayload: StudentRecordingsPayload = {
      recordings: [REC_REV],
      accessible_classes: [PAPER_2027, REV_2027],
    };

    global.fetch = vi.fn(async (input) => {
      const url = String(input);
      if (url.includes(`class_id=${REV_2027.id}`)) {
        return new Response(JSON.stringify(revPayload), { status: 200 });
      }
      return new Response(JSON.stringify(paperPayload), { status: 200 });
    });

    const { rerender } = render(
      <StudentRecordingsClient initialData={paperPayload} initialClassId={PAPER_2027.id} />,
    );

    expect(screen.getByRole("heading", { name: "Paper Class 2027 A/L Recordings" })).toBeInTheDocument();
    expect(screen.getByText("Paper 01 Mechanics")).toBeInTheDocument();
    expect(screen.queryByText("Revision Differentiation")).not.toBeInTheDocument();

    // Switch dropdown to 2027 A/L Revision
    fireEvent.change(screen.getByLabelText("Filter by class"), { target: { value: REV_2027.id } });

    expect(pushMock).toHaveBeenCalledWith(`/portal/recordings?class_id=${REV_2027.id}`, { scroll: false });
    await waitFor(() => {
      expect(screen.getByText("Revision Differentiation")).toBeInTheDocument();
    });
    expect(screen.queryByText("Paper 01 Mechanics")).not.toBeInTheDocument();

    // Next.js App Router delivers the new server props for the pushed URL
    rerender(<StudentRecordingsClient initialData={revPayload} initialClassId={REV_2027.id} />);
    expect(screen.getByRole("heading", { name: "2027 A/L Revision Recordings" })).toBeInTheDocument();

    // Simulate browser Back restoring previous URL and server props
    rerender(<StudentRecordingsClient initialData={paperPayload} initialClassId={PAPER_2027.id} />);

    expect(screen.getByRole("heading", { name: "Paper Class 2027 A/L Recordings" })).toBeInTheDocument();
    expect(screen.getByText("Paper 01 Mechanics")).toBeInTheDocument();
    expect((screen.getByLabelText("Filter by class") as HTMLSelectElement).value).toBe(PAPER_2027.id);
  });

  it("shows a class-specific empty state for an enrolled class with zero recordings", () => {
    const emptyPayload: StudentRecordingsPayload = {
      recordings: [],
      accessible_classes: [PAPER_2027, REV_2027],
    };

    render(<StudentRecordingsClient initialData={emptyPayload} initialClassId={PAPER_2027.id} />);

    expect(screen.getByRole("heading", { name: "No recordings in Paper Class 2027 A/L yet" })).toBeInTheDocument();
    expect(screen.getByText(/no recordings for Paper Class 2027 A\/L/i)).toBeInTheDocument();
  });

  it("never falls back to all recordings for an invalid or inaccessible class_id", () => {
    const payload: StudentRecordingsPayload = {
      recordings: [],
      accessible_classes: [PAPER_2027],
    };

    render(<StudentRecordingsClient initialData={payload} initialClassId="unowned-class-id" />);

    expect(screen.getByRole("heading", { name: "Class not available" })).toBeInTheDocument();
    expect(screen.queryByText("Paper 01 Mechanics")).not.toBeInTheDocument();
  });

  it("auto-opens the exact highlighted recording outside the 2027 batch and tolerates view-counting failure", async () => {
    global.fetch = vi.fn(async () => new Response(JSON.stringify({ error: "fail" }), { status: 500 }));

    const payload: StudentRecordingsPayload = {
      recordings: [REC_PAPER, REC_2028],
      accessible_classes: [PAPER_2027, CLASS_2028],
    };

    render(<StudentRecordingsClient initialData={payload} initialClassId="" highlight={REC_2028.id} />);

    // Modal should immediately open with the exact 2028 recording despite view POST returning 500
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByTestId("youtube-embed")).toHaveAttribute("data-video-id", REC_2028.youtube_video_id);
  });

  it("opens playback immediately even if view-counting fetch rejects", async () => {
    global.fetch = vi.fn(async () => {
      throw new Error("Network offline");
    });

    const payload: StudentRecordingsPayload = {
      recordings: [REC_PAPER],
      accessible_classes: [PAPER_2027],
    };

    render(<StudentRecordingsClient initialData={payload} initialClassId={PAPER_2027.id} />);

    fireEvent.click(screen.getByText("Paper 01 Mechanics"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByTestId("youtube-embed")).toHaveAttribute("data-video-id", REC_PAPER.youtube_video_id);
  });
});
