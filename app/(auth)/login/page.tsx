"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/lib/auth/actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, {});

  return (
    <div className="bg-psy-paper border border-[var(--border)] rounded-xl shadow-[var(--shadow-panel)] p-8">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="font-serif text-2xl text-psy-ink font-semibold tracking-tight">
          PsyAssist
        </h1>
        <p className="mt-1 text-sm text-psy-muted">
          Plataforma clínica para psicólogos
        </p>
      </div>

      <h2 className="font-serif text-xl text-psy-ink mb-6">Iniciar sesión</h2>

      <form action={action} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-psy-ink mb-1" htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="tu@correo.com"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-psy-cream text-psy-ink placeholder:text-psy-muted text-sm focus:outline-none focus:ring-2 focus:ring-psy-blue/30 focus:border-psy-blue transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-psy-ink mb-1" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-psy-cream text-psy-ink placeholder:text-psy-muted text-sm focus:outline-none focus:ring-2 focus:ring-psy-blue/30 focus:border-psy-blue transition-colors"
          />
        </div>

        {state.error && (
          <p className="text-sm text-psy-red bg-psy-red-light px-3 py-2 rounded-lg">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-2.5 px-4 bg-psy-blue text-white rounded-lg text-sm font-medium hover:bg-psy-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-psy-muted">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-psy-blue hover:underline font-medium">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
