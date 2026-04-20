import { BookOpen } from "lucide-react";

interface GlossaryItem {
  term: string;
  description: string;
}

interface GlossaryNoteProps {
  title?: string;
  description?: string;
  items: readonly GlossaryItem[];
}

export function GlossaryNote({
  title = "Glosario",
  description = "Siglas y abreviaturas usadas en esta vista.",
  items,
}: GlossaryNoteProps) {
  if (items.length === 0) return null;

  return (
    <aside className="rounded-[1.75rem] border border-psy-border bg-psy-paper p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-psy-blue-light text-psy-blue">
          <BookOpen size={18} />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-psy-muted">
            {title}
          </p>
          <p className="mt-1 text-sm leading-6 text-psy-ink/70">{description}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.term}
            className="rounded-2xl border border-psy-border bg-white px-4 py-3"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-psy-blue">
              {item.term}
            </p>
            <p className="mt-1 text-sm leading-6 text-psy-ink/70">{item.description}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
