import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as React from "react";

import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => {
    const baseClasses = "shrink-0 bg-border";
    const orientationClasses =
      orientation === "horizontal"
        ? "h-px w-full my-2"
        : "w-px h-full mx-2";

    return (
      <SeparatorPrimitive.Root
        ref={ref}
        role="separator"
        decorative={decorative}
        orientation={orientation}
        className={cn(baseClasses, orientationClasses, className)}
        {...props}
      />
    );
  }
);
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator };

