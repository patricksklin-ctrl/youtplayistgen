export interface SearchCriteria {
  keywords: string;
  recency: {
    value: number;
    unit: "days" | "weeks" | "months";
  };
  minViews: number;
  language: string;
  duration: {
    min: number;
    max: number;
  };
  target: {
    type: "videos" | "minutes";
    value: number;
  };
  playlistTitle: string;
  playlistPrivacy: "public" | "unlisted" | "private";
}

export interface VideoResult {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: number;
  duration: number;
  durationFormatted: string;
}

export interface PlaylistResult {
  id: string;
  title: string;
  url: string;
  videoCount: number;
  totalDuration: number;
}

export interface GenerationProgress {
  step: "searching" | "fetching_details" | "creating_playlist" | "adding_videos" | "complete" | "error";
  progress: number;
  message: string;
  current?: number;
  total?: number;
}
