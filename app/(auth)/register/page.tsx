"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/lib/auth/actions";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, {});

  return (
    <div className="rounded-xl border border-psy-border bg-psy-paper p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="font-sora text-2xl text-psy-ink font-bold tracking-tight italic">
          MENTEZER
        </h1>
        <p className="mt-1 text-sm text-psy-muted">
          Crea tu cuenta como psicólogo
        </p>
      </div>

      <h2 className="font-serif text-xl text-psy-ink mb-6">Crear cuenta</h2>

      <form action={action} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-psy-ink mb-1" htmlFor="name">
            Nombre completo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Dra. María García"
            className="w-full rounded-lg border border-psy-border bg-psy-cream px-3 py-2 text-sm text-psy-ink placeholder:text-psy-muted transition-colors focus:border-psy-blue focus:outline-none focus:ring-2 focus:ring-psy-blue/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-psy-ink mb-1" htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@correo.com"
            className="w-full rounded-lg border border-psy-border bg-psy-cream px-3 py-2 text-sm text-psy-ink placeholder:text-psy-muted transition-colors focus:border-psy-blue focus:outline-none focus:ring-2 focus:ring-psy-blue/30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-psy-ink mb-1" htmlFor="professional_license">
            Tarjeta profesional{" "}
            <span className="text-psy-muted font-normal">(opcional)</span>
          </label>
          <input
            id="professional_license"
            name="professional_license"
            type="text"
            placeholder="TP-12345-COL"
            className="w-full rounded-lg border border-psy-border bg-psy-cream px-3 py-2 text-sm text-psy-ink placeholder:text-psy-muted transition-colors focus:border-psy-blue focus:outline-none focus:ring-2 focus:ring-psy-blue/30"
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
            required
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            className="w-full rounded-lg border border-psy-border bg-psy-cream px-3 py-2 text-sm text-psy-ink placeholder:text-psy-muted transition-colors focus:border-psy-blue focus:outline-none focus:ring-2 focus:ring-psy-blue/30"
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
          {pending ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-4 text-xs text-psy-muted text-center leading-relaxed">
        Al registrarte aceptas el tratamiento de datos conforme a la{" "}
        <span className="font-medium">Ley 1581</span> de Colombia.
      </p>

      <p className="mt-4 text-center text-sm text-psy-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-psy-blue hover:underline font-medium">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
