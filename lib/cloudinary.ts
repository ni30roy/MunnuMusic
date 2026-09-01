// No "server-only" guard here — this module is also imported directly by
// scripts/bulk-import.ts, a standalone Node script that runs outside
// Next.js's bundler (where the "server-only" package always throws). The
// Cloudinary SDK's own use of Node built-ins already makes it fail to
// bundle if ever imported into client code, which is the guard that matters.
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// Audio files are uploaded as Cloudinary's "video" resource type (its
// audio/video delivery pipeline) rather than "raw", so browsers get proper
// range-request support for seeking.
export function getAudioUrl(publicId: string) {
  return cloudinary.url(publicId, { resource_type: "video" });
}
