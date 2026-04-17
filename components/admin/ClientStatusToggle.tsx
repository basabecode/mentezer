"use client";

import { useState, useTransition } from "react";
import { toggleClientStatus } from "@/lib/admin/actions";
import { Power, Loader2 } from "lucide-react";

interface Props {
  psychologistId: string;
  currentStatus: "active" | "suspended" | "pending";
}

export function ClientStatusToggle({ psychologistId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const newStatus = status === "active" ? "suspended" : "active";
    startTransition(async () => {
      await toggleClientStatus(psychologistId, newStatus);
      setStatus(newStatus);
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
        status === "active"
          ? "bg-psy-red-light text-psy-red hover:bg-psy-red hover:text-white"
          : "bg-psy-green-light text-psy-green hover:bg-psy-green hover:text-white"
      }`}
    >
      {isPending ? <Loader2 size={12} className="animate-spin" /> : <Power size={12} />}
      {status === "active" ? "Suspender cuenta" : "Reactivar cuenta"}
    </button>
  );
}
