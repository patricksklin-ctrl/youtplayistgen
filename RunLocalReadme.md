# Step-by-Step Local Setup Guide

## Step 1: Prerequisites

Make sure you have these installed:
- **Node.js 18+** - Check with `node --version`
- **npm** - Check with `npm --version`
- A **Google account** for OAuth setup

---

## Step 2: Clone and Install Dependencies

```bash
git clone https://github.com/patricksklin-ctrl/youtplayistgen.git
cd youtplayistgen
npm install
```

---

## Step 3: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. **Create a new project:**
   - Click the project dropdown at the top
   - Click "New Project"
   - Name: `YouTube Playlist Generator`
   - Click "Create"

3. **Wait for the project to be created**, then select it from the dropdown

---

## Step 4: Enable YouTube Data API

1. In Google Cloud Console, go to **APIs & Services > Library**
   - Or direct link: https://console.cloud.google.com/apis/library

2. Search for `YouTube Data API v3`

3. Click on it and click **"Enable"**

---

## Step 5: Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
   - Or direct link: https://console.cloud.google.com/apis/credentials

2. Click **"+ Create Credentials" > "OAuth client ID"**

3. If prompted, configure the **OAuth consent screen** first:
   - User Type: **External**
   - App name: `YouTube Playlist Generator`
   - User support email: Your email
   - Developer contact email: Your email
   - Click **"Save and Continue"** through the remaining steps
   - Add yourself as a **test user** (your Gmail address)

4. Now create the OAuth client:
   - Application type: **Web application**
   - Name: `YouTube Playlist Generator Web`
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
   - Click **"Create"**

5. **Copy the Client ID and Client Secret** - you'll need these

---

## Step 6: Create API Key

1. Still in **APIs & Services > Credentials**

2. Click **"+ Create Credentials" > "API Key"**

3. **Copy the API key**

4. (Optional but recommended) Click "Edit API key" and restrict it:
   - Under "API restrictions", select "Restrict key"
   - Select "YouTube Data API v3"
   - Click "Save"

---

## Step 7: Configure Environment Variables

1. Create the `.env.local` file:

```bash
cp .env.example .env.local
```

2. Open `.env.local` and fill in the values:

```env
# Authentication (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-min-32-chars-here

# Google OAuth (from Step 5)
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx

# YouTube Data API (from Step 6)
YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
```

3. Generate a random secret for `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

Copy the output and paste it as `NEXTAUTH_SECRET`

---

## Step 8: Run the Development Server

```bash
npm run dev
```

You should see:

```
▲ Next.js 16.1.6 (Turbopack)
- Local:   http://localhost:3000
```

---

## Step 9: Test the Application

1. Open **http://localhost:3000** in your browser

2. Click **"Sign in with Google"**

3. Select your Google account (must be added as a test user in Step 5)

4. Grant permissions for YouTube access

5. You'll be redirected to the **Create Playlist** page

6. Fill out the form:
   - Keywords: e.g., "react tutorial"
   - Published within: 30 days
   - Language: English
   - Min views: 1000
   - Duration: 1-30 minutes
   - Target: 10 videos
   - Playlist title: "My Test Playlist"
   - Privacy: Unlisted

7. Click **"Search Videos"**

8. Select the videos you want

9. Click **"Create Playlist"**

10. You'll see a success page with a link to your new YouTube playlist

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Access blocked" on Google sign-in | Make sure your email is added as a test user in OAuth consent screen |
| "redirect_uri_mismatch" error | Verify the redirect URI in Google Console is exactly `http://localhost:3000/api/auth/callback/google` |
| "API key not valid" | Check that YouTube Data API is enabled for your project |
| "Quota exceeded" | You've hit the daily 10,000 unit limit. Wait 24 hours. |
| Videos not loading | Check browser console for errors; verify API key is correct |

---

## Quick Reference: Required Values

| Variable | Where to get it |
|----------|-----------------|
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console > Credentials > OAuth 2.0 Client |
| `GOOGLE_CLIENT_SECRET` | Same as above |
| `YOUTUBE_API_KEY` | Google Cloud Console > Credentials > API Keys |

---

## Next Steps

Once running locally, you can:
- Modify the search form in `src/components/playlist/search-form.tsx`
- Adjust video filtering logic in `src/lib/youtube.ts`
- Customize the UI components in `src/components/`

For deployment to Vercel, see the main [README.md](./README.md).
