import Link from "next/link";
import { ArrowLeft, Mail, MessageCircle, BookOpen } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-psy-blue hover:underline mb-6"
      >
        <ArrowLeft size={16} />
        Volver al dashboard
      </Link>

      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-psy-ink mb-3">Centro de Soporte</h1>
        <p className="text-psy-muted">¿Necesitas ayuda? Aquí encontrarás respuestas y opciones de contacto</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Support */}
        <div className="p-6 rounded-2xl border border-psy-border bg-psy-paper">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="text-psy-blue" size={24} />
            <h2 className="font-semibold text-lg text-psy-ink">Email</h2>
          </div>
          <p className="text-sm text-psy-muted mb-4">
            Contacta nuestro equipo de soporte por email
          </p>
          <a
            href="mailto:support@mentezer.co"
            className="inline-block px-4 py-2 rounded-lg bg-psy-blue text-white text-sm font-medium hover:bg-psy-blue/90 transition-colors"
          >
            support@mentezer.co
          </a>
        </div>

        {/* Chat */}
        <div className="p-6 rounded-2xl border border-psy-border bg-psy-paper">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="text-psy-blue" size={24} />
            <h2 className="font-semibold text-lg text-psy-ink">Chat en Vivo</h2>
          </div>
          <p className="text-sm text-psy-muted mb-4">
            Chat disponible de lunes a viernes, 8am-5pm (hora Cali)
          </p>
          <button className="px-4 py-2 rounded-lg bg-psy-blue text-white text-sm font-medium hover:bg-psy-blue/90 transition-colors cursor-pointer">
            Iniciar chat
          </button>
        </div>

        {/* Documentation */}
        <div className="p-6 rounded-2xl border border-psy-border bg-psy-paper">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="text-psy-blue" size={24} />
            <h2 className="font-semibold text-lg text-psy-ink">Documentación</h2>
          </div>
          <p className="text-sm text-psy-muted mb-4">
            Explora nuestra base de conocimiento (próximamente)
          </p>
          <button className="px-4 py-2 rounded-lg bg-psy-blue/10 text-psy-blue text-sm font-medium border border-psy-blue/20 cursor-not-allowed opacity-60">
            En desarrollo
          </button>
        </div>
      </div>

      <div className="mt-10 p-6 rounded-2xl border border-psy-blue/20 bg-psy-blue/5">
        <h3 className="font-semibold text-psy-ink mb-2">Horario de Soporte</h3>
        <p className="text-sm text-psy-muted">
          Lunes a viernes: 8:00 AM - 5:00 PM (Hora de Cali, Colombia)
        </p>
        <p className="text-sm text-psy-muted mt-1">
          Respuesta típica: dentro de 24 horas hábiles
        </p>
      </div>
    </div>
  );
}
