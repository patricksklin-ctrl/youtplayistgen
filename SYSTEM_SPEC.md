# YouTube Playlist Generator - System Specification

## 1. Project Overview

A modern web application that allows users to automatically generate YouTube playlists based on search criteria. Users authenticate with their Google account, specify search parameters (keywords, recency, views, language, duration), and the app creates a playlist directly in their YouTube account.

### Goals
- Simple, intuitive UI for playlist generation
- Secure Google OAuth 2.0 authentication
- Efficient YouTube API quota usage
- Cloud-deployable (Vercel)
- No database dependency

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Shadcn/UI |
| Forms | React Hook Form + Zod |
| Authentication | NextAuth.js v5 (Auth.js) |
| YouTube API | googleapis (official SDK) |
| Deployment | Vercel |

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
├─────────────────────────────────────────────────────────────┤
│  Next.js App Router                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Pages      │  │  Components │  │  Client Hooks       │  │
│  │  - /        │  │  - Form     │  │  - usePlaylistGen   │  │
│  │  - /create  │  │  - Preview  │  │                     │  │
│  │  - /success │  │  - Results  │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Server Layer                                                │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │  Auth.js (NextAuth) │  │  Server Actions             │   │
│  │  - Google OAuth     │  │  - searchVideos()           │   │
│  │  - Token Management │  │  - createPlaylist()         │   │
│  │  - Session Handling │  │  - addVideosToPlaylist()    │   │
│  └─────────────────────┘  └─────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  External APIs                                               │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │  Google OAuth 2.0   │  │  YouTube Data API v3        │   │
│  │  - Authentication   │  │  - search.list              │   │
│  │  - Authorization    │  │  - videos.list              │   │
│  └─────────────────────┘  │  - playlists.insert         │   │
│                           │  - playlistItems.insert     │   │
│                           └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Authentication Flow

### OAuth 2.0 Implementation with NextAuth.js v5

```
User clicks "Sign in with Google"
         │
         ▼
┌─────────────────────────────┐
│  NextAuth redirects to      │
│  Google OAuth consent       │
│  Scopes:                    │
│  - openid                   │
│  - email                    │
│  - profile                  │
│  - youtube (write playlists)│
└─────────────────────────────┘
         │
         ▼
User grants permissions
         │
         ▼
┌─────────────────────────────┐
│  Google returns auth code   │
│  NextAuth exchanges for:    │
│  - access_token             │
│  - refresh_token            │
│  - id_token                 │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Tokens stored in:          │
│  - HTTP-only secure cookie  │
│  - Encrypted JWT session    │
│  NEVER exposed to client JS │
└─────────────────────────────┘
```

### Required Google OAuth Scopes
```typescript
const scopes = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/youtube"  // Full YouTube access for playlist creation
];
```

### Token Refresh Strategy
- Access tokens expire in 1 hour
- NextAuth automatically refreshes using refresh_token
- If refresh fails, user must re-authenticate

---

## 5. Data Models

### Search Criteria (Form Input)
```typescript
interface SearchCriteria {
  keywords: string;                    // Required: search query
  recency: {
    value: number;                     // e.g., 7
    unit: "days" | "weeks" | "months"; // e.g., "days"
  };
  minViews: number;                    // Minimum view count
  language: string;                    // ISO 639-1 code (e.g., "en")
  duration: {
    min: number;                       // Minimum duration in minutes
    max: number;                       // Maximum duration in minutes
  };
  target: {
    type: "videos" | "minutes";        // Target type
    value: number;                     // Target count
  };
  playlistTitle: string;               // Name for created playlist
  playlistPrivacy: "public" | "unlisted" | "private";
}
```

### Video Result
```typescript
interface VideoResult {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: number;
  duration: number;        // Duration in seconds
  durationFormatted: string; // e.g., "12:34"
}
```

### Playlist Creation Result
```typescript
interface PlaylistResult {
  id: string;
  title: string;
  url: string;             // https://www.youtube.com/playlist?list={id}
  videoCount: number;
  totalDuration: number;   // Total duration in minutes
}
```

---

## 6. API Design

### Server Actions (Recommended Approach)

