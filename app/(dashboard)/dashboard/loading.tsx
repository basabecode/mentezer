import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-10">
        <Breadcrumbs />
        <div className="mt-6">
          <div className="h-10 w-48 rounded-lg bg-psy-muted/10 animate-pulse mb-4" />
          <div className="h-5 w-96 rounded-lg bg-psy-muted/10 animate-pulse" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-psy-muted/10 animate-pulse" />
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} className="md:col-span-2" />
        ))}
      </div>
    </div>
  );
}
