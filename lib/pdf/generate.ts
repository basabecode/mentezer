import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import React from "react";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 72,
    color: "#0D2232",
    lineHeight: 1.6,
  },
  header: { marginBottom: 32 },
  headerTitle: { fontSize: 9, color: "#6B6760", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 },
  headerLine: { height: 1, backgroundColor: "#E0DDD8", marginBottom: 16 },
  date: { fontSize: 10, color: "#6B6760", textAlign: "right", marginBottom: 20 },
  recipient: { marginBottom: 24 },
  recipientName: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  recipientSub: { fontSize: 10, color: "#6B6760" },
  subject: { fontFamily: "Helvetica-Bold", fontSize: 11, marginBottom: 20, textDecoration: "underline" },
  body: { fontSize: 11, lineHeight: 1.7, textAlign: "justify" },
  paragraph: { marginBottom: 12 },
  footer: { marginTop: 40, borderTopWidth: 1, borderTopColor: "#E0DDD8", paddingTop: 16 },
  footerPsy: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  footerSub: { fontSize: 9, color: "#6B6760", marginTop: 2 },
  disclaimer: {
    marginTop: 32,
    padding: 10,
    backgroundColor: "#FBF3E4",
    borderLeftWidth: 3,
    borderLeftColor: "#B07D3A",
    fontSize: 8,
    color: "#6B6760",
    lineHeight: 1.5,
  },
});

interface ReferralPDFProps {
  patientName: string;
  recipientName: string;
  recipientSpecialty: string;
  psychologistName: string;
  psychologistLicense: string;
  content: string;
  date: string;
}

function ReferralDocument({
  patientName,
  recipientName,
  recipientSpecialty,
  psychologistName,
  psychologistLicense,
  content,
  date,
}: ReferralPDFProps) {
  const paragraphs = content.split(/\n\n+/).filter(Boolean);

  return React.createElement(
    Document,
    { title: `Informe de derivación — ${patientName}` },
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      // Header
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.headerTitle }, "Mentezer · Informe de Derivación"),
        React.createElement(View, { style: styles.headerLine })
      ),
      // Date
      React.createElement(Text, { style: styles.date }, date),
      // Recipient
      React.createElement(
        View,
        { style: styles.recipient },
        React.createElement(Text, { style: styles.recipientName }, recipientName),
        React.createElement(Text, { style: styles.recipientSub }, `Especialista en ${recipientSpecialty}`)
      ),
      // Subject
      React.createElement(
        Text,
        { style: styles.subject },
        `Asunto: Carta de derivación — ${patientName}`
      ),
      // Body
      React.createElement(
        View,
        { style: styles.body },
        ...paragraphs.map((para, i) =>
          React.createElement(Text, { key: i, style: styles.paragraph }, para.trim())
        )
      ),
      // Footer signature
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, { style: styles.footerPsy }, psychologistName),
        React.createElement(Text, { style: styles.footerSub }, `Psicólogo/a · T.P. ${psychologistLicense}`),
        React.createElement(Text, { style: { ...styles.footerSub, marginTop: 1 } }, "Emitido con Mentezer")
      ),
      // Disclaimer
      React.createElement(
        View,
        { style: styles.disclaimer },
        React.createElement(
          Text,
          null,
          "⚠️ Este documento es un informe de apoyo clínico. El diagnóstico, tratamiento y decisiones clínicas son responsabilidad exclusiva del profesional de salud mental emisor. Mentezer no reemplaza la evaluación clínica profesional."
        )
      )
    )
  );
}

export async function generateReferralPDF(props: ReferralPDFProps): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = React.createElement(ReferralDocument, props) as any;
  return await renderToBuffer(doc);
}
