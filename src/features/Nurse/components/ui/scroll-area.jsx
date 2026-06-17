import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils";

function ScrollArea({
  className,
  children,
  ...props
}) {
  return (
    React.createElement(ScrollAreaPrimitive.Root, {
      'data-slot': "scroll-area",
      className: cn("relative", className),
      ...props,}

      , React.createElement(ScrollAreaPrimitive.Viewport, {
        'data-slot': "scroll-area-viewport",
        className: "focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"      ,}

        , children
      )
      , React.createElement(ScrollBar, null )
      , React.createElement(ScrollAreaPrimitive.Corner, null )
    )
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}) {
  return (
    React.createElement(ScrollAreaPrimitive.ScrollAreaScrollbar, {
      'data-slot': "scroll-area-scrollbar",
      orientation: orientation,
      className: cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      ),
      ...props,}

      , React.createElement(ScrollAreaPrimitive.ScrollAreaThumb, {
        'data-slot': "scroll-area-thumb",
        className: "bg-border relative flex-1 rounded-full"   ,}
      )
    )
  );
}

export { ScrollArea, ScrollBar };
