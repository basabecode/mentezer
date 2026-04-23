import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AlertTriangle, Mic, Upload } from 'lucide-react'
import { AudioUploader } from '@/components/recorder/AudioUploader'
import { PresentialSessionComposer } from '@/components/recorder/PresentialSessionComposer'
import { PortalPage } from '@/components/ui/portal-layout'
import { SessionSidebar } from '@/components/recorder/SessionSidebar'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'BUENOS DÍAS,'
  if (h < 18) return 'BUENAS TARDES,'
  return 'BUENAS NOCHES,'
}

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ patient?: string; mode?: string; consent?: string }>
}) {
  const { patient: patientId, mode: modeParam, consent: consentParam } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: patients } = await supabase
    .from('patients')
    .select('id, name, consent_signed_at, status')
    .eq('psychologist_id', user!.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (!patients || patients.length === 0) redirect('/patients/new')

  const selected = patients.find(patient => patient.id === patientId) ?? patients[0]
  const mode = modeParam === 'virtual' ? 'virtual' : 'presential'
  const hasConsent = !!selected?.consent_signed_at
  const recordingPermission =
    consentParam === 'accepted' || consentParam === 'declined' ? consentParam : null

  return (
    <PortalPage size="full">
      <div className="flex flex-col gap-3">
        {/* Eyebrow row */}
        <div className="flex items-center justify-between gap-2 px-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-psy-blue">
            {greeting()} <span className="ml-2 font-sans tracking-normal text-psy-ink">Nueva sesión</span>
          </p>
        </div>

        {/* Main layout — sidebar + content */}
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:gap-4">
          {/* ── Sidebar colapsable ── */}
          <SessionSidebar
            patients={patients}
            selectedId={selected?.id ?? ''}
            selectedName={selected?.name ?? ''}
            hasConsent={hasConsent}
            mode={mode}
            recordingPermission={recordingPermission}
          />

          {/* ── Contenido principal ── */}
          <div className="min-w-0 flex-1">
            {mode === 'presential' ? (
              <PresentialSessionComposer
                patientId={selected!.id}
                patientName={selected!.name}
                hasConsent={hasConsent}
                recordingPermission={recordingPermission}
              />
            ) : (
              <div className="rounded-[2rem] border border-psy-border bg-white p-5 shadow-[0_12px_28px_rgba(13,34,50,0.04)]">
                <AudioUploader patientId={selected!.id} hasConsent={hasConsent} />
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalPage>
  )
}
