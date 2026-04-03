"use client";

import { Badge, DateFormat } from "@/components/ui";
import { youtubeThumbnailFallbackUrl, youtubeThumbnailUrl } from "@/lib/recordings/youtube";

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
  onOpen: () => void;
}

export default function StudentRecordingRow({ recording, onOpen }: StudentRecordingRowProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-3 text-left shadow-sm transition-all hover:border-indigo-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <div className="relative aspect-video w-32 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-40">
        <img
          src={recording.thumbnail_url || youtubeThumbnailUrl(recording.youtube_video_id)}
          alt=""
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = youtubeThumbnailFallbackUrl(recording.youtube_video_id);
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
          <div className="flex h-10 w-10 scale-90 items-center justify-center rounded-full bg-white/90 text-indigo-600 opacity-0 shadow-lg transition-all group-hover:scale-100 group-hover:opacity-100">
            <svg className="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-w-0 flex-col py-0.5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-indigo-700 transition-colors">
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
          <span className="font-medium text-indigo-600/80">
            {recording.class_groups?.name ?? "Other Class"}
          </span>
          <span className="flex items-center gap-1">
            <DateFormat date={recording.release_at} format="short" />
          </span>
        </div>
      </div>

      <div className="hidden sm:flex items-center pr-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </button>
  );
}
