"use client";

import { useState, useEffect, useCallback } from "react";
import { requireUser } from "@/lib/auth";
import { Card, Button, SearchBar, Badge, DateFormat, Select } from "@/components/ui";
import YouTubeEmbed from "@/components/videos/YouTubeEmbed";

type Recording = {
  id: string;
  title: string;
  description: string | null;
  youtube_video_id: string;
  release_at: string;
  published: boolean;
  thumbnail_url: string | null;
  class_id: string;
  class_groups: { id: string; name: string } | null;
  views_count: number;
  is_manually_unlocked: boolean;
  can_access: boolean;
};

type Class = {
  id: string;
  name: string;
};

export default function StudentRecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [accessibleClasses, setAccessibleClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);

  const fetchRecordings = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedClassId
        ? `/api/student/recordings?class_id=${selectedClassId}`
        : "/api/student/recordings";

      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Access denied or account inactive");
        }
        throw new Error("Failed to fetch recordings");
      }

      const data = await response.json();
      setRecordings(data.recordings || []);
      setAccessibleClasses(data.accessible_classes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [selectedClassId]);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

    const handleSearch = (value: string) => {
    setSearchQuery(value.toLowerCase());
  };

  const handleRecordingClick = async (recording: Recording) => {
    // Log view asynchronously (don't wait for response)
    try {
      await fetch(`/api/student/recordings/${recording.id}/view`, {
        method: "POST",
      });
      // Update local views count optimistically
      setRecordings((prev) =>
        prev.map((r) =>
          r.id === recording.id
            ? { ...r, views_count: (r.views_count || 0) + 1 }
            : r
        )
      );
    } catch (error) {
      console.error("Failed to log view:", error);
    }

    setSelectedRecording(recording);
  };

  const filteredRecordings = recordings.filter((rec) =>
    rec.title.toLowerCase().includes(searchQuery) ||
    rec.description?.toLowerCase().includes(searchQuery) ||
    rec.class_groups?.name.toLowerCase().includes(searchQuery)
  );

  const groupedRecordings = selectedClassId
    ? filteredRecordings
    : filteredRecordings.reduce((acc, rec) => {
        const className = rec.class_groups?.name || "Uncategorized";
        if (!acc[className]) {
          acc[className] = [];
        }
        acc[className].push(rec);
        return acc;
      }, {} as Record<string, Recording[]>);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Unable to Load Recordings</h2>
            <p className="text-slate-600">{error}</p>
            <Button onClick={fetchRecordings} className="mt-4" size="sm">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Class Recordings</h1>
          <p className="text-sm text-slate-600 mt-1">
            Watch and review your class lessons
          </p>
        </div>

        {accessibleClasses.length > 0 && (
          <div className="w-full sm:w-64">
            <Select
              label="Filter by Class"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              options={[
                { value: "", label: "All Classes" },
                ...accessibleClasses.map((cls) => ({
                  value: cls.id,
                  label: cls.name,
                })),
              ]}
            />
          </div>
        )}
      </div>

      {recordings.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎥</div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Recordings Available</h2>
            <p className="text-slate-600 max-w-md mx-auto">
              {selectedClassId
                ? "There are no recordings for this class yet. Check back later or contact your instructor."
                : "You don't have access to any recordings yet. Make sure you're enrolled in a class and the release date has passed."}
            </p>
          </div>
        </Card>
      ) : filteredRecordings.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">No Results Found</h2>
            <p className="text-slate-600">
              No recordings match your search. Try a different keyword or filter.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {selectedClassId ? (
            // Single class view - show all recordings in a grid
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredRecordings.map((recording) => (
                <RecordingCard
                  key={recording.id}
                  recording={recording}
                  onClick={() => setSelectedRecording(recording)}
                />
              ))}
            </div>
          ) : (
            // Group by class
            Object.entries(groupedRecordings).map(([className, recs]) => (
              <section key={className}>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-indigo-600">📚</span>
                  {className}
                  <Badge variant="info">{recs.length}</Badge>
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {recs.map((recording) => (
                    <RecordingCard
                      key={recording.id}
                      recording={recording}
                      onClick={() => setSelectedRecording(recording)}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      )}

      {/* Recording Detail Modal */}
      {selectedRecording && (
        <RecordingDetailModal
          recording={selectedRecording}
          onClose={() => setSelectedRecording(null)}
        />
      )}
    </div>
  );
}

interface RecordingCardProps {
  recording: Recording;
  onClick: () => void;
}

function RecordingCard({ recording, onClick }: RecordingCardProps) {
  const getYouTubeThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const isUnlocked = recording.is_manually_unlocked;

  const handleClick = () => {
    onClick();
  };

  return (
    <Card
      padding="none"
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-100">
        <img
          src={getYouTubeThumbnail(recording.youtube_video_id)}
          alt={recording.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${recording.youtube_video_id}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {isUnlocked && (
          <div className="absolute top-2 right-2">
            <Badge variant="warning" size="sm">
              🔓 Unlocked
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2">
          {recording.title}
        </h3>
        {recording.description && (
          <p className="text-sm text-slate-600 mb-3 line-clamp-2">
            {recording.description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{recording.class_groups?.name}</span>
          <span>
            <DateFormat date={recording.release_at} format="short" />
          </span>
        </div>
      </div>
    </Card>
  );
}

interface RecordingDetailModalProps {
  recording: Recording;
  onClose: () => void;
}

function RecordingDetailModal({ recording, onClose }: RecordingDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{recording.title}</h2>
            <p className="text-sm text-slate-600">{recording.class_groups?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <YouTubeEmbed
              videoId={recording.youtube_video_id}
              title={recording.title}
              className="w-full"
            />
          </div>

          {recording.description && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
              <p className="text-slate-600">{recording.description}</p>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>Released: <DateFormat date={recording.release_at} format="long" /></span>
            {recording.is_manually_unlocked && (
              <Badge variant="warning">Manually Unlocked</Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
