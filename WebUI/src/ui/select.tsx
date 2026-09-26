import React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { cn } from "./cn.js";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

/** coss-style Select (Base UI under the hood), themed dark. */
export function Select({ value, options, onChange, label, className }: SelectProps) {
  return (
    <BaseSelect.Root value={value} onValueChange={(v) => onChange(v as string)}>
      <BaseSelect.Trigger
        aria-label={label}
        className={cn(
          "flex h-10 min-w-40 cursor-pointer items-center justify-between gap-2 rounded-md",
          "border border-[#4d4d4d] bg-[#333] px-3 text-sm text-white outline-none",
          "focus:border-netflix focus:ring-2 focus:ring-netflix/35",
          className
        )}
      >
        <BaseSelect.Value />
        <BaseSelect.Icon>
          <svg className="h-4 w-4 fill-[#b3b3b3]" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m7 10 5 5 5-5z"></path>
          </svg>
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Backdrop />
        <BaseSelect.Positioner className="z-[1400] outline-none" sideOffset={6}>
          <BaseSelect.Popup className="min-w-40 rounded-lg border border-white/10 bg-[#1f1f1f] p-1.5 shadow-2xl outline-none">
            {options.map((o) => (
              <BaseSelect.Item
                key={o.value}
                value={o.value}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm text-[#eee] outline-none hover:bg-white/10 data-[highlighted]:bg-white/10"
              >
                <BaseSelect.ItemText>{o.label}</BaseSelect.ItemText>
                <BaseSelect.ItemIndicator>
                  <svg className="h-4 w-4 fill-netflix" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                  </svg>
                </BaseSelect.ItemIndicator>
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
