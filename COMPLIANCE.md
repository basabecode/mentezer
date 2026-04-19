# COMPLIANCE.md — Privacidad y Cumplimiento Regulatorio

## Marco legal — LATAM hispanohablante

| País      | Ley              | Compatibilidad con Ley 1581       |
| --------- | ---------------- | --------------------------------- |
| Colombia  | Ley 1581 de 2012 | Marco principal de implementación |
| México    | LFPDPPP          | Compatible                        |
| Argentina | Ley 25.326       | Compatible                        |
| Chile     | Ley 19.628       | Compatible                        |
| España    | GDPR + LOPDGDD   | Compatible (más estricto)         |

La Ley 1581 es el mínimo común que satisface todos los mercados.

## 10 Reglas que NUNCA se rompen

```
1.  RLS en toda tabla — sin excepciones
2.  Audio cifrado AES-256 antes de subir a Storage
3.  consent_signed_at obligatorio antes de crear Session, AIReport o ReferralReport
4.  Derecho al olvido: cascada completa — audio, transcripts, notas, reports,
    embeddings, planes, citas, ficha del paciente
5.  AuditLog registra TODO acceso a datos clínicos
6.  Embeddings segregados por psychologist_id — nunca cruce entre cuentas
7.  Disclaimer clínico en TODO output de IA — sin excepción
8.  Notas privadas del terapeuta NUNCA en exportaciones ni vistas del paciente
9.  WhatsApp NUNCA lleva datos clínicos — solo logística de cita
10. Nunca exponer patient data en logs de error
```

## Disclaimer clínico — copiar literal en cada output de IA

```
⚠️ Este contenido es una herramienta de apoyo al criterio clínico.
El diagnóstico, tratamiento y decisiones clínicas son responsabilidad
exclusiva del profesional de salud mental. Mentezer no reemplaza la
evaluación clínica profesional.
```

## Gestión del consentimiento

- Consentimiento digital antes de crear sesión, AIReport o informe
- `consent_signed_at` registrado en base de datos
- Audit log para toda lectura/escritura de datos sensibles
- Derecho al olvido: eliminación en cascada con confirmación 2-factor

## Reglas específicas por versión

**Lite:**
- PDFs personales máximo 3 — para limitar surface de compliance
- Notas solo en texto — menos riesgo de exposición

**Pro:**
- PDFs personales ilimitados — pero clasificación automática y segregación
- Audio grabado — cifrado AES-256 inmediato
- CIE-11 — cumplimiento psiquiátrico formal
- Informes de derivación — firma digital requerida

## Referencias

- Ley 1581 Colombia: https://www.sic.gov.co/tema/proteccion-de-datos-personales
- GDPR: https://gdpr-info.eu/
- LFPDPPP México: https://www.gob.mx/inai
