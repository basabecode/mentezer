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
  { href: "/dashboard",       icon: LayoutDashboard, label: "Inicio" },
  { href: "/patients",        icon: Users,            label: "Pacientes" },
  { href: "/sessions/new",    icon: Mic,              label: "Sesión" },
  { href: "/knowledge",       icon: BookOpen,         label: "Biblioteca" },
  { href: "/schedule",        icon: Calendar,         label: "Agenda" },
  { href: "/reports",         icon: FileText,         label: "Informes" },
  { href: "/cases",           icon: Briefcase,        label: "Casos" },
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
          <div className="flex max-w-[calc(100vw-1rem)] items-center gap-1 overflow-x-auto rounded-2xl border border-[var(--border)] bg-psy-paper/95 px-2 py-2 shadow-[var(--shadow-dock)] backdrop-blur-md md:px-3">
            {navItems.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex min-w-[64px] flex-col items-center gap-0.5 rounded-xl px-2.5 py-2 transition-all duration-200 md:min-w-[72px] md:px-3",
                    active
                      ? "bg-psy-blue text-white"
                      : "text-psy-muted hover:text-psy-ink hover:bg-psy-cream"
                  )}
                >
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                  <span className="text-[10px] font-medium leading-none">{label}</span>
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
