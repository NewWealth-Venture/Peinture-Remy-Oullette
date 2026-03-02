"use client";

import { useEffect } from "react";
import type { MediaPiece } from "@/lib/briefs/types";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface MediaViewerModalProps {
  open: boolean;
  onClose: () => void;
  pieces: MediaPiece[];
  currentIndex: number;
  onIndexChange: (i: number) => void;
}

export function MediaViewerModal({ open, onClose, pieces, currentIndex, onIndexChange }: MediaViewerModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndexChange(Math.max(0, currentIndex - 1));
      if (e.key === "ArrowRight") onIndexChange(Math.min(pieces.length - 1, currentIndex + 1));
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose, currentIndex, onIndexChange, pieces.length]);

  if (!open || pieces.length === 0) return null;

  const piece = pieces[currentIndex];
  if (!piece) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute top-2 right-2 z-10 p-2 rounded bg-black/50 text-white hover:bg-black/70 focus-ring" aria-label="Fermer">
          <X size={24} strokeWidth={1.7} />
        </button>
        {currentIndex > 0 && (
          <button type="button" onClick={() => onIndexChange(currentIndex - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded bg-black/50 text-white hover:bg-black/70 focus-ring" aria-label="Précédent">
            <ChevronLeft size={28} strokeWidth={1.7} />
          </button>
        )}
        {currentIndex < pieces.length - 1 && (
          <button type="button" onClick={() => onIndexChange(currentIndex + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded bg-black/50 text-white hover:bg-black/70 focus-ring" aria-label="Suivant">
            <ChevronRight size={28} strokeWidth={1.7} />
          </button>
        )}
        <div className="bg-neutral-white rounded overflow-hidden">
          {piece.type === "Photo" ? (
            <img src={piece.url} alt="" className="w-full h-auto max-h-[80vh] object-contain" />
          ) : (
            <video src={piece.url} controls className="w-full max-h-[80vh]" />
          )}
          <div className="p-3 border-t border-neutral-border">
            <p className="text-caption text-neutral-text-secondary">{currentIndex + 1} / {pieces.length}</p>
            {piece.description && <p className="text-caption text-neutral-text mt-1">{piece.description}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
