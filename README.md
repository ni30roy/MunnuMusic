# Munnu Music

A personal Spotify-style music app — web + installable PWA — built entirely on
free-tier services. Play your own preloaded library, upload songs, or search
and play from YouTube.

## Stack

- Next.js 16 (App Router, Turbopack) + Tailwind CSS
- Neon (serverless Postgres) + Prisma 7
- Auth.js (email/password, JWT sessions)
- Cloudinary (audio + cover art storage)
- YouTube Data API v3 + IFrame Player API

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — Neon connection string (console.neon.tech)
   - `AUTH_SECRET` — random string, e.g. `openssl rand -base64 32`
   - `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` — cloudinary.com dashboard
   - `YOUTUBE_API_KEY` — Google Cloud Console, YouTube Data API v3 key
   - `SIGNUP_INVITE_CODE` — any string; people need it to create an account on `/signup`
3. `npx prisma migrate dev` — creates the database schema
4. `npm run dev` — starts the app at http://localhost:3000

## Preloading your own song library

Drop your MP3/M4A/WAV/FLAC files in a folder, then run:

```bash
npm run import-songs -- "C:\path\to\your\songs"
```

Reads ID3 tags (title/artist/album/cover art), uploads to Cloudinary, and adds
each song to the library. Safe to re-run — already-imported songs are skipped.

## Deploy

Push to GitHub and import the repo on [vercel.com](https://vercel.com/new).
Set the same environment variables from `.env` in the Vercel project settings.
