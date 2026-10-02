"use client";

import { useFormStatus } from "react-dom";
import { buttonClasses, type ButtonVariant } from "./button";

interface SubmitButtonProps {
  children: React.ReactNode;
  /** Label shown while the form is submitting. */
  pendingLabel?: string;
  variant?: ButtonVariant;
}

/**
 * Submit button that disables itself while its parent form is pending,
 * giving immediate feedback and preventing duplicate submissions.
 */
export function SubmitButton({ children, pendingLabel, variant = "primary" }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={buttonClasses(variant)}
    >
      {pending && (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      )}
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}
