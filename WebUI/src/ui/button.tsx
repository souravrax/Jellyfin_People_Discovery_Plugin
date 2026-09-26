import React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { cn } from "./cn.js";

export type ButtonVariant = "default" | "secondary" | "outline" | "ghost";
export type ButtonSize = "xs" | "sm" | "default" | "lg" | "icon" | "icon-sm";

const variants: Record<ButtonVariant, string> = {
  default: "bg-netflix text-white hover:bg-[#f6121d]",
  secondary: "bg-white/10 text-[#e8e8e8] hover:bg-white/20 hover:text-white",
  outline: "border border-white/20 bg-transparent text-[#e8e8e8] hover:bg-white/10 hover:text-white",
  ghost: "bg-transparent text-[#b3b3b3] hover:bg-white/10 hover:text-white",
};

const sizes: Record<ButtonSize, string> = {
  xs: "h-7 px-2.5 text-xs",
  sm: "h-8 px-3 text-xs",
  default: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-sm",
  icon: "h-10 w-10",
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
 * coss-style Button (Base UI under the hood): variants, sizes, loading state.
 * Themed for our dark UI — `default` is Netflix red.
 */
export function Button({
  variant = "default",
  size = "default",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      data-loading={loading || undefined}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap transition-colors",
        "disabled:cursor-default disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? <Spinner className="h-4 w-4" /> : null}
      <span className={loading ? "invisible" : undefined}>{children}</span>
    </BaseButton>
  );
}