Using Next.js Server Actions for type-safe, secure server-side operations.

#### `searchVideos(criteria: SearchCriteria): Promise<VideoResult[]>`
1. Calculate `publishedAfter` from recency
2. Call `youtube.search.list` with keywords, publishedAfter, relevanceLanguage
3. Extract video IDs from results
4. Call `youtube.videos.list` to get statistics (views) and contentDetails (duration)
5. Filter by minViews and duration range
6. Sort by relevance/views
7. Return filtered results

#### `createPlaylist(videos: VideoResult[], criteria: SearchCriteria): Promise<PlaylistResult>`
1. Get user's access token from session
2. Call `youtube.playlists.insert` to create playlist
3. Batch call `youtube.playlistItems.insert` for each video
4. Return playlist URL and stats

### API Route Alternative (for progress streaming)
`POST /api/generate-playlist` - For cases where streaming progress updates is needed

---

## 7. YouTube API Quota Management

### Quota Costs (per request)
| Operation | Cost |
|-----------|------|
| search.list | 100 units |
| videos.list | 1 unit |
| playlists.insert | 50 units |
| playlistItems.insert | 50 units |

### Daily Limit: 10,000 units

### Optimization Strategies

1. **Batch Video Details**
   - Fetch up to 50 video IDs per `videos.list` call
   - Cost: 1 unit for 50 videos vs 50 units individually

2. **Limit Search Results**
   - Max 50 results per search (maxResults=50)
   - Use pagination only if needed

3. **Client-Side Filtering**
   - Filter views/duration after fetching details
   - Reduces need for multiple searches

4. **Estimated Quota per Playlist Generation**
   ```
   1 search.list (100) + 1 videos.list (1) + 1 playlists.insert (50) +
   20 playlistItems.insert (1000) = ~1,151 units

   Allows ~8 playlist generations per day with free quota
   ```

5. **Caching Strategy**
   - Cache search results for 5 minutes (in-memory or unstable_cache)
   - Same search criteria returns cached results
   - Reduces redundant API calls during form adjustments

---

## 8. UI/UX Design

### Page Structure

```
/                    → Landing page (unauthenticated)
/create              → Playlist creation form (authenticated)
/create/preview      → Preview selected videos (optional step)
/success             → Success page with playlist link
```

### Component Hierarchy

```
app/
├── layout.tsx           → Root layout with providers
├── page.tsx             → Landing/login page
├── create/
│   ├── page.tsx         → Main form page
│   └── loading.tsx      → Loading skeleton
├── success/
│   └── page.tsx         → Success with playlist link
└── components/
    ├── ui/              → Shadcn components
    ├── auth/
    │   ├── login-button.tsx
    │   └── user-menu.tsx
    ├── playlist/
    │   ├── search-form.tsx
    │   ├── video-preview-card.tsx
    │   ├── video-preview-list.tsx
    │   ├── generation-progress.tsx
    │   └── playlist-result.tsx
    └── layout/
        ├── header.tsx
        └── footer.tsx
```

### Form Fields (Shadcn/UI Components)

| Field | Component | Validation |
|-------|-----------|------------|
| Keywords | Input | Required, 3-100 chars |
| Recency Value | Input (number) | 1-365 |
| Recency Unit | Select | days/weeks/months |
| Min Views | Input (number) | 0-1B |
| Language | Select | ISO 639-1 codes |
| Min Duration | Input (number) | 0-600 minutes |
| Max Duration | Input (number) | > min, ≤600 |
| Target Type | RadioGroup | videos/minutes |
| Target Value | Input (number) | 1-50 videos or 1-500 minutes |
| Playlist Title | Input | Required, 1-150 chars |
| Privacy | Select | public/unlisted/private |

### User Flow

```
1. Landing Page
   ├── Hero section explaining the app
   ├── "Sign in with Google" button
   └── Feature highlights

2. Create Page (after auth)
   ├── Form with all criteria fields
   ├── "Search Videos" button
   └── Loading state with skeleton

3. Preview Step (inline or modal)
   ├── Grid/list of matching videos
   ├── Checkboxes to include/exclude
   ├── Running total (videos/minutes)
   └── "Create Playlist" button

4. Generation Progress
   ├── Progress bar
   ├── Status messages
   └── Cancel option

5. Success Page
   ├── Playlist thumbnail/preview
   ├── Direct link to YouTube playlist
   ├── Stats (video count, total duration)
   └── "Create Another" button
```

