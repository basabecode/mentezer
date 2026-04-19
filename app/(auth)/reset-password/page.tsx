"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { resetPassword } from "@/lib/auth/reset-password-actions";

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(resetPassword, {});
  const [step, setStep] = useState<"request" | "confirm">("request");

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-2xl border border-psy-border bg-psy-paper shadow-xl">

        {/* Header */}
        <div className="border-b border-psy-border px-8 pb-6 pt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-psy-blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M8 12h8M12 8v8"/>
              </svg>
            </div>
            <div>
              <p className="font-sora text-lg font-bold leading-none text-psy-ink italic">MENTEZER</p>
              <p className="mt-0.5 text-xs text-psy-muted">Plataforma clínica</p>
            </div>
          </div>
          <h1 className="font-sora text-2xl font-semibold tracking-tight text-psy-ink">
            Recuperar contraseña
          </h1>
          <p className="mt-1 text-sm text-psy-muted">
            {step === "request"
              ? "Ingresa tu correo para recibir un enlace de recuperación"
              : "Ingresa tu nueva contraseña"}
          </p>
        </div>

        {/* Form */}
        <div className="px-8 py-7">
          {step === "request" ? (
            <form action={action} className="space-y-5">
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
                  className="h-11 w-full rounded-xl border border-psy-border bg-psy-cream px-4 text-sm text-psy-ink placeholder:text-psy-muted/60 transition-all focus:border-psy-blue focus:outline-none focus:ring-2 focus:ring-psy-blue/25"
                />
              </div>

              {state.success && (
                <div className="p-4 bg-psy-green/5 border border-psy-green rounded-lg text-sm text-psy-green">
                  Revisa tu correo para el enlace de recuperación. Válido por 24 horas.
                </div>
              )}

              {state.error && (
                <div className="p-4 bg-psy-red/5 border border-psy-red rounded-lg text-sm text-psy-red">
                  {state.error}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  disabled={pending || state.success}
                  className="h-11 px-6 rounded-lg bg-psy-blue text-white text-sm font-medium hover:bg-psy-blue/90 transition-colors disabled:opacity-60"
                >
                  {pending ? "Enviando..." : "Enviar enlace de recuperación"}
                </button>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 h-11 rounded-lg border border-psy-border bg-psy-paper text-psy-ink text-sm font-medium hover:bg-psy-cream transition-colors"
                >
                  <ArrowLeft size={16} />
                  Volver a login
                </Link>
              </div>
            </form>
          ) : null}
        </div>

        <div className="px-8 pb-6 text-center text-xs text-psy-muted">
          ¿Recordaste tu contraseña?{" "}
          <Link href="/login" className="text-psy-blue hover:underline font-medium">
            Volver a login
          </Link>
        </div>
      </div>
    </div>
  );
}
