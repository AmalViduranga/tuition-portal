import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminSiteContentPage from "@/app/admin/site-content/page";
import { updateSiteContent } from "@/app/admin/actions";

vi.mock("@/app/admin/actions", () => ({ updateSiteContent: vi.fn() }));
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

describe("Site content error feedback", () => {
  it("shows a failed save and never announces success", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify([{ key: "site_name", value: "MathsLK" }]))));
    vi.mocked(updateSiteContent).mockRejectedValueOnce(new Error("Site content could not be saved. Please try again."));
    render(<AdminSiteContentPage />);
    const button = await screen.findByRole("button", { name: "Save Changes" });
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("could not be saved"));
    expect(screen.queryByText("Content saved successfully!")).not.toBeInTheDocument();
  });
  it("does not allow saving an empty form after an initial read failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("failed", { status: 500 })));
    render(<AdminSiteContentPage />);
    expect(await screen.findByRole("button", { name: "Save Changes" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("Failed to fetch content");
    expect(updateSiteContent).not.toHaveBeenCalled();
  });
});
