import { getIntegration } from "@/lib/integrations/loader";

export async function sendWhatsAppMessage(
  psychologistId: string,
  toPhone: string,
  text: string
): Promise<boolean> {
  const creds = await getIntegration(psychologistId, "whatsapp_meta");
  if (creds) {
    return sendViaMetaApi(creds.phone_number_id, creds.access_token, toPhone, text);
  }

  const twilioCreds = await getIntegration(psychologistId, "whatsapp_twilio");
  if (twilioCreds) {
    return sendViaTwilio(twilioCreds, toPhone, text);
  }

  console.error(`[WhatsApp] Sin integración configurada para ${psychologistId}`);
  return false;
}

async function sendViaMetaApi(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  text: string
): Promise<boolean> {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to.replace(/\D/g, ""),
          type: "text",
          text: { body: text },
        }),
      }
    );
    return res.ok;
  } catch (err) {
    console.error("[WhatsApp Meta] Error enviando mensaje:", err);
    return false;
  }
}

async function sendViaTwilio(
  creds: { account_sid: string; auth_token: string; whatsapp_number: string },
  to: string,
  text: string
): Promise<boolean> {
  try {
    const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
    const body = new URLSearchParams({
      From: creds.whatsapp_number,
      To: toFormatted,
      Body: text,
    });

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${creds.account_sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${creds.account_sid}:${creds.auth_token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      }
    );
    return res.ok;
  } catch (err) {
    console.error("[WhatsApp Twilio] Error enviando mensaje:", err);
    return false;
  }
}
