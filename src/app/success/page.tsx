"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlaylistResult } from "@/types";

export default function SuccessPage() {
  const router = useRouter();
  const [playlist, setPlaylist] = useState<PlaylistResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("playlistResult");
    if (stored) {
      setPlaylist(JSON.parse(stored));
      sessionStorage.removeItem("playlistResult");
    } else {
      router.push("/create");
    }
  }, [router]);

  if (!playlist) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold">Playlist Created!</h1>
          <p className="text-muted-foreground">
            Your playlist has been successfully created on YouTube.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{playlist.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Videos</p>
                <p className="font-medium text-lg">{playlist.videoCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Duration</p>
                <p className="font-medium text-lg">
                  {playlist.totalDuration >= 60
                    ? `${Math.floor(playlist.totalDuration / 60)}h ${playlist.totalDuration % 60}m`
                    : `${playlist.totalDuration}m`}
                </p>
              </div>
            </div>

            <Button asChild className="w-full" size="lg">
              <a
                href={playlist.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                Open in YouTube
              </a>
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/create">Create Another Playlist</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
