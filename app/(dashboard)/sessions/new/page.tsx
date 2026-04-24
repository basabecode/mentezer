import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PresentialSessionComposer } from '@/components/recorder/PresentialSessionComposer'
import { PortalPage } from '@/components/ui/portal-layout'

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

        {/* Contenido principal */}
        <PresentialSessionComposer
          patientId={selected!.id}
          patientName={selected!.name}
          hasConsent={hasConsent}
          recordingPermission={recordingPermission}
          mode={mode}
        />
      </div>
    </PortalPage>
  )
}
