"use client";

import { Button } from "@/components/ui/button";
import type { VideoResult } from "@/types";

interface SelectionSummaryProps {
  videos: VideoResult[];
  selectedIds: Set<string>;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onCreatePlaylist: () => void;
  isCreating: boolean;
}

function formatTotalDuration(videos: VideoResult[]): string {
  const totalSeconds = videos.reduce((sum, v) => sum + v.duration, 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function SelectionSummary({
  videos,
  selectedIds,
  onSelectAll,
  onDeselectAll,
  onCreatePlaylist,
  isCreating,
}: SelectionSummaryProps) {
  const selectedVideos = videos.filter((v) => selectedIds.has(v.id));
  const allSelected = selectedIds.size === videos.length && videos.length > 0;

  return (
    <div className="sticky bottom-0 bg-background border-t p-4">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-medium">{selectedIds.size}</span> of{" "}
            <span className="font-medium">{videos.length}</span> videos selected
          </div>
          {selectedVideos.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Total: {formatTotalDuration(selectedVideos)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={allSelected ? onDeselectAll : onSelectAll}
          >
            {allSelected ? "Deselect All" : "Select All"}
          </Button>
          <Button
            onClick={onCreatePlaylist}
            disabled={selectedIds.size === 0 || isCreating}
            size="sm"
          >
            {isCreating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </>
            ) : (
              <>Create Playlist ({selectedIds.size})</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
