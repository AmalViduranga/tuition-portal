import { describe, it, expect } from "vitest";
import { extractYouTubeVideoId, getYoutubeThumbnailLevels } from "@/lib/recordings/youtube";

describe("YouTube Utility Functions", () => {
  describe("extractYouTubeVideoId", () => {
    it("extracts ID from youtu.be URLs", () => {
      expect(extractYouTubeVideoId("https://youtu.be/IV9L7WWNJe8")).toBe("IV9L7WWNJe8");
      expect(extractYouTubeVideoId("https://youtu.be/IV9L7WWNJe8?si=test")).toBe("IV9L7WWNJe8");
    });

    it("extracts ID from standard watch URLs", () => {
      expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=IV9L7WWNJe8")).toBe("IV9L7WWNJe8");
      expect(extractYouTubeVideoId("https://www.youtube.com/watch?v=IV9L7WWNJe8&t=120")).toBe("IV9L7WWNJe8");
      expect(extractYouTubeVideoId("https://m.youtube.com/watch?v=IV9L7WWNJe8")).toBe("IV9L7WWNJe8");
    });

    it("extracts ID from special paths (embed, shorts, live)", () => {
      expect(extractYouTubeVideoId("https://youtube.com/embed/IV9L7WWNJe8")).toBe("IV9L7WWNJe8");
      expect(extractYouTubeVideoId("https://youtube.com/shorts/IV9L7WWNJe8")).toBe("IV9L7WWNJe8");
      expect(extractYouTubeVideoId("https://youtube.com/live/IV9L7WWNJe8")).toBe("IV9L7WWNJe8");
    });

    it("extracts ID from nocookie URLs", () => {
      expect(extractYouTubeVideoId("https://www.youtube-nocookie.com/embed/IV9L7WWNJe8")).toBe("IV9L7WWNJe8");
    });

    it("accepts raw IDs", () => {
      expect(extractYouTubeVideoId("IV9L7WWNJe8")).toBe("IV9L7WWNJe8");
    });

    it("returns null for empty or invalid input", () => {
      expect(extractYouTubeVideoId("")).toBeNull();
      expect(extractYouTubeVideoId(null)).toBeNull();
      expect(extractYouTubeVideoId(undefined)).toBeNull();
    });

    it("returns null for playlist-only or channel URLs", () => {
      expect(extractYouTubeVideoId("https://www.youtube.com/playlist?list=PLxyz")).toBeNull();
      expect(extractYouTubeVideoId("https://www.youtube.com/@channelname")).toBeNull();
    });

    it("returns null for malformed IDs", () => {
      expect(extractYouTubeVideoId("https://youtu.be/tooshort")).toBeNull(); // Less than 11 chars
      expect(extractYouTubeVideoId("https://youtu.be/toolongvideoid")).toBeNull(); // More than 11 chars
      expect(extractYouTubeVideoId("https://youtu.be/invalid!@#$")).toBeNull(); // Invalid chars
    });

    it("returns null for unsupported hostnames", () => {
      expect(extractYouTubeVideoId("https://vimeo.com/IV9L7WWNJe8")).toBeNull();
      expect(extractYouTubeVideoId("https://evil.example/youtube.com/watch?v=IV9L7WWNJe8")).toBeNull();
    });

    it("returns null for XSS/HTML attempts", () => {
      expect(extractYouTubeVideoId("<script>alert(1)</script>")).toBeNull();
    });
  });

  describe("getYoutubeThumbnailLevels", () => {
    it("returns proper i.ytimg.com URLs for a valid ID", () => {
      const levels = getYoutubeThumbnailLevels("IV9L7WWNJe8");
      expect(levels).toHaveLength(2);
      expect(levels[0]).toBe("https://i.ytimg.com/vi/IV9L7WWNJe8/maxresdefault.jpg");
      expect(levels[1]).toBe("https://i.ytimg.com/vi/IV9L7WWNJe8/hqdefault.jpg");
    });

    it("returns empty array for invalid ID", () => {
      const levels = getYoutubeThumbnailLevels("invalid");
      expect(levels).toEqual([]);
    });
  });
});
