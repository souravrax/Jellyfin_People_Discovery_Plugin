import React from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import { cn } from "./cn.js";

export type InputSize = "sm" | "default" | "lg";

const sizes: Record<InputSize, string> = {
  sm: "h-8 px-2.5 text-xs",
  default: "h-9 px-3 text-sm",
  lg: "h-10 px-4 text-sm",
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
}

/** coss-style Input (Base UI under the hood), on coss dark tokens. */
export function Input({ inputSize = "default", className, ...props }: InputProps) {
  return (
    <BaseInput
      className={cn(
        "w-full rounded-md border border-input bg-background text-sm text-foreground shadow-xs transition-colors outline-none",
        "placeholder:text-muted-foreground",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "disabled:pointer-events-none disabled:opacity-50",
        sizes[inputSize],
        className
      )}
      {...props}
    />
  );
}
