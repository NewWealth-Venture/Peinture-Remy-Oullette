"use client";

import { useState } from "react";
import type { MediaPiece } from "@/lib/briefs/types";
import { MediaViewerModal } from "./MediaViewerModal";
import { Image, Video } from "lucide-react";

interface MediaGridProps {
  pieces: MediaPiece[];
  onRemove?: (id: string) => void;
  readOnly?: boolean;
}

export function MediaGrid({ pieces, onRemove, readOnly }: MediaGridProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const photos = pieces.filter((p) => p.type === "Photo");
  const videos = pieces.filter((p) => p.type === "Vidéo");

  return (
    <>
      <div className="space-y-3">
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p, i) => (
              <div key={p.id} className="relative group aspect-square rounded border border-neutral-border overflow-hidden bg-neutral-bg-subtle">
                <button type="button" onClick={() => setViewerIndex(pieces.indexOf(p))} className="w-full h-full block focus-ring">
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                </button>
                {!readOnly && onRemove && (
                  <button type="button" onClick={() => onRemove(p.id)} className="absolute top-1 right-1 p-1 rounded bg-black/50 text-white hover:bg-black/70 focus-ring opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Retirer">
                    Retirer
                  </button>
                )}
                {p.description && <p className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/60 text-white text-caption-xs truncate">{p.description}</p>}
              </div>
            ))}
          </div>
        )}
        {videos.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {videos.map((p) => (
              <div key={p.id} className="relative rounded border border-neutral-border overflow-hidden bg-neutral-bg-subtle">
                <video src={p.url} className="w-full aspect-video object-cover" controls />
                {p.description && <p className="p-2 text-caption text-neutral-text-secondary border-t border-neutral-border">{p.description}</p>}
                {!readOnly && onRemove && (
                  <button type="button" onClick={() => onRemove(p.id)} className="absolute top-1 right-1 p-1 rounded bg-black/50 text-white hover:bg-black/70 focus-ring" aria-label="Retirer">Retirer</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {viewerIndex !== null && (
        <MediaViewerModal
          open={viewerIndex !== null}
          onClose={() => setViewerIndex(null)}
          pieces={pieces}
          currentIndex={viewerIndex}
          onIndexChange={setViewerIndex}
        />
      )}
    </>
  );
}
