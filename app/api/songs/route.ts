import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, artist, duration, cloudinaryPublicId } = body as {
    title?: string;
    artist?: string;
    duration?: number;
    cloudinaryPublicId?: string;
  };

  if (!title || !cloudinaryPublicId) {
    return NextResponse.json(
      { error: "title and cloudinaryPublicId are required" },
      { status: 400 }
    );
  }

  // The client only ever sends a cloudinaryPublicId we just handed it via
  // the signed-upload flow, but treat it as untrusted input anyway: confirm
  // it's a real asset that actually landed in this user's own upload folder
  // before creating a library entry that points at it — otherwise nothing
  // stops a request from claiming someone else's (or the library's) asset.
  if (!cloudinaryPublicId.startsWith(`user-uploads/${session.user.id}/`)) {
    return NextResponse.json({ error: "Invalid upload reference" }, { status: 400 });
  }

  try {
    await cloudinary.api.resource(cloudinaryPublicId, { resource_type: "video" });
  } catch {
    return NextResponse.json({ error: "Upload not found" }, { status: 400 });
  }

  const song = await prisma.song.create({
    data: {
      title,
      artist: artist || null,
      duration: duration ? Math.round(duration) : null,
      source: "upload",
      cloudinaryPublicId,
      uploadedById: session.user.id,
    },
  });

  return NextResponse.json(song, { status: 201 });
}
