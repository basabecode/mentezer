import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface RiskBadgeProps {
  level: "low" | "medium" | "high";
  label?: string;
  className?: string;
}

export function RiskBadge({ level, label, className }: RiskBadgeProps) {
  const config = {
    low: {
      bg: "bg-psy-green/10",
      text: "text-psy-green",
      border: "border-psy-green/20",
      icon: false,
    },
    medium: {
      bg: "bg-psy-amber/10",
      text: "text-psy-amber",
      border: "border-psy-amber/20",
      icon: true,
    },
    high: {
      bg: "bg-psy-red/10",
      text: "text-psy-red",
      border: "border-psy-red/20",
      icon: true,
    },
  };

  const style = config[level];
  const defaultLabel =
    level === "low" ? "Riesgo bajo" : level === "medium" ? "Riesgo medio" : "Riesgo alto";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold",
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      {style.icon && <AlertTriangle size={12} />}
      {label || defaultLabel}
    </div>
  );
}
