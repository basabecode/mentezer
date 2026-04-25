import type { Database } from "@/types/supabase";

type Patient = Database["public"]["Tables"]["patients"]["Row"];
type Session = Database["public"]["Tables"]["sessions"]["Row"];
type AIReport = Database["public"]["Tables"]["ai_reports"]["Row"];
type TherapeuticPlan = Database["public"]["Tables"]["therapeutic_plans"]["Row"];

export interface PreviousSessionContext extends Session {
  ai_report: AIReport | null;
}

export interface PatientContextInput {
  patient: Patient;
  previousSessions: PreviousSessionContext[];
  activePlan: TherapeuticPlan | null;
  currentSessionNumber: number;
}

export function buildPatientContextPrompt(input: PatientContextInput): string {
  const { patient, previousSessions, activePlan, currentSessionNumber } = input;
  const history = previousSessions.length
    ? previousSessions
        .slice(0, 6)
        .map((session, index) => formatPreviousSession(session, previousSessions.length - index))
        .join("\n\n---\n\n")
    : "Primera sesión registrada del paciente. No hay historial previo para comparar.";

  return `
BRIEFING CLINICO DEL PACIENTE

DATOS DEL CASO
Identificador interno: ${patient.id}
Edad: ${patient.age ?? "No registrada"}
Genero: ${formatGender(patient.gender)}
Estado actual: ${formatStatus(patient.status)}
Sesion actual: ${currentSessionNumber}
Sesiones previas completadas: ${previousSessions.length}

PRESENTACION INICIAL
Motivo de consulta:
${patient.reason ?? "No registrado"}

Derivado por: ${patient.referred_by ?? "Consulta espontanea"}
Inicio del caso: ${formatDate(patient.created_at)}

PLAN TERAPEUTICO ACTIVO
${activePlan ? formatTherapeuticPlan(activePlan) : "Sin plan terapeutico formal activo registrado."}

HISTORIAL RELEVANTE
${history}
`.trim();
}

function formatPreviousSession(session: PreviousSessionContext, sessionNumber: number): string {
  const report = session.ai_report;
  const duration = session.duration_minutes ? `${session.duration_minutes} min` : "duracion no registrada";

  if (!report) {
    return `SESION ${sessionNumber} | ${formatDate(session.scheduled_at)} | ${duration}
Sin analisis IA registrado para esta sesion.`;
  }

  return `SESION ${sessionNumber} | ${formatDate(session.scheduled_at)} | ${duration} | Modo: ${formatMode(session.mode)}

Resumen:
${report.summary ?? "Sin resumen."}

Patrones:
${formatJsonArray(report.patterns)}

Hipotesis exploratorias:
${formatJsonArray(report.diagnostic_hints)}

Riesgos:
${formatJsonArray(report.risk_signals)}

Evolucion:
${report.evolution_vs_previous ?? "Sin comparacion registrada."}

Sugerencias previas:
${formatJsonArray(report.therapeutic_suggestions)}`;
}

function formatTherapeuticPlan(plan: TherapeuticPlan): string {
  const content = plan.approved_plan ?? plan.ai_draft;
  return `Estado: ${formatPlanStatus(plan.status)}
Creado: ${formatDate(plan.created_at)}
Compartido con paciente: ${plan.shared_with_patient_at ? formatDate(plan.shared_with_patient_at) : "No compartido"}
Contenido:
${content ? JSON.stringify(content, null, 2) : "Plan registrado sin contenido estructurado."}`;
}

function formatJsonArray(value: unknown): string {
  if (!Array.isArray(value) || value.length === 0) return "No registrado.";
  return value
    .slice(0, 5)
    .map((item, index) => `${index + 1}. ${typeof item === "string" ? item : JSON.stringify(item)}`)
    .join("\n");
}

function formatGender(gender: string | null): string {
  const map: Record<string, string> = {
    male: "Masculino",
    female: "Femenino",
    non_binary: "No binario",
    other: "Otro",
  };
  return gender ? map[gender] ?? gender : "No registrado";
}

function formatStatus(status: string | null): string {
  const map: Record<string, string> = {
    active: "Activo",
    paused: "Pausado",
    closed: "Cerrado",
  };
  return status ? map[status] ?? status : "No registrado";
}

function formatMode(mode: string | null): string {
  if (mode === "presential") return "Presencial";
  if (mode === "virtual") return "Virtual";
  return mode ?? "No registrado";
}

function formatPlanStatus(status: string | null): string {
  const map: Record<string, string> = {
    draft: "Borrador",
    active: "Activo",
    completed: "Completado",
  };
  return status ? map[status] ?? status : "Sin estado";
}

function formatDate(date: string | null): string {
  if (!date) return "Fecha no registrada";
  return new Date(date).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
