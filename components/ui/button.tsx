import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-flux text-slate-950 hover:bg-flux-light shadow-glow-flux hover:shadow-[0_0_32px_0_rgba(63,216,196,0.5)]",
        copper:
          "bg-copper text-slate-950 hover:bg-copper-light shadow-glow-copper",
        outline:
          "border border-white/10 bg-white/[0.02] text-slate-200 hover:bg-white/[0.06] hover:border-white/20",
        ghost: "text-slate-300 hover:bg-white/[0.06] hover:text-white",
        destructive: "bg-alert-red/90 text-white hover:bg-alert-red",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
