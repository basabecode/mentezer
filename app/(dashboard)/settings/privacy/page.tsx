import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Shield,
  Lock,
  FileText,
  Download,
  Trash2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

export const metadata = {
  title: "Privacidad y datos | MENTEZER",
};

export default async function SettingsPrivacyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Metricas de privacidad para el psicologo
  const [
    { count: totalPacientes },
    { count: pacientesConConsent },
    { count: sesionesGrabadas },
    { count: auditLogsCount },
  ] = await Promise.all([
    supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .eq("psychologist_id", user!.id),
    supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .eq("psychologist_id", user!.id)
      .not("consent_signed_at", "is", null),
    supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .eq("psychologist_id", user!.id),
    supabase
      .from("audit_logs")
      .select("*", { count: "exact", head: true })
      .eq("psychologist_id", user!.id),
  ]);

  const sinConsent = (totalPacientes ?? 0) - (pacientesConConsent ?? 0);

  const garantias = [
    {
      icon: Lock,
      title: "Cifrado extremo a extremo",
      description:
        "Audio y notas clínicas cifradas con AES-256 antes de almacenarse.",
    },
    {
      icon: Shield,
      title: "Aislamiento por Row Level Security (RLS)",
      description:
        "Cada profesional solo accede a sus propios datos. Sin excepciones.",
    },
    {
      icon: FileText,
      title: "Registro de auditoria",
      description:
        "Cada acceso, edicion o exportacion de datos clinicos queda registrada.",
    },
    {
      icon: CheckCircle2,
      title: "Consentimiento informado digital",
      description:
        "Los pacientes firman consentimiento antes de cualquier grabacion o analisis IA.",
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
      {/* Breadcrumb */}
      <Link
        href="/settings"
        className="inline-flex w-fit items-center gap-2 text-xs uppercase tracking-[0.22em] text-psy-muted transition hover:text-psy-ink"
      >
        <ArrowLeft size={14} />
        Configuracion
      </Link>

      {/* Hero */}
      <section className="overflow-hidden rounded-[2rem] border border-psy-border bg-psy-paper p-6 shadow-[0_14px_40px_rgba(28,27,24,0.05)] md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-psy-blue-light">
            <Shield size={22} className="text-psy-blue" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-[0.26em] text-psy-muted">
              Privacidad y datos
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-psy-ink md:text-4xl">
              Tus datos clinicos, bajo tu control
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-psy-muted md:text-base">
              MENTEZER cumple con la Ley 1581 de Colombia y adopta practicas
              equivalentes para Mexico, Argentina, Chile y Espana. Aqui revisas
              el estado de tus consentimientos y ejerces tus derechos sobre la
              informacion clinica.
            </p>
          </div>
        </div>
      </section>

      {/* Metricas */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Pacientes totales",
            value: totalPacientes ?? 0,
            sub: "registrados en tu practica",
            color: "text-psy-blue",
            bg: "bg-psy-blue-light",
          },
          {
            label: "Con consentimiento firmado",
            value: pacientesConConsent ?? 0,
            sub: "pueden recibir analisis IA",
            color: "text-psy-green",
            bg: "bg-psy-green-light",
          },
          {
            label: "Sin consentimiento",
            value: sinConsent,
            sub: sinConsent > 0 ? "completa antes de grabar" : "todo al dia",
            color: sinConsent > 0 ? "text-psy-amber" : "text-psy-green",
            bg: sinConsent > 0 ? "bg-psy-amber-light" : "bg-psy-green-light",
          },
          {
            label: "Sesiones registradas",
            value: sesionesGrabadas ?? 0,
            sub: "protegidas con cifrado AES-256",
            color: "text-psy-ink",
            bg: "bg-psy-cream",
          },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-2xl border border-psy-border bg-psy-paper p-5 shadow-[0_8px_24px_rgba(28,27,24,0.04)]"
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${m.bg}`}
            >
              <span className={`h-2 w-2 rounded-full ${m.color.replace("text-", "bg-")}`} />
            </div>
            <p className="mt-4 font-mono text-3xl font-semibold text-psy-ink">
              {m.value}
            </p>
            <p className="mt-1 text-sm font-medium text-psy-ink">{m.label}</p>
            <p className="mt-0.5 text-xs text-psy-muted">{m.sub}</p>
          </div>
        ))}
      </section>

      {/* Garantias tecnicas */}
      <section className="rounded-[2rem] border border-psy-border bg-psy-paper p-6 shadow-[0_10px_30px_rgba(28,27,24,0.04)] md:p-7">
        <div className="flex items-center gap-2">
          <p className="text-[11px] uppercase tracking-[0.22em] text-psy-muted">
            Garantias tecnicas
          </p>
        </div>
        <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-psy-ink">
          Como protegemos la informacion clinica
        </h2>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {garantias.map((g) => (
            <div
              key={g.title}
              className="flex items-start gap-3 rounded-2xl border border-psy-border bg-psy-cream p-4"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-psy-blue-light">
                <g.icon size={16} className="text-psy-blue" />
              </div>
              <div>
                <p className="text-sm font-semibold text-psy-ink">{g.title}</p>
                <p className="mt-1 text-xs leading-6 text-psy-muted">
                  {g.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Derechos del titular / psicologo */}
      <section className="rounded-[2rem] border border-psy-border bg-psy-paper p-6 shadow-[0_10px_30px_rgba(28,27,24,0.04)] md:p-7">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] uppercase tracking-[0.22em] text-psy-muted">
            Tus derechos
          </p>
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-psy-ink">
            Ejerce tus derechos sobre la informacion
          </h2>
          <p className="text-sm text-psy-muted">
            Puedes solicitar acceso, rectificacion o eliminacion total de los
            datos en cualquier momento.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl border border-psy-border bg-psy-cream p-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-psy-green-light">
              <Download size={16} className="text-psy-green" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-psy-ink">
                Exportar mis datos
              </p>
              <p className="mt-1 text-xs leading-6 text-psy-muted">
                Descarga un archivo con tus pacientes, sesiones y analisis IA.
              </p>
              <p className="mt-2 inline-flex rounded-full bg-psy-blue-light px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-psy-blue">
                Disponible en v1.5
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-psy-border bg-psy-cream p-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-psy-red-light">
              <Trash2 size={16} className="text-psy-red" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-psy-ink">
                Derecho al olvido
              </p>
              <p className="mt-1 text-xs leading-6 text-psy-muted">
                Eliminar por completo un paciente y todos sus datos asociados.
              </p>
              <p className="mt-2 inline-flex rounded-full bg-psy-blue-light px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-psy-blue">
                Disponible desde /patients
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-psy-blue/20 bg-psy-blue-light p-4">
          <p className="text-xs leading-6 text-psy-ink">
            <strong className="font-semibold">Registro de auditoria:</strong>{" "}
            se han registrado {auditLogsCount ?? 0} eventos en tu cuenta. Este
            historial esta disponible para Legal en caso de auditoria externa.
          </p>
        </div>
      </section>

      {/* Documentos legales */}
      <section className="rounded-[2rem] border border-psy-border bg-psy-paper p-6 shadow-[0_10px_30px_rgba(28,27,24,0.04)] md:p-7">
        <p className="text-[11px] uppercase tracking-[0.22em] text-psy-muted">
          Documentos legales
        </p>
        <h2 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-psy-ink">
          Politicas y terminos vigentes
        </h2>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/legal/privacy"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-psy-border bg-psy-cream px-4 py-3 text-sm font-medium text-psy-ink transition hover:bg-psy-blue-light hover:text-psy-blue"
          >
            <FileText size={15} />
            Politica de privacidad
          </Link>
          <Link
            href="/legal/terms"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-psy-border bg-psy-cream px-4 py-3 text-sm font-medium text-psy-ink transition hover:bg-psy-blue-light hover:text-psy-blue"
          >
            <FileText size={15} />
            Terminos de uso
          </Link>
        </div>

        <p className="mt-5 text-xs leading-6 text-psy-muted">
          MENTEZER cumple con la Ley 1581 de 2012 (Colombia) y la Ley Federal
          de Proteccion de Datos Personales (Mexico). Para consultas, escribe a{" "}
          <a
            href="mailto:privacidad@mentezer.co"
            className="text-psy-blue hover:underline"
          >
            privacidad@mentezer.co
          </a>
          .
        </p>
      </section>
    </div>
  );
}
