"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

export function Modal({ open, onClose, title, children, maxWidth = "md" }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const focusable = ref.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable?.[0];
    first?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && focusable?.length) {
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      prev?.focus();
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const maxW = maxWidth === "sm" ? "max-w-sm" : maxWidth === "lg" ? "max-w-lg" : "max-w-md";

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/30"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        ref={ref}
        className={`bg-neutral-white border border-neutral-border shadow-sm w-full flex flex-col
          sm:rounded sm:max-h-[90vh]
          max-sm:rounded-t-xl max-sm:max-h-[92vh] max-sm:border-b-0
          ${maxW}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-4 py-3 border-b border-neutral-border shrink-0 flex items-center justify-between gap-2">
            <h2 id="modal-title" className="text-section-title text-neutral-text font-heading truncate">
              {title}
            </h2>
            <button type="button" onClick={onClose} className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded hover:bg-neutral-bg-subtle focus-ring text-neutral-text" aria-label="Fermer">
              ×
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}
