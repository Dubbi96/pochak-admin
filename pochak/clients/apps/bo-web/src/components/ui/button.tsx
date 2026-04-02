import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "text-white shadow",
        destructive: "shadow-sm",
        outline:
          "shadow-sm",
        secondary: "shadow-sm",
        ghost: "",
        link: "underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/* Map variant → inline styles for design-token colors (dark/light aware) */
const variantStyles: Record<string, React.CSSProperties> = {
  default: { backgroundColor: "var(--c-primary)", color: "var(--fg-on-primary)" },
  destructive: { backgroundColor: "var(--c-error)", color: "#fff" },
  outline: {
    border: "1px solid var(--c-border)",
    backgroundColor: "var(--bg-surface)",
    color: "var(--fg)",
  },
  secondary: { backgroundColor: "var(--c-hover)", color: "var(--fg)" },
  ghost: { color: "var(--fg-secondary)" },
  link: { color: "var(--c-primary)" },
};

const variantHoverStyles: Record<string, React.CSSProperties> = {
  default: { backgroundColor: "var(--c-primary-hover)" },
  destructive: { backgroundColor: "#c41420" },
  outline: { backgroundColor: "var(--c-hover)" },
  secondary: { backgroundColor: "var(--c-border-light)" },
  ghost: { backgroundColor: "var(--c-hover)" },
  link: {},
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const v = variant ?? "default";
    const Comp = asChild ? Slot : "button";
    const [hovered, setHovered] = React.useState(false);

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={{
          ...variantStyles[v],
          ...(hovered ? variantHoverStyles[v] : {}),
          ...style,
        }}
        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
          setHovered(true);
          props.onMouseEnter?.(e);
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
          setHovered(false);
          props.onMouseLeave?.(e);
        }}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
