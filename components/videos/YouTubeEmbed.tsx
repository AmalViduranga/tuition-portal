"use client";

import { useState } from "react";

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  className?: string;
  autoplay?: boolean;
  startTime?: number;
  controls?: boolean;
  responsive?: boolean;
}

export default function YouTubeEmbed({
  videoId,
  title = "YouTube video",
  className = "",
  autoplay = false,
  startTime = 0,
  controls = true,
  responsive = true,
}: YouTubeEmbedProps) {
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract clean video ID from various YouTube URL formats
  const extractVideoId = (input: string): string | null => {
    // If already a clean ID (11 characters)
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
      return input;
    }

    // Extract from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  const cleanVideoId = extractVideoId(videoId);

  if (!cleanVideoId) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 rounded-lg ${className}`} style={{ minHeight: "200px" }}>
        <div className="text-center p-4">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-sm text-slate-600">Invalid YouTube video ID</p>
          <p className="text-xs text-slate-500 mt-1">{videoId}</p>
        </div>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${cleanVideoId}?autoplay=${autoplay ? 1 : 0}&start=${startTime}&rel=0&modestbranding=1${controls ? '' : '&controls=0'}`;

  const handleError = () => {
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 rounded-lg ${className}`} style={{ minHeight: "200px" }}>
        <div className="text-center p-4">
          <div className="text-4xl mb-2">🎬</div>
          <p className="text-sm font-medium text-slate-700">{title}</p>
          <a
            href={`https://www.youtube.com/watch?v=${cleanVideoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
          >
            Watch on YouTube
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`${responsive ? "aspect-video" : ""} ${className}`}>
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onError={handleError}
        onLoad={() => setIsPlaying(true)}
        className={`w-full h-full rounded-lg ${isPlaying ? "bg-black" : "bg-slate-100"}`}
        style={{
          minHeight: "200px",
          border: "none",
        }}
      />
    </div>
  );
}
