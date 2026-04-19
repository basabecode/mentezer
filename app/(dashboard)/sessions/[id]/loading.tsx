import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function SessionDetailLoading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Breadcrumbs />

      <div className="mt-8">
        <div className="h-10 w-64 rounded-lg bg-psy-muted/10 animate-pulse mb-4" />
        <div className="h-6 w-40 rounded-lg bg-psy-muted/10 animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        {/* Left content */}
        <div className="md:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
