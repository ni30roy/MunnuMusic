"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UploadCloud, Music2 } from "lucide-react";

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
    <div className="mx-auto max-w-md px-4 pt-6 md:px-6 md:pt-10">
      <h1 className="mb-1 text-2xl font-bold tracking-tight">Upload a song</h1>
      <p className="mb-6 text-sm text-[var(--text-muted)]">
        Goes straight into your library, from your own device.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-5"
      >
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-[var(--border)] px-4 py-8 text-center transition-colors hover:border-[var(--accent)]/50">
          {file ? (
            <Music2 size={26} className="text-[var(--accent)]" />
          ) : (
            <UploadCloud size={26} className="text-[var(--text-faint)]" />
          )}
          <span className="text-sm font-medium">
            {file ? file.name : "Tap to choose an audio file"}
          </span>
          <input
            type="file"
            accept="audio/*"
            required
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </label>

        <div className="space-y-1">
          <label htmlFor="title" className="text-xs font-medium text-[var(--text-muted)]">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]/60"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="artist" className="text-xs font-medium text-[var(--text-muted)]">
            Artist (optional)
          </label>
          <input
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]/60"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={busy || !file}
          className="w-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] py-2.5 font-semibold text-[var(--accent-contrast)] transition-transform active:scale-[0.98] disabled:opacity-50"
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
