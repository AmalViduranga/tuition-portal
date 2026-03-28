"use client";

import { Badge, DateFormat } from "@/components/ui";
import { youtubeThumbnailFallbackUrl, youtubeThumbnailUrl } from "@/lib/recordings/youtube";

export type StudentRecordingCardData = {
  id: string;
  title: string;
  description: string | null;
  youtube_video_id: string;
  release_at: string;
  class_groups: { id: string; name: string } | null;
  is_manually_unlocked: boolean;
};

interface StudentRecordingCardProps {
  recording: StudentRecordingCardData;
  onOpen: () => void;
}

export default function StudentRecordingCard({ recording, onOpen }: StudentRecordingCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full text-left rounded-xl overflow-hidden border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md hover:border-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-video bg-slate-100">
        <img
          src={youtubeThumbnailUrl(recording.youtube_video_id)}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = youtubeThumbnailFallbackUrl(recording.youtube_video_id);
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/25">
          <span className="flex h-14 w-14 scale-90 items-center justify-center rounded-full bg-white/95 text-indigo-600 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
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

      <div className="p-4">
        <h3 className="font-semibold text-slate-900 line-clamp-2 leading-snug">{recording.title}</h3>
        {recording.description ? (
          <p className="mt-2 text-sm text-slate-600 line-clamp-2">{recording.description}</p>
        ) : null}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span className="font-medium text-indigo-700/90">{recording.class_groups?.name ?? "Class"}</span>
          <DateFormat date={recording.release_at} format="short" />
        </div>
      </div>
    </button>
  );
}
