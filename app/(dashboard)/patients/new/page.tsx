"use client";

import { useActionState } from "react";
import { createPatient } from "@/lib/patients/actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-xs text-psy-red mt-1">{error}</p>;
}

function Label({ htmlFor, children, optional }: { htmlFor: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="block text-sm font-medium text-psy-ink mb-1" htmlFor={htmlFor}>
      {children}
      {optional && <span className="text-psy-muted font-normal ml-1">(opcional)</span>}
    </label>
  );
}

function Input({ id, name, type = "text", placeholder, required }: {
  id: string; name: string; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-psy-cream text-psy-ink placeholder:text-psy-muted text-sm focus:outline-none focus:ring-2 focus:ring-psy-blue/30 focus:border-psy-blue transition-colors"
    />
  );
}

export default function NewPatientPage() {
  const [state, action, pending] = useActionState(createPatient, {});

  return (
    <div className="px-6 py-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/patients" className="p-1.5 rounded-lg text-psy-muted hover:text-psy-ink hover:bg-psy-paper transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-serif text-xl text-psy-ink font-semibold">Nuevo paciente</h1>
          <p className="text-xs text-psy-muted mt-0.5">Registra los datos básicos del paciente</p>
        </div>
      </div>

      <form action={action} className="space-y-6">
        {/* Datos personales */}
        <section className="bg-psy-paper border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-serif text-sm font-semibold text-psy-ink mb-4">Datos personales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <Input id="name" name="name" placeholder="Juan Pérez" required />
              <FieldError error={state.fieldErrors?.name} />
            </div>
            <div>
              <Label htmlFor="document_id" optional>Documento de identidad</Label>
              <Input id="document_id" name="document_id" placeholder="12345678" />
            </div>
            <div>
              <Label htmlFor="age" optional>Edad</Label>
              <Input id="age" name="age" type="number" placeholder="35" />
            </div>
            <div>
              <Label htmlFor="gender" optional>Género</Label>
              <select
                id="gender"
                name="gender"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-psy-cream text-psy-ink text-sm focus:outline-none focus:ring-2 focus:ring-psy-blue/30 focus:border-psy-blue transition-colors"
              >
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
        <section className="bg-psy-paper border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-serif text-sm font-semibold text-psy-ink mb-4">Información de contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_email" optional>Correo electrónico</Label>
              <Input id="contact_email" name="contact_email" type="email" placeholder="paciente@correo.com" />
              <FieldError error={state.fieldErrors?.contact_email} />
            </div>
            <div>
              <Label htmlFor="contact_phone" optional>Teléfono</Label>
              <Input id="contact_phone" name="contact_phone" placeholder="+57 300 0000000" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="emergency_contact" optional>Contacto de emergencia</Label>
              <Input id="emergency_contact" name="emergency_contact" placeholder="Nombre — Relación — Teléfono" />
            </div>
          </div>
        </section>

        {/* Motivo clínico */}
        <section className="bg-psy-paper border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-serif text-sm font-semibold text-psy-ink mb-4">Motivo de consulta</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Motivo principal</Label>
              <textarea
                id="reason"
                name="reason"
                rows={3}
                placeholder="Describe brevemente el motivo de consulta..."
                required
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-psy-cream text-psy-ink placeholder:text-psy-muted text-sm focus:outline-none focus:ring-2 focus:ring-psy-blue/30 focus:border-psy-blue transition-colors resize-none"
              />
              <FieldError error={state.fieldErrors?.reason} />
            </div>
            <div>
              <Label htmlFor="referred_by" optional>Referido por</Label>
              <Input id="referred_by" name="referred_by" placeholder="Dr. García — Médico general" />
            </div>
          </div>
        </section>

        {/* Consentimiento */}
        <section className="bg-psy-amber-light border border-psy-amber/20 rounded-xl p-5">
          <h2 className="font-serif text-sm font-semibold text-psy-amber mb-2">
            Aviso sobre consentimiento informado
          </h2>
          <p className="text-xs text-psy-ink/70 leading-relaxed">
            El consentimiento informado para grabación y análisis de sesiones debe obtenerse
            antes de iniciar la primera sesión. Podrás registrarlo desde la ficha del paciente.
            Obligatorio conforme a la Ley 1581 de Colombia.
          </p>
        </section>

        {state.error && (
          <p className="text-sm text-psy-red bg-psy-red-light px-3 py-2 rounded-lg">
            {state.error}
          </p>
        )}

        <div className="flex gap-3">
          <Link
            href="/patients"
            className="px-4 py-2.5 border border-[var(--border)] text-psy-muted rounded-lg text-sm hover:bg-psy-paper transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="flex-1 py-2.5 bg-psy-blue text-white rounded-lg text-sm font-medium hover:bg-psy-blue/90 disabled:opacity-50 transition-colors"
          >
            {pending ? "Guardando..." : "Registrar paciente"}
          </button>
        </div>
      </form>
    </div>
  );
}
