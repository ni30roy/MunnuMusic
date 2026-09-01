import { create } from "zustand";

export type PlayableSource = "library" | "upload" | "youtube";

export interface Track {
  id: string;
  title: string;
  artist?: string | null;
  coverArtUrl?: string | null;
  source: PlayableSource;
  // library/upload: Cloudinary-hosted audio URL. youtube: video id.
  streamUrl?: string | null;
  youtubeVideoId?: string | null;
}

interface PlayerState {
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  currentTrack: Track | null;

  playQueue: (tracks: Track[], startIndex?: number) => void;
  playNow: (track: Track) => void;
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  next: () => void;
  previous: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  currentTrack: null,

  playQueue: (tracks, startIndex = 0) => {
    set({
      queue: tracks,
      currentIndex: startIndex,
      currentTrack: tracks[startIndex] ?? null,
      isPlaying: tracks.length > 0,
    });
  },

  playNow: (track) => {
    set({ queue: [track], currentIndex: 0, currentTrack: track, isPlaying: true });
  },

  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setIsPlaying: (playing) => set({ isPlaying: playing }),

  next: () => {
    const { queue, currentIndex } = get();
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      set({ currentIndex: nextIndex, currentTrack: queue[nextIndex], isPlaying: true });
    } else {
      set({ isPlaying: false });
    }
  },

  previous: () => {
    const { queue, currentIndex } = get();
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      set({ currentIndex: prevIndex, currentTrack: queue[prevIndex], isPlaying: true });
    }
  },
}));
