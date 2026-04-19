import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm text-psy-blue hover:underline mb-6"
      >
        <ArrowLeft size={16} />
        Volver
      </Link>

      <article className="prose prose-sm max-w-none text-psy-ink">
        <h1 className="font-serif text-4xl font-bold mb-8">Política de Privacidad</h1>

        <p className="text-psy-muted mb-6">
          Última actualización: Abril 2026
        </p>

        <section className="mb-8">
          <h2 className="font-serif text-2xl font-bold mt-8 mb-4">1. Recopilación de Datos</h2>
          <p>
            MENTEZER recopila datos clínicos estrictamente necesarios para proporcionar el servicio. Esto incluye información de pacientes, sesiones de terapia y datos de conocimiento personal.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-2xl font-bold mt-8 mb-4">2. Protección de Datos</h2>
          <p>
            Cumplimos con la Ley 1581 de Colombia (LPPD) y GDPR. Todos los datos clínicos se almacenan con cifrado AES-256 y control de acceso mediante Row Level Security (RLS).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-2xl font-bold mt-8 mb-4">3. Consentimiento</h2>
          <p>
            Todo análisis clínico requiere consentimiento informado del paciente. MENTEZER solo procesa datos con consentimiento explícito.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-2xl font-bold mt-8 mb-4">4. Derecho al Olvido</h2>
          <p>
            Los pacientes tienen derecho a solicitar la eliminación completa de sus datos. MENTEZER elimina registros en cascada dentro de 30 días hábiles.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-2xl font-bold mt-8 mb-4">5. Transferencias Internacionales</h2>
          <p>
            Algunos datos pueden procesarse en servidores fuera de Colombia/España. Todos los servidores cumplen con estándares internacionales de protección de datos.
          </p>
        </section>

        <p className="text-psy-muted mt-12">
          Para solicitudes de privacidad, contacta a{" "}
          <a href="mailto:privacy@mentezer.co" className="text-psy-blue hover:underline">
            privacy@mentezer.co
          </a>
        </p>
      </article>
    </div>
  );
}
