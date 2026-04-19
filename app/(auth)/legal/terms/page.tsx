import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
        <h1 className="font-serif text-4xl font-bold mb-8">Términos y Condiciones</h1>

        <p className="text-psy-muted mb-6">
          Última actualización: Abril 2026
        </p>

        <section className="mb-8">
          <h2 className="font-serif text-2xl font-bold mt-8 mb-4">1. Aceptación de Términos</h2>
          <p>
            Al acceder y utilizar MENTEZER, aceptas estos términos y condiciones en su totalidad. Si no estás de acuerdo con cualquier parte de estos términos, no debes usar nuestro servicio.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-2xl font-bold mt-8 mb-4">2. Descripción del Servicio</h2>
          <p>
            MENTEZER es una plataforma de IA clínica diseñada para profesionales de salud mental en América Latina y España. Nuestro servicio proporciona análisis asistido por IA, gestión de pacientes y herramientas de documentación clínica.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-2xl font-bold mt-8 mb-4">3. Cuentas de Usuario</h2>
          <p>
            Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Aceptas que toda actividad bajo tu cuenta es tu responsabilidad.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-2xl font-bold mt-8 mb-4">4. Limitación de Responsabilidad</h2>
          <p>
            MENTEZER proporciona herramientas de asistencia clínica, pero ningún análisis de IA reemplaza el criterio profesional. Siempre aplica tu juicio clínico independiente.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-serif text-2xl font-bold mt-8 mb-4">5. Modificaciones</h2>
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuado del servicio implica la aceptación de los cambios.
          </p>
        </section>

        <p className="text-psy-muted mt-12">
          Para preguntas sobre estos términos, contacta a{" "}
          <a href="mailto:legal@mentezer.co" className="text-psy-blue hover:underline">
            legal@mentezer.co
          </a>
        </p>
      </article>
    </div>
  );
}
