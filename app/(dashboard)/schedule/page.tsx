import { Calendar, Clock, Plus } from "lucide-react";

export default function SchedulePage() {
  return (
    <div className="px-6 py-6 max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-psy-ink font-semibold">Agenda</h1>
          <p className="text-sm text-psy-muted mt-1">
            Gestión de citas y disponibilidad. Integración con Google Calendar disponible en v1.5.
          </p>
        </div>
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2 bg-psy-blue/40 text-white rounded-lg text-sm font-medium cursor-not-allowed"
        >
          <Plus size={14} />
          Nueva cita
        </button>
      </div>

      {/* Próximamente */}
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-psy-blue-light flex items-center justify-center mb-4">
          <Calendar size={24} className="text-psy-blue" />
        </div>
        <h2 className="font-serif text-lg text-psy-ink font-semibold mb-2">Agenda — v1.5</h2>
        <p className="text-sm text-psy-muted max-w-sm leading-relaxed mb-6">
          Sistema de citas propio con reservas en línea, integración con Google Calendar y recordatorios automáticos por email.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md text-left">
          {[
            { icon: Calendar, title: "Calendario propio", desc: "Vista semanal y mensual de citas" },
            { icon: Clock, title: "Disponibilidad", desc: "Configura horarios y duración de sesiones" },
            { icon: Plus, title: "Reservas en línea", desc: "Widget para que pacientes agenden" },
            { icon: Calendar, title: "Google Calendar", desc: "Sincronización bidireccional" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-4 bg-psy-paper border border-psy-border rounded-xl opacity-60">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={13} className="text-psy-blue" />
                <p className="text-sm font-medium text-psy-ink">{title}</p>
              </div>
              <p className="text-xs text-psy-muted">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
