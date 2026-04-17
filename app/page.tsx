import Link from "next/link";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function IconBrain() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.04-4.69 3 3 0 0 1 .38-5.74 2.5 2.5 0 0 1 3.12-3.61"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.04-4.69 3 3 0 0 0-.38-5.74 2.5 2.5 0 0 0-3.12-3.61"/>
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  );
}
function IconArchive() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
    </svg>
  );
}
function IconFileText() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}
function IconGlobe() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}
function IconLayout() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
    </svg>
  );
}
function IconMic() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}
function IconShield() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

// ─── Datos ────────────────────────────────────────────────────────────────────
const diferenciadores = [
  {
    icon: <IconBook />,
    label: "RAG sobre tu biblioteca",
    desc: "La IA razona con los libros que tú usas y confías. Cita libro, autor y página. Ningún competidor hace esto.",
    accent: "blue",
    span: "col-span-2",
  },
  {
    icon: <IconArchive />,
    label: "Memoria de casos exitosos",
    desc: "Cada caso cerrado se convierte en conocimiento reutilizable. El sistema crece contigo.",
    accent: "green",
    span: "col-span-1",
  },
  {
    icon: <IconFileText />,
    label: "Informes de derivación",
    desc: "Cartas profesionales para otro especialista con un clic. Específico para Colombia y LATAM.",
    accent: "amber",
    span: "col-span-1",
  },
  {
    icon: <IconGlobe />,
    label: "Nativo hispanohablante",
    desc: "Whisper optimizado en español, prompts en español clínico, cumplimiento Ley 1581.",
    accent: "green",
    span: "col-span-1",
  },
  {
    icon: <IconLayout />,
    label: "Spatial Clinical",
    desc: "Sin chrome innecesario. Un expediente digital que se siente como herramienta, no como SaaS genérico.",
    accent: "blue",
    span: "col-span-2",
  },
];

const pasos = [
  {
    n: "01",
    title: "Graba o sube la sesión",
    desc: "Presencial o virtual. Web Audio API o archivo MP3/WAV/M4A. El audio se cifra AES-256 antes de subir.",
  },
  {
    n: "02",
    title: "IA analiza con tu biblioteca",
    desc: "Whisper transcribe en español. Claude cruza la transcripción con tus libros y tus casos exitosos previos.",
  },
  {
    n: "03",
    title: "Tú revisas y decides",
    desc: "Recibes el reporte, el plan terapéutico y, si necesitas, el informe de derivación listo para firmar.",
  },
];

const planes = [
  {
    name: "Starter",
    price: "$29",
    desc: "Para psicólogos que comienzan",
    features: ["Hasta 20 sesiones/mes", "5 documentos en biblioteca", "Informes básicos", "Soporte por email"],
    cta: "Comenzar gratis",
    highlight: false,
  },
  {
    name: "Professional",
    price: "$59",
    desc: "Para práctica activa",
    features: ["Sesiones ilimitadas", "Biblioteca ilimitada", "Informes de derivación", "Casos exitosos", "Google Calendar", "Soporte prioritario"],
    cta: "Empezar prueba",
    highlight: true,
  },
  {
    name: "Clinic",
    price: "$149",
    desc: "Para consultorios y grupos",
    features: ["Todo en Professional", "Hasta 5 psicólogos", "Panel administrativo", "Facturación unificada", "Onboarding dedicado"],
    cta: "Hablar con ventas",
    highlight: false,
  },
];

