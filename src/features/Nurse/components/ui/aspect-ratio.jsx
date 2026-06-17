import * as React from "react";
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

function AspectRatio({
  ...props
}) {
  return React.createElement(AspectRatioPrimitive.Root, { 'data-slot': "aspect-ratio", ...props,} );
}

export { AspectRatio };
