import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="paper-texture relative flex min-h-screen items-center justify-center overflow-hidden bg-psy-cream">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-0 h-[420px] w-[860px] -translate-x-1/2 rounded-full bg-psy-blue/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[340px] w-[340px] rounded-full bg-psy-green/12 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md px-4 py-12">
        <div className="mb-6 flex justify-center">
          <Breadcrumbs />
        </div>
        {children}
      </div>
    </div>
  );
}
