import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "",
        secondary: "",
        destructive: "",
        outline: "",
        success: "",
        warning: "",
        info: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const variantStyleMap: Record<string, React.CSSProperties> = {
  default: {
    border: "transparent",
    backgroundColor: "var(--c-primary-light)",
    color: "var(--c-primary)",
  },
  secondary: {
    border: "transparent",
    backgroundColor: "var(--c-hover)",
    color: "var(--fg-secondary)",
  },
  destructive: {
    border: "transparent",
    backgroundColor: "rgba(229, 23, 40, 0.1)",
    color: "var(--c-error)",
  },
  outline: {
    borderColor: "var(--c-border)",
    color: "var(--fg-secondary)",
  },
  success: {
    border: "transparent",
    backgroundColor: "var(--c-primary-light)",
    color: "var(--c-success)",
  },
  warning: {
    border: "transparent",
    backgroundColor: "rgba(255, 215, 64, 0.15)",
    color: "#B8860B",
  },
  info: {
    border: "transparent",
    backgroundColor: "rgba(102, 153, 255, 0.1)",
    color: "var(--c-info)",
  },
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, style, ...props }: BadgeProps) {
  const v = variant ?? "default";
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      style={{ ...variantStyleMap[v], ...style }}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
