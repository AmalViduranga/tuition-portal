import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import ExamCountdown from "@/components/home/ExamCountdown";

describe("ExamCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should render countdown values when target is in the future", () => {
    // 2 September 2026, 8:30 AM Sri Lanka Time (UTC+05:30) is 2026-09-02T03:00:00.000Z
    // Let's set time exactly 1 day and 2 hours before the start:
    // 2026-09-01T01:00:00.000Z
    vi.setSystemTime(new Date("2026-09-01T01:00:00.000Z"));
    
    render(<ExamCountdown />);
    
    // We expect 1 day, 2 hours, 0 minutes, 0 seconds
    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("02")).toBeDefined(); // 02 hours
    expect(screen.getAllByText("00").length).toBe(2); // 00 minutes and 00 seconds
  });

  it("should show completed state when target has passed", () => {
    // Let's set time after the start
    vi.setSystemTime(new Date("2026-09-02T04:00:00.000Z")); // 9:30 AM SL time
    
    render(<ExamCountdown />);
    
    expect(screen.getByText("The 2026 A/L Mathematics (07) paper has started.")).toBeDefined();
  });

  it("should update countdown when time advances", () => {
    vi.setSystemTime(new Date("2026-09-01T01:00:00.000Z")); // 1 day, 2 hours, 0 mins, 0 secs
    
    render(<ExamCountdown />);
    
    act(() => {
      vi.advanceTimersByTime(1000); // advance 1 second
    });
    
    // Now it should be 1 day, 1 hour, 59 minutes, 59 seconds
    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("01")).toBeDefined();
    expect(screen.getAllByText("59").length).toBe(2);
  });
});
