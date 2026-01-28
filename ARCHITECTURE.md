# System Architecture Document

## YouTube Playlist Generator

---

## 1. High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         Browser (React)                               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Landing   │  │   Create    │  │   Preview   │  │   Success   │  │  │
│  │  │    Page     │  │    Form     │  │    List     │  │    Page     │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                            APPLICATION LAYER                                │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      Next.js App Router (Vercel)                      │  │
│  │                                                                       │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐   │  │
│  │  │  React Server   │  │  Server Actions │  │    API Routes       │   │  │
│  │  │   Components    │  │                 │  │  (Auth, Streaming)  │   │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘   │  │
│  │                                                                       │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐   │  │
│  │  │   NextAuth.js   │  │  YouTube Service│  │   Validation Layer  │   │  │
│  │  │   (Auth.js v5)  │  │                 │  │       (Zod)         │   │  │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS
                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                            EXTERNAL SERVICES                                │
│  ┌─────────────────────────┐          ┌─────────────────────────────────┐  │
│  │    Google OAuth 2.0     │          │      YouTube Data API v3        │  │
│  │  ┌───────────────────┐  │          │  ┌───────────────────────────┐  │  │
│  │  │ Authorization     │  │          │  │ search.list               │  │  │
│  │  │ Token Exchange    │  │          │  │ videos.list               │  │  │
│  │  │ Token Refresh     │  │          │  │ playlists.insert          │  │  │
│  │  └───────────────────┘  │          │  │ playlistItems.insert      │  │  │
│  └─────────────────────────┘          │  └───────────────────────────┘  │  │
│                                       └─────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture

### 2.1 Frontend Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Component Hierarchy                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  RootLayout                                                          │
│  ├── ThemeProvider (dark/light mode)                                │
│  ├── SessionProvider (NextAuth)                                     │
│  ├── Header                                                          │
│  │   ├── Logo                                                        │
│  │   ├── Navigation                                                  │
│  │   └── UserMenu / LoginButton                                      │
│  │                                                                   │
│  ├── [Page Content]                                                  │
│  │   │                                                               │
│  │   ├── LandingPage (/)                                            │
│  │   │   ├── HeroSection                                            │
│  │   │   ├── FeatureCards                                           │
│  │   │   └── CallToAction                                           │
│  │   │                                                               │
│  │   ├── CreatePage (/create)                                       │
│  │   │   ├── SearchForm                                             │
│  │   │   │   ├── KeywordsInput                                      │
│  │   │   │   ├── RecencySelector                                    │
│  │   │   │   ├── FiltersGroup                                       │
│  │   │   │   │   ├── MinViewsInput                                  │
│  │   │   │   │   ├── LanguageSelect                                 │
│  │   │   │   │   └── DurationRange                                  │
│  │   │   │   ├── TargetSelector                                     │
│  │   │   │   └── PlaylistSettings                                   │
│  │   │   │                                                          │
│  │   │   ├── VideoPreviewSection                                    │
│  │   │   │   ├── VideoGrid                                          │
│  │   │   │   │   └── VideoCard[]                                    │
│  │   │   │   ├── SelectionSummary                                   │
│  │   │   │   └── CreatePlaylistButton                               │
│  │   │   │                                                          │
│  │   │   └── GenerationProgress                                     │
│  │   │       ├── ProgressBar                                        │
│  │   │       └── StatusMessage                                      │
│  │   │                                                               │
│  │   └── SuccessPage (/success)                                     │
│  │       ├── PlaylistCard                                           │
│  │       ├── StatsDisplay                                           │
│  │       └── ActionButtons                                          │
│  │                                                                   │
│  └── Footer                                                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Server Components vs Client Components

