"use client";

import { VideoCard } from "./video-card";
import type { VideoResult } from "@/types";

interface VideoGridProps {
  videos: VideoResult[];
  selectedIds: Set<string>;
  onToggleVideo: (videoId: string) => void;
}

export function VideoGrid({
  videos,
  selectedIds,
  onToggleVideo,
}: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No videos to display. Try adjusting your search criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          selected={selectedIds.has(video.id)}
          onToggle={() => onToggleVideo(video.id)}
        />
      ))}
    </div>
  );
}
