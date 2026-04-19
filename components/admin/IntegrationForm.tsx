"use client";

import { useState, useActionState } from "react";
import { ChevronDown, ChevronUp, Save, Loader2, Eye, EyeOff } from "lucide-react";
import { saveIntegration } from "@/lib/admin/actions";

interface Field {
  key: string;
  label: string;
  type: "text" | "password" | "email";
  placeholder: string;
}

interface Props {
  psychologistId: string;
  provider: string;
  fields: Field[];
  isConfigured: boolean;
  displayName: string;
}

export function IntegrationForm({ psychologistId, provider, fields, isConfigured, displayName }: Props) {
  const [open, setOpen] = useState(!isConfigured);
  const [showPasswords, setShowPasswords] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [state, action, pending] = useActionState(saveIntegration, null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const credentialsJson = JSON.stringify(
      Object.fromEntries(fields.map(f => [f.key, values[f.key] ?? ""]))
    );
    const input = e.currentTarget.querySelector('input[name="credentials_json"]') as HTMLInputElement;
    if (input) input.value = credentialsJson;
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-xs text-psy-blue hover:underline"
      >
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {isConfigured ? "Actualizar credenciales" : "Configurar integración"}
      </button>

      {open && (
        <form action={action} onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input type="hidden" name="psychologist_id" value={psychologistId} />
          <input type="hidden" name="provider" value={provider} />
          <input type="hidden" name="credentials_json" value="" />

          <div>
            <label className="block text-xs font-medium text-psy-ink mb-1">
              Nombre descriptivo (visible en admin)
            </label>
            <input
              type="text"
              name="display_name"
              defaultValue={displayName}
              placeholder="ej: calendario@clinicalaura.com"
              className="w-full px-3 py-2 rounded-lg border border-psy-border bg-psy-cream text-psy-ink text-xs focus:outline-none focus:ring-2 focus:ring-psy-blue/30"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.key} className={field.key.includes("token") || field.key.includes("secret") || field.key.includes("key") ? "col-span-2" : ""}>
                <label className="block text-xs font-medium text-psy-ink mb-1">{field.label}</label>
                <div className="relative">
                  <input
                    type={field.type === "password" && !showPasswords ? "password" : "text"}
                    value={values[field.key] ?? ""}
                    onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 rounded-lg border border-psy-border bg-psy-cream text-psy-ink text-xs focus:outline-none focus:ring-2 focus:ring-psy-blue/30 pr-8"
                  />
                  {field.type === "password" && (
                    <button
                      type="button"
                      onClick={() => setShowPasswords(s => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-psy-muted hover:text-psy-ink"
                    >
                      {showPasswords ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {state?.error && (
            <p className="text-xs text-psy-red bg-psy-red-light px-3 py-2 rounded-lg">{state.error}</p>
          )}

          <div className="p-3 bg-psy-amber-light rounded-lg">
            <p className="text-[10px] text-psy-amber leading-relaxed">
              Las credenciales se cifran con AES-256-GCM antes de guardarse. El psicólogo nunca las ve en texto plano.
            </p>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 px-4 py-2 bg-psy-blue text-white rounded-lg text-xs font-medium hover:bg-psy-blue/90 disabled:opacity-50 transition-colors"
          >
            {pending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {pending ? "Guardando..." : "Guardar credenciales"}
          </button>
        </form>
      )}
    </div>
  );
}