```
┌─────────────────────────────────────┬─────────────────────────────────────┐
│        Server Components (RSC)       │         Client Components           │
├─────────────────────────────────────┼─────────────────────────────────────┤
│                                     │                                     │
│  • RootLayout                       │  • SearchForm ('use client')        │
│  • Header (static parts)            │  • VideoCard (interactions)         │
│  • LandingPage                      │  • UserMenu (dropdown state)        │
│  • SuccessPage                      │  • GenerationProgress (live)        │
│  • Footer                           │  • ThemeToggle                      │
│                                     │  • Toast notifications              │
│  Benefits:                          │                                     │
│  - Zero client JS                   │  Benefits:                          │
│  - Direct data fetching             │  - User interactions                │
│  - SEO optimized                    │  - Form state management            │
│  - Faster initial load              │  - Real-time updates                │
│                                     │                                     │
└─────────────────────────────────────┴─────────────────────────────────────┘
```

---

## 3. Authentication Architecture

### 3.1 OAuth 2.0 Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User    │     │  Next.js │     │  Google  │     │ YouTube  │
│ Browser  │     │  Server  │     │  OAuth   │     │   API    │
└────┬─────┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
     │                │                │                │
     │ 1. Click Login │                │                │
     │───────────────>│                │                │
     │                │                │                │
     │ 2. Redirect to Google          │                │
     │<───────────────│                │                │
     │                │                │                │
     │ 3. Authorization Request        │                │
     │────────────────────────────────>│                │
     │                │                │                │
     │ 4. User Consents (scopes)       │                │
     │<────────────────────────────────│                │
     │                │                │                │
     │ 5. Auth Code Callback           │                │
     │───────────────>│                │                │
     │                │                │                │
     │                │ 6. Exchange Code for Tokens     │
     │                │───────────────>│                │
     │                │                │                │
     │                │ 7. access_token + refresh_token │
     │                │<───────────────│                │
     │                │                │                │
     │ 8. Set Session Cookie           │                │
     │<───────────────│                │                │
     │                │                │                │
     │ 9. API Calls with access_token  │                │
     │                │────────────────────────────────>│
     │                │                │                │
     │                │ 10. YouTube Data                │
     │                │<────────────────────────────────│
     │                │                │                │
```

### 3.2 Session & Token Management

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Token Storage Strategy                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    HTTP-Only Cookie                          │    │
│  │  ┌─────────────────────────────────────────────────────┐    │    │
│  │  │  Encrypted JWT Session                               │    │    │
│  │  │  {                                                   │    │    │
│  │  │    user: { name, email, image },                     │    │    │
│  │  │    accessToken: "ya29.xxx..." (encrypted),           │    │    │
│  │  │    refreshToken: "1//xxx..." (encrypted),            │    │    │
│  │  │    accessTokenExpires: 1706500000000                 │    │    │
│  │  │  }                                                   │    │    │
│  │  └─────────────────────────────────────────────────────┘    │    │
│  │                                                              │    │
│  │  Cookie Attributes:                                          │    │
│  │  • httpOnly: true    (no JS access)                         │    │
│  │  • secure: true      (HTTPS only in production)             │    │
│  │  • sameSite: "lax"   (CSRF protection)                      │    │
│  │  • path: "/"                                                 │    │
│  │  • maxAge: 30 days                                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Token Refresh Flow:                                                 │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  if (accessTokenExpires < Date.now()) {                     │    │
│  │    newTokens = await refreshAccessToken(refreshToken);      │    │
│  │    updateSession(newTokens);                                │    │
│  │  }                                                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Data Flow Architecture

### 4.1 Playlist Generation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Playlist Generation Pipeline                         │
└─────────────────────────────────────────────────────────────────────────────┘

Step 1: User Input
┌─────────────────┐
│  SearchForm     │ ─── Zod Validation ───> SearchCriteria
└─────────────────┘

Step 2: Video Search
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ SearchCriteria  │────>│  searchVideos() │────>│ YouTube API     │
│                 │     │  Server Action  │     │ search.list     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                               ┌────────────────────────┘
                               ▼
                        Video IDs (max 50)

Step 3: Fetch Details
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Video IDs     │────>│  getVideoDetails│────>│ YouTube API     │
│   (batched)     │     │  Server Action  │     │ videos.list     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                               ┌────────────────────────┘
                               ▼
                        VideoResult[] (with stats)

Step 4: Filter & Sort
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ VideoResult[]   │────>│ filterVideos()  │────>│ Filtered &      │
│                 │     │ (client-side)   │     │ Sorted Videos   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        Apply: minViews, duration, language

Step 5: Select Videos
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Filtered Videos │────>│ selectVideos()  │────>│ Selected Videos │
│                 │     │ (greedy algo)   │     │ (meets target)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        Until: target videos OR target minutes

Step 6: Create Playlist
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Selected Videos │────>│ createPlaylist()│────>│ YouTube API     │
│ + User Token    │     │ Server Action   │     │ playlists.insert│
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                               ┌────────────────────────┘
                               ▼
                        Playlist ID

Step 7: Add Videos
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Playlist ID +   │────>│ addVideos()     │────>│ YouTube API     │
│ Video IDs       │     │ Server Action   │     │ playlistItems   │
└─────────────────┘     └─────────────────┘     │ .insert (loop)  │
                                                └─────────────────┘
                                                        │
                               ┌────────────────────────┘
                               ▼
                        PlaylistResult { url, stats }
```

