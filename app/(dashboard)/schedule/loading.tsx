import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function ScheduleLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-10">
        <Breadcrumbs />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-6">
          <div>
            <div className="h-10 w-40 rounded-lg bg-psy-muted/10 animate-pulse mb-3" />
            <div className="h-5 w-80 rounded-lg bg-psy-muted/10 animate-pulse" />
          </div>
          <div className="h-12 w-40 rounded-2xl bg-psy-muted/10 animate-pulse" />
        </div>
      </div>

      {/* Calendar skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 rounded-2xl bg-psy-muted/10 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
