import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Pagination({ className, ...props }) {
  return (
    React.createElement('nav', {
      role: "navigation",
      'aria-label': "pagination",
      'data-slot': "pagination",
      className: cn("mx-auto flex w-full justify-center", className),
      ...props,}
    )
  );
}

function PaginationContent({
  className,
  ...props
}) {
  return (
    React.createElement('ul', {
      'data-slot': "pagination-content",
      className: cn("flex flex-row items-center gap-1", className),
      ...props,}
    )
  );
}

function PaginationItem({ ...props }) {
  return React.createElement('li', { 'data-slot': "pagination-item", ...props,} );
}






function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}) {
  return (
    React.createElement('a', {
      'aria-current': isActive ? "page" : undefined,
      'data-slot': "pagination-link",
      'data-active': isActive,
      className: cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      ),
      ...props,}
    )
  );
}

function PaginationPrevious({
  className,
  ...props
}) {
  return (
    React.createElement(PaginationLink, {
      'aria-label': "Go to previous page"   ,
      size: "default",
      className: cn("gap-1 px-2.5 sm:pl-2.5", className),
      ...props,}

      , React.createElement(ChevronLeftIcon, null )
      , React.createElement('span', { className: "hidden sm:block" ,}, "Previous")
    )
  );
}

function PaginationNext({
  className,
  ...props
}) {
  return (
    React.createElement(PaginationLink, {
      'aria-label': "Go to next page"   ,
      size: "default",
      className: cn("gap-1 px-2.5 sm:pr-2.5", className),
      ...props,}

      , React.createElement('span', { className: "hidden sm:block" ,}, "Next")
      , React.createElement(ChevronRightIcon, null )
    )
  );
}

function PaginationEllipsis({
  className,
  ...props
}) {
  return (
    React.createElement('span', {
      'aria-hidden': true,
      'data-slot': "pagination-ellipsis",
      className: cn("flex size-9 items-center justify-center", className),
      ...props,}

      , React.createElement(MoreHorizontalIcon, { className: "size-4",} )
      , React.createElement('span', { className: "sr-only",}, "More pages" )
    )
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
