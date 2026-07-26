"use client";

import { useState, useEffect } from "react";
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
  const [fallbackLevel, setFallbackLevel] = useState(0);

  // Reset fallback level when video changes
  useEffect(() => {
    setFallbackLevel(0);
  }, [youtubeVideoId, thumbnailUrl]);

  const cleanId = extractYouTubeVideoId(youtubeVideoId);
  const youtubeLevels = cleanId ? getYoutubeThumbnailLevels(cleanId) : [];
  
  const sources = thumbnailUrl ? [thumbnailUrl, ...youtubeLevels] : youtubeLevels;
  const currentSource = sources[fallbackLevel];

  if (!currentSource || fallbackLevel >= sources.length) {
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
          setFallbackLevel((prev) => prev + 1);
        }}
      />
    </div>
  );
}