### Responsive Breakpoints
- Mobile: < 640px (single column)
- Tablet: 640-1024px (two columns for form)
- Desktop: > 1024px (sidebar preview)

---

## 9. Error Handling

### Error Categories

1. **Authentication Errors**
   - Token expired → Redirect to re-auth
   - Insufficient scopes → Show permissions dialog
   - Account suspended → Display message

2. **API Errors**
   - Quota exceeded → Show friendly message, suggest retry tomorrow
   - Rate limited → Implement exponential backoff
   - Network errors → Retry with timeout

3. **Validation Errors**
   - Form validation → Inline error messages (Zod)
   - No results found → Suggest broadening criteria

4. **YouTube-Specific Errors**
   - Playlist creation failed → Display API error
   - Video unavailable → Skip and continue

### Error Display
- Toast notifications for transient errors
- Inline messages for form validation
- Full-page error for critical failures

---

## 10. Security Considerations

### Token Security
- [ ] Access tokens stored in HTTP-only cookies
- [ ] Refresh tokens encrypted at rest
- [ ] No tokens exposed to client JavaScript
- [ ] CSRF protection via NextAuth

### API Key Security
- [ ] YouTube Data API key in environment variables
- [ ] Never bundled in client code
- [ ] Restricted to specific APIs in Google Console

### Input Validation
- [ ] All form inputs validated with Zod
- [ ] Server-side validation before API calls
- [ ] Sanitize user input for playlist titles

### Rate Limiting
- [ ] Implement per-user rate limiting
- [ ] Prevent quota abuse

---

## 11. Environment Variables

```env
# .env.local (NEVER commit this file)

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-min-32-chars

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# YouTube Data API
YOUTUBE_API_KEY=your-youtube-api-key
```

### Vercel Deployment
1. Go to Project Settings → Environment Variables
2. Add all variables above
3. Set `NEXTAUTH_URL` to your production domain

---

## 12. Project Structure

