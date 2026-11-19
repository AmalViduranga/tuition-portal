import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CurrentLessons from "@/components/home/CurrentLessons";
import {
  buildPublicClassOffers,
  buildPublicLessons,
  pickPublicSettings,
  type PublicContentResult,
} from "@/lib/public-content";

afterEach(() => vi.unstubAllGlobals());

function makeReadyContent(
  settingRows: Array<{ key: string; value: string }>,
  activeClasses = [
    { id: "c-2027-th", name: "2027 A/L", is_active: true },
    { id: "c-2027-rev", name: "2027 A/L Revision", is_active: true },
    { id: "c-2028-th", name: "2028 A/L", is_active: true },
  ]
): PublicContentResult {
  const settings = pickPublicSettings(settingRows);
  const classes = buildPublicClassOffers(activeClasses);
  const lessons = buildPublicLessons(settings, classes);
  return { status: "ready", settings, classes, lessons };
}

describe("Current lessons", () => {
  it("shows configured Sinhala titles without a Refresh button or fake topics", () => {
    render(
      <CurrentLessons
        initial={makeReadyContent([{ key: "current_lesson_2027_theory", value: "අවකලනය" }])}
      />
    );
    expect(screen.getByText("අවකලනය")).toHaveAttribute("lang", "si");
    expect(screen.getAllByText("Topic to be announced")).toHaveLength(2);
    expect(screen.queryByRole("button", { name: /refresh/i })).not.toBeInTheDocument();
    expect(screen.queryByText("Limits and Continuity")).not.toBeInTheDocument();
  });

  it("hides deactivated classes and shows an honest empty state when none are active", () => {
    render(<CurrentLessons initial={makeReadyContent([], [])} />);
    expect(screen.getByText("No active class lessons are published right now.")).toBeInTheDocument();
    expect(screen.queryByText("2027 Theory")).not.toBeInTheDocument();
  });

  it("auto-refreshes after initial failure and on window focus without a manual button", async () => {
    const updated = makeReadyContent([{ key: "current_lesson_2027_theory", value: "New topic" }]);
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(updated)));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <CurrentLessons
        initial={{ status: "error", message: "Current lessons and classes could not be loaded right now." }}
      />
    );

    await screen.findByText("New topic");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.focus(window);
    await screen.findByText("New topic");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("keeps the last successful titles with a clear notice if background refresh fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("failure", { status: 503 })));
    render(
      <CurrentLessons
        initial={makeReadyContent([{ key: "current_lesson_2027_theory", value: "Known lesson" }])}
      />
    );
    fireEvent.focus(window);
    await screen.findByText(/Showing the last loaded lessons/);
    expect(screen.getByText("Known lesson")).toBeInTheDocument();
  });
});