### 4.2 State Management

```
┌─────────────────────────────────────────────────────────────────────┐
│                        State Architecture                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     URL State (nuqs)                         │    │
│  │  • Search criteria preserved in URL                          │    │
│  │  • Shareable/bookmarkable configurations                     │    │
│  │  • Browser back/forward support                              │    │
│  │  Example: /create?keywords=react&minViews=10000&lang=en      │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                  React Hook Form State                       │    │
│  │  • Form field values                                         │    │
│  │  • Validation errors                                         │    │
│  │  • Dirty/touched tracking                                    │    │
│  │  • Submit state                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                  Component Local State                       │    │
│  │  • Video selection (useState)                                │    │
│  │  • Loading states (useTransition)                            │    │
│  │  • UI toggles (modals, accordions)                           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                   Server State (RSC)                         │    │
│  │  • Session data (NextAuth)                                   │    │
│  │  • Search results (Server Action response)                   │    │
│  │  • Playlist result (passed via redirect/props)               │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. API Architecture

### 5.1 Server Actions

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Server Actions                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  app/actions/youtube.ts                                             │
│  ├── searchVideos(criteria: SearchCriteria)                         │
│  │   └── Returns: Promise<VideoResult[]>                            │
│  │                                                                   │
│  ├── getVideoDetails(videoIds: string[])                            │
│  │   └── Returns: Promise<VideoDetails[]>                           │
│  │                                                                   │
│  └── createPlaylistWithVideos(                                      │
│        videos: VideoResult[],                                       │
│        settings: PlaylistSettings                                   │
│      )                                                              │
│      └── Returns: Promise<PlaylistResult>                           │
│                                                                      │
│  Benefits of Server Actions:                                        │
│  • Type-safe end-to-end                                             │
│  • No API route boilerplate                                         │
│  • Automatic request deduplication                                  │
│  • Progressive enhancement                                          │
│  • Direct database/API access                                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 API Routes (for streaming)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    API Route: Progress Streaming                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  POST /api/playlist/generate                                        │
│                                                                      │
│  Request Body:                                                       │
│  {                                                                   │
│    videos: VideoResult[],                                           │
│    settings: PlaylistSettings                                       │
│  }                                                                   │
│                                                                      │
│  Response: Server-Sent Events (SSE)                                 │
│                                                                      │
│  event: progress                                                     │
│  data: { step: "creating_playlist", progress: 10 }                  │
│                                                                      │
│  event: progress                                                     │
│  data: { step: "adding_video", current: 1, total: 20, progress: 15 }│
│                                                                      │
│  event: progress                                                     │
│  data: { step: "adding_video", current: 20, total: 20, progress: 95}│
│                                                                      │
│  event: complete                                                     │
│  data: { playlistId: "PLxxx", url: "https://...", stats: {...} }    │
│                                                                      │
│  event: error                                                        │
│  data: { message: "Quota exceeded", code: "QUOTA_EXCEEDED" }        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. YouTube API Integration

### 6.1 API Client Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      YouTube Service Layer                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  lib/youtube.ts                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  YouTubeService                                              │    │
│  │  ├── constructor(apiKey: string, accessToken?: string)       │    │
│  │  │                                                           │    │
│  │  ├── search(params: SearchParams): Promise<SearchResult[]>   │    │
│  │  │   • Uses API key (no auth required)                       │    │
│  │  │   • Quota: 100 units                                      │    │
│  │  │                                                           │    │
│  │  ├── getVideos(ids: string[]): Promise<Video[]>              │    │
│  │  │   • Uses API key (no auth required)                       │    │
│  │  │   • Batches up to 50 IDs per request                      │    │
│  │  │   • Quota: 1 unit per request                             │    │
│  │  │                                                           │    │
│  │  ├── createPlaylist(title, privacy): Promise<Playlist>       │    │
│  │  │   • Requires OAuth access token                           │    │
│  │  │   • Quota: 50 units                                       │    │
│  │  │                                                           │    │
│  │  └── addToPlaylist(playlistId, videoId): Promise<void>       │    │
│  │      • Requires OAuth access token                           │    │
│  │      • Quota: 50 units per video                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Quota Management

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Quota Budget Per Operation                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Daily Quota Limit: 10,000 units                                    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Single Playlist Generation (20 videos)                      │    │
│  │                                                              │    │
│  │  Operation              │ Units │ Count │ Subtotal          │    │
│  │  ──────────────────────────────────────────────────────────  │    │
│  │  search.list            │  100  │   1   │    100            │    │
│  │  videos.list (batch)    │    1  │   1   │      1            │    │
│  │  playlists.insert       │   50  │   1   │     50            │    │
│  │  playlistItems.insert   │   50  │  20   │  1,000            │    │
│  │  ──────────────────────────────────────────────────────────  │    │
│  │  TOTAL                  │       │       │  1,151 units      │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Maximum Generations Per Day: ~8 playlists (20 videos each)         │
│                                                                      │
│  Optimization Strategies:                                            │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  1. Batch video.list calls (50 IDs max per call)            │    │
│  │  2. Cache search results (5 min TTL)                        │    │
│  │  3. Limit search to 50 results (single page)                │    │
│  │  4. Client-side filtering (no extra API calls)              │    │
│  │  5. Rate limiting per user                                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Error Handling Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Error Handling Strategy                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Error Categories & Responses:                                       │
│                                                                      │
│  ┌─────────────────┬────────────────────┬────────────────────────┐  │
│  │ Category        │ Error Code         │ User Action            │  │
│  ├─────────────────┼────────────────────┼────────────────────────┤  │
│  │ Authentication  │ UNAUTHENTICATED    │ Redirect to login      │  │
│  │                 │ TOKEN_EXPIRED      │ Auto-refresh or login  │  │
│  │                 │ INSUFFICIENT_SCOPE │ Re-consent required    │  │
│  ├─────────────────┼────────────────────┼────────────────────────┤  │
│  │ Rate Limiting   │ QUOTA_EXCEEDED     │ Try again tomorrow     │  │
│  │                 │ RATE_LIMITED       │ Retry with backoff     │  │
│  ├─────────────────┼────────────────────┼────────────────────────┤  │
│  │ Validation      │ INVALID_INPUT      │ Fix form errors        │  │
│  │                 │ NO_RESULTS         │ Broaden search         │  │
│  ├─────────────────┼────────────────────┼────────────────────────┤  │
│  │ YouTube API     │ VIDEO_NOT_FOUND    │ Skip video, continue   │  │
│  │                 │ PLAYLIST_FAILED    │ Retry or contact support│ │
│  │                 │ FORBIDDEN          │ Check account status   │  │
│  ├─────────────────┼────────────────────┼────────────────────────┤  │
│  │ Network         │ NETWORK_ERROR      │ Check connection       │  │
│  │                 │ TIMEOUT            │ Retry                  │  │
│  └─────────────────┴────────────────────┴────────────────────────┘  │
│                                                                      │
│  Error Flow:                                                         │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │  try {                                                       │    │
│  │    result = await serverAction(data);                        │    │
│  │  } catch (error) {                                           │    │
│  │    if (error instanceof AppError) {                          │    │
│  │      // Known error - show appropriate UI                    │    │
│  │      toast.error(error.userMessage);                         │    │
│  │      if (error.code === 'UNAUTHENTICATED') redirect('/');    │    │
│  │    } else {                                                  │    │
│  │      // Unknown error - log and show generic message         │    │
│  │      console.error(error);                                   │    │
│  │      toast.error('Something went wrong. Please try again.'); │    │
│  │    }                                                         │    │
│  │  }                                                           │    │
│  │                                                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. Security Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Security Layers                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Layer 1: Transport Security                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  • HTTPS enforced (Vercel default)                          │    │
│  │  • HSTS headers                                              │    │
│  │  • TLS 1.3                                                   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Layer 2: Authentication & Authorization                            │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  • OAuth 2.0 with PKCE                                       │    │
│  │  • Scoped access (youtube scope only)                        │    │
│  │  • Token rotation on refresh                                 │    │
│  │  • Session validation on every request                       │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Layer 3: Token Security                                            │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  • HTTP-only cookies (no XSS access)                         │    │
│  │  • Encrypted JWT payload                                     │    │
│  │  • Secure + SameSite cookie attributes                       │    │
│  │  • Short-lived access tokens (1 hour)                        │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Layer 4: Input Validation                                          │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  • Zod schemas for all inputs                                │    │
│  │  • Server-side validation (never trust client)               │    │
│  │  • Sanitized output for XSS prevention                       │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Layer 5: API Security                                              │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  • API key restricted in Google Console                      │    │
│  │  • Environment variables (never in code)                     │    │
│  │  • Rate limiting per user/IP                                 │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Vercel Deployment                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                      Vercel Edge Network                     │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │    │
│  │  │   CDN   │  │   CDN   │  │   CDN   │  │   CDN   │        │    │
│  │  │  (US)   │  │  (EU)   │  │ (Asia)  │  │  (...)  │        │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │    │
│  │       │            │            │            │              │    │
│  │       └────────────┴────────────┴────────────┘              │    │
│  │                          │                                   │    │
│  │                          ▼                                   │    │
│  │  ┌─────────────────────────────────────────────────────┐    │    │
│  │  │              Serverless Functions                    │    │    │
│  │  │  • API Routes (/api/*)                              │    │    │
│  │  │  • Server Actions                                   │    │    │
│  │  │  • NextAuth handlers                                │    │    │
│  │  │  • Region: auto (closest to user)                   │    │    │
│  │  └─────────────────────────────────────────────────────┘    │    │
│  │                          │                                   │    │
│  │                          ▼                                   │    │
│  │  ┌─────────────────────────────────────────────────────┐    │    │
│  │  │               Static Assets                          │    │    │
│  │  │  • Pre-rendered pages                               │    │    │
│  │  │  • JS/CSS bundles                                   │    │    │
│  │  │  • Images, fonts                                    │    │    │
│  │  └─────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Environment Configuration:                                          │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Production     │ Preview        │ Development              │    │
│  │  ─────────────────────────────────────────────────────────  │    │
│  │  NEXTAUTH_URL   │ Auto-set       │ localhost:3000           │    │
│  │  = prod domain  │ = preview URL  │                          │    │
│  │                 │                │                          │    │
│  │  All secrets shared across environments in Vercel           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 10. File Structure

```
youtplayistgen/
├── app/
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Landing page
│   ├── globals.css                # Global styles + Tailwind
│   ├── loading.tsx                # Global loading UI
│   ├── error.tsx                  # Global error boundary
│   ├── not-found.tsx              # 404 page
│   │
│   ├── create/
│   │   ├── page.tsx               # Playlist creation page
│   │   └── loading.tsx            # Loading skeleton
│   │
│   ├── success/
│   │   └── page.tsx               # Success page with playlist link
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts       # NextAuth API route
│   │   └── playlist/
│   │       └── generate/
│   │           └── route.ts       # SSE endpoint for progress
│   │
│   └── actions/
│       ├── youtube.ts             # YouTube API server actions
│       └── auth.ts                # Auth-related server actions
│
├── components/
│   ├── ui/                        # Shadcn/UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── card.tsx
│   │   ├── progress.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   │
│   ├── auth/
│   │   ├── login-button.tsx       # Google sign-in button
│   │   ├── logout-button.tsx      # Sign out button
│   │   └── user-menu.tsx          # User dropdown menu
│   │
│   ├── playlist/
│   │   ├── search-form.tsx        # Main search/filter form
│   │   ├── video-card.tsx         # Single video preview
│   │   ├── video-grid.tsx         # Grid of video cards
│   │   ├── selection-summary.tsx  # Selected videos summary
│   │   ├── progress-display.tsx   # Generation progress UI
│   │   └── playlist-result.tsx    # Final playlist card
│   │
│   └── layout/
│       ├── header.tsx             # App header
│       ├── footer.tsx             # App footer
│       └── providers.tsx          # Context providers wrapper
│
├── lib/
│   ├── auth.ts                    # NextAuth configuration
│   ├── youtube.ts                 # YouTube API service
│   ├── utils.ts                   # Utility functions
│   └── constants.ts               # App constants
│
├── types/
│   ├── index.ts                   # Main type exports
│   ├── youtube.ts                 # YouTube API types
│   └── next-auth.d.ts             # NextAuth type extensions
│
├── schemas/
│   └── search.ts                  # Zod validation schemas
│
├── hooks/
│   ├── use-playlist-generator.ts  # Playlist generation hook
│   └── use-search-params.ts       # URL state hook
│
├── public/
│   ├── favicon.ico
│   └── og-image.png               # Social share image
│
├── .env.local                     # Local environment (gitignored)
├── .env.example                   # Environment template
├── next.config.js                 # Next.js configuration
├── tailwind.config.ts             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
├── components.json                # Shadcn/UI configuration
├── package.json
├── SYSTEM_SPEC.md                 # System specification
├── ARCHITECTURE.md                # This document
└── README.md                      # Project readme
```

---

## 11. Technology Decisions Summary

| Concern | Decision | Rationale |
|---------|----------|-----------|
| Framework | Next.js 14+ App Router | Modern React, server components, server actions |
| Auth | NextAuth.js v5 | Best-in-class Next.js auth, built-in Google provider |
| Styling | Tailwind CSS | Utility-first, rapid development, small bundle |
| Components | Shadcn/UI | Accessible, customizable, not a dependency |
| Forms | React Hook Form + Zod | Type-safe, performant, great DX |
| State | URL + Local state | Simple, shareable, no extra libraries |
| API Calls | Server Actions | Type-safe, secure, less boilerplate |
| Progress | SSE (API route) | Real-time updates without WebSocket complexity |
| Deployment | Vercel | Zero-config Next.js hosting, edge network |

---

*Document Version: 1.0*
*Last Updated: 2026-01-29*
