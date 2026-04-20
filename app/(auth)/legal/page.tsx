import Link from "next/link";
import { FileText, Scale, ShieldCheck } from "lucide-react";

const legalLinks = [
  {
    href: "/legal/privacy",
    title: "Política de privacidad",
    description:
      "Cómo recopilamos, protegemos y eliminamos la información clínica y operativa.",
    icon: ShieldCheck,
  },
  {
    href: "/legal/terms",
    title: "Términos y condiciones",
    description:
      "Condiciones de uso de la plataforma, responsabilidades y límites del servicio.",
    icon: Scale,
  },
];

export default function LegalIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <section className="rounded-[2rem] border border-psy-border bg-psy-paper p-7 shadow-[0_18px_40px_rgba(28,27,24,0.05)] sm:p-9">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-psy-blue-light text-psy-blue">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-psy-muted">
              Legal
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-psy-ink sm:text-4xl">
              Documentos legales de MENTEZER
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-psy-ink/70 sm:text-base">
              Aquí encuentras los documentos base sobre tratamiento de datos,
              responsabilidades de uso y condiciones vigentes de la plataforma.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {legalLinks.map(({ href, title, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-[1.5rem] border border-psy-border bg-white p-5 transition hover:border-psy-blue/30 hover:shadow-lg"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-psy-cream text-psy-blue transition group-hover:bg-psy-blue-light">
                <Icon size={18} />
              </div>
              <h2 className="mt-4 font-serif text-xl font-semibold text-psy-ink">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-psy-ink/70">{description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
