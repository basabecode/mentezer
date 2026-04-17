export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--psy-cream)] paper-texture relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--psy-blue)]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[var(--psy-green)]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md px-4 py-12">
        {children}
      </div>
    </div>
  );
}
