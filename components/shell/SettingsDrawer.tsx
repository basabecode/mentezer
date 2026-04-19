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
        className="fixed bottom-24 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-psy-paper/92 text-psy-muted shadow-[0_14px_34px_rgba(13,34,50,0.12)] backdrop-blur-md transition hover:text-psy-ink md:right-5"
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
              className="fixed bottom-0 right-0 top-0 z-50 flex w-[min(26rem,100vw)] flex-col border-l border-[var(--border)] bg-psy-paper shadow-[var(--shadow-dock)]"
            >
              <div className="paper-texture border-b border-[var(--border)] px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-psy-muted">
                      Ajustes y soporte
                    </p>
                    <h2 className="mt-1 font-serif text-xl font-semibold tracking-tight text-psy-ink">
                      Configuración
                    </h2>
                  </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl p-2 text-psy-muted transition-colors hover:bg-psy-cream hover:text-psy-ink"
                >
                  <X size={16} />
                </button>
                </div>
              </div>

              <nav className="flex-1 overflow-y-auto space-y-1 px-3 py-3">
                <DrawerItem icon={Settings} label="Mi perfil" href="/settings" onClick={() => setOpen(false)} />
                <DrawerItem icon={Shield} label="Privacidad y datos" href="/settings/privacy" onClick={() => setOpen(false)} />
                <DrawerItem icon={FileText} label="Términos y condiciones" href="/legal/terms" onClick={() => setOpen(false)} />
                <DrawerItem icon={HelpCircle} label="Soporte" href="/support" onClick={() => setOpen(false)} />
              </nav>

              <div className="border-t border-[var(--border)] px-3 pb-6 pt-3">
                <button
                  onClick={() => logout()}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium text-psy-red transition-colors hover:bg-psy-red-light"
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
