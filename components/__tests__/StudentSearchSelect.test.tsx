import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import StudentSearchSelect from "@/components/admin/StudentSearchSelect";

const students = [
  { id: "uuid-one", full_name: "Same Name", email: "one@example.com" },
  { id: "uuid-two", full_name: "Same Name", email: "two@example.com" },
  { id: "uuid-null", full_name: null, email: null },
];
const response = (rows = students) => new Response(JSON.stringify({ students: rows, hasMore: false }), { headers: { "Content-Type": "application/json" } });
afterEach(() => { vi.unstubAllGlobals(); });

function Form({ submit }: { submit: (value: string) => void }) {
  const [value, setValue] = useState("");
  return <form onSubmit={event => { event.preventDefault(); submit(value); }}><StudentSearchSelect value={value} onChange={setValue} required /><button type="submit">Save selection</button></form>;
}

describe("Student combobox", () => {
  it("shows names/emails, supports keyboard selection and submits the existing UUID", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => response()));
    const submit = vi.fn();
    render(<Form submit={submit} />);
    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("placeholder", "Search by student name or email");
    fireEvent.focus(input);
    await screen.findByText("two@example.com");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Save selection" }));
    expect(submit).toHaveBeenCalledWith("uuid-two");
    fireEvent.change(input, { target: { value: "new query" } });
    fireEvent.submit(input.closest("form")!);
    expect(submit).toHaveBeenLastCalledWith("");
    expect(input).toBeInvalid();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("trims/encodes searches, handles null fields, and announces no results", async () => {
    const fetchMock = vi.fn(async (url: string) => url.includes("missing") ? response([]) : response());
    vi.stubGlobal("fetch", fetchMock);
    render(<StudentSearchSelect value="" onChange={vi.fn()} />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "  A,(b)%_*@example.com  " } });
    await screen.findByText("No email recorded");
    expect(fetchMock.mock.calls[0][0]).toBe(`/api/admin/students?search=${encodeURIComponent("A,(b)%_*@example.com")}`);
    fireEvent.change(input, { target: { value: "missing" } });
    await screen.findByText("No students found");
  });

  it("does not let a late response replace the latest query", async () => {
    let finishOld: ((value: Response) => void) | undefined;
    vi.stubGlobal("fetch", vi.fn((url: string) => url.includes("older")
      ? new Promise<Response>(resolve => { finishOld = resolve; })
      : Promise.resolve(response([students[1]]))));
    render(<StudentSearchSelect value="" onChange={vi.fn()} />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "older" } });
    await waitFor(() => expect(finishOld).toBeDefined());
    fireEvent.change(input, { target: { value: "latest" } });
    await screen.findByText("two@example.com");
    await act(async () => { finishOld!(response([students[0]])); });
    expect(screen.queryByText("one@example.com")).not.toBeInTheDocument();
    expect(screen.getByText("two@example.com")).toBeInTheDocument();
  });

  it("shows failures and prevents unselected text from satisfying required validation", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("failed", { status: 500 })));
    render(<StudentSearchSelect value="" onChange={vi.fn()} required />);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "some student" } });
    await screen.findByText(/Student search failed/);
    expect(input).toBeInvalid();
  });
});