```
youtplayistgen/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── create/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── success/
│   │   └── page.tsx
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   └── actions/
│       ├── youtube.ts          # Server actions for YouTube API
│       └── playlist.ts         # Playlist creation logic
├── components/
│   ├── ui/                     # Shadcn components
│   ├── auth/
│   │   ├── login-button.tsx
│   │   ├── logout-button.tsx
│   │   └── user-menu.tsx
│   ├── playlist/
│   │   ├── search-form.tsx
│   │   ├── video-card.tsx
│   │   ├── video-list.tsx
│   │   ├── progress-indicator.tsx
│   │   └── result-card.tsx
│   └── layout/
│       ├── header.tsx
│       └── footer.tsx
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   ├── youtube.ts              # YouTube API client
│   ├── utils.ts                # Utility functions
│   └── validations.ts          # Zod schemas
├── types/
│   └── index.ts                # TypeScript interfaces
├── hooks/
│   └── use-playlist-generator.ts
├── public/
│   └── ...
├── .env.local                  # Environment variables (gitignored)
├── .env.example                # Template for env vars
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 13. Key Implementation Decisions

### Decision 1: Server Actions vs API Routes
**Choice: Server Actions (primary) + API Route (streaming)**
- Server Actions for simple request/response (search, create)
- API Route with SSE for real-time progress updates during playlist creation

### Decision 2: State Management
**Choice: React Server Components + URL State**
- No global state library needed
- Form state in React Hook Form
- Search results passed as props
- Use URL params for shareable filter states

### Decision 3: Preview Step
**Choice: Inline preview (not separate page)**
- Videos appear below form after search
- Reduces navigation complexity
- Better UX for iterating on criteria

### Decision 4: Video Selection Algorithm
**Choice: Greedy selection with scoring**
```typescript
function selectVideos(videos: VideoResult[], target: Target): VideoResult[] {
  // Score = views * recency_factor * relevance_position
  const scored = videos.map((v, i) => ({
    ...v,
    score: calculateScore(v, i)
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Greedy selection until target reached
  const selected: VideoResult[] = [];
  let total = 0;

  for (const video of scored) {
    if (target.type === "videos" && selected.length >= target.value) break;
    if (target.type === "minutes" && total >= target.value * 60) break;

    selected.push(video);
    total += video.duration;
  }

  return selected;
}
```

### Decision 5: Error Recovery
**Choice: Partial success with reporting**
- If some videos fail to add, continue with others
- Report partial success with list of failures
- User can manually add failed videos

---

## 14. Development Phases

### Phase 1: Foundation
- [ ] Initialize Next.js project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Install and configure Shadcn/UI
- [ ] Set up project structure

### Phase 2: Authentication
- [ ] Configure NextAuth.js with Google provider
- [ ] Implement login/logout UI
- [ ] Handle token storage and refresh
- [ ] Protect routes

### Phase 3: Core Features
- [ ] Build search form with validation
- [ ] Implement YouTube search server action
- [ ] Implement video details fetching
- [ ] Build video preview components

### Phase 4: Playlist Creation
- [ ] Implement playlist creation logic
- [ ] Build progress indicator
- [ ] Create success page
- [ ] Handle errors gracefully

### Phase 5: Polish & Deploy
- [ ] Add loading states and skeletons
- [ ] Implement caching
- [ ] Test quota usage
- [ ] Deploy to Vercel
- [ ] Write documentation

---

## 15. Testing Strategy

### Unit Tests
- Zod schema validation
- Video selection algorithm
- Duration/date calculations

### Integration Tests
- OAuth flow (mocked)
- YouTube API calls (mocked)
- Form submission flow

### E2E Tests (optional)
- Full user journey with Playwright
- Requires test Google account

---

## 16. Future Enhancements (Out of Scope)

- Save search presets
- Scheduled playlist updates
- Multiple search queries combined
- Import existing playlist for modification
- Analytics dashboard
- Sharing generated playlists

---

## Appendix A: YouTube API Reference

### search.list
```typescript
youtube.search.list({
  part: ["snippet"],
  q: keywords,
  type: ["video"],
  maxResults: 50,
  publishedAfter: isoDate,
  relevanceLanguage: languageCode,
  videoDuration: "medium", // short/medium/long
  order: "relevance"
});
```

### videos.list
```typescript
youtube.videos.list({
  part: ["snippet", "statistics", "contentDetails"],
  id: videoIds // comma-separated, max 50
});
```

### playlists.insert
```typescript
youtube.playlists.insert({
  part: ["snippet", "status"],
  requestBody: {
    snippet: {
      title: playlistTitle,
      description: "Generated by YouTube Playlist Generator"
    },
    status: {
      privacyStatus: privacy
    }
  }
});
```

### playlistItems.insert
```typescript
youtube.playlistItems.insert({
  part: ["snippet"],
  requestBody: {
    snippet: {
      playlistId: playlistId,
      resourceId: {
        kind: "youtube#video",
        videoId: videoId
      }
    }
  }
});
```

---

## Appendix B: Zod Validation Schema

```typescript
import { z } from "zod";

export const searchCriteriaSchema = z.object({
  keywords: z.string().min(3).max(100),
  recency: z.object({
    value: z.number().int().min(1).max(365),
    unit: z.enum(["days", "weeks", "months"])
  }),
  minViews: z.number().int().min(0).max(1_000_000_000),
  language: z.string().length(2),
  duration: z.object({
    min: z.number().int().min(0).max(600),
    max: z.number().int().min(1).max(600)
  }).refine(d => d.max > d.min, "Max must be greater than min"),
  target: z.object({
    type: z.enum(["videos", "minutes"]),
    value: z.number().int().min(1).max(500)
  }),
  playlistTitle: z.string().min(1).max(150),
  playlistPrivacy: z.enum(["public", "unlisted", "private"])
});
```

---

*Document Version: 1.0*
*Last Updated: 2026-01-29*
