import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md px-3 py-2 text-sm shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{
          border: "1px solid var(--c-border)",
          backgroundColor: "var(--bg-surface)",
          color: "var(--fg)",
        }}
        ref={ref}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--c-primary)";
          e.currentTarget.style.boxShadow = "0 0 0 3px var(--c-primary-light)";
          e.currentTarget.style.outline = "none";
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--c-border)";
          e.currentTarget.style.boxShadow = "none";
          props.onBlur?.(e);
        }}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
