// One-off admin script to preload a local folder of MP3s into the library.
// Usage: npm run import-songs -- "C:\path\to\your\songs"
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { parseFile } from "music-metadata";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../app/generated/prisma/client.js";
import { cloudinary } from "../lib/cloudinary.js";

const AUDIO_EXTENSIONS = new Set([".mp3", ".m4a", ".wav", ".flac", ".ogg"]);
const CONCURRENCY = 4;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function uploadCoverArt(picture: { data: Uint8Array; format: string } | undefined) {
  if (!picture) return null;
  const base64 = Buffer.from(picture.data).toString("base64");
  const dataUri = `data:${picture.format};base64,${base64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    resource_type: "image",
    folder: "cover-art",
  });
  return result.secure_url as string;
}

async function importFile(filePath: string): Promise<"imported" | "skipped"> {
  const fileName = path.basename(filePath);

  const metadata = await parseFile(filePath);
  const title = metadata.common.title?.trim() || path.parse(fileName).name;
  const artist = metadata.common.artist?.trim() || null;
  const album = metadata.common.album?.trim() || null;
  const duration = metadata.format.duration
    ? Math.round(metadata.format.duration)
    : null;

  const existing = await prisma.song.findFirst({
    where: { source: "library", title, artist },
  });
  if (existing) {
    console.log(`skip (already imported): ${fileName}`);
    return "skipped";
  }

  const uploadResult = await cloudinary.uploader.upload(filePath, {
    resource_type: "video",
    folder: "library",
  });

  const coverArtUrl = await uploadCoverArt(metadata.common.picture?.[0]);

  await prisma.song.create({
    data: {
      title,
      artist,
      album,
      duration,
      source: "library",
      cloudinaryPublicId: uploadResult.public_id,
      coverArtUrl,
    },
  });

  console.log(`imported: ${title}${artist ? ` — ${artist}` : ""}`);
  return "imported";
}

async function runWithConcurrency(files: string[], limit: number) {
  let index = 0;
  let importedCount = 0;
  let skippedCount = 0;
  let failCount = 0;

  async function worker() {
    while (index < files.length) {
      const current = files[index++];
      try {
        const result = await importFile(current);
        if (result === "imported") importedCount++;
        else skippedCount++;
      } catch (err) {
        failCount++;
        console.error(`FAILED: ${path.basename(current)} —`, (err as Error).message);
      }
    }
  }

  await Promise.all(Array.from({ length: limit }, worker));
  return { importedCount, skippedCount, failCount };
}

async function main() {
  const folder = process.argv[2];
  if (!folder) {
    console.error('Usage: npm run import-songs -- "C:\\path\\to\\your\\songs"');
    process.exit(1);
  }

  const entries = await fs.readdir(folder);
  const files = entries
    .filter((name) => AUDIO_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .map((name) => path.join(folder, name));

  console.log(`Found ${files.length} audio file(s) in ${folder}`);

  const { importedCount, skippedCount, failCount } = await runWithConcurrency(
    files,
    CONCURRENCY
  );

  console.log(
    `\nDone. Imported: ${importedCount}, Skipped: ${skippedCount}, Failed: ${failCount}`
  );
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
