"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "info", onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const bg = type === "error" ? "bg-red-50 border-red-200 text-red-800" : type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-neutral-bg-subtle border-neutral-border text-neutral-text";

  return (
    <div
      role="alert"
      className={`fixed bottom-4 right-4 z-[100] px-4 py-3 border rounded shadow-sm text-caption font-medium ${bg}`}
    >
      {message}
    </div>
  );
}
