import Link from "next/link";
import { auth } from "@/lib/auth";
import { UserMenu } from "@/components/auth/user-menu";
import { LoginButton } from "@/components/auth/login-button";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <svg
            className="h-6 w-6 text-red-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <span className="font-bold text-xl">Playlist Generator</span>
        </Link>
        <nav className="flex items-center gap-4">
          {session?.user ? (
            <>
              <Link
                href="/create"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Create Playlist
              </Link>
              <UserMenu />
            </>
          ) : (
            <LoginButton />
          )}
        </nav>
      </div>
    </header>
  );
}
