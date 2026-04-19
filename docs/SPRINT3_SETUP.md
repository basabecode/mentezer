# Sprint 3 — Setup Guía

## WhatsApp Recordatorios

### Cómo funciona

1. **Job scheduler externo** llama a `/api/reminders/send-whatsapp` cada hora
2. **Base de datos** busca citas próximas (24h y 1h antes)
3. **Credenciales** se cargan de la tabla `psychologist_integrations` para cada psicólogo
4. **Mensajes** se envían vía Meta WhatsApp API o Twilio (según configuración del psicólogo)

### Setup en producción

#### Opción 1: Cron job externo (recomendado)

Usar **EasyCron**, **Vercel Crons**, o servicio similar:

```bash
# Ejecutar cada hora
curl https://tudominio.com/api/reminders/send-whatsapp \
  -H "Authorization: Bearer tu-cron-secret-aqui"
```

Configurar variable de entorno en `.env.production`:

```
CRON_SECRET=tu-cron-secret-superlargoyseguro
```

#### Opción 2: Vercel Crons (si usas Vercel)

Crear archivo `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/reminders/send-whatsapp",
      "schedule": "0 * * * *"
    }
  ]
}
```

### Configurar credenciales WhatsApp

El psicólogo debe ir a **Configuración > Integraciones** y agregar:

**Para Meta WhatsApp Cloud API:**
- Phone Number ID
- Access Token
- Business Account ID

**Para Twilio:**
- Account SID
- Auth Token
- WhatsApp Number

La tabla `psychologist_integrations` guarda estas credenciales encriptadas.

### Resultado

- ✅ Recordatorios automáticos 24h antes
- ✅ Recordatorios automáticos 1h antes
- ✅ Tracking de envíos (logs en `whatsapp_reminder_logs`)
- ✅ Reintentos automáticos si falla

**Mensajes de ejemplo:**
- 24h: "Hola [Paciente], 👋 tu sesión con [Psicólogo] es mañana a las [HORA]. ¿Confirmas tu asistencia?"
- 1h: "Recordatorio: Tu sesión es en 1 hora ([HORA]). ¡Nos vemos pronto! 🕐"

---

## Panel Financiero

### Características

- ✅ Registrar pagos en USD
- ✅ Métodos: efectivo, transferencia, Nequi, Daviplata, tarjeta, exento
- ✅ Dashboard con stats (total, completados, pendientes)
- ✅ Filtros por semana/mes
- ✅ Historial de pagos por período

### Ubicación

Dashboard → **Finanzas** (o icono de dólar en el dock)

### API Endpoints

```bash
# Obtener pagos
GET /api/payments?period=month

# Crear pago
POST /api/payments
{
  "amount_usd": 50.00,
  "payment_method": "cash",
  "notes": "Sesión intensiva 2h",
  "paid_at": "2026-04-19T00:00:00Z"
}
```

### Base de datos

Tabla `payments`:
- `id` (UUID)
- `psychologist_id` (FK)
- `amount_usd` (DECIMAL)
- `payment_method` (enum)
- `status` (pending | completed | failed | refunded)
- `notes` (TEXT)
- `paid_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)

**RLS Policy:** Solo el psicólogo puede ver/editar sus propios pagos.

---

## Variables de entorno necesarias

```bash
# .env.local o .env.production
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Para cron job
CRON_SECRET=tu-cron-secret-largo-y-seguro

# Integrations WhatsApp (se guardan por psicólogo en DB)
# No ir en .env, sino en panel del psicólogo
```

---

## Migration & Deployment

### 1. Aplicar migration

```bash
supabase db push
```

Esto crea:
- Tabla `payments`
- Tabla `whatsapp_reminder_logs`
- Función `get_pending_reminders()`
- Función `create_reminder_logs_for_appointment()`
- Trigger automático al crear appointments

### 2. Regenerar tipos

```bash
supabase gen types typescript --local > types/supabase.ts
```

### 3. Deploy

```bash
vercel --prod
```

### 4. Verificar

```bash
# Test del endpoint de recordatorios
curl https://tudominio.com/api/reminders/send-whatsapp \
  -H "Authorization: Bearer $CRON_SECRET"

# Debe retornar:
# { "sent": 0, "failed": 0, "skipped": 0, "total": 0, "results": [] }
```

---

## Testing local

```bash
# Ver los reminders pendientes
supabase functions invoke --local

# O ejecutar en SQL Editor:
SELECT * FROM get_pending_reminders();
```

---

## Próximos pasos (v1.5+)

- [ ] Tabla de ganancias por período (resumen semanal/mensual)
- [ ] Export de reportes financieros (PDF/CSV)
- [ ] Integración Stripe (pagos online desde paciente)
- [ ] Proyecciones de ingresos (IA)
