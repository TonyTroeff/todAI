"use client";

import { useEffect } from "react";
import { buttonClasses } from "@/components/ui/button";

/** Error boundary for unexpected failures; lets the user retry in place. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="py-16 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted">An unexpected error occurred. Your data is safe.</p>
      <button type="button" onClick={reset} className={buttonClasses("primary", "mt-6")}>
        Try again
      </button>
    </div>
  );
}
