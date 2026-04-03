/** YouTube thumbnail URL for a video ID (falls back in UI on error). */
export function youtubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function youtubeThumbnailFallbackUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/** Fetch video metadata using oEmbed (no API key needed) */
export async function getYouTubeMetadata(videoId: string) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title,
      thumbnail_url: data.thumbnail_url,
      author_name: data.author_name,
    };
  } catch (e) {
    return null;
  }
}
