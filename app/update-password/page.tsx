"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function readRecoveryError() {
  if (typeof window === "undefined") return "";

  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return params.get("error_description") ?? params.get("error") ?? "";
}

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const recoveryError = readRecoveryError();
    if (recoveryError) {
      setError(recoveryError);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setSubmitting(false);
      return;
    }

    setSuccess("Contraseña actualizada. Ahora puedes iniciar sesión.");
    setSubmitting(false);
    window.setTimeout(() => router.push("/login"), 1200);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
      <div className="w-full rounded-2xl border border-psy-border bg-psy-paper p-8 shadow-xl">
        <div className="mb-6">
          <p className="font-sora text-lg font-semibold text-psy-ink">MENTEZER</p>
          <h1 className="mt-3 font-serif text-2xl text-psy-ink">Actualiza tu contraseña</h1>
          <p className="mt-2 text-sm text-psy-muted">
            Define una contraseña segura para activar o recuperar tu acceso.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-psy-ink">
              Nueva contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              className="w-full rounded-xl border border-psy-border bg-psy-cream px-4 py-3 text-sm text-psy-ink outline-none ring-0 transition focus:border-psy-blue"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-psy-ink">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
              className="w-full rounded-xl border border-psy-border bg-psy-cream px-4 py-3 text-sm text-psy-ink outline-none ring-0 transition focus:border-psy-blue"
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-psy-red/20 bg-psy-red-light px-4 py-3 text-sm text-psy-red">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="rounded-xl border border-psy-green/20 bg-psy-green-light px-4 py-3 text-sm text-psy-green">
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-psy-blue px-4 py-3 text-sm font-medium text-white transition hover:bg-psy-blue/90 disabled:opacity-60"
          >
            {submitting ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-psy-muted">
          <Link href="/login" className="text-psy-blue hover:underline">
            Volver a login
          </Link>
        </p>
      </div>
    </div>
  );
}
