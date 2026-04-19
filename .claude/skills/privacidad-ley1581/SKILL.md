# SKILL: privacidad-ley1581
## Privacidad Clínica y Cumplimiento Legal — Mentezer

### Cuándo usar este skill
- Crear o modificar cualquier tabla con datos de pacientes
- Implementar endpoints de eliminación de datos
- Configurar RLS en Supabase
- Manejar audio, transcripciones o reportes
- Implementar consentimiento informado

---

## Checklist de Cumplimiento (verificar SIEMPRE)

```
[ ] RLS habilitado en la tabla nueva
[ ] Policy de SELECT solo para psychologist_id = auth.uid()
[ ] Policy de INSERT verifica psychologist_id
[ ] Policy de UPDATE verifica psychologist_id
[ ] Policy de DELETE verifica psychologist_id
[ ] consent_signed_at verificado antes de procesar datos
[ ] AuditLog registra el acceso
[ ] Datos sensibles cifrados en Storage
```

---

## Plantilla RLS para toda tabla nueva

```sql
-- Habilitar RLS
ALTER TABLE nombre_tabla ENABLE ROW LEVEL SECURITY;

-- Psicólogo solo ve sus propios datos
CREATE POLICY "psychologist_select_own"
  ON nombre_tabla FOR SELECT
  USING (psychologist_id = auth.uid());

CREATE POLICY "psychologist_insert_own"
  ON nombre_tabla FOR INSERT
  WITH CHECK (psychologist_id = auth.uid());

CREATE POLICY "psychologist_update_own"
  ON nombre_tabla FOR UPDATE
  USING (psychologist_id = auth.uid());

CREATE POLICY "psychologist_delete_own"
  ON nombre_tabla FOR DELETE
  USING (psychologist_id = auth.uid());
```

---

## Endpoint Derecho al Olvido

```typescript
// app/api/patients/[id]/delete/route.ts
import { createServerClient } from '@/lib/supabase/server'
import { getServerSession } from 'next-auth'

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession()
  if (!session?.user?.id) return Response.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServerClient()
  const psychologistId = session.user.id
  const patientId = params.id

  // Verificar que el paciente pertenece al psicólogo
  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('id', patientId)
    .eq('psychologist_id', psychologistId)
    .single()

  if (!patient) return Response.json({ error: 'Paciente no encontrado' }, { status: 404 })

  // 1. Obtener todas las sesiones
  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, audio_url')
    .eq('patient_id', patientId)

  // 2. Eliminar audios de Storage
  if (sessions) {
    for (const sess of sessions) {
      if (sess.audio_url) {
        const path = sess.audio_url.split('/storage/v1/object/public/')[1]
        await supabase.storage.from('sessions').remove([path])
      }
    }
  }

  // 3. Eliminar embeddings de casos asociados
  await supabase
    .from('clinical_cases')
    .delete()
    .eq('patient_id', patientId)
    .eq('psychologist_id', psychologistId)

  // 4. Eliminar transcripciones
  const sessionIds = sessions?.map(s => s.id) || []
  if (sessionIds.length > 0) {
    await supabase.from('transcripts').delete().in('session_id', sessionIds)
    await supabase.from('ai_reports').delete().in('session_id', sessionIds)
    await supabase.from('sessions').delete().in('id', sessionIds)
  }

  // 5. Eliminar plan terapéutico
  await supabase
    .from('therapeutic_plans')
    .delete()
    .eq('patient_id', patientId)
    .eq('psychologist_id', psychologistId)

  // 6. Eliminar ficha del paciente
  await supabase.from('patients').delete().eq('id', patientId)

  // 7. Registrar en AuditLog
  await supabase.from('audit_logs').insert({
    psychologist_id: psychologistId,
    action: 'patient_data_deleted',
    resource_type: 'patient',
    resource_id: patientId,
  })

  return Response.json({
    success: true,
    message: 'Todos los datos del paciente han sido eliminados permanentemente',
  })
}
```

---

## Verificación de Consentimiento

```typescript
// lib/utils/gdpr.ts

// Verificar antes de procesar cualquier sesión
export async function verifyConsent(
  patientId: string,
  psychologistId: string,
  supabase: any
): Promise<boolean> {
  const { data } = await supabase
    .from('patients')
    .select('consent_signed_at')
    .eq('id', patientId)
    .eq('psychologist_id', psychologistId)
    .single()

  return !!data?.consent_signed_at
}

// Registrar en AuditLog
export async function logAccess(
  supabase: any,
  psychologistId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  req?: Request
) {
  await supabase.from('audit_logs').insert({
    psychologist_id: psychologistId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    ip_address: req?.headers.get('x-forwarded-for') || 'unknown',
    user_agent: req?.headers.get('user-agent') || 'unknown',
  })
}
```

---

## Texto Legal de Consentimiento (en español)

```
CONSENTIMIENTO INFORMADO PARA GRABACIÓN Y PROCESAMIENTO CON IA

Yo, [NOMBRE DEL PACIENTE], autorizo a [NOMBRE DEL PSICÓLOGO] a:

1. Grabar en audio las sesiones de psicoterapia
2. Transcribir el audio mediante herramientas de inteligencia artificial
3. Procesar la transcripción para generar notas clínicas de apoyo

GARANTÍAS:
- Mi información está protegida bajo la Ley 1581 de 2012 (Colombia)
- El audio es eliminado o cifrado tras la transcripción
- Solo mi psicólogo tiene acceso a mis datos
- Puedo solicitar la eliminación de todos mis datos en cualquier momento

Entiendo que este procesamiento es una herramienta de apoyo al 
psicólogo y no reemplaza su criterio clínico.

Firma digital: _______________  Fecha: _______________
```
