"use client";

import { useState } from "react";
import { BookOpen, FolderOpen } from "lucide-react";

interface Props {
  baseTab: React.ReactNode;
  personalTab: React.ReactNode;
}

const TABS = [
  { id: "base",     label: "Biblioteca base",   icon: BookOpen  },
  { id: "personal", label: "Mi biblioteca",      icon: FolderOpen },
] as const;

type TabId = typeof TABS[number]["id"];

export function KnowledgeTabs({ baseTab, personalTab }: Props) {
  const [active, setActive] = useState<TabId>("base");

  return (
    <div>
      {/* Tab list */}
      <div className="flex gap-1 p-1 bg-psy-paper border border-psy-border rounded-xl mb-4">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex items-center gap-2 flex-1 justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              active === id
                ? "bg-white text-psy-ink shadow-sm border border-psy-border"
                : "text-psy-muted hover:text-psy-ink"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className={active === "base" ? "" : "hidden"}>{baseTab}</div>
      <div className={active === "personal" ? "" : "hidden"}>{personalTab}</div>
    </div>
  );
}
