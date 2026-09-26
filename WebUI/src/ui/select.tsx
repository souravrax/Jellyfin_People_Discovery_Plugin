import React, { useEffect, useId, useRef, useState } from "react";
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

/**
 * coss-style Select. Fully owned dropdown (no portals): trigger + menu both
 * render inline inside our shadow root, so styling can never escape or the
 * menu end up unstyled in document.body. Keyboard: arrows move, Enter
 * selects, Escape closes.
 */
export function Select({ value, options, onChange, label, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    if (!open) {
      return;
    }
    const onDown = (e: MouseEvent): void => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open ]);

  useEffect(() => {
    if (open) {
      const idx = Math.max(
        0,
        options.findIndex((o) => o.value === value)
      );
      setFocusIndex(idx);
    }
  }, [open, options, value]);

  const choose = (v: string): void => {
    onChange(v);
    setOpen(false);
  };

  const onTriggerKey = (e: React.KeyboardEvent): void => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const onListKey = (e: React.KeyboardEvent): void => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIndex((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIndex((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(options[focusIndex].value);
    }
  };

  return (
    <div ref={rootRef} className={cn("relative min-w-40", className)}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onTriggerKey}
        className="flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
      >
        <span className="truncate">{selected?.label}</span>
        <svg className={cn("size-4 shrink-0 fill-muted-foreground transition-transform", open && "rotate-180")} viewBox="0 0 24 24" aria-hidden="true">
          <path d="m7 10 5 5 5-5z"></path>
        </svg>
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={onListKey}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-[1400] max-h-72 overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none"
        >
          {options.map((o, i) => {
            const isSelected = o.value === value;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  data-focused={i === focusIndex || undefined}
                  onClick={() => choose(o.value)}
                  onMouseEnter={() => setFocusIndex(i)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between gap-3 rounded-sm px-2.5 py-2 text-left text-sm outline-none",
                    i === focusIndex ? "bg-accent text-accent-foreground" : "text-popover-foreground",
                    isSelected && "font-semibold"
                  )}
                >
                  <span className="truncate">{o.label}</span>
                  {isSelected ? (
                    <svg className="size-4 shrink-0 fill-primary" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                    </svg>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
