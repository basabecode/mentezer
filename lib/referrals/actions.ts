"use server";

import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export async function generateReferralDraft(
  patientId: string,
  specialty: string,
  reason: string,
  recipientName: string = ""
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  // 1. Fetch Patient Info
  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patientId)
    .eq("psychologist_id", user.id)
    .single();

  if (!patient) {
    throw new Error("Paciente no encontrado");
  }

  // 2. Fetch Psychologist Info (for signature)
  const { data: psychologist } = await supabase
    .from("psychologists")
    .select("name, professional_license, specialty")
    .eq("id", user.id)
    .single();

  // 3. Fetch past AI Reports to give Claude context
  const { data: reports } = await supabase
    .from("sessions")
    .select("id, status, ai_reports(summary, diagnostic_hints, therapeutic_suggestions)")
    .eq("patient_id", patientId)
    .order("scheduled_at", { ascending: false })
    .limit(5);

  const parsedReportsContext = reports?.map(r => r.ai_reports).flat().filter(Boolean) || [];
  
  const systemPrompt = `
Eres un asistente que redacta informes clínicos profesionales en Colombia.
Genera una carta de derivación formal para ${specialty} sobre el paciente.
Tono: profesional médico, respetuoso, técnico apropiado.
Idiomas: español colombiano clínico.

Estructura obligatoria:
1. Encabezado con fecha y destinatario (Si aplica a un especialista específico o a "Especialidad en ${specialty}").
2. Saludo formal.
3. Motivo de la derivación: ${reason}.
4. Datos clínicos relevantes (extraídos del contexto).
5. Intervenciones realizadas.
6. Evolución observada.
7. Recomendaciones al especialista.
8. Despedida formal.

Devuelve EXCLUSIVAMENTE el texto de la carta de derivación en formato texto/markdown legible, listo para revisión. Sin prefijos ni explicaciones.
  `;

  const userContext = `
DATOS DEL PACIENTE:
Nombre: ${patient.name}
Edad: ${patient.age || "No especificado"}
Motivo original de consulta psicológica: ${patient.reason}

DATOS DEL PROFESIONAL QUE DERIVA:
Nombre: ${psychologist?.name}
Licencia Profesional (TP): ${psychologist?.professional_license || "En trámite"}

RESUMEN DE SESIONES ANTERIORES:
${JSON.stringify(parsedReportsContext, null, 2)}
  `;

  // 4. Call Claude
  const response = await getAnthropic().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    temperature: 0.3,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: userContext,
      },
    ],
  });

  const content = Array.isArray(response.content) 
  ? response.content.map((b) => ('text' in b ? b.text : '')).join('') 
  : '';

  // 5. Save Draft to Database
  const { data: referral, error: insertError } = await supabase
    .from("referral_reports")
    .insert({
      patient_id: patientId,
      psychologist_id: user.id,
      recipient_specialist_name: recipientName || `Especialista en ${specialty}`,
      recipient_specialty: specialty,
      reason_for_referral: reason,
      ai_draft: content,
      status: "draft",
      diagnosis_codes: [], // Could be extracted with JSON parsing later
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Error creating referral draft", insertError);
    throw new Error("No se pudo guardar el borrador.");
  }

  revalidatePath(`/patients/${patientId}`);
  return { id: referral.id, draft: content };
}
