import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnCreate = req.nextUrl.pathname.startsWith("/create");
  const isOnSuccess = req.nextUrl.pathname.startsWith("/success");

  // Protect /create and /success routes
  if ((isOnCreate || isOnSuccess) && !isLoggedIn) {
    return Response.redirect(new URL("/", req.nextUrl));
  }

  return;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
