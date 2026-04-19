"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";

interface KnowledgeGroup {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
  book_count: number;
  is_active: boolean;
}

interface Props {
  group: KnowledgeGroup;
}

export function KnowledgeGroupCard({ group }: Props) {
  const [isActive, setIsActive] = useState(group.is_active);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const newActive = !isActive;
    setIsActive(newActive); // optimistic

    try {
      const res = await fetch("/api/knowledge/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ group_id: group.id, is_active: newActive }),
      });
      if (!res.ok) setIsActive(!newActive); // revert on error
    } catch {
      setIsActive(!newActive);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isActive
          ? "bg-psy-paper border-psy-border shadow-sm"
          : "bg-psy-cream border-psy-border/50 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{ backgroundColor: group.color + "22" }}
          >
            <BookOpen size={14} style={{ color: group.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-psy-ink leading-tight">{group.name}</p>
            <p className="text-xs text-psy-muted mt-0.5 leading-relaxed line-clamp-2">
              {group.description}
            </p>
            {group.book_count > 0 && (
              <p className="text-xs text-psy-muted mt-1 font-mono">
                {group.book_count} {group.book_count === 1 ? "libro" : "libros"}
              </p>
            )}
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={toggle}
          disabled={loading}
          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
            isActive ? "bg-psy-blue" : "bg-psy-border"
          }`}
          aria-label={isActive ? "Desactivar grupo" : "Activar grupo"}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
              isActive ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
