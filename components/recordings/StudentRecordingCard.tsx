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
  onOpen: () => void;
}

export default function StudentRecordingCard({ recording, onOpen }: StudentRecordingCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="group w-full flex flex-col text-left rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        <RecordingThumbnail
          thumbnailUrl={recording.thumbnail_url}
          youtubeVideoId={recording.youtube_video_id}
          title={recording.title}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/10">
          <span className="flex h-14 w-14 scale-90 items-center justify-center rounded-full bg-white/95 text-blue-600 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
            <svg className="ml-1 h-7 w-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
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
        <h3 className="font-semibold text-slate-900 line-clamp-2 leading-snug">{recording.title}</h3>
        {recording.description ? (
          <p className="mt-2 text-sm text-slate-600 line-clamp-2">{recording.description}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex flex-col gap-1">
            <span className="font-medium">{recording.class_groups?.name ?? "Class"}</span>
            <DateFormat date={recording.release_at} format="short" />
          </div>
          <span className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            Watch
          </span>
        </div>
      </div>
    </div>
  );
}
