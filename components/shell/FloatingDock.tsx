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
  { href: "/dashboard",       icon: LayoutDashboard, label: "Inicio",     labelShort: "Inicio" },
  { href: "/patients",        icon: Users,            label: "Pacientes",  labelShort: "Pctes." },
  { href: "/sessions/new",    icon: Mic,              label: "Sesión",     labelShort: "Sesión" },
  { href: "/knowledge",       icon: BookOpen,         label: "Biblioteca", labelShort: "Biblio" },
  { href: "/schedule",        icon: Calendar,         label: "Agenda",     labelShort: "Agenda" },
  { href: "/finance",         icon: DollarSign,       label: "Finanzas",   labelShort: "Dinero" },
  { href: "/reports",         icon: FileText,         label: "Informes",   labelShort: "Inform" },
  { href: "/cases",           icon: Briefcase,        label: "Casos",      labelShort: "Casos"  },
];

export function FloatingDock() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setVisible(currentY < lastScrollY || currentY < 50);
      setLastScrollY(currentY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 md:bottom-6"
        >
          <div className="flex items-center gap-1 rounded-[2rem] border border-psy-border bg-white px-2 py-2 shadow-2xl backdrop-blur-md">
            {navItems.map(({ href, icon: Icon, label, labelShort }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 rounded-2xl px-3 py-2.5 transition-all duration-300 min-w-[70px]",
                    active
                      ? "bg-psy-blue text-white shadow-lg shadow-psy-blue/20"
                      : "text-psy-muted hover:text-psy-ink hover:bg-psy-cream"
                  )}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
                  <span className="text-[10px] font-bold leading-none uppercase tracking-wider">{label}</span>
                  {active && (
                    <motion.span
                      layoutId="dock-indicator"
                      className="absolute inset-0 rounded-xl bg-psy-blue -z-10"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
