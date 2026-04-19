import { createClient } from "@/lib/supabase/server";
import { sendWhatsAppMessage } from "@/lib/messaging/whatsapp";
import { getIntegration } from "@/lib/integrations/loader";

/**
 * Job endpoint para enviar recordatorios WhatsApp
 * GET /api/reminders/send-whatsapp
 *
 * Busca recordatorios pendientes (24h y 1h antes)
 * y los envía usando credenciales del psicólogo
 *
 * Ejecutar vía cron externo: curl https://domain/api/reminders/send-whatsapp
 */
export async function GET(request: Request) {
  try {
    // Validar que sea llamada desde cron job (verificar header si es necesario)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      // En dev permitir sin secret
      if (process.env.NODE_ENV !== "development") {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
        });
      }
    }

    const supabase = await createClient();

    // Obtener recordatorios pendientes
    const { data: reminders, error: fetchError } = await supabase.rpc(
      "get_pending_reminders"
    );

    if (fetchError) {
      console.error("[Reminders] Error fetching pending reminders:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch reminders" }),
        { status: 500 }
      );
    }

    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ sent: 0, data: [] }), {
        status: 200,
      });
    }

    const results = [];

    for (const reminder of reminders) {
      try {
        // Obtener credenciales WhatsApp del psicólogo
        const creds = await getIntegration(
          reminder.psychologist_id,
          "whatsapp_meta"
        );

        if (!creds) {
          // Si no hay credenciales Meta, intentar Twilio
          const twilioCreds = await getIntegration(
            reminder.psychologist_id,
            "whatsapp_twilio"
          );
          if (!twilioCreds) {
            console.warn(
              `[Reminders] No WhatsApp credentials for psychologist ${reminder.psychologist_id}`
            );
            results.push({
              reminder_id: reminder.reminder_id,
              status: "skipped",
              reason: "No credentials configured",
            });
            continue;
          }
        }

        // Formatear mensaje
        const message = formatReminderMessage(
          reminder.reminder_type,
          reminder.patient_name,
          reminder.appointment_time,
          reminder.psychologist_name
        );

        // Enviar mensaje
        const sent = await sendWhatsAppMessage(
          reminder.psychologist_id,
          reminder.patient_phone,
          message
        );

        // Marcar como enviado o fallido
        const { error: updateError } = await supabase
          .from("whatsapp_reminder_logs")
          .update({
            status: sent ? "sent" : "failed",
            error_message: sent
              ? null
              : "Failed to send via WhatsApp",
            sent_at: sent ? new Date().toISOString() : null,
          })
          .eq("id", reminder.reminder_id);

        if (updateError) {
          console.error(`[Reminders] Error updating reminder log:`, updateError);
          results.push({
            reminder_id: reminder.reminder_id,
            status: "error",
            reason: updateError.message,
          });
        } else {
          results.push({
            reminder_id: reminder.reminder_id,
            status: sent ? "sent" : "failed",
            patient_phone: reminder.patient_phone,
            type: reminder.reminder_type,
          });
        }
      } catch (err) {
        console.error(`[Reminders] Error processing reminder:`, err);
        results.push({
          reminder_id: reminder.reminder_id,
          status: "error",
          reason: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    const sentCount = results.filter((r) => r.status === "sent").length;
    const failedCount = results.filter((r) => r.status === "failed").length;

    return new Response(
      JSON.stringify({
        sent: sentCount,
        failed: failedCount,
        skipped: results.filter((r) => r.status === "skipped").length,
        total: results.length,
        results,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("[Reminders] Unexpected error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Internal server error",
      }),
      { status: 500 }
    );
  }
}

function formatReminderMessage(
  reminderType: string,
  patientName: string,
  appointmentTime: string,
  psychologistName: string
): string {
  const time = new Date(appointmentTime).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const date = new Date(appointmentTime).toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  if (reminderType === "24h") {
    return `Hola ${patientName}, 👋 tu sesión con ${psychologistName} es mañana a las ${time}. ¿Confirmas tu asistencia?`;
  } else {
    return `Recordatorio: Tu sesión es en 1 hora (${time}). ¡Nos vemos pronto! 🕐`;
  }
}
