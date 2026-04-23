"use client";

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
  X,
  Brain,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { useDashboard } from "./DashboardContext";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
  { href: "/patients", icon: Users, label: "Pacientes" },
  { href: "/sessions/new", icon: Mic, label: "Sesión" },
  { href: "/knowledge", icon: BookOpen, label: "Biblioteca" },
  { href: "/schedule", icon: Calendar, label: "Agenda" },
  { href: "/finance", icon: DollarSign, label: "Finanzas" },
  { href: "/reports", icon: FileText, label: "Informes" },
  { href: "/cases", icon: Briefcase, label: "Casos" },
];

function NavRail({
  expanded = false,
  onNavigate,
  onToggleExpand,
  showToggle = false,
}: {
  expanded?: boolean;
  onNavigate?: () => void;
  onToggleExpand?: () => void;
  showToggle?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "relative z-30 flex h-full flex-col overflow-visible rounded-[1.9rem] border border-white/6 bg-[#1e2224] text-white shadow-[0_18px_40px_rgba(15,18,20,0.24)] transition-all duration-300",
        expanded ? "w-[184px] p-3" : "w-[76px] p-3"
      )}
      aria-label="Navegación principal"
    >
      {/* Logo */}
      <div className={cn("flex items-center pb-3", expanded ? "gap-3 px-1" : "justify-center")}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#4a8aa6] text-white shadow-[0_10px_18px_rgba(74,138,166,0.28)]">
          <Brain size={18} strokeWidth={2} />
        </div>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            className="text-sm font-semibold text-white"
          >
            Mentezer
          </motion.span>
        )}
      </div>

      {/* Nav items */}
      <div className="mt-2 flex flex-1 flex-col gap-1.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-label={label}
              className={cn(
                "group relative z-0 flex h-11 items-center rounded-2xl transition-all duration-200",
                expanded ? "gap-3 px-3" : "justify-center",
                active
                  ? "bg-[#254452] text-white shadow-[0_10px_20px_rgba(37,68,82,0.28)]"
                  : "text-white/65 hover:bg-white/6 hover:text-white"
              )}
            >
              <Icon size={17} strokeWidth={active ? 2.3 : 1.9} className="shrink-0" />

              {/* Label inline when expanded */}
              {expanded && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate text-[13px] font-medium"
                >
                  {label}
                </motion.span>
              )}

              {/* Tooltip when collapsed */}
              {!expanded && (
                <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-[90] hidden -translate-y-1/2 whitespace-nowrap rounded-xl border border-[#d6dfdf] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#1c2427] shadow-[0_14px_28px_rgba(16,24,28,0.16)] xl:block xl:translate-x-1 xl:opacity-0 xl:transition-all xl:duration-150 group-hover:xl:translate-x-0 group-hover:xl:opacity-100">
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Toggle expand/collapse — desktop only */}
      {showToggle && (
        <button
          type="button"
          onClick={onToggleExpand}
          className="mt-2 flex h-9 w-full items-center justify-center rounded-2xl border border-white/8 text-white/40 transition hover:bg-white/6 hover:text-white/80"
          aria-label={expanded ? "Colapsar menú" : "Expandir menú"}
        >
          {expanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      )}
    </nav>
  );
}

export function FloatingDock() {
  const { navOpen, setNavOpen, sidebarExpanded, setSidebarExpanded } = useDashboard();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="relative z-30 hidden h-full shrink-0 overflow-visible lg:block">
        <NavRail
          expanded={sidebarExpanded}
          onToggleExpand={() => setSidebarExpanded(!sidebarExpanded)}
          showToggle
        />
      </aside>

      {/* Mobile overlay + drawer */}
      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#111315]/35 backdrop-blur-sm lg:hidden"
              onClick={() => setNavOpen(false)}
            />

            <motion.aside
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="fixed inset-y-3 left-3 z-[60] overflow-visible lg:hidden"
            >
              <div className="flex h-full flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setNavOpen(false)}
                  className="ml-auto flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[#1e2224] text-white/72"
                  aria-label="Cerrar navegación"
                >
                  <X size={16} />
                </button>
                <NavRail expanded onNavigate={() => setNavOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
