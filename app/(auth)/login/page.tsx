"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { login } from "@/lib/auth/actions";
import { MentezerLogo } from "@/components/brand/MentezerLogo";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      {/* Card */}
      <div className="calm-panel overflow-hidden">

        {/* Header strip */}
        <div className="border-b border-psy-border/90 px-8 pb-6 pt-8">
          <div className="mb-4">
            <MentezerLogo variant="light" size="md" />
            <p className="mt-2 text-xs text-psy-muted">Espacio clínico sereno</p>
          </div>
          <h1 className="font-sora text-2xl font-semibold tracking-tight text-psy-ink">
            Bienvenido de vuelta
          </h1>
          <p className="mt-1 text-sm text-psy-muted">
            Accede a una experiencia clínica clara, segura y profesional.
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-7">
          <form action={action} className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-psy-ink">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="tucorreo@ejemplo.com"
                className="calm-input h-11 px-4 text-sm"
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-psy-ink">
                  Contraseña
                </label>
                <Link
                  href="/reset-password"
                  className="text-xs text-psy-blue hover:underline focus:outline-none"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Mínimo 8 caracteres"
                  className="calm-input h-11 px-4 pr-11 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-psy-muted transition-colors hover:text-psy-ink focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Error */}
            {state.error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-psy-red/20 bg-psy-red-light px-4 py-3 text-sm text-psy-red">
                <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {state.error}
              </div>
            )}

            {/* Submit */}
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
                  Ingresando...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-psy-border bg-psy-blue-light/40 px-8 py-5 text-center">
          <p className="text-sm text-psy-muted">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="font-medium text-psy-blue hover:underline">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-5 px-4 text-center text-xs text-psy-muted/70">
        Acceso exclusivo para profesionales de salud mental certificados.
      </p>
    </div>
  );
}
