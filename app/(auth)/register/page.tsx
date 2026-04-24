"use client"

import { useActionState } from "react"
import Link from "next/link"
import { register } from "@/lib/auth/actions"
import { ArrowRight } from "lucide-react"

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, {})

  return (
    <div className="w-full">
      <div className="calm-panel overflow-hidden">

        {/* Header */}
        <div className="border-b px-8 pb-6 pt-8" style={{ borderColor: 'var(--psy-warm-border)' }}>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-psy-blue-light text-psy-blue shadow-sm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4a4 4 0 0 0-4 4v1.5a2.5 2.5 0 0 0-1.5 4.5 5.5 5.5 0 0 0 11 0A2.5 2.5 0 0 0 16 9.5V8a4 4 0 0 0-4-4Z"/>
                <path d="M9.5 15.5c.8.7 1.56 1 2.5 1s1.7-.3 2.5-1"/>
              </svg>
            </div>
            <div>
              <p className="font-sora text-lg font-semibold leading-none text-psy-ink">MENTEZER</p>
              <p className="mt-0.5 text-xs text-psy-muted">Espacio clínico sereno</p>
            </div>
          </div>
          <h1 className="font-sora text-2xl font-semibold tracking-tight text-psy-ink">Crear cuenta profesional</h1>
          <p className="mt-1 text-sm text-psy-muted">Acceso exclusivo para profesionales de salud mental.</p>
        </div>

        {/* Form */}
        <div className="px-8 py-7">
          <form action={action} className="space-y-5">

            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium text-psy-ink">Nombre completo</label>
              <input
                id="name" name="name" type="text" required autoComplete="name"
                placeholder="Dra. María García"
                className="calm-input h-11 px-4 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-psy-ink">Correo electrónico</label>
              <input
                id="email" name="email" type="email" required autoComplete="email"
                placeholder="tu@correo.com"
                className="calm-input h-11 px-4 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="professional_license" className="block text-sm font-medium text-psy-ink">
                Tarjeta profesional <span className="font-normal text-psy-muted">(opcional)</span>
              </label>
              <input
                id="professional_license" name="professional_license" type="text"
                placeholder="TP-12345-COL"
                className="calm-input h-11 px-4 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-psy-ink">Contraseña</label>
              <input
                id="password" name="password" type="password" required autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className="calm-input h-11 px-4 text-sm"
              />
            </div>

            {state.error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-psy-red/20 bg-psy-red-light px-4 py-3 text-sm text-psy-red">
                <svg className="mt-0.5 shrink-0" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="calm-button-primary mt-1 flex h-11 w-full text-sm font-medium"
            >
              {pending ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear cuenta
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t bg-psy-blue-light/40 px-8 py-5 text-center" style={{ borderColor: 'var(--psy-warm-border)' }}>
          <p className="text-xs text-psy-muted leading-relaxed">
            Al registrarte aceptas el tratamiento de datos conforme a la{" "}
            <span className="font-semibold text-psy-ink">Ley 1581</span> de Colombia.
          </p>
          <p className="mt-2 text-sm text-psy-muted">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-semibold text-psy-blue hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-5 px-4 text-center text-xs text-psy-muted/70">
        Acceso exclusivo para profesionales de salud mental certificados.
      </p>
    </div>
  )
}
