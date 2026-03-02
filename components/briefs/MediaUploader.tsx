"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import type { MediaPiece } from "@/lib/briefs/types";

interface MediaUploaderProps {
  accept?: string;
  onAdd: (piece: Omit<MediaPiece, "id" | "creeLe">) => void;
  className?: string;
}

export function MediaUploader({ accept = "image/*,video/*", onAdd, className = "" }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [description, setDescription] = useState("");

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isImage && !isVideo) continue;
      const url = URL.createObjectURL(file);
      onAdd({
        type: isVideo ? "Vidéo" : "Photo",
        url,
        nomFichier: file.name,
        description: description.trim() || undefined,
      });
    }
    setDescription("");
  };

  return (
    <div className={className}>
      <div
        className={`border border-dashed border-neutral-border rounded p-3 text-center transition-colors ${
          dragging ? "bg-neutral-bg-subtle border-primary-blue" : "bg-neutral-bg-subtle/50 hover:bg-neutral-bg-subtle"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center gap-2 w-full py-2 text-caption text-neutral-text-secondary hover:text-neutral-text focus-ring rounded"
        >
          <Upload size={18} strokeWidth={1.7} />
          Glisser ou cliquer (photo/vidéo)
        </button>
        <input
          type="text"
          placeholder="Description (optionnel)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-2 w-full h-8 px-2 text-caption border border-neutral-border rounded bg-neutral-white focus:ring-2 focus:ring-primary-blue/20 focus:outline-none"
        />
      </div>
    </div>
  );
}
