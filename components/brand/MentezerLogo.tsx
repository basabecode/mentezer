import { cn } from "@/lib/utils/cn";

type LogoVariant = "light" | "dark" | "brand" | "mono";
type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

interface MentezerLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  showWordmark?: boolean;
  className?: string;
  iconClassName?: string;
}

const ICON_SIZES: Record<LogoSize, number> = {
  xs: 16,
  sm: 22,
  md: 28,
  lg: 40,
  xl: 64,
};

const WORDMARK_SIZES: Record<LogoSize, string> = {
  xs: "text-sm",
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
  xl: "text-4xl",
};

const ICON_COLORS: Record<LogoVariant, { stroke: string; opacity?: boolean }> = {
  light:  { stroke: "#607ec9", opacity: true },
  dark:   { stroke: "#c4d0f0", opacity: true },
  brand:  { stroke: "white",   opacity: true },
  mono:   { stroke: "#1c4c96", opacity: true },
};

const WORDMARK_COLORS: Record<LogoVariant, string> = {
  light:  "text-psy-ink",
  dark:   "text-white",
  brand:  "text-white",
  mono:   "text-[#1a1a1a]",
};

function NeuralMIcon({
  size,
  stroke,
  withSubtle = true,
  pixelHint = false,
}: {
  size: number;
  stroke: string;
  withSubtle?: boolean;
  pixelHint?: boolean;
}) {
  const sw = pixelHint ? 3 : size >= 40 ? 2.2 : size >= 28 ? 2.4 : 2.8;
  const nodeR = pixelHint ? 3.5 : size >= 40 ? 2.8 : 3;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Main Neural M strokes */}
      <line x1="4"  y1="34" x2="13" y2="11" stroke={stroke} strokeWidth={sw}       strokeLinecap="round" />
      <line x1="13" y1="11" x2="20" y2="24" stroke={stroke} strokeWidth={sw}       strokeLinecap="round" />
      <line x1="20" y1="24" x2="27" y2="11" stroke={stroke} strokeWidth={sw}       strokeLinecap="round" />
      <line x1="27" y1="11" x2="36" y2="34" stroke={stroke} strokeWidth={sw}       strokeLinecap="round" />

      {/* Subtle connectors — omitted at favicon scale */}
      {withSubtle && (
        <>
          <line x1="13" y1="11" x2="27" y2="11" stroke={stroke} strokeWidth={sw * 0.68} strokeLinecap="round" opacity="0.4" />
          <line x1="4"  y1="34" x2="20" y2="24" stroke={stroke} strokeWidth={sw * 0.55} strokeLinecap="round" opacity="0.25" />
          <line x1="36" y1="34" x2="20" y2="24" stroke={stroke} strokeWidth={sw * 0.55} strokeLinecap="round" opacity="0.25" />
        </>
      )}

      {/* Nodes */}
      <circle cx="4"  cy="34" r={nodeR} fill={stroke} />
      <circle cx="13" cy="11" r={nodeR} fill={stroke} />
      <circle cx="20" cy="24" r={nodeR} fill={stroke} />
      <circle cx="27" cy="11" r={nodeR} fill={stroke} />
      <circle cx="36" cy="34" r={nodeR} fill={stroke} />
    </svg>
  );
}

export function MentezerLogo({
  variant = "light",
  size = "md",
  showWordmark = true,
  className,
  iconClassName,
}: MentezerLogoProps) {
  const iconPx = ICON_SIZES[size];
  const { stroke } = ICON_COLORS[variant];
  const isFavicon = size === "xs";

  return (
    <div className={cn("flex items-center gap-[0.35em]", className)} role="img" aria-label="Mentezer">
      <span className={cn("shrink-0", iconClassName)}>
        <NeuralMIcon
          size={iconPx}
          stroke={stroke}
          withSubtle={!isFavicon}
          pixelHint={isFavicon}
        />
      </span>
      {showWordmark && (
        <span
          className={cn(
            "font-sora font-medium leading-none tracking-tight",
            WORDMARK_SIZES[size],
            WORDMARK_COLORS[variant],
          )}
        >
          Mentezer
        </span>
      )}
    </div>
  );
}

export function MentezerIcon({
  size = "md",
  variant = "light",
  className,
}: Pick<MentezerLogoProps, "size" | "variant" | "className">) {
  const iconPx = ICON_SIZES[size];
  const { stroke } = ICON_COLORS[variant];
  return (
    <span className={cn("inline-flex shrink-0", className)}>
      <NeuralMIcon size={iconPx} stroke={stroke} withSubtle={size !== "xs"} pixelHint={size === "xs"} />
    </span>
  );
}
