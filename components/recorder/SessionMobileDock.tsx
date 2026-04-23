"use client";

import { Mic, NotebookPen, ShieldCheck, SlidersHorizontal, SquareStack } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SessionMobileDockProps {
  activeAnchor: string;
  onNavigate: (anchor: string) => void;
}

const items = [
  { id: "session-overview", label: "Sesion", icon: SquareStack },
  { id: "session-main", label: "Grabar", icon: Mic },
  { id: "session-settings", label: "Config", icon: SlidersHorizontal },
  { id: "session-notes", label: "Notas", icon: NotebookPen },
  { id: "session-preflight", label: "Prueba", icon: ShieldCheck },
];

export function SessionMobileDock({ activeAnchor, onNavigate }: SessionMobileDockProps) {
  return (
    <nav
      aria-label="Navegacion movil de sesion"
      className="fixed inset-x-3 bottom-3 z-40 rounded-[1.6rem] border border-[#1a1d20] bg-[linear-gradient(180deg,rgba(25,29,31,0.97)_0%,rgba(19,21,23,0.98)_100%)] px-2 py-2 shadow-[0_18px_34px_rgba(13,16,18,0.26)] backdrop-blur lg:hidden"
    >
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeAnchor === item.id;

          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "flex min-h-[62px] flex-col items-center justify-center rounded-[1rem] px-1 text-center transition-colors",
                active ? "bg-[#3f7d95] text-white shadow-[0_10px_22px_rgba(63,125,149,0.28)]" : "text-white/62 hover:bg-white/[0.05] hover:text-white",
              )}
            >
              <Icon size={16} />
              <span className="mt-1 text-[10px] font-medium">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
