"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { VideoResult } from "@/types";

interface VideoCardProps {
  video: VideoResult;
  selected?: boolean;
  onToggle?: () => void;
}

function formatViews(views: number): string {
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1)}M views`;
  }
  if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1)}K views`;
  }
  return `${views} views`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function VideoCard({ video, selected, onToggle }: VideoCardProps) {
  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
        selected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onToggle}
    >
      <div className="relative aspect-video">
        <Image
          src={video.thumbnailUrl || "/placeholder.svg"}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <Badge
          variant="secondary"
          className="absolute bottom-2 right-2 bg-black/80 text-white"
        >
          {video.durationFormatted}
        </Badge>
        {selected && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <div className="bg-primary text-primary-foreground rounded-full p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2" title={video.title}>
          {video.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {video.channelTitle}
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span>{formatViews(video.viewCount)}</span>
          <span>•</span>
          <span>{formatDate(video.publishedAt)}</span>
        </div>
      </div>
    </Card>
  );
}
