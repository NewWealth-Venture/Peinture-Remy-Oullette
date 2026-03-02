"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  value?: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  className?: string;
}

export function FileUpload({
  accept = "image/*",
  multiple = true,
  value = [],
  onChange,
  maxFiles = 10,
  className = "",
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const urls: string[] = [...value];
    for (let i = 0; i < files.length && urls.length < maxFiles; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;
      const url = URL.createObjectURL(file);
      urls.push(url);
    }
    onChange(urls.slice(0, maxFiles));
  };

  const remove = (index: number) => {
    const u = value[index];
    if (u?.startsWith("blob:")) URL.revokeObjectURL(u);
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={className}>
      <div
        className={`border border-dashed border-neutral-border rounded p-4 text-center transition-colors ${
          dragging ? "bg-neutral-bg-subtle border-primary-blue" : "bg-neutral-bg-subtle/50 hover:bg-neutral-bg-subtle"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => { addFiles(e.target.files ?? null); e.target.value = ""; }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center gap-2 w-full py-2 text-caption text-neutral-text-secondary hover:text-neutral-text focus-ring rounded"
        >
          <Upload size={18} strokeWidth={1.7} />
          Cliquer ou glisser des images
        </button>
      </div>
      {value.length > 0 && (
        <ul className="mt-2 grid grid-cols-3 gap-2">
          {value.map((url, i) => (
            <li key={url} className="relative aspect-square rounded border border-neutral-border overflow-hidden bg-neutral-bg-subtle">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 p-1 rounded bg-black/50 text-white hover:bg-black/70 focus-ring"
                aria-label="Retirer"
              >
                <X size={14} strokeWidth={1.7} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
