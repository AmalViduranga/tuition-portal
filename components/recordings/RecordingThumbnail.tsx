"use client";

import Image from "next/image";
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
  const [fallbackLevel, setFallbackLevel] = useState(0);

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
      <Image
        src={currentSource}
        alt={title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={() => {
          setFallbackLevel((prev) => prev + 1);
        }}
      />
    </div>
  );
}
