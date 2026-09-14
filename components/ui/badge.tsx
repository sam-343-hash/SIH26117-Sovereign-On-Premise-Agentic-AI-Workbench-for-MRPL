import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
  {
    variants: {
      variant: {
        neutral: "border-white/10 bg-white/[0.04] text-slate-300",
        flux: "border-flux/30 bg-flux/10 text-flux-light",
        copper: "border-copper/30 bg-copper/10 text-copper-light",
        success: "border-alert-green/30 bg-alert-green/10 text-alert-green",
        warning: "border-alert-amber/30 bg-alert-amber/10 text-alert-amber",
        critical: "border-alert-red/30 bg-alert-red/10 text-alert-red",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
