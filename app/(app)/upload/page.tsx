"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Status = "idle" | "uploading" | "saving" | "done" | "error";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  function onFileChange(f: File | null) {
    setFile(f);
    if (f && !title) {
      setTitle(f.name.replace(/\.[^/.]+$/, ""));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title) return;
    setError(null);

    try {
      setStatus("uploading");
      const sigRes = await fetch("/api/cloudinary-signature");
      if (!sigRes.ok) throw new Error("Could not get upload permission.");
      const { timestamp, signature, apiKey, cloudName, folder } = await sigRes.json();

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", apiKey);
      form.append("timestamp", String(timestamp));
      form.append("signature", signature);
      form.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        { method: "POST", body: form }
      );
      if (!uploadRes.ok) throw new Error("Upload to Cloudinary failed.");
      const uploaded = await uploadRes.json();

      setStatus("saving");
      const songRes = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          artist: artist || undefined,
          duration: uploaded.duration,
          cloudinaryPublicId: uploaded.public_id,
        }),
      });
      if (!songRes.ok) throw new Error("Could not save song.");

      setStatus("done");
      router.push("/");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const busy = status === "uploading" || status === "saving";

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold">Upload a song</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm text-neutral-400">Audio file</label>
          <input
            type="file"
            accept="audio/*"
            required
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="title" className="text-sm text-neutral-400">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-md bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="artist" className="text-sm text-neutral-400">
            Artist (optional)
          </label>
          <input
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="w-full rounded-md bg-neutral-900 px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={busy || !file}
          className="w-full rounded-full bg-green-500 py-2 font-semibold text-black disabled:opacity-60"
        >
          {status === "uploading"
            ? "Uploading..."
            : status === "saving"
              ? "Saving..."
              : "Upload"}
        </button>
      </form>
    </div>
  );
}
