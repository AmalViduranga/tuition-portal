/**
 * Safely extracts an 11-character YouTube video ID from various YouTube URL formats.
 * If the input is already a clean ID, it returns it.
 */
export function extractYouTubeVideoId(input: string | null | undefined): string | null {
  if (!input) return null;
  const cleanInput = input.trim();
  
  // Safe length limit to prevent any excessive processing
  if (cleanInput.length === 0 || cleanInput.length > 500) return null;

  // Exact 11-character raw video ID match
  const idRegex = /^[A-Za-z0-9_-]{11}$/;
  if (idRegex.test(cleanInput)) {
    return cleanInput;
  }

  // Prepend protocol if missing to allow URL parsing
  let urlString = cleanInput;
  if (!urlString.startsWith("http://") && !urlString.startsWith("https://")) {
    urlString = `https://${urlString}`;
  }

  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return null; // Invalid URL structure
  }

  const hostname = url.hostname.toLowerCase();
  let extractedId: string | null = null;

  if (hostname === "youtu.be") {
    // e.g. https://youtu.be/AinV7Bbpiuc
    extractedId = url.pathname.slice(1);
  } else if (
    hostname === "youtube.com" ||
    hostname === "www.youtube.com" ||
    hostname === "youtube-nocookie.com" ||
    hostname === "www.youtube-nocookie.com"
  ) {
    if (url.pathname.startsWith("/embed/") || url.pathname.startsWith("/v/") || url.pathname.startsWith("/shorts/")) {
      // e.g. https://www.youtube.com/embed/AinV7Bbpiuc
      extractedId = url.pathname.split("/")[2];
    } else if (url.pathname === "/watch") {
      // e.g. https://www.youtube.com/watch?v=AinV7Bbpiuc
      extractedId = url.searchParams.get("v");
    }
  }

  // Final safety validation
  if (extractedId && idRegex.test(extractedId)) {
    return extractedId;
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
