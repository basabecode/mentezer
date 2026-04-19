import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface ClinicalCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  icon?: ReactNode;
  color?: "blue" | "green" | "amber" | "red" | "purple";
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ClinicalCard({
  title,
  subtitle,
  children,
  icon,
  color = "blue",
  interactive = false,
  onClick,
  className,
}: ClinicalCardProps) {
  const colorMap = {
    blue: {
      bg: "bg-psy-blue/5",
      border: "border-psy-blue/20",
      text: "text-psy-blue",
    },
    green: {
      bg: "bg-psy-green/5",
      border: "border-psy-green/20",
      text: "text-psy-green",
    },
    amber: {
      bg: "bg-psy-amber/5",
      border: "border-psy-amber/20",
      text: "text-psy-amber",
    },
    red: {
      bg: "bg-psy-red/5",
      border: "border-psy-red/20",
      text: "text-psy-red",
    },
    purple: {
      bg: "bg-psy-purple/5",
      border: "border-psy-purple/20",
      text: "text-psy-purple",
    },
  };

  const style = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-6 transition-all duration-300",
        style.bg,
        style.border,
        interactive && "cursor-pointer hover:shadow-md hover:border-psy-blue/40",
        className
      )}
    >
      {(icon || title) && (
        <div className="flex items-start gap-3 mb-4">
          {icon && <div className={cn("flex-shrink-0", style.text)}>{icon}</div>}
          <div className="flex-1 min-w-0">
            {title && <h3 className="font-semibold text-psy-ink text-sm">{title}</h3>}
            {subtitle && (
              <p className="text-xs text-psy-muted/80 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      <div className="text-sm text-psy-ink/80">{children}</div>
    </div>
  );
}
