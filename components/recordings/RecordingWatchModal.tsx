"use client";

import { Badge, DateFormat } from "@/components/ui";
import YouTubeEmbed from "@/components/videos/YouTubeEmbed";

export type RecordingWatchModalData = {
  id: string;
  title: string;
  description: string | null;
  youtube_video_id: string;
  release_at: string;
  class_groups: { id: string; name: string } | null;
  is_manually_unlocked: boolean;
};

interface RecordingWatchModalProps {
  recording: RecordingWatchModalData;
  onClose: () => void;
}

export default function RecordingWatchModal({ recording, onClose }: RecordingWatchModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recording-modal-title"
    >
      <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
              {recording.class_groups?.name ?? "Class recording"}
            </p>
            <h2 id="recording-modal-title" className="mt-1 text-lg font-semibold text-slate-900 sm:text-xl">
              {recording.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6 px-5 py-6 sm:px-6">
          <YouTubeEmbed videoId={recording.youtube_video_id} title={recording.title} className="w-full" />

          {recording.description ? (
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Description</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{recording.description}</p>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>
              Released <DateFormat date={recording.release_at} format="long" />
            </span>
            {recording.is_manually_unlocked ? (
              <Badge variant="warning" size="sm">
                Manually unlocked
              </Badge>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
