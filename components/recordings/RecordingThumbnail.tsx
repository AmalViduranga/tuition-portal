"use client";

import { useState } from "react";
import { getYoutubeThumbnailLevels, extractYouTubeVideoId } from "@/lib/recordings/youtube";

interface RecordingThumbnailProps {
  thumbnailUrl?: string | null;
  youtubeVideoId: string;
  title: string;
  className?: string;
}

export default function RecordingThumbnail({
  thumbnailUrl,
  youtubeVideoId,
  title,
  className = "",
}: RecordingThumbnailProps) {
  const currentIdentity = `${youtubeVideoId}-${thumbnailUrl || ""}`;
  const [fallbackState, setFallbackState] = useState({
    identity: currentIdentity,
    level: 0,
  });

  const effectiveLevel = fallbackState.identity === currentIdentity ? fallbackState.level : 0;

  const cleanId = extractYouTubeVideoId(youtubeVideoId);
  const youtubeLevels = cleanId ? getYoutubeThumbnailLevels(cleanId) : [];
  
  const sources = thumbnailUrl ? [thumbnailUrl, ...youtubeLevels] : youtubeLevels;
  const currentSource = sources[effectiveLevel];

  if (!currentSource || effectiveLevel >= sources.length) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-slate-100 ${className}`}>
        <svg className="h-10 w-10 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentSource}
        alt={title}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
        onError={() => {
          setFallbackState({
            identity: currentIdentity,
            level: effectiveLevel + 1,
          });
        }}
      />
    </div>
  );
}
