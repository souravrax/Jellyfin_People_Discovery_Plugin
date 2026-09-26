import React from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import { cn } from "./cn.js";

export type InputSize = "sm" | "default" | "lg";

const sizes: Record<InputSize, string> = {
  sm: "h-8 px-2.5 text-xs",
  default: "h-10 px-3.5 text-sm",
  lg: "h-11 px-4 text-sm",
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: InputSize;
}

/** coss-style Input (Base UI under the hood), themed dark. */
export function Input({ inputSize = "default", className, ...props }: InputProps) {
  return (
    <BaseInput
      className={cn(
        "w-full rounded-md border border-[#4d4d4d] bg-[#333] text-white outline-none",
        "placeholder:text-[#8c8c8c]",
        "focus:border-netflix focus:ring-2 focus:ring-netflix/35",
        "disabled:cursor-default disabled:opacity-50",
        sizes[inputSize],
        className
      )}
      {...props}
    />
  );
}
