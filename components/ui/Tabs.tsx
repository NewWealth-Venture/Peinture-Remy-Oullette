"use client";

import { ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeId, onChange, className = "" }: TabsProps) {
  return (
    <div className={className}>
      <div className="flex border-b border-neutral-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2.5 text-caption font-medium border-b-2 -mb-px transition-colors focus-ring ${
              activeId === tab.id
                ? "border-primary-blue text-primary-blue"
                : "border-transparent text-neutral-text-secondary hover:text-neutral-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-3">
        {tabs.find((t) => t.id === activeId)?.content}
      </div>
    </div>
  );
}
