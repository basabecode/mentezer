import { createAdminClient } from "@/lib/supabase/admin";
import { getIntegration } from "@/lib/integrations/loader";
import { sendWhatsAppMessage } from "./whatsapp";
import { sendTelegramMessage } from "./telegram";

interface IncomingMessage {
  psychologistId: string;
  channel: "whatsapp" | "telegram" | "email";
  senderId: string;
  senderName: string;
  text: string;
  rawPayload: unknown;
}

const BOOK_KEYWORDS = ["cita", "agendar", "consulta", "reservar", "turno", "appointment", "disponibilidad", "horario"];
const CANCEL_KEYWORDS = ["cancelar", "anular", "cancel"];
const INFO_KEYWORDS = ["precio", "costo", "dirección", "ubicación", "info", "información", "contacto"];

function detectIntent(text: string): "book_appointment" | "cancel" | "info" | "unknown" {
  const lower = text.toLowerCase();
  if (CANCEL_KEYWORDS.some(k => lower.includes(k))) return "cancel";
  if (BOOK_KEYWORDS.some(k => lower.includes(k))) return "book_appointment";
  if (INFO_KEYWORDS.some(k => lower.includes(k))) return "info";
  return "unknown";
}

type MessageTrigger = "appointment_confirmed" | "appointment_reminder_24h" | "appointment_cancelled" | "booking_received" | "booking_rejected" | "welcome";

async function getTemplate(
  psychologistId: string,
  trigger: MessageTrigger,
  channel: "whatsapp" | "telegram" | "email",
  vars: Record<string, string>
): Promise<string> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("message_templates")
    .select("body_template")
    .eq("psychologist_id", psychologistId)
    .eq("trigger", trigger)
    .eq("is_active", true)
    .or(`channel.eq.${channel},channel.eq.all`)
    .order("channel", { ascending: false }) // prioriza el específico sobre 'all'
    .limit(1)
    .single();

  if (!data?.body_template) return "";

  return data.body_template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

export async function processIncomingMessage(msg: IncomingMessage): Promise<void> {
  const { psychologistId, channel, senderId, senderName, text } = msg;
  const intent = detectIntent(text);

  const supabase = createAdminClient();

  // Obtener info del psicólogo para las templates
  const { data: psychologist } = await supabase
    .from("psychologists")
    .select("name")
    .eq("id", psychologistId)
    .single();

  const vars = {
    patient_name: senderName,
    psychologist_name: psychologist?.name ?? "el psicólogo",
    date: "",
    time: "",
    link: `${process.env.NEXT_PUBLIC_APP_URL}/book/${psychologistId}`,
  };

  let responseText = "";
  let bookingRequestId: string | null = null;

  if (intent === "book_appointment") {
    // Crear solicitud de cita pendiente
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: booking } = await (supabase as any)
      .from("booking_requests")
      .insert({
        psychologist_id: psychologistId,
        name: senderName,
        email: channel === "email" ? senderId : null,
        phone: channel === "whatsapp" ? senderId : null,
        reason: text,
        status: "pending",
        source: channel,
        source_sender_id: senderId,
      })
      .select("id")
      .single();

    bookingRequestId = booking?.id ?? null;

    responseText = await getTemplate(psychologistId, "booking_received" as const, channel, {
      ...vars,
      link: `${process.env.NEXT_PUBLIC_APP_URL}/book/${psychologistId}`,
    });

    if (!responseText) {
      responseText = `Hola ${senderName}, recibimos tu solicitud de cita. Te confirmaremos en las próximas horas. Para ver disponibilidad: ${vars.link}`;
    }
  } else if (intent === "cancel") {
    responseText = `Hola ${senderName}, para cancelar o modificar tu cita comunícate directamente con ${vars.psychologist_name}.`;
  } else if (intent === "info") {
    responseText = `Hola ${senderName}, puedes encontrar más información y agendar tu cita en: ${vars.link}`;
  } else {
    responseText = `Hola ${senderName}, gracias por escribir. Para agendar una cita con ${vars.psychologist_name} visita: ${vars.link}`;
  }

  // Actualizar el log con la intención detectada
  await supabase
    .from("messaging_logs")
    .update({ intent, appointment_id: bookingRequestId ?? null })
    .eq("psychologist_id", psychologistId)
    .eq("sender_id", senderId)
    .eq("direction", "inbound")
    .order("created_at", { ascending: false })
    .limit(1);

  // Enviar respuesta
  if (responseText) {
    if (channel === "whatsapp") {
      await sendWhatsAppMessage(psychologistId, senderId, responseText);
    } else if (channel === "telegram") {
      await sendTelegramMessage(psychologistId, senderId, responseText);
    }

    // Loguear respuesta saliente
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("messaging_logs").insert({
      psychologist_id: psychologistId,
      channel,
      direction: "outbound",
      sender_id: senderId,
      message_text: responseText,
      intent,
      processed_at: new Date().toISOString(),
    });
  }
}
