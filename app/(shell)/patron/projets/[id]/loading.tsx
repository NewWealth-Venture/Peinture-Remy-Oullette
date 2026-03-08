export default function ProjetDetailLoading() {
  return (
    <div className="p-6 max-w-[1280px] mx-auto animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-9 w-9 rounded bg-neutral-bg-subtle" />
        <div className="flex-1">
          <div className="h-6 w-64 bg-neutral-bg-subtle rounded mb-2" />
          <div className="h-4 w-48 bg-neutral-bg-subtle rounded" />
        </div>
      </div>
      <div className="h-20 rounded border border-neutral-border bg-neutral-bg-subtle mb-4" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          <div className="h-40 rounded border border-neutral-border bg-neutral-bg-subtle" />
          <div className="h-56 rounded border border-neutral-border bg-neutral-bg-subtle" />
          <div className="h-32 rounded border border-neutral-border bg-neutral-bg-subtle" />
          <div className="h-48 rounded border border-neutral-border bg-neutral-bg-subtle" />
        </div>
        <div className="space-y-4">
          <div className="h-48 rounded border border-neutral-border bg-neutral-bg-subtle" />
          <div className="h-24 rounded border border-neutral-border bg-neutral-bg-subtle" />
          <div className="h-28 rounded border border-neutral-border bg-neutral-bg-subtle" />
          <div className="h-20 rounded border border-neutral-border bg-neutral-bg-subtle" />
        </div>
      </div>
    </div>
  );
}
