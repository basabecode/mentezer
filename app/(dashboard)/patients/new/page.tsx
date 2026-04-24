"use client"

import { useActionState } from "react"
import { createPatient } from "@/lib/patients/actions"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PortalPage } from "@/components/ui/portal-layout"

function FieldError({ error }: { error?: string }) {
  if (!error) return null
  return <p className="mt-1.5 text-xs text-psy-red">{error}</p>
}

function Label({ htmlFor, children, optional }: { htmlFor: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-psy-ink" htmlFor={htmlFor}>
      {children}
      {optional && <span className="ml-1.5 font-normal text-psy-muted">(opcional)</span>}
    </label>
  )
}

const inputClass = "calm-input h-10 px-3.5 text-sm"
const selectClass = "calm-input h-10 px-3.5 text-sm"

export default function NewPatientPage() {
  const [state, action, pending] = useActionState(createPatient, {})

  return (
    <PortalPage size="lg">
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/patients"
            className="flex h-9 w-9 items-center justify-center rounded-xl border bg-white text-psy-muted transition hover:bg-psy-cream hover:text-psy-ink"
            style={{ borderColor: 'var(--psy-warm-border)' }}
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-psy-blue">Seguimiento clínico</p>
            <h1 className="mt-1 font-serif text-[1.8rem] font-bold tracking-tight text-psy-ink">Nuevo paciente</h1>
          </div>
        </div>

        <form action={action} className="space-y-4">

          {/* Datos personales */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: 'var(--psy-warm-border)' }}>
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-psy-blue">Datos personales</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Nombre completo</Label>
                <input id="name" name="name" type="text" placeholder="Juan Pérez" required className={inputClass} />
                <FieldError error={state.fieldErrors?.name} />
              </div>
              <div>
                <Label htmlFor="document_id" optional>Documento de identidad</Label>
                <input id="document_id" name="document_id" type="text" placeholder="12345678" className={inputClass} />
              </div>
              <div>
                <Label htmlFor="age" optional>Edad</Label>
                <input id="age" name="age" type="number" placeholder="35" className={inputClass} />
              </div>
              <div>
                <Label htmlFor="gender" optional>Género</Label>
                <select id="gender" name="gender" className={selectClass}>
                  <option value="">Seleccionar</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="no_binario">No binario</option>
                  <option value="prefiero_no_decir">Prefiero no decir</option>
                </select>
              </div>
            </div>
          </section>

          {/* Contacto */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: 'var(--psy-warm-border)' }}>
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-psy-blue">Información de contacto</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="contact_email" optional>Correo electrónico</Label>
                <input id="contact_email" name="contact_email" type="email" placeholder="paciente@correo.com" className={inputClass} />
                <FieldError error={state.fieldErrors?.contact_email} />
              </div>
              <div>
                <Label htmlFor="contact_phone" optional>Teléfono</Label>
                <input id="contact_phone" name="contact_phone" placeholder="+57 300 0000000" className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="emergency_contact" optional>Contacto de emergencia</Label>
                <input id="emergency_contact" name="emergency_contact" placeholder="Nombre — Relación — Teléfono" className={inputClass} />
              </div>
            </div>
          </section>

          {/* Motivo clínico */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm" style={{ borderColor: 'var(--psy-warm-border)' }}>
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-psy-blue">Motivo de consulta</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Motivo principal</Label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={3}
                  placeholder="Describe brevemente el motivo de consulta..."
                  required
                  className="calm-input resize-none px-3.5 py-2.5 text-sm"
                />
                <FieldError error={state.fieldErrors?.reason} />
              </div>
              <div>
                <Label htmlFor="referred_by" optional>Referido por</Label>
                <input id="referred_by" name="referred_by" placeholder="Dr. García — Médico general" className={inputClass} />
              </div>
            </div>
          </section>

          {/* Aviso consentimiento */}
          <div className="flex items-start gap-3 rounded-2xl border border-psy-amber/20 bg-psy-amber-light px-5 py-4">
            <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-psy-amber" />
            <div>
              <p className="text-sm font-semibold text-psy-amber">Aviso sobre consentimiento informado</p>
              <p className="mt-1.5 text-xs leading-relaxed text-psy-ink/65">
                El consentimiento para grabación y análisis de sesiones debe obtenerse antes de la primera sesión.
                Podrás registrarlo desde la ficha del paciente. Obligatorio conforme a la Ley 1581 de Colombia.
              </p>
            </div>
          </div>

          {state.error && (
            <div className="rounded-xl border border-psy-red/15 bg-psy-red-light px-4 py-3 text-sm text-psy-red">
              {state.error}
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <Link
              href="/patients"
              className="inline-flex items-center justify-center rounded-2xl border bg-white px-5 py-2.5 text-sm text-psy-muted transition hover:bg-psy-cream"
              style={{ borderColor: 'var(--psy-warm-border)' }}
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="calm-button-primary flex-1 rounded-2xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              {pending ? "Guardando..." : "Registrar paciente"}
            </button>
          </div>
        </form>

      </div>
    </PortalPage>
  )
}
