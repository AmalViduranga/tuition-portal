"use client";

import { Badge, DateFormat } from "@/components/ui";
import { RecordingThumbnail } from "./index";

export type StudentRecordingCardData = {
  id: string;
  title: string;
  description: string | null;
  youtube_video_id: string;
  release_at: string;
  class_groups: { id: string; name: string } | null;
  is_manually_unlocked: boolean;
  thumbnail_url?: string | null;
};

interface StudentRecordingCardProps {
  recording: StudentRecordingCardData;
  isHighlighted?: boolean;
  onOpen: () => void;
}

export default function StudentRecordingCard({ recording, isHighlighted, onOpen }: StudentRecordingCardProps) {
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
      className={`group w-full flex flex-col text-left rounded-lg overflow-hidden border bg-card transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
        isHighlighted
          ? "border-blue-500 ring-1 ring-blue-500"
          : "border-border hover:border-blue-400 dark:hover:border-blue-600"
      }`}
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        <RecordingThumbnail
          thumbnailUrl={recording.thumbnail_url}
          youtubeVideoId={recording.youtube_video_id}
          title={recording.title}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/25">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
            <svg className="ml-0.5 h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
        {recording.is_manually_unlocked ? (
          <div className="absolute right-2 top-2">
            <Badge variant="warning" size="sm">
              Unlocked
            </Badge>
          </div>
        ) : null}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-foreground line-clamp-2 leading-snug">{recording.title}</h3>
        {recording.description ? (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{recording.description}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-link">{recording.class_groups?.name ?? "Class"}</span>
            <DateFormat date={recording.release_at} format="short" />
          </div>
          <span className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors group-hover:bg-primary-hover">
            Watch
          </span>
        </div>
      </div>
    </div>
  );
}