// ─── Componente principal ─────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F5F2ED] font-sans overflow-x-hidden">

      {/* ── PILL NAVBAR (flotante, no tradicional) ──────────────────────────── */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
        <nav className="flex items-center justify-between bg-[#FAF8F4]/90 backdrop-blur-md border border-[rgba(28,27,24,0.10)] rounded-2xl px-5 py-3 shadow-[0_4px_24px_rgba(28,27,24,0.08)]">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#3B6FA0] flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.04-4.69 3 3 0 0 1 .38-5.74 2.5 2.5 0 0 1 3.12-3.61"/>
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.04-4.69 3 3 0 0 0-.38-5.74 2.5 2.5 0 0 0-3.12-3.61"/>
              </svg>
            </div>
            <span className="font-serif text-base font-semibold text-[#1C1B18] tracking-tight">PsyAssist</span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-1">
            {["Funciones", "Precios", "Para quién"].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`}
                className="px-3 py-1.5 text-sm text-[#6B6760] hover:text-[#1C1B18] hover:bg-[rgba(28,27,24,0.05)] rounded-lg transition-all">
                {l}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm text-[#6B6760] hover:text-[#1C1B18] px-3 py-1.5 transition-colors">
              Ingresar
            </Link>
            <Link href="/register"
              className="text-sm font-medium bg-[#1C1B18] text-[#FAF8F4] px-4 py-1.5 rounded-xl hover:bg-[#1C1B18]/85 transition-all">
              Comenzar gratis
            </Link>
          </div>
        </nav>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-28 pb-20 overflow-hidden">

        {/* Textura sutil de fondo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#3B6FA0]/6 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-[#4A7C59]/6 rounded-full blur-[80px]" />
        </div>

        {/* Badge */}
        <div className="relative flex items-center gap-2 bg-[#FAF8F4] border border-[rgba(28,27,24,0.10)] rounded-full px-4 py-2 mb-8 text-xs text-[#6B6760] shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4A7C59] animate-pulse" />
          Diseñado para psicólogos en Colombia y LATAM
        </div>

        {/* Headline */}
        <h1 className="relative font-serif text-5xl md:text-7xl font-semibold text-[#1C1B18] text-center max-w-4xl leading-[1.08] tracking-tight mb-6">
          Como tener todos tus libros{" "}
          <span className="text-[#3B6FA0]">leyendo la sesión</span>{" "}
          contigo
        </h1>

        <p className="relative text-lg md:text-xl text-[#6B6760] text-center max-w-xl leading-relaxed mb-10">
          PsyAssist analiza cada sesión con tu propia biblioteca clínica
          y tus casos exitosos. No reemplaza tu criterio — lo potencia.
        </p>

        {/* CTAs */}
        <div className="relative flex flex-col sm:flex-row items-center gap-3 mb-16">
          <Link href="/register"
            className="flex items-center gap-2 bg-[#3B6FA0] text-white text-sm font-medium px-6 py-3.5 rounded-xl hover:bg-[#3B6FA0]/90 transition-all shadow-[0_4px_16px_rgba(59,111,160,0.30)]">
            Comenzar 14 días gratis
            <IconArrow />
          </Link>
          <Link href="/login"
            className="flex items-center gap-2 bg-[#FAF8F4] border border-[rgba(28,27,24,0.12)] text-[#1C1B18] text-sm font-medium px-6 py-3.5 rounded-xl hover:bg-[rgba(28,27,24,0.04)] transition-all">
            <IconMic />
            Ver demo en vivo
          </Link>
        </div>

        {/* Stats strip */}
        <div className="relative flex flex-wrap justify-center gap-8 text-center">
          {[
            { n: "< 2 min", l: "análisis post-sesión" },
            { n: "> 90%", l: "precisión en español" },
            { n: "Ley 1581", l: "cumplimiento Colombia" },
          ].map((s) => (
            <div key={s.n}>
              <p className="font-serif text-2xl font-semibold text-[#1C1B18]">{s.n}</p>
              <p className="text-xs text-[#6B6760] mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BENTO — 5 DIFERENCIADORES ──────────────────────────────────────── */}
      <section id="funciones" className="px-4 pb-28 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-medium text-[#3B6FA0] uppercase tracking-widest mb-3">Por qué PsyAssist</p>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#1C1B18] tracking-tight max-w-xl mx-auto">
            Cinco diferencias que ningún competidor tiene
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {diferenciadores.map((d, i) => {
            const accentMap = {
              blue: { bg: "bg-[#EAF1F8]", text: "text-[#3B6FA0]", border: "border-[#3B6FA0]/15" },
              green: { bg: "bg-[#EBF4EE]", text: "text-[#4A7C59]", border: "border-[#4A7C59]/15" },
              amber: { bg: "bg-[#FBF3E4]", text: "text-[#B07D3A]", border: "border-[#B07D3A]/15" },
            };
            const a = accentMap[d.accent as keyof typeof accentMap];
            const isWide = d.span === "col-span-2";
            return (
              <div key={i}
                className={`${isWide ? "md:col-span-2" : ""} bg-[#FAF8F4] border border-[rgba(28,27,24,0.08)] rounded-2xl p-7 flex flex-col gap-5 hover:shadow-[0_8px_32px_rgba(28,27,24,0.07)] transition-shadow`}>
                <div className={`w-10 h-10 rounded-xl ${a.bg} ${a.text} border ${a.border} flex items-center justify-center`}>
                  {d.icon}
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#1C1B18] mb-2">{d.label}</h3>
                  <p className="text-sm text-[#6B6760] leading-relaxed">{d.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────────────────────────── */}
      <section id="funciones-como" className="bg-[#FAF8F4] border-y border-[rgba(28,27,24,0.07)] py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-[#4A7C59] uppercase tracking-widest mb-3">El flujo</p>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#1C1B18] tracking-tight">
              De la grabación al reporte<br />en menos de dos minutos
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-[rgba(28,27,24,0.08)] rounded-2xl overflow-hidden">
            {pasos.map((p, i) => (
              <div key={i} className="bg-[#FAF8F4] p-8 flex flex-col gap-4">
                <span className="font-mono text-5xl font-semibold text-[rgba(28,27,24,0.08)] leading-none select-none">
                  {p.n}
                </span>
                <h3 className="font-serif text-xl font-semibold text-[#1C1B18]">{p.title}</h3>
                <p className="text-sm text-[#6B6760] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ───────────────────────────────────────────────────────────── */}
      <section id="precios" className="py-28 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-medium text-[#B07D3A] uppercase tracking-widest mb-3">Planes</p>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-[#1C1B18] tracking-tight mb-4">
            Inversión que se paga sola
          </h2>
          <p className="text-[#6B6760] max-w-md mx-auto text-base">
            15 minutos ahorrados por sesión × tus tarifas = PsyAssist se paga en el primer día del mes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {planes.map((p) => (
            <div key={p.name}
              className={`relative rounded-2xl p-7 flex flex-col gap-6 ${
                p.highlight
                  ? "bg-[#3B6FA0] text-white shadow-[0_16px_48px_rgba(59,111,160,0.28)]"
                  : "bg-[#FAF8F4] border border-[rgba(28,27,24,0.08)]"
              }`}>
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4A7C59] text-white text-xs font-medium px-3 py-1 rounded-full">
                  Más popular
                </div>
              )}

              <div>
                <p className={`text-sm font-medium mb-1 ${p.highlight ? "text-white/70" : "text-[#6B6760]"}`}>{p.name}</p>
                <p className={`font-serif text-4xl font-semibold tracking-tight ${p.highlight ? "text-white" : "text-[#1C1B18]"}`}>
                  {p.price}
                  <span className={`text-base font-normal ml-1 ${p.highlight ? "text-white/60" : "text-[#6B6760]"}`}>/mes</span>
                </p>
                <p className={`text-xs mt-1 ${p.highlight ? "text-white/60" : "text-[#6B6760]"}`}>{p.desc}</p>
              </div>

              <ul className="flex flex-col gap-2.5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span className={`flex-shrink-0 mt-0.5 ${p.highlight ? "text-white/80" : "text-[#4A7C59]"}`}>
                      <IconCheck />
                    </span>
                    <span className={p.highlight ? "text-white/85" : "text-[#1C1B18]"}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link href="/register"
                className={`text-center text-sm font-medium py-3 rounded-xl transition-all ${
                  p.highlight
                    ? "bg-white text-[#3B6FA0] hover:bg-white/90"
                    : "bg-[#1C1B18] text-[#FAF8F4] hover:bg-[#1C1B18]/85"
                }`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────────────── */}
      <section className="px-4 pb-28 max-w-5xl mx-auto">
        <div className="relative bg-[#1C1B18] rounded-3xl px-8 py-16 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[#3B6FA0]/20 rounded-full blur-[80px]" />
          </div>
          <p className="relative text-xs font-medium text-[#3B6FA0] uppercase tracking-widest mb-4">
            Empieza hoy
          </p>
          <h2 className="relative font-serif text-4xl md:text-5xl font-semibold text-[#FAF8F4] tracking-tight mb-4 max-w-2xl mx-auto">
            Tu próxima sesión ya puede estar respaldada por toda tu biblioteca
          </h2>
          <p className="relative text-[#FAF8F4]/50 max-w-md mx-auto mb-10 text-base">
            14 días gratis. Sin tarjeta de crédito. Configuración en menos de 5 minutos.
          </p>
          <Link href="/register"
            className="relative inline-flex items-center gap-2 bg-[#FAF8F4] text-[#1C1B18] text-sm font-medium px-8 py-3.5 rounded-xl hover:bg-white transition-all shadow-[0_4px_24px_rgba(250,248,244,0.15)]">
            Crear cuenta gratis
            <IconArrow />
          </Link>
        </div>
      </section>

      {/* ── STRIP INFERIOR (no footer tradicional) ────────────────────────────── */}
      <div className="border-t border-[rgba(28,27,24,0.07)] px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#3B6FA0] flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.04-4.69 3 3 0 0 1 .38-5.74 2.5 2.5 0 0 1 3.12-3.61"/>
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.04-4.69 3 3 0 0 0-.38-5.74 2.5 2.5 0 0 0-3.12-3.61"/>
            </svg>
          </div>
          <span className="font-serif text-sm text-[#1C1B18] font-semibold">PsyAssist</span>
          <span className="text-xs text-[#6B6760]">— Diseñado en Cali, Colombia</span>
        </div>

        <div className="flex items-center gap-5 text-xs text-[#6B6760]">
          <span className="flex items-center gap-1.5">
            <IconShield />
            Ley 1581 · HABEAS DATA
          </span>
          <a href="#" className="hover:text-[#1C1B18] transition-colors">Privacidad</a>
          <a href="#" className="hover:text-[#1C1B18] transition-colors">Términos</a>
          <Link href="/login" className="hover:text-[#1C1B18] transition-colors">Acceso</Link>
        </div>
      </div>

    </div>
  );
}
