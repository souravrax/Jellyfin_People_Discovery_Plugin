import React from "react";
import { cn } from "./cn.js";

export type ButtonVariant = "default" | "secondary" | "outline" | "ghost";
export type ButtonSize = "xs" | "sm" | "default" | "lg" | "icon" | "icon-sm";

const variants: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
  outline:
    "border border-input bg-background text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground",
  ghost: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
};

const sizes: Record<ButtonSize, string> = {
  xs: "h-7 gap-1.5 px-2.5 text-xs",
  sm: "h-8 gap-1.5 px-3 text-xs",
  default: "h-9 gap-2 px-4 text-sm",
  lg: "h-10 gap-2 px-6 text-sm",
  icon: "h-9 w-9",
  "icon-sm": "h-8 w-8",
};

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

/**
 * coss-style Button. Plain element, zero dependencies — renders inline,
 * so it can never escape the shadow root or depend on outside styles.
 */
export function Button({
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      data-loading={loading || undefined}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors outline-none",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? <Spinner className="size-4" /> : null}
      <span className={loading ? "invisible" : undefined}>{children}</span>
    </button>
  );
}
