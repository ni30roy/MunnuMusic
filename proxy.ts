import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const publicRoutes = ["/login", "/signup"];
const publicFiles = ["/manifest.json", "/sw.js", "/icon.svg", "/favicon.ico"];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (publicFiles.includes(pathname)) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.includes(pathname);
  const session = await auth();

  if (!isPublicRoute && !session?.user) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoute && session?.user) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
