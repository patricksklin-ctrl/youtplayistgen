"use server";

import { auth } from "@/lib/auth";
import { searchCriteriaSchema } from "@/lib/validations";
import {
  searchVideos,
  getVideoDetails,
  filterAndSortVideos,
  selectVideosForTarget,
  createPlaylist,
  addVideoToPlaylist,
} from "@/lib/youtube";
import type { VideoResult, PlaylistResult, SearchCriteria } from "@/types";

export async function searchAndFilterVideos(
  input: SearchCriteria
): Promise<{ success: true; videos: VideoResult[] } | { success: false; error: string }> {
  try {
    // Validate input
    const result = searchCriteriaSchema.safeParse(input);
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message };
    }

    const criteria = result.data;
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return { success: false, error: "YouTube API key not configured" };
    }

    // Search for videos
    const videoIds = await searchVideos(criteria, apiKey);

    if (videoIds.length === 0) {
      return {
        success: false,
        error: "No videos found matching your criteria. Try broadening your search.",
      };
    }

    // Get video details
    const videos = await getVideoDetails(videoIds, apiKey);

    // Filter and sort
    const filtered = filterAndSortVideos(videos, criteria);

    if (filtered.length === 0) {
      return {
        success: false,
        error: "No videos match your filters. Try adjusting minimum views or duration range.",
      };
    }

    // Select videos based on target
    const selected = selectVideosForTarget(filtered, criteria.target);

    return { success: true, videos: selected };
  } catch (error) {
    console.error("Error searching videos:", error);

    if (error instanceof Error && error.message.includes("quota")) {
      return {
        success: false,
        error: "YouTube API quota exceeded. Please try again tomorrow.",
      };
    }

    return {
      success: false,
      error: "Failed to search videos. Please try again.",
    };
  }
}

export async function generatePlaylist(
  videos: VideoResult[],
  title: string,
  privacy: "public" | "unlisted" | "private"
): Promise<{ success: true; playlist: PlaylistResult } | { success: false; error: string }> {
  try {
    const session = await auth();

    if (!session?.accessToken) {
      return {
        success: false,
        error: "Not authenticated. Please sign in again.",
      };
    }

    if (session.error === "RefreshAccessTokenError") {
      return {
        success: false,
        error: "Session expired. Please sign in again.",
      };
    }

    if (videos.length === 0) {
      return { success: false, error: "No videos selected" };
    }

    // Create the playlist
    const playlist = await createPlaylist(title, privacy, session.accessToken);

    // Add videos to the playlist
    let addedCount = 0;
    const errors: string[] = [];

    for (const video of videos) {
      try {
        await addVideoToPlaylist(playlist.id, video.id, session.accessToken);
        addedCount++;
      } catch (error) {
        console.error(`Failed to add video ${video.id}:`, error);
        errors.push(video.title);
      }
    }

    // Calculate total duration
    const totalDuration = videos.reduce((sum, v) => sum + v.duration, 0);

    const result: PlaylistResult = {
      id: playlist.id,
      title,
      url: playlist.url,
      videoCount: addedCount,
      totalDuration: Math.round(totalDuration / 60), // Convert to minutes
    };

    return { success: true, playlist: result };
  } catch (error) {
    console.error("Error creating playlist:", error);

    if (error instanceof Error) {
      if (error.message.includes("quota")) {
        return {
          success: false,
          error: "YouTube API quota exceeded. Please try again tomorrow.",
        };
      }
      if (error.message.includes("invalid_grant") || error.message.includes("Token")) {
        return {
          success: false,
          error: "Session expired. Please sign in again.",
        };
      }
    }

    return {
      success: false,
      error: "Failed to create playlist. Please try again.",
    };
  }
}
