import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function PatientDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Breadcrumbs />

      <div className="mt-8 mb-10">
        <div className="h-10 w-48 rounded-lg bg-psy-muted/10 animate-pulse mb-2" />
        <div className="h-5 w-80 rounded-lg bg-psy-muted/10 animate-pulse" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-4 mb-8 border-b border-psy-border">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-24 rounded-lg bg-psy-muted/10 animate-pulse" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
