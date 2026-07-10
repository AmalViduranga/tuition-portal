"use client";

import { Badge, DateFormat } from "@/components/ui";
import { RecordingThumbnail } from "./index";

export type StudentRecordingRowData = {
  id: string;
  title: string;
  description: string | null;
  youtube_video_id: string;
  release_at: string;
  class_groups: { id: string; name: string } | null;
  is_manually_unlocked: boolean;
  thumbnail_url?: string | null;
};

interface StudentRecordingRowProps {
  recording: StudentRecordingRowData;
  isHighlighted?: boolean;
  onOpen: () => void;
}

export default function StudentRecordingRow({ recording, isHighlighted, onOpen }: StudentRecordingRowProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      id={recording.id}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={`group flex w-full items-center gap-4 rounded-xl border p-3 text-left shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 duration-300 ${
        isHighlighted 
          ? "border-blue-500 bg-white shadow-md ring-1 ring-blue-500" 
          : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      <div className="relative aspect-video w-32 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-40">
        <RecordingThumbnail
          thumbnailUrl={recording.thumbnail_url}
          youtubeVideoId={recording.youtube_video_id}
          title={recording.title}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
          <div className="flex h-10 w-10 scale-90 items-center justify-center rounded-full bg-white/95 text-blue-600 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
            <svg className="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-w-0 flex-col py-0.5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
            {recording.title}
          </h3>
          {recording.is_manually_unlocked && (
            <Badge variant="warning" size="sm" className="whitespace-nowrap flex-shrink-0">
              Unlocked
            </Badge>
          )}
        </div>
        
        {recording.description && (
          <p className="mt-1 text-sm text-slate-600 line-clamp-1 hidden sm:block">
            {recording.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="font-medium text-blue-600/80">
            {recording.class_groups?.name ?? "Other Class"}
          </span>
          <span className="flex items-center gap-1">
            <DateFormat date={recording.release_at} format="short" />
          </span>
        </div>
      </div>

      <div className="hidden sm:flex items-center pr-2">
        <span className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          Watch
        </span>
      </div>
    </div>
  );
}
