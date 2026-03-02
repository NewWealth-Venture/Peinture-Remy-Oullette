"use client";

import { ReactNode } from "react";

interface TableProps {
  columns: { key: string; label: string; className?: string }[];
  children: ReactNode;
  className?: string;
}

export function Table({ columns, children, className = "" }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse text-body">
        <thead>
          <tr className="border-b border-neutral-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left py-3 px-4 font-heading font-medium text-neutral-text text-caption uppercase tracking-wide text-neutral-text-secondary ${col.className ?? ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
