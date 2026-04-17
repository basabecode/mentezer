import { getIntegration } from "@/lib/integrations/loader";

export async function sendTelegramMessage(
  psychologistId: string,
  chatId: string,
  text: string
): Promise<boolean> {
  const creds = await getIntegration(psychologistId, "telegram");
  if (!creds) {
    console.error(`[Telegram] Sin integración configurada para ${psychologistId}`);
    return false;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${creds.bot_token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      }
    );
    return res.ok;
  } catch (err) {
    console.error("[Telegram] Error enviando mensaje:", err);
    return false;
  }
}

// Registra el webhook del bot en Telegram API
export async function registerTelegramWebhook(
  botToken: string,
  webhookUrl: string,
  secretToken?: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          secret_token: secretToken,
          allowed_updates: ["message"],
        }),
      }
    );
    const data = await res.json() as { ok: boolean };
    return data.ok;
  } catch (err) {
    console.error("[Telegram] Error registrando webhook:", err);
    return false;
  }
}
