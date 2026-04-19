import { Calendar, Clock, Plus, Lock } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function SchedulePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-10">
        <Breadcrumbs />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-6">
          <div>
            <h1 className="font-sora text-3xl md:text-5xl font-bold tracking-tight text-psy-ink">Agenda Clínica</h1>
            <p className="text-base text-psy-ink/60 mt-3 leading-relaxed">
              Gestión automatizada de citas y disponibilidad profesional.
            </p>
          </div>
          <div className="group relative">
            <button
              disabled
              title="Disponible en v1.5"
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-psy-blue/5 bg-psy-blue/10 px-6 text-sm font-bold text-psy-blue/40 cursor-not-allowed max-sm:w-full"
          >
              <Plus size={18} strokeWidth={2.5} />
              Nueva cita
              <span className="inline-block px-2 py-1 ml-2 text-xs bg-psy-amber/20 text-psy-amber rounded-full font-semibold">
                v1.5
              </span>
            </button>
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-psy-ink text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              Disponible en versión 1.5
            </span>
          </div>
        </div>
      </div>

      {/* Próximamente */}
      <div className="bg-white border border-psy-border rounded-[2.5rem] p-8 text-center shadow-sm sm:p-12">
        <div className="w-20 h-20 rounded-[2rem] bg-psy-cream flex items-center justify-center mx-auto mb-6 shadow-psy-border">
          <Lock size={32} className="text-psy-blue" />
        </div>
        <h2 className="font-sora text-2xl text-psy-ink font-bold mb-3">Versión 1.5 en desarrollo</h2>
        <p className="text-base text-psy-ink/50 max-w-md mx-auto leading-relaxed mb-10">
          Estamos construyendo un motor de reservas optimizado con recordatorios automáticos e <span className="font-semibold text-psy-blue">integración bidireccional</span> con Google Calendar.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl mx-auto text-left">
          {[
            { icon: Calendar, title: "Calendario Mentezer", desc: "Vista semanal de alto rendimiento" },
            { icon: Clock, title: "Gestión de bloques", desc: "Configura tus horarios de atención" },
            { icon: Plus, title: "Booking Online", desc: "Link personalizable para pacientes" },
            { icon: Calendar, title: "Multi-Sync", desc: "Apple & Google Calendar Sync" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-5 bg-psy-cream/30 border border-psy-border rounded-2xl transition-all hover:bg-white hover:shadow-lg group">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center shadow-sm border border-psy-border group-hover:text-psy-blue transition-colors">
                  <Icon size={16} />
                </div>
                <p className="text-[14px] font-bold text-psy-ink">{title}</p>
              </div>
              <p className="text-xs text-psy-ink/50 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
