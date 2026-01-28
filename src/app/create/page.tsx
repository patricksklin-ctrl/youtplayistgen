"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SearchForm } from "@/components/playlist/search-form";
import { VideoGrid } from "@/components/playlist/video-grid";
import { SelectionSummary } from "@/components/playlist/selection-summary";
import { searchAndFilterVideos, generatePlaylist } from "@/app/actions/youtube";
import type { VideoResult } from "@/types";
import type { SearchCriteriaInput } from "@/lib/validations";

export default function CreatePage() {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<SearchCriteriaInput | null>(null);

  const handleSearch = async (data: SearchCriteriaInput) => {
    setIsSearching(true);
    setFormData(data);

    try {
      const result = await searchAndFilterVideos(data);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setVideos(result.videos);
      setSelectedIds(new Set(result.videos.map((v) => v.id)));
      toast.success(`Found ${result.videos.length} videos`);
    } catch (error) {
      toast.error("Failed to search videos. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleVideo = (videoId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(videos.map((v) => v.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleCreatePlaylist = async () => {
    if (!formData || selectedIds.size === 0) return;

    setIsCreating(true);

    try {
      const selectedVideos = videos.filter((v) => selectedIds.has(v.id));
      const result = await generatePlaylist(
        selectedVideos,
        formData.playlistTitle,
        formData.playlistPrivacy
      );

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      // Store result in sessionStorage for success page
      sessionStorage.setItem("playlistResult", JSON.stringify(result.playlist));
      router.push("/success");
    } catch (error) {
      toast.error("Failed to create playlist. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-2">Create a Playlist</h1>
        <p className="text-muted-foreground">
          Search for videos and generate a playlist based on your criteria.
        </p>
      </div>

      <div className="grid lg:grid-cols-[400px_1fr] gap-8">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <SearchForm onSubmit={handleSearch} isLoading={isSearching} />
        </aside>

        <section>
          {videos.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Search Results ({videos.length})
                </h2>
              </div>
              <VideoGrid
                videos={videos}
                selectedIds={selectedIds}
                onToggleVideo={handleToggleVideo}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
              <div className="text-center text-muted-foreground">
                <svg
                  className="mx-auto h-12 w-12 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p>Fill out the form and click "Search Videos" to find videos</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {videos.length > 0 && (
        <SelectionSummary
          videos={videos}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onCreatePlaylist={handleCreatePlaylist}
          isCreating={isCreating}
        />
      )}
    </div>
  );
}
