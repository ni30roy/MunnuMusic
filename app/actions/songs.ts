"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

async function requireUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

export async function toggleLike(songId: string) {
  const userId = await requireUserId();

  const existing = await prisma.likedSong.findUnique({
    where: { userId_songId: { userId, songId } },
  });

  if (existing) {
    await prisma.likedSong.delete({
      where: { userId_songId: { userId, songId } },
    });
  } else {
    await prisma.likedSong.create({ data: { userId, songId } });
  }

  revalidatePath("/library");
  revalidatePath("/");
}

export async function createPlaylist(formData: FormData) {
  const userId = await requireUserId();
  const name = (formData.get("name") as string | null)?.trim();
  if (!name) return;

  await prisma.playlist.create({ data: { name, userId } });
  revalidatePath("/library");
}

export async function addSongToPlaylist(playlistId: string, songId: string) {
  const userId = await requireUserId();

  const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
  if (!playlist || playlist.userId !== userId) throw new Error("Not found");

  const count = await prisma.playlistSong.count({ where: { playlistId } });

  await prisma.playlistSong.upsert({
    where: { playlistId_songId: { playlistId, songId } },
    update: {},
    create: { playlistId, songId, position: count },
  });

  revalidatePath(`/playlist/${playlistId}`);
}

export async function removeSongFromPlaylist(playlistId: string, songId: string) {
  const userId = await requireUserId();

  const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
  if (!playlist || playlist.userId !== userId) throw new Error("Not found");

  await prisma.playlistSong.delete({
    where: { playlistId_songId: { playlistId, songId } },
  });

  revalidatePath(`/playlist/${playlistId}`);
}

// Permanently removes a song from the shared library (not just "unlike" or
// "remove from this playlist"). Any signed-in user can delete any song —
// this is a small trusted/invite-only group sharing one library, the same
// trust boundary that already lets everyone see and play each other's
// uploads.
export async function deleteSong(songId: string) {
  await requireUserId();

  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!song) return;

  if (song.cloudinaryPublicId) {
    await cloudinary.uploader
      .destroy(song.cloudinaryPublicId, { resource_type: "video" })
      .catch((err) => console.error("Cloudinary delete failed:", err));
  }

  await prisma.song.delete({ where: { id: songId } });

  revalidatePath("/");
  revalidatePath("/library");
  revalidatePath("/search");
}
