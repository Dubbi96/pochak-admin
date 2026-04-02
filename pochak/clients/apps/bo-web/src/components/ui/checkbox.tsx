"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm shadow-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    style={{
      border: "1px solid var(--c-border)",
    }}
    data-slot="checkbox"
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-3.5 w-3.5" />
    </CheckboxPrimitive.Indicator>
    <style>{`
      [data-slot="checkbox"][data-state="checked"] {
        background-color: var(--c-primary) !important;
        border-color: var(--c-primary) !important;
        color: var(--fg-on-primary);
      }
      [data-slot="checkbox"]:focus-visible {
        box-shadow: 0 0 0 2px var(--c-primary-light);
      }
    `}</style>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
