"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { StudentOption } from "@/lib/admin/student-search";

interface Props {
  students?: Array<{ id: string; full_name: string | null; email?: string | null }>;
  value: string;
  onChange: (studentId: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export default function StudentSearchSelect({ students = [], value, onChange, label = "Student", placeholder = "Search by student name or email", required = false }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const version = useRef(0);
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<StudentOption | null>(null);
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<StudentOption[]>([]);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const selected = selection?.id === value ? selection : students.find(student => student.id === value);
  const inputText = value ? selected?.full_name || selected?.email || value : query;

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const current = version.current;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/admin/students?search=${encodeURIComponent(query.trim())}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("Student search failed. Please try again.");
        const result: { students: StudentOption[]; hasMore: boolean } = await response.json();
        if (!controller.signal.aborted && version.current === current) {
          setOptions(result.students);
          setHasMore(result.hasMore);
          setActive(-1);
        }
      } catch {
        if (!controller.signal.aborted && version.current === current) {
          setError("Student search failed. Close and reopen the search to try again.");
          setOptions([]);
        }
      } finally {
        if (!controller.signal.aborted && version.current === current) setLoading(false);
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [open, query]);

  useEffect(() => {
    const outside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  useEffect(() => {
    if (open && active >= 0) document.getElementById(`${id}-option-${active}`)?.scrollIntoView?.({ block: "nearest" });
  }, [active, id, open]);

  const select = (student: StudentOption) => {
    version.current++;
    setSelection(student);
    setQuery("");
    onChange(student.id);
    setOpen(false);
    setLoading(false);
    inputRef.current?.setCustomValidity("");
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
    }}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}{required && <span aria-hidden="true" className="text-red-500"> *</span>}</label>
      <div className="relative">
        <input
          id={id}
          ref={node => { inputRef.current = node; node?.setCustomValidity(required && !value ? "Select a student from the results." : ""); }}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-activedescendant={open && !loading && active >= 0 ? `${id}-option-${active}` : undefined}
          aria-describedby={open ? `${id}-status` : undefined}
          autoComplete="off"
          value={inputText}
          placeholder={placeholder}
          required={required}
          maxLength={200}
          onChange={event => {
            version.current++;
            setQuery(event.target.value);
            onChange("");
            setSelection(null);
            setOptions([]);
            setActive(-1);
            setError("");
            setLoading(true);
            setOpen(true);
          }}
          onFocus={() => { if (!open) { setOpen(true); setLoading(true); } }}
          onClick={() => { if (!open) { setOpen(true); setLoading(true); } }}
          onKeyDown={event => {
            if (event.key === "Escape") { version.current++; setOpen(false); return; }
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              if (!open) { setOpen(true); setLoading(true); }
              if (!loading) setActive(previous => options.length ? (event.key === "ArrowDown" ? (previous + 1) % options.length : (previous <= 0 ? options.length - 1 : previous - 1)) : -1);
            }
            if (event.key === "Enter" && open) {
              event.preventDefault();
              if (!loading && active >= 0 && options[active]) select(options[active]);
            }
          }}
          className="w-full rounded-lg border border-slate-300 pl-9! pr-10! py-2 text-sm min-h-[44px] bg-white dark:bg-slate-900"
        />
        <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        {(value || query) && <button type="button" aria-label="Clear student selection" className="absolute right-1 top-1/2 -translate-y-1/2 bg-transparent! text-slate-500! p-2! shadow-none!" onClick={() => {
          version.current++;
          onChange(""); setSelection(null); setQuery(""); setOptions([]); setActive(-1); setOpen(false); setLoading(false);
          inputRef.current?.focus();
        }}><X size={16} /></button>}
      </div>
      {open && <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
        <div id={`${id}-status`} role="status" className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
          {loading ? "Searching students…" : error || (options.length ? `${options.length} results. Use arrow keys and Enter to select.${hasMore ? " More matches available; refine your search." : ""}` : "No students found")}
        </div>
        <ul id={`${id}-list`} role="listbox" aria-label={`${label} results`} className="max-h-60 overflow-y-auto">
          {!loading && !error && options.map((student, index) => <li
            key={student.id} id={`${id}-option-${index}`} role="option" aria-selected={student.id === value}
            onMouseDown={event => event.preventDefault()} onClick={() => select(student)}
            className={`cursor-pointer px-3 py-2.5 text-sm min-h-[44px] ${active === index ? "bg-blue-50 dark:bg-blue-950" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
          ><span className="block font-medium text-slate-900 dark:text-slate-100">{student.full_name || "Unnamed student"}</span><span className="block break-all text-xs text-slate-500 dark:text-slate-400">{student.email || "No email recorded"}</span><span className="text-xs text-slate-500">{student.id.slice(0, 8)}…</span></li>)}
        </ul>
      </div>}
    </div>
  );
}
