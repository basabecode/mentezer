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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-1 px-3 py-2 bg-psy-paper/95 backdrop-blur-md border border-[var(--border)] rounded-2xl shadow-[var(--shadow-dock)]">
            {navItems.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200",
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
