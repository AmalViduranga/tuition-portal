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
      className={`group flex w-full items-center gap-4 rounded-lg border p-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        isHighlighted
          ? "border-blue-500 bg-card ring-1 ring-blue-500"
          : "border-border bg-card hover:border-blue-400 dark:hover:border-blue-600"
      }`}
    >
      <div className="relative aspect-video w-32 flex-shrink-0 overflow-hidden rounded-lg bg-muted sm:w-40">
        <RecordingThumbnail
          thumbnailUrl={recording.thumbnail_url}
          youtubeVideoId={recording.youtube_video_id}
          title={recording.title}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/25">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
            <svg className="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-w-0 flex-col py-0.5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-link transition-colors">
            {recording.title}
          </h3>
          {recording.is_manually_unlocked && (
            <Badge variant="warning" size="sm" className="whitespace-nowrap flex-shrink-0">
              Unlocked
            </Badge>
          )}
        </div>
        
        {recording.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-1 hidden sm:block">
            {recording.description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="font-medium text-link">
            {recording.class_groups?.name ?? "Other Class"}
          </span>
          <span className="flex items-center gap-1">
            <DateFormat date={recording.release_at} format="short" />
          </span>
        </div>
      </div>

      <div className="hidden sm:flex items-center pr-2">
        <span className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors group-hover:bg-primary-hover">
          Watch
        </span>
      </div>
    </div>
  );
}
