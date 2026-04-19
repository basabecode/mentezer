import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export interface ReferralEmailParams {
  to: string;
  recipientName: string;
  recipientSpecialty: string;
  patientName: string;
  psychologistName: string;
  pdfBuffer: Buffer;
  referralId: string;
}

export async function sendReferralEmail({
  to,
  recipientName,
  recipientSpecialty,
  patientName,
  psychologistName,
  pdfBuffer,
  referralId,
}: ReferralEmailParams): Promise<void> {
  const resend = getResend();

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'DM Sans', Georgia, sans-serif; background: #C8E6F2; margin: 0; padding: 32px;">
      <div style="max-width: 560px; margin: 0 auto; background: #DFF3F8; border: 1px solid rgba(13,34,50,0.10); border-radius: 12px; padding: 40px;">
        <p style="font-size: 10px; color: #6B6760; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 16px;">Mentezer · Informe de Derivación</p>
        <h1 style="font-family: Georgia, serif; font-size: 22px; color: #0D2232; margin: 0 0 8px; font-weight: 600;">Carta de derivación</h1>
        <p style="color: #6B6760; font-size: 14px; margin: 0 0 32px;">Estimado/a ${recipientName},</p>
        <p style="color: #0D2232; font-size: 14px; line-height: 1.7; margin: 0 0 16px;">
          El/la psicólogo/a <strong>${psychologistName}</strong> le envía el presente informe de derivación del paciente <strong>${patientName}</strong> para valoración en <strong>${recipientSpecialty}</strong>.
        </p>
        <p style="color: #0D2232; font-size: 14px; line-height: 1.7; margin: 0 0 32px;">
          Encontrará la carta completa adjunta en formato PDF. Quedo disponible para cualquier intercambio clínico que considere pertinente.
        </p>
        <div style="border-top: 1px solid rgba(13,34,50,0.10); padding-top: 24px; margin-top: 24px;">
          <p style="font-size: 13px; font-weight: 600; color: #0D2232; margin: 0 0 2px;">${psychologistName}</p>
          <p style="font-size: 12px; color: #6B6760; margin: 0;">Psicólogo/a · Emitido con Mentezer</p>
        </div>
        <div style="margin-top: 24px; padding: 12px; background: #FBF3E4; border-left: 3px solid #B07D3A; border-radius: 4px;">
          <p style="font-size: 10px; color: #6B6760; margin: 0; line-height: 1.6;">
            ⚠️ Este es un informe de apoyo clínico. El diagnóstico y decisiones clínicas son responsabilidad del profesional emisor.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const { error } = await resend.emails.send({
    from: "Mentezer <noreply@mentezer.app>",
    to,
    subject: `Carta de derivación — ${patientName} a ${recipientSpecialty}`,
    html,
    attachments: [
      {
        filename: `derivacion-${referralId}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  if (error) throw new Error(`Error al enviar email: ${error.message}`);
}
