"use client";

import { X, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface Notification {
  id: string;
  type: "analysis" | "consent" | "referral";
  title: string;
  description: string;
  timestamp: Date;
  link?: string;
  read: boolean;
}

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  pendingCount: number;
}

export function NotificationsPanel({
  open,
  onClose,
  notifications,
  pendingCount,
}: NotificationsPanelProps) {
  const typeConfig = {
    analysis: { icon: Clock, color: "text-psy-amber", bg: "bg-psy-amber/10" },
    consent: { icon: CheckCircle2, color: "text-psy-green", bg: "bg-psy-green/10" },
    referral: { icon: CheckCircle2, color: "text-psy-blue", bg: "bg-psy-blue/10" },
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-screen w-full max-w-sm bg-psy-paper border-l border-psy-border shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-psy-border p-6">
          <div>
            <h2 className="font-serif text-lg font-bold text-psy-ink">
              Notificaciones
            </h2>
            <p className="text-xs text-psy-muted mt-1">
              {pendingCount} pendientes
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-psy-border hover:bg-psy-cream transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto h-[calc(100vh-100px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="h-12 w-12 rounded-full bg-psy-cream flex items-center justify-center mb-3">
                <CheckCircle2 size={24} className="text-psy-green" />
              </div>
              <p className="text-sm font-medium text-psy-ink">
                Todo actualizado
              </p>
              <p className="text-xs text-psy-muted mt-1">
                No hay notificaciones pendientes
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-6">
              {notifications.map((notification) => {
                const config = typeConfig[notification.type];
                const TypeIcon = config.icon;
                const isNew = !notification.read;

                const content = (
                  <div
                    className={cn(
                      "relative p-4 rounded-2xl border transition-all duration-300",
                      isNew
                        ? "border-psy-amber/40 bg-psy-amber/5"
                        : "border-psy-border/40 bg-psy-cream/30 opacity-75"
                    )}
                  >
                    <div className="flex gap-3">
                      <div
                        className={cn(
                          "flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center",
                          config.bg,
                          config.color
                        )}
                      >
                        <TypeIcon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-psy-ink">
                          {notification.title}
                        </p>
                        <p className="text-xs text-psy-muted mt-1 line-clamp-2">
                          {notification.description}
                        </p>
                        <p className="text-[10px] text-psy-muted/60 mt-2">
                          {notification.timestamp.toLocaleDateString("es-CO", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {isNew && (
                        <div className="flex-shrink-0 h-2 w-2 rounded-full bg-psy-amber mt-1" />
                      )}
                    </div>
                  </div>
                );

                if (notification.link) {
                  return (
                    <Link
                      key={notification.id}
                      href={notification.link}
                      onClick={onClose}
                      className="block hover:no-underline"
                    >
                      {content}
                    </Link>
                  );
                }

                return <div key={notification.id}>{content}</div>;
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
