# YouTube Playlist Generator

Automatically create YouTube playlists based on search criteria. Search by keywords, filter by views, duration, and recency, then generate a playlist directly in your YouTube account.

## Features

- **Smart Search**: Find videos by keywords, minimum views, language, and duration range
- **Flexible Targeting**: Set your goal by number of videos or total watch time
- **One-Click Create**: Preview selected videos and create a playlist directly in your YouTube account
- **Secure Authentication**: Google OAuth 2.0 with secure token handling

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Forms**: React Hook Form + Zod
- **Authentication**: NextAuth.js v5
- **API**: YouTube Data API v3

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. A Google Cloud Console project with:
   - OAuth 2.0 credentials configured
   - YouTube Data API v3 enabled

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/patricksklin-ctrl/youtplayistgen.git
   cd youtplayistgen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment example file:
   ```bash
   cp .env.example .env.local
   ```

4. Configure your environment variables in `.env.local`:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-random-secret-min-32-chars-here

   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   YOUTUBE_API_KEY=your-youtube-api-key
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **YouTube Data API v3**
4. Create **OAuth 2.0 Client ID** credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Create an **API Key** for YouTube Data API
6. Copy the credentials to your `.env.local` file

### Required OAuth Scopes

The app requests these Google OAuth scopes:
- `openid` - OpenID Connect
- `email` - User email
- `profile` - User profile
- `https://www.googleapis.com/auth/youtube` - YouTube account access (for playlist creation)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add your environment variables in Project Settings
4. Update `NEXTAUTH_URL` to your production domain
5. Add production redirect URI to Google Cloud Console:
   `https://your-domain.vercel.app/api/auth/callback/google`

## API Quota

The YouTube Data API has a daily quota of 10,000 units. Each playlist generation uses approximately:
- `search.list`: 100 units
- `videos.list`: 1 unit (batched)
- `playlists.insert`: 50 units
- `playlistItems.insert`: 50 units per video

This allows roughly **8 playlist generations per day** (20 videos each) with the free quota.

## License

MIT
