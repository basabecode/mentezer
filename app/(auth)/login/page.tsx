"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { login } from "@/lib/auth/actions";

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
      <div className="bg-[var(--psy-paper)] border border-[var(--psy-border)] rounded-2xl shadow-[0_8px_40px_rgba(28,27,24,0.08)] overflow-hidden">

        {/* Header strip */}
        <div className="px-8 pt-8 pb-6 border-b border-[var(--psy-border)]">
          <div className="flex items-center gap-3 mb-4">
            {/* Logo mark */}
            <div className="w-9 h-9 rounded-xl bg-[var(--psy-blue)] flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M8 12h8M12 8v8"/>
              </svg>
            </div>
            <div>
              <p className="font-serif text-lg font-semibold text-[var(--psy-ink)] leading-none">PsyAssist</p>
              <p className="text-xs text-[var(--psy-muted)] mt-0.5">Plataforma clínica</p>
            </div>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-[var(--psy-ink)] tracking-tight">
            Bienvenido de vuelta
          </h1>
          <p className="text-sm text-[var(--psy-muted)] mt-1">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-7">
          <form action={action} className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-[var(--psy-ink)]">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="tucorreo@ejemplo.com"
                className="w-full h-11 px-4 rounded-xl border border-[var(--psy-border)] bg-[var(--psy-cream)] text-[var(--psy-ink)] placeholder:text-[var(--psy-muted)]/60 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--psy-blue)]/25 focus:border-[var(--psy-blue)] transition-all"
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-[var(--psy-ink)]">
                  Contraseña
                </label>
                <button
                  type="button"
                  className="text-xs text-[var(--psy-blue)] hover:underline focus:outline-none"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="Mínimo 8 caracteres"
                  className="w-full h-11 px-4 pr-11 rounded-xl border border-[var(--psy-border)] bg-[var(--psy-cream)] text-[var(--psy-ink)] placeholder:text-[var(--psy-muted)]/60 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--psy-blue)]/25 focus:border-[var(--psy-blue)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--psy-muted)] hover:text-[var(--psy-ink)] transition-colors focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {/* Error */}
            {state.error && (
              <div className="flex items-start gap-2.5 bg-[var(--psy-red-light)] border border-[var(--psy-red)]/20 text-[var(--psy-red)] px-4 py-3 rounded-xl text-sm">
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
              className="w-full h-11 bg-[var(--psy-blue)] hover:bg-[var(--psy-blue)]/90 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
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
        <div className="px-8 py-5 bg-[var(--psy-cream)] border-t border-[var(--psy-border)] text-center">
          <p className="text-sm text-[var(--psy-muted)]">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-[var(--psy-blue)] font-medium hover:underline">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-5 text-center text-xs text-[var(--psy-muted)]/70 px-4">
        Acceso exclusivo para profesionales de salud mental certificados.
      </p>
    </div>
  );
}
