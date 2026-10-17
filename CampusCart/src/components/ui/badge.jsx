import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#eb2027] text-white hover:bg-[#c81a1f]",
        secondary: "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200",
        destructive: "border-transparent bg-red-100 text-red-700",
        outline: "text-gray-700 border-gray-200",
        success: "border-transparent bg-green-100 text-green-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
