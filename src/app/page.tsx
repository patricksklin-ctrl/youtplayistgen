import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/auth/login-button";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/create");
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <div className="mx-auto max-w-3xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            YouTube Playlist Generator
          </h1>
          <p className="text-xl text-muted-foreground">
            Automatically create YouTube playlists based on your search
            criteria. Search by keywords, filter by views, duration, and
            recency, then generate a playlist with one click.
          </p>
        </div>

        <div className="flex justify-center">
          <LoginButton />
        </div>

        <div className="grid gap-6 sm:grid-cols-3 pt-8">
          <FeatureCard
            title="Smart Search"
            description="Find videos by keywords, minimum views, language, and duration range"
          />
          <FeatureCard
            title="Flexible Targeting"
            description="Set your goal by number of videos or total watch time in minutes"
          />
          <FeatureCard
            title="One-Click Create"
            description="Preview selected videos and create a playlist directly in your YouTube account"
          />
        </div>

        <div className="pt-8 text-sm text-muted-foreground">
          <p>
            Sign in with your Google account to grant access to your YouTube
            account for creating playlists.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 text-left">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
