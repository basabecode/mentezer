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
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/dashboard",       icon: LayoutDashboard, label: "Inicio",     labelShort: "Inicio" },
  { href: "/patients",        icon: Users,            label: "Pacientes",  labelShort: "Pctes." },
  { href: "/sessions/new",    icon: Mic,              label: "Sesión",     labelShort: "Sesión" },
  { href: "/knowledge",       icon: BookOpen,         label: "Biblioteca", labelShort: "Biblio" },
  { href: "/schedule",        icon: Calendar,         label: "Agenda",     labelShort: "Agenda" },
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
          <div className="flex w-[calc(100vw-1.5rem)] items-center gap-0.5 rounded-2xl border border-[var(--border)] bg-psy-paper/95 px-1 py-1.5 shadow-[var(--shadow-dock)] backdrop-blur-md sm:w-auto sm:gap-1 sm:px-2 sm:py-2 md:px-3">
            {navItems.map(({ href, icon: Icon, label, labelShort }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-2 transition-all duration-200 sm:flex-none sm:min-w-[60px] sm:px-2.5 md:min-w-[72px] md:px-3",
                    active
                      ? "bg-psy-blue text-white"
                      : "text-psy-muted hover:text-psy-ink hover:bg-psy-cream"
                  )}
                >
                  <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                  <span className="text-[9px] font-medium leading-none sm:hidden">{labelShort}</span>
                  <span className="hidden text-[10px] font-medium leading-none sm:block">{label}</span>
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
