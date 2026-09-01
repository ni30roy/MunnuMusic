import { Music2 } from "lucide-react";

export default function CoverArt({
  src,
  size = 44,
  rounded = "rounded-lg",
  playing = false,
  className = "",
}: {
  src?: string | null;
  size?: number;
  rounded?: string;
  playing?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden ${rounded} ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--accent)]/25 to-[var(--accent-2)]/25">
          <Music2 className="h-[45%] w-[45%] text-[var(--text-muted)]" strokeWidth={1.6} />
        </div>
      )}

      {playing && (
        <div className="absolute inset-0 flex items-end justify-center gap-[3px] bg-black/45 pb-[22%]">
          <span className="eq-bar h-[35%] w-[3px] rounded-full bg-[var(--accent)] [animation-delay:-0.3s]" />
          <span className="eq-bar h-[60%] w-[3px] rounded-full bg-[var(--accent)]" />
          <span className="eq-bar h-[40%] w-[3px] rounded-full bg-[var(--accent)] [animation-delay:-0.6s]" />
        </div>
      )}
    </div>
  );
}
