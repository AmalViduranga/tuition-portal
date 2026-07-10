/**
 * Safely extracts an 11-character YouTube video ID from various YouTube URL formats.
 * If the input is already a clean ID, it returns it.
 */
export function extractYouTubeVideoId(input: string | null | undefined): string | null {
  if (!input) return null;
  const cleanInput = input.trim();
  if (!cleanInput) return null;

  // Regex to extract video ID from full urls, shorts, embed, watch?v=
  const match = cleanInput.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^"&?\/\s]{11})/);
  if (match && match[1]) {
    return match[1];
  }

  // If it's just the 11 character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanInput)) {
    return cleanInput;
  }

  return null;
}

export function getYoutubeThumbnailLevels(videoId: string) {
  const cleanId = extractYouTubeVideoId(videoId);
  if (!cleanId) return [];

  return [
    `https://img.youtube.com/vi/${cleanId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${cleanId}/mqdefault.jpg`,
  ];
}

/** Fetch video metadata using oEmbed (no API key needed) */
export async function getYouTubeMetadata(videoId: string) {
  try {
    const cleanId = extractYouTubeVideoId(videoId);
    if (!cleanId) return null;

    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${cleanId}&format=json`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title,
      thumbnail_url: data.thumbnail_url,
      author_name: data.author_name,
    };
  } catch {
    return null;
  }
}
