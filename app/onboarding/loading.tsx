export default function OnboardingLoading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(21,134,160,0.14),transparent_24%),linear-gradient(180deg,#F5F2ED_0%,#E7F0F5_100%)]">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-2xl">
          <div className="bg-psy-paper rounded-3xl border border-psy-border p-10">
            {/* Header skeleton */}
            <div className="mb-8">
              <div className="h-10 w-48 rounded-lg bg-psy-muted/10 animate-pulse mb-3" />
              <div className="h-6 w-96 rounded-lg bg-psy-muted/10 animate-pulse" />
            </div>

            {/* Form skeleton */}
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 rounded bg-psy-muted/10 animate-pulse" />
                  <div className="h-11 w-full rounded-lg bg-psy-muted/10 animate-pulse" />
                </div>
              ))}
            </div>

            {/* Button skeleton */}
            <div className="mt-8 h-12 w-full rounded-lg bg-psy-muted/10 animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
