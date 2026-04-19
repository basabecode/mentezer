"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Mic,
  BookOpen,
  Calendar,
  FileText,
  Briefcase,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/dashboard",    icon: LayoutDashboard, label: "Inicio",     mobileLabel: "Inicio"  },
  { href: "/patients",     icon: Users,            label: "Pacientes",  mobileLabel: "Pctes."  },
  { href: "/sessions/new", icon: Mic,              label: "Sesión",     mobileLabel: "Sesión"  },
  { href: "/knowledge",    icon: BookOpen,         label: "Biblioteca", mobileLabel: "Biblio." },
  { href: "/schedule",     icon: Calendar,         label: "Agenda",     mobileLabel: "Agenda"  },
  { href: "/finance",      icon: DollarSign,       label: "Finanzas",   mobileLabel: "Dinero"  },
  { href: "/reports",      icon: FileText,         label: "Informes",   mobileLabel: "Inform." },
  { href: "/cases",        icon: Briefcase,        label: "Casos",      mobileLabel: "Casos"   },
];

export function FloatingDock() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = document.querySelector("main");
      if (!el) return;
      const currentY = el.scrollTop;
      setVisible(currentY < lastScrollY || currentY < 50);
      setLastScrollY(currentY);
    };

    const main = document.querySelector("main");
    main?.addEventListener("scroll", handleScroll, { passive: true });
    return () => main?.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2 md:bottom-5"
          aria-label="Navegación principal"
        >
          {/* Mobile: scrollable pill */}
          <div className="flex md:hidden max-w-[calc(100vw-24px)] overflow-x-auto rounded-[1.5rem] border border-white/10 bg-psy-ink/92 px-1.5 py-1.5 shadow-2xl shadow-psy-ink/50 backdrop-blur-xl no-scrollbar">
            {navItems.map(({ href, icon: Icon, label, mobileLabel }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  className={cn(
                    "relative flex shrink-0 flex-col items-center gap-1 rounded-2xl px-2.5 py-2 transition-all duration-200",
                    active
                      ? "bg-psy-blue text-white shadow-lg shadow-psy-blue/40"
                      : "text-white/45 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
                  <span className="text-[9px] font-bold leading-none uppercase tracking-wide whitespace-nowrap">
                    {mobileLabel}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Desktop: regular dock with tooltips */}
          <div className="hidden md:flex items-center gap-0.5 rounded-[2rem] border border-white/10 bg-psy-ink/92 px-2 py-2 shadow-2xl shadow-psy-ink/50 backdrop-blur-xl">
            {navItems.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <div key={href} className="group relative">
                  <Link
                    href={href}
                    aria-label={label}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 rounded-2xl px-3 py-2.5 transition-all duration-200 min-w-[68px]",
                      active
                        ? "bg-psy-blue text-white shadow-lg shadow-psy-blue/40"
                        : "text-white/45 hover:text-white hover:bg-white/10"
                    )}
                  >
                    <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                    <span className="text-[10px] font-bold leading-none uppercase tracking-wider">
                      {label}
                    </span>
                    {active && (
                      <motion.span
                        layoutId="dock-indicator"
                        className="absolute inset-0 rounded-2xl bg-psy-blue -z-10"
                      />
                    )}
                  </Link>
                  {/* Tooltip — only on inactive items */}
                  {!active && (
                    <span className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/10 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-psy-ink shadow-xl opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100">
                      {label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
