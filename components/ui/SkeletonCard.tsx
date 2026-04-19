export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-psy-border bg-psy-paper p-6 space-y-4 ${className}`}>
      <div className="h-6 w-2/3 rounded-lg bg-psy-muted/10 animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-psy-muted/10 animate-pulse" />
        <div className="h-4 w-5/6 rounded bg-psy-muted/10 animate-pulse" />
        <div className="h-4 w-4/6 rounded bg-psy-muted/10 animate-pulse" />
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-8 w-16 rounded-lg bg-psy-muted/10 animate-pulse" />
        <div className="h-8 w-20 rounded-lg bg-psy-muted/10 animate-pulse" />
      </div>
    </div>
  );
}
