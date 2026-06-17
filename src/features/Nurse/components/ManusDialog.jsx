function _optionalChain(ops) {
  let lastAccessLHS = undefined;
  let value = ops[0];
  let i = 1;
  while (i < ops.length) {
    const op = ops[i];
    const fn = ops[i + 1];
    i += 2;
    if ((op === "optionalAccess" || op === "optionalCall") && value == null) {
      return undefined;
    }
    if (op === "access" || op === "optionalAccess") {
      lastAccessLHS = value;
      value = fn(value);
    } else if (op === "call" || op === "optionalCall") {
      value = fn((...args) => value.call(lastAccessLHS, ...args));
      lastAccessLHS = undefined;
    }
  }
  return value;
}
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "./components/ui/dialog";

export function ManusDialog({
  title,
  logo,
  open = false,
  onLogin,
  onOpenChange,
  onClose,
}) {
  const [internalOpen, setInternalOpen] = useState(open);

  useEffect(() => {
    if (!onOpenChange) {
      setInternalOpen(open);
    }
  }, [open, onOpenChange]);

  const handleOpenChange = (nextOpen) => {
    if (onOpenChange) {
      onOpenChange(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }

    if (!nextOpen) {
      _optionalChain([onClose, "optionalCall", (_) => _()]);
    }
  };

  return React.createElement(
    Dialog,
    {
      open: onOpenChange ? open : internalOpen,
      onOpenChange: handleOpenChange,
    },

    React.createElement(
      DialogContent,
      {
        className:
          "py-5 bg-[#f8f8f7] rounded-[20px] w-[400px] shadow-[0px_4px_11px_0px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.08)] backdrop-blur-2xl p-0 gap-0 text-center",
      },
      React.createElement(
        "div",
        { className: "flex flex-col items-center gap-2 p-5 pt-12" },
        logo
          ? React.createElement(
              "div",
              {
                className:
                  "w-16 h-16 bg-white rounded-xl border border-[rgba(0,0,0,0.08)] flex items-center justify-center",
              },
              React.createElement("img", {
                src: logo,
                alt: "Dialog graphic",
                className: "w-10 h-10 rounded-md",
              }),
            )
          : null,

        /* Title and subtitle */
        title
          ? React.createElement(
              DialogTitle,
              {
                className:
                  "text-xl font-semibold text-[#34322d] leading-[26px] tracking-[-0.44px]",
              },
              title,
            )
          : null,
        React.createElement(
          DialogDescription,
          { className: "text-sm text-[#858481] leading-5 tracking-[-0.154px]" },
          "Please login with Manus to continue",
        ),
      ),

      React.createElement(
        DialogFooter,
        { className: "px-5 py-5" },
        /* Login button */
        React.createElement(
          Button,
          {
            onClick: onLogin,
            className:
              "w-full h-10 bg-[#1a1a19] hover:bg-[#1a1a19]/90 text-white rounded-[10px] text-sm font-medium leading-5 tracking-[-0.154px]",
          },
          "Login with Manus",
        ),
      ),
    ),
  );
}
