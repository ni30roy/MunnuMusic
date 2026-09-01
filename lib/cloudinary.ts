import "server-only";
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
