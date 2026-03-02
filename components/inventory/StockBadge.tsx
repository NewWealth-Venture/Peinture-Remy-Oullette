"use client";

interface StockBadgeProps {
  total: number;
  stockMin?: number;
  unite: string;
  className?: string;
}

export function StockBadge({ total, stockMin, unite, className = "" }: StockBadgeProps) {
  const isZero = total === 0;
  const isLow = stockMin != null && total < stockMin && !isZero;

  if (isZero) {
    return <span className={`inline-flex px-2 py-0.5 rounded text-caption-xs font-medium bg-red-50 text-red-700 ${className}`}>0 {unite}</span>;
  }
  if (isLow) {
    return <span className={`inline-flex px-2 py-0.5 rounded text-caption-xs font-medium bg-amber-50 text-amber-700 ${className}`}>{total} {unite} (sous min)</span>;
  }
  return <span className={`text-caption text-neutral-text ${className}`}>{total} {unite}</span>;
}
