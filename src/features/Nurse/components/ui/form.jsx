 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }"use client";

import * as React from "react";

import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,



} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const Form = FormProvider;








const FormFieldContext = React.createContext(
  {} 
);

const FormField = 


({
  ...props
}) => {
  return (
    React.createElement(FormFieldContext.Provider, { value: { name: props.name },}
      , React.createElement(Controller, { ...props,} )
    )
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};





const FormItemContext = React.createContext(
  {} 
);

function FormItem({ className, ...props }) {
  const id = React.useId();

  return (
    React.createElement(FormItemContext.Provider, { value: { id },}
      , React.createElement('div', {
        'data-slot': "form-item",
        className: cn("grid gap-2", className),
        ...props,}
      )
    )
  );
}

function FormLabel({
  className,
  ...props
}) {
  const { error, formItemId } = useFormField();

  return (
    React.createElement(Label, {
      'data-slot': "form-label",
      'data-error': !!error,
      className: cn("data-[error=true]:text-destructive", className),
      htmlFor: formItemId,
      ...props,}
    )
  );
}

function FormControl({ ...props }) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    React.createElement(Slot, {
      'data-slot': "form-control",
      id: formItemId,
      'aria-describedby': 
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      ,
      'aria-invalid': !!error,
      ...props,}
    )
  );
}

function FormDescription({ className, ...props }) {
  const { formDescriptionId } = useFormField();

  return (
    React.createElement('p', {
      'data-slot': "form-description",
      id: formDescriptionId,
      className: cn("text-muted-foreground text-sm", className),
      ...props,}
    )
  );
}

function FormMessage({ className, ...props }) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(_nullishCoalesce(_optionalChain([error, 'optionalAccess', _ => _.message]), () => ( ""))) : props.children;

  if (!body) {
    return null;
  }

  return (
    React.createElement('p', {
      'data-slot': "form-message",
      id: formMessageId,
      className: cn("text-destructive text-sm", className),
      ...props,}

      , body
    )
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
