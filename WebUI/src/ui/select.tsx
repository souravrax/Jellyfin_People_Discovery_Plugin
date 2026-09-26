import React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { getPortalContainer } from "../portal.js";
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

/** coss-style Select (Base UI under the hood), on coss dark tokens. */
export function Select({ value, options, onChange, label, className }: SelectProps) {
  return (
    <BaseSelect.Root value={value} onValueChange={(v) => onChange(v as string)}>
      <BaseSelect.Trigger
        aria-label={label}
        className={cn(
          "flex h-9 min-w-40 cursor-pointer items-center justify-between gap-2 rounded-md",
          "border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          className
        )}
      >
        <BaseSelect.Value />
        <BaseSelect.Icon>
          <svg className="size-4 fill-muted-foreground" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m7 10 5 5 5-5z"></path>
          </svg>
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal container={getPortalContainer()}>
        <BaseSelect.Backdrop className="bg-black/60" />
        <BaseSelect.Positioner className="z-[1400] outline-none" sideOffset={6}>
          <BaseSelect.Popup className="min-w-40 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none">
            {options.map((o) => (
              <BaseSelect.Item
                key={o.value}
                value={o.value}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-sm px-2.5 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
              >
                <BaseSelect.ItemText>{o.label}</BaseSelect.ItemText>
                <BaseSelect.ItemIndicator>
                  <svg className="size-4 fill-primary" viewBox="0 0 24 24" aria-hidden="true">
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
