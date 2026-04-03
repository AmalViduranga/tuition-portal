"use client";

import { useState } from "react";
import { StudentRecordingRow, RecordingWatchModal } from "@/components/recordings";

interface ClassRecordingsListProps {
  recordings: any[];
}

export default function ClassRecordingsList({ recordings }: ClassRecordingsListProps) {
  const [selectedRecording, setSelectedRecording] = useState<any | null>(null);

  if (recordings.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500">
        <p className="text-sm">No recordings available for this class yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {recordings.map((recording) => (
        <StudentRecordingRow
          key={recording.id}
          recording={recording}
          onOpen={() => setSelectedRecording(recording)}
        />
      ))}

      {selectedRecording && (
        <RecordingWatchModal
          recording={selectedRecording}
          onClose={() => setSelectedRecording(null)}
        />
      )}
    </div>
  );
}
