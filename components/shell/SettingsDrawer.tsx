"use client";

import { useState } from "react";
import { X, Settings, LogOut, Shield, HelpCircle, FileText, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "@/lib/auth/actions";
import { cn } from "@/lib/utils/cn";

export function SettingsDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-40 p-2.5 rounded-xl bg-psy-paper border border-[var(--border)] shadow-[var(--shadow-card)] text-psy-muted hover:text-psy-ink transition-colors"
        aria-label="Configuración"
      >
        <Settings size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-psy-ink/20 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 bg-psy-paper border-l border-[var(--border)] shadow-[var(--shadow-dock)] flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <h2 className="font-serif text-base text-psy-ink font-semibold">Configuración</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-psy-muted hover:text-psy-ink hover:bg-psy-cream transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
                <DrawerItem icon={Settings} label="Mi perfil" href="/settings" onClick={() => setOpen(false)} />
                <DrawerItem icon={Shield} label="Privacidad y datos" href="/settings/privacy" onClick={() => setOpen(false)} />
                <DrawerItem icon={FileText} label="Términos y condiciones" href="/legal/terms" onClick={() => setOpen(false)} />
                <DrawerItem icon={HelpCircle} label="Soporte" href="/support" onClick={() => setOpen(false)} />
              </nav>

              <div className="px-3 pb-6 border-t border-[var(--border)] pt-3">
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-psy-red hover:bg-psy-red-light text-sm font-medium transition-colors"
                >
                  <LogOut size={15} />
                  <span>Cerrar sesión</span>
                </button>

                <p className="mt-4 text-center text-[10px] text-psy-muted leading-relaxed">
                  PsyAssist · Tratamiento de datos conforme a Ley 1581 Colombia
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function DrawerItem({
  icon: Icon,
  label,
  href,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  onClick: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-psy-ink hover:bg-psy-cream transition-colors"
      )}
    >
      <Icon size={15} className="text-psy-muted shrink-0" />
      <span className="flex-1">{label}</span>
      <ChevronRight size={13} className="text-psy-muted" />
    </a>
  );
}
