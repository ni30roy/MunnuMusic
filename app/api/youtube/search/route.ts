import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { searchYoutube } from "@/lib/youtube";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchYoutube(q);
  return NextResponse.json({ results });
}
