"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface DashboardContextType {
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const syncSidebar = (event?: MediaQueryList | MediaQueryListEvent) => {
      if (event?.matches ?? media.matches) {
        setNavOpen(false);
      }
    };

    syncSidebar(media);
    media.addEventListener("change", syncSidebar);

    return () => media.removeEventListener("change", syncSidebar);
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        navOpen,
        setNavOpen,
        settingsOpen,
        setSettingsOpen,
        sidebarExpanded,
        setSidebarExpanded,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within a DashboardProvider");
  return context;
}
