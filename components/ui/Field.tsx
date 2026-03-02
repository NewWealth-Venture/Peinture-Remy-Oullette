"use client";

import { ReactNode } from "react";

interface FieldProps {
  label: string;
  htmlFor?: string;
  help?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, help, error, required, children, className = "" }: FieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="block text-caption font-medium text-neutral-text mb-1"
      >
        {label}
        {required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      {children}
      {help && !error && <p className="text-caption-xs text-neutral-text-secondary mt-1">{help}</p>}
      {error && <p className="text-caption-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
